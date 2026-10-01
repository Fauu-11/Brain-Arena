from playwright.sync_api import sync_playwright
from harness import mount,browser_options
import json
errors=[]
base={'ba_onboarding_v1':json.dumps({'completedAt':1,'version':'1.15'}),'ba_data_schema':'16','ba_pinned_games_v2':json.dumps(['maze','sudoku','game2048']),'ba_favorites_v2':json.dumps(['maze','sudoku'])}
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));mount(page,'home','id',base);page.wait_for_selector('.pinned-v2-section');assert page.locator('.pinned-v2-grid article').count()==3;assert page.locator('.filter-v2-select select').count()==2;page.close()
    assert not errors,errors
    print('v1.16 home QA passed: pinned games v2 and search/filter v2')
    browser.close()
