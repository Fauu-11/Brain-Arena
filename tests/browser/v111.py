from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from harness import mount, ROOT, browser_options

OUT=ROOT/'qa-results/v1.11'; OUT.mkdir(parents=True, exist_ok=True)
results=[]
FIXED='BA-MAZE-QA11111'

def overflow(page):
    return page.evaluate('''()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth})''')

def snap(page,name,width,route):
    ov=overflow(page)
    assert ov['document']<=width, (name,ov)
    page.screenshot(path=str(OUT/name),full_page=True)
    return {'name':name,'route':route,'width':width,'overflow':ov}

def setup_page(browser,route,width=1440,height=1000):
    page=browser.new_page(viewport={'width':width,'height':height},reduced_motion='reduce')
    page.set_default_timeout(10000)
    errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    mount(page,route)
    return page,errors

def seeded_maze(browser,width=1440,shot=None):
    page,errors=setup_page(browser,'maze',width,1000 if width>600 else 900)
    page.locator('.competitive-mode-toggle button').nth(1).click()
    field=page.locator('.challenge-code-input input')
    field.fill(FIXED)
    page.locator('.play-levels button').last.click()
    page.wait_for_selector('.play-university-difficulty')
    page.locator('.play-university-difficulty button').first.click()
    page.locator('.play-setup-actions .uw-btn-primary').first.click()
    page.wait_for_selector('.maze-board')
    page.wait_for_selector('.competitive-hud')
    player=page.locator('.maze-player').evaluate('(el)=>Array.from(el.closest(".maze-board").children).indexOf(el.closest(".maze-cell"))')
    target=page.locator('.maze-cell.exit').evaluate('(el)=>Array.from(el.parentElement.children).indexOf(el)')
    assert page.locator('.competitive-hud').inner_text().find('Ranked')>=0
    assert FIXED in page.locator('.competitive-hud').inner_text()
    if shot: snap(page,shot,width,'maze')
    assert not errors, errors
    page.close()
    return (player,target)

with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())

    # Arena Run desktop/mobile.
    for width,name in [(1440,'arena-run-1440.png'),(390,'arena-run-390.png')]:
        page,errors=setup_page(browser,'arena-run',width,1000 if width>600 else 900)
        assert page.locator('.run-presets button').count()==4
        assert 'Ultimate Run' in page.locator('.run-presets').inner_text()
        rec=snap(page,name,width,'arena-run'); rec['passed']=not errors; rec['jsErrors']=errors; results.append(rec); page.close()

    # Seeded challenge: exact same code must create exact same maze endpoints.
    pair1=seeded_maze(browser,1440,'seed-ranked-maze-1440.png')
    pair2=seeded_maze(browser,390,'seed-ranked-maze-390.png')
    assert pair1==pair2,(pair1,pair2)
    results.append({'name':'seeded-maze-repeat','passed':True,'pair':pair1})

    # Game completion grid.
    page,errors=setup_page(browser,'completion',1440,1000)
    assert page.locator('.completion-card').count()==12
    assert page.locator('.completion-levels span').count()==72
    rec=snap(page,'completion-1440.png',1440,'completion'); rec['passed']=not errors; rec['jsErrors']=errors; results.append(rec); page.close()

    # Inject one realistic local match, verify history and action replay.
    page,errors=setup_page(browser,'history',1440,1000)
    match={
      'id':'match-qa-v111','gameId':'maze','time':1790820000000,'dateKey':'2026-10-01','mode':'ranked','outcome':'completed',
      'schoolLevel':'universitas','universityDifficulty':'hard','challengeCode':FIXED,'durationMs':82450,'performance':94,'grade':'A',
      'hintsUsed':1,'rankedDelta':24,'xp':115,'isPersonalBest':True,'previousBestMs':90000,
      'replay':[{'t':800,'type':'key','label':'ArrowRight'},{'t':1450,'type':'key','label':'ArrowDown'},{'t':2200,'type':'hint','label':'Brain Coach #1'},{'t':3100,'type':'click','label':'Jeda'}]
    }
    page.evaluate('''m=>{localStorage.setItem('ba_match_history_v1',JSON.stringify([m]));window.dispatchEvent(new Event('storage'));}''',match)
    page.wait_for_selector('.match-row')
    assert FIXED in page.locator('.match-row').inner_text()
    rec=snap(page,'history-1440.png',1440,'history'); rec['passed']=not errors; rec['jsErrors']=errors; results.append(rec)
    page.locator('.history-replay').click()
    page.wait_for_selector('.replay-shell')
    assert page.locator('.replay-timeline button').count()==4
    rec=snap(page,'replay-1440.png',1440,'replay'); rec['passed']=not errors; rec['jsErrors']=errors; results.append(rec)
    page.close()

    # Mobile completion and history reflow.
    page,errors=setup_page(browser,'completion',390,900)
    rec=snap(page,'completion-390.png',390,'completion'); rec['passed']=not errors; rec['jsErrors']=errors; results.append(rec); page.close()

    browser.close()

(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
if not all(r.get('passed',True) for r in results): raise SystemExit(1)
