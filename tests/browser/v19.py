from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from harness import mount, ROOT, browser_options
OUT=ROOT/'qa-results/v1.9'; OUT.mkdir(parents=True, exist_ok=True)
results=[]

def overflow(page):
    return page.evaluate('''()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth})''')

def run_page(browser, route, width, height=900):
    page=browser.new_page(viewport={'width':width,'height':height}, reduced_motion='reduce')
    page.set_default_timeout(8000)
    errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    rec={'route':route,'width':width}
    try:
        mount(page,route)
        page.locator('.meta-page, .home-page, .home-content, .arena-main').first.wait_for()
        rec['overflow']=overflow(page)
        assert rec['overflow']['document']<=width
        rec['jsErrors']=errors
        assert not errors,errors
        page.screenshot(path=str(OUT/f'{route}-{width}.png'),full_page=True)
        rec['passed']=True
    except Exception as e:
        rec['passed']=False; rec['exception']=str(e)[:1800]; rec['jsErrors']=errors
        page.screenshot(path=str(OUT/f'{route}-{width}-error.png'),full_page=True)
    results.append(rec); print(json.dumps(rec),flush=True); page.close()

def run_nonogram(browser,width):
    page=browser.new_page(viewport={'width':width,'height':950 if width>600 else 900},reduced_motion='reduce')
    page.set_default_timeout(8000); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    rec={'route':'nonogram','width':width}
    try:
        mount(page,'nonogram')
        page.locator('.play-levels button').last.click()
        page.locator('.play-university-difficulty button').last.click()
        page.locator('.play-setup-actions .uw-btn-primary').first.click()
        page.wait_for_selector('.nonogram-grid')
        assert page.locator('.nonogram-grid button').count()==400
        assert page.locator('.nonogram-col-clues>div').count()==20
        assert page.locator('.nonogram-row-clues>div').count()==20
        page.locator('.nonogram-tools button').nth(1).click()
        page.locator('.nonogram-grid button').first.click()
        assert 'cross' in (page.locator('.nonogram-grid button').first.get_attribute('class') or '')
        rec['overflow']=overflow(page); assert rec['overflow']['document']<=width
        assert not errors,errors
        page.screenshot(path=str(OUT/f'nonogram-play-{width}.png'),full_page=True)
        rec['passed']=True
    except Exception as e:
        rec['passed']=False; rec['exception']=str(e)[:1800]
        page.screenshot(path=str(OUT/f'nonogram-{width}-error.png'),full_page=True)
    rec['jsErrors']=errors;results.append(rec);print(json.dumps(rec),flush=True);page.close()

def run_2048(browser,width):
    page=browser.new_page(viewport={'width':width,'height':950 if width>600 else 900},reduced_motion='reduce')
    page.set_default_timeout(8000); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    rec={'route':'2048','width':width}
    try:
        mount(page,'2048')
        page.locator('.play-levels button').last.click()
        page.locator('.play-university-difficulty button').last.click()
        page.locator('.play-setup-actions .uw-btn-primary').first.click()
        page.wait_for_selector('.g2048-board')
        assert page.locator('.g2048-tile').count()==16
        before=page.locator('.g2048-board').inner_text()
        for key in ['ArrowLeft','ArrowDown','ArrowRight','ArrowUp']:
            page.keyboard.press(key);page.wait_for_timeout(40)
        after=page.locator('.g2048-board').inner_text()
        assert before!=after
        assert page.locator('.g2048-dpad button').count()==4
        rec['overflow']=overflow(page); assert rec['overflow']['document']<=width
        assert not errors,errors
        page.screenshot(path=str(OUT/f'2048-play-{width}.png'),full_page=True)
        rec['passed']=True
    except Exception as e:
        rec['passed']=False;rec['exception']=str(e)[:1800]
        page.screenshot(path=str(OUT/f'2048-{width}-error.png'),full_page=True)
    rec['jsErrors']=errors;results.append(rec);print(json.dumps(rec),flush=True);page.close()

def run_accessibility(browser,width=390):
    page=browser.new_page(viewport={'width':width,'height':900},reduced_motion='no-preference')
    page.set_default_timeout(8000);errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    rec={'route':'settings-interaction','width':width}
    try:
        mount(page,'settings')
        page.locator('.setting-toggle').nth(0).click()
        assert page.locator('html').evaluate('(el)=>el.classList.contains("ba-reduced-motion")')
        page.locator('.setting-toggle').nth(1).click()
        assert page.locator('html').evaluate('(el)=>el.classList.contains("ba-high-contrast")')
        page.locator('.setting-toggle').nth(2).click()
        assert page.locator('html').evaluate('(el)=>el.classList.contains("ba-large-text")')
        page.locator('.theme-select select').select_option('dark')
        assert page.locator('html').get_attribute('data-ba-theme')=='dark'
        rec['overflow']=overflow(page);assert rec['overflow']['document']<=width
        assert not errors,errors
        page.screenshot(path=str(OUT/'settings-accessibility-mobile.png'),full_page=True)
        rec['passed']=True
    except Exception as e:
        rec['passed']=False;rec['exception']=str(e)[:1800]
        page.screenshot(path=str(OUT/'settings-accessibility-error.png'),full_page=True)
    rec['jsErrors']=errors;results.append(rec);print(json.dumps(rec),flush=True);page.close()

with sync_playwright() as p:
    b=p.chromium.launch(**browser_options())
    for width,height in [(1440,1000),(390,844)]:
        for route in ['season','events','mastery','settings']:
            run_page(b,route,width,height)
        run_nonogram(b,width);run_2048(b,width)
    run_accessibility(b)
    b.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
if not all(r['passed'] for r in results): raise SystemExit(1)
