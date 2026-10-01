from playwright.sync_api import sync_playwright
from harness import mount,browser_options
import json
errors=[]
base={'ba_onboarding_v1':json.dumps({'completedAt':1,'version':'1.15'})}
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.on('pageerror',lambda e: errors.append(str(e)))
    mount(page,'challenge/BA-MAZE-1DIACHZ','id',base)
    page.wait_for_selector('.share-challenge-card')
    assert page.locator('.share-game').count()==1
    assert 'Maze Escape' in page.locator('.share-game').inner_text()
    page.close()

    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.on('pageerror',lambda e: errors.append(str(e)))
    mount(page,'arena-builder','id',base)
    page.wait_for_selector('.builder-layout')
    assert page.locator('.builder-game-grid button').count()==12
    page.close()

    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda e: errors.append(str(e)))
    mount(page,'settings','id',base)
    page.wait_for_selector('.settings-page')
    assert page.locator('select').count()>=2
    page.close()

    assert not errors,errors
    print('v1.15 browser QA passed: challenge share, arena builder, accessibility settings desktop/mobile')
    browser.close()
