from playwright.sync_api import sync_playwright
from harness import mount,browser_options
import json
from pathlib import Path
errors=[]
games=['aritmatika','bilangan-prima','warna-pixel','mnm-grid','kubus-3d','suwit','sudoku','minesweeper','maze-escape','memory-matrix','nonogram','2048']
base={'ba_onboarding_v1':json.dumps({'completedAt':1,'version':'1.15'}),'ba_data_schema':'16'}
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    for route in games:
        page=browser.new_page(viewport={'width':1280,'height':850})
        page.on('pageerror',lambda e,r=route: errors.append(f'{r}: {e}'))
        mount(page,route,'id',base)
        page.wait_for_selector('.play-setup-card',timeout=15000)
        assert page.locator('.play-setup-card').count()==1,route
        page.close()
    assert not errors,errors
    print('v1.16 all 12 game setup screens passed without JS errors')
    browser.close()
