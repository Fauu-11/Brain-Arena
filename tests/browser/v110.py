from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from harness import mount, ROOT, browser_options

OUT=ROOT/'qa-results/v1.10'; OUT.mkdir(parents=True, exist_ok=True)
GAMES=['300','prime','pixel','mnm','cube','rps','sudoku','minesweeper','maze','memory-matrix','nonogram','2048']
results=[]

def overflow(page):
    return page.evaluate('''()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth})''')

def open_university_selector(page, route):
    if route=='300':
        page.locator('.play-mode-button').first.click()
        # Game300 starts with University selected by default.
    else:
        page.locator('.play-levels button').last.click()
    page.wait_for_selector('.play-university-difficulty')
    labels=[x.strip() for x in page.locator('.play-university-difficulty button span').all_text_contents()]
    assert labels==['Hard','Very Hard','Impossible'], (route, labels)
    page.locator('.play-university-difficulty button').last.click()
    assert page.locator('.play-university-difficulty button').last.get_attribute('aria-pressed')=='true'
    return labels

def run_selector(browser, route, width):
    page=browser.new_page(viewport={'width':width,'height':900 if width<600 else 1000}, reduced_motion='reduce')
    page.set_default_timeout(8000); errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    rec={'route':route,'width':width}
    try:
        mount(page,route)
        rec['labels']=open_university_selector(page,route)
        rec['overflow']=overflow(page)
        assert rec['overflow']['document']<=width
        assert not errors, errors
        if route in ['300','maze','minesweeper','sudoku']:
            page.screenshot(path=str(OUT/f'{route}-arena-{width}.png'),full_page=True)
        rec['passed']=True
    except Exception as e:
        rec['passed']=False;rec['exception']=str(e)[:1800]
        page.screenshot(path=str(OUT/f'{route}-arena-{width}-error.png'),full_page=True)
    rec['jsErrors']=errors;results.append(rec);print(json.dumps(rec),flush=True);page.close()

def run_maze_random(browser,width=1440):
    page=browser.new_page(viewport={'width':width,'height':1000},reduced_motion='reduce')
    page.set_default_timeout(8000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    rec={'route':'maze-random-endpoints','width':width}
    try:
        mount(page,'maze')
        open_university_selector(page,'maze')
        page.locator('.play-setup-actions .uw-btn-primary').first.click()
        page.wait_for_selector('.maze-board')
        pairs=[]
        for i in range(6):
            player=page.locator('.maze-player').evaluate('(el)=>Array.from(el.closest(".maze-board").children).indexOf(el.closest(".maze-cell"))')
            target=page.locator('.maze-cell.exit').evaluate('(el)=>Array.from(el.parentElement.children).indexOf(el)')
            pairs.append(f'{player}:{target}')
            if i<5:
                page.locator('.maze-toolbar-actions button').nth(1).click()
                page.wait_for_timeout(80)
        rec['endpointPairs']=pairs
        rec['uniquePairs']=len(set(pairs))
        assert rec['uniquePairs']>=3,pairs
        assert all(a!=b for a,b in (map(int,p.split(':')) for p in pairs))
        assert not errors,errors
        page.screenshot(path=str(OUT/'maze-random-endpoints.png'),full_page=True)
        rec['passed']=True
    except Exception as e:
        rec['passed']=False;rec['exception']=str(e)[:1800]
        page.screenshot(path=str(OUT/'maze-random-endpoints-error.png'),full_page=True)
    rec['jsErrors']=errors;results.append(rec);print(json.dumps(rec),flush=True);page.close()

with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    for route in GAMES:
        run_selector(browser,route,1440)
    for route in ['maze','memory-matrix','nonogram','2048','300']:
        run_selector(browser,route,390)
    run_maze_random(browser)
    browser.close()

(OUT/'results.json').write_text(json.dumps(results,indent=2))
if not all(r['passed'] for r in results): raise SystemExit(1)
