from playwright.sync_api import sync_playwright
from harness import mount,browser_options
import json
routes=['aritmatika','bilangan-prima','warna-pixel','mnm-grid','kubus-3d','suwit','sudoku','minesweeper','maze-escape','memory-matrix','nonogram','2048']
base={'ba_onboarding_v1':json.dumps({'completedAt':1,'version':'1.17'}),'ba_data_schema':'17'}
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    for route in routes:
        page=browser.new_page(viewport={'width':1280,'height':900}); errors=[]; page.on('pageerror',lambda e,errors=errors:errors.append(str(e))); page.set_default_timeout(7000)
        rec={'route':route}
        try:
            mount(page,route,'id',base)
            page.wait_for_selector('.play-setup-card, .uw-setup-card, .game-shell',timeout=7000)
            rec['overflow']=page.evaluate('document.documentElement.scrollWidth')
            assert rec['overflow']<=1280
            assert not errors,errors
            rec['passed']=True
        except Exception as e:
            rec['passed']=False;rec['error']=str(e)[:800];rec['jsErrors']=errors
        results.append(rec); print(json.dumps(rec),flush=True); page.close()
    browser.close()
if not all(x['passed'] for x in results): raise SystemExit(1)
