from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from harness import mount, ROOT, browser_options
OUT=ROOT/'qa-results/newgames-browser'; OUT.mkdir(parents=True, exist_ok=True)
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    for route in ['maze','memory-matrix']:
        for width,height in [(1440,1000),(390,844),(320,800)]:
            page=browser.new_page(viewport={'width':width,'height':height})
            errors=[]; page.on('pageerror', lambda e: errors.append(str(e)))
            rec={'route':route,'width':width}
            try:
                mount(page,route)
                # University always exposes the requested Hard / Very Hard / Impossible selector.
                page.locator('.play-levels button').last.click()
                page.wait_for_selector('.play-university-difficulty')
                assert page.locator('.play-university-difficulty button').count()==3
                labels=page.locator('.play-university-difficulty button').all_text_contents()
                assert any('Very Hard' in text for text in labels)
                assert any('Impossible' in text for text in labels)
                page.locator('.play-university-difficulty button').last.click()
                page.locator('.play-setup-actions .uw-btn-primary').first.click()
                if route=='maze':
                    page.wait_for_selector('.maze-board')
                    assert page.locator('.maze-cell').count()==32*32
                    before=page.locator('.maze-route-note strong').inner_text()
                    # START is randomized on the perimeter. Try all directions; at least one adjacent corridor must be open.
                    for key in ['ArrowUp','ArrowRight','ArrowDown','ArrowLeft']:
                        page.keyboard.press(key)
                    page.wait_for_timeout(80)
                    after=page.locator('.maze-route-note strong').inner_text()
                    assert int(after)>=int(before)+1
                    page.locator('.maze-toolbar-actions button').first.click()
                    assert page.locator('.maze-pause').count()==1
                    rec['impossibleCells']=1024
                    rec['movement']=True
                    rec['pause']=True
                else:
                    page.wait_for_selector('.memory-board')
                    assert page.locator('[data-matrix-cell]').count()==64
                    lit=page.locator('[data-matrix-cell].memory-on')
                    assert lit.count()==12
                    indexes=[int(lit.nth(i).evaluate('(el)=>Array.from(el.parentNode.children).indexOf(el)')) for i in range(lit.count())]
                    page.wait_for_timeout(1550)
                    assert page.locator('.arena-game').get_attribute('data-state')=='playing'
                    for index in indexes:
                        page.locator('[data-matrix-cell]').nth(index).click()
                    page.wait_for_timeout(800)
                    assert page.locator('.arena-game').get_attribute('data-state')=='start'
                    assert page.locator('[data-matrix-cell].memory-on').count()==14
                    rec['impossibleCells']=64
                    rec['roundAdvance']=True
                rec['documentWidth']=page.evaluate('document.documentElement.scrollWidth')
                assert rec['documentWidth']<=width
                page.screenshot(path=str(OUT/f'{route}-{width}.png'),full_page=True)
                rec['passed']=not errors
            except Exception as e:
                rec['passed']=False; rec['exception']=str(e)[:1800]
                page.screenshot(path=str(OUT/f'{route}-{width}-error.png'),full_page=True)
            rec['jsErrors']=errors
            results.append(rec); print(json.dumps(rec),flush=True)
            page.close()
    browser.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
if not all(r['passed'] for r in results): raise SystemExit(1)
