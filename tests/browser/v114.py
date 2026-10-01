from playwright.sync_api import sync_playwright
from harness import mount, browser_options
import json, time
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    page=browser.new_page(viewport={'width':1440,'height':1000})
    page.on('pageerror',lambda e: errors.append(str(e)))
    mount(page,'home','id')
    assert page.locator('.smart-nav-group').count()==4
    before=page.locator('.ba-app').get_attribute('class')
    page.keyboard.press('Control+Shift+S'); page.wait_for_timeout(100)
    after=page.locator('.ba-app').get_attribute('class')
    assert before!=after
    page.keyboard.press('Control+K'); page.wait_for_selector('.command-dialog[open]')
    assert page.locator('.command-results button').count()>=8
    page.keyboard.press('Escape')
    page.locator('.notification-button').click(); page.wait_for_selector('.notification-dialog[open]')
    page.keyboard.press('Escape')
    assert not errors, errors
    page.close()

    recovery={'id':'session-recovery-qa','gameId':'maze','challengeCode':'BA-MAZE-1DIACHZ','mode':'practice','schoolLevel':'sd','universityDifficulty':'hard','elapsedMs':65000,'lastSavedAt':int(time.time()*1000),'actions':[]}
    page=browser.new_page(viewport={'width':390,'height':844})
    page.on('pageerror',lambda e: errors.append(str(e)))
    mount(page,'maze-escape','id',{'ba_recovery_session_v2':json.dumps(recovery)})
    page.wait_for_selector('.setup-recovery-card')
    page.locator('.setup-recovery-card .ba-button.primary').click()
    page.wait_for_selector('.maze-gameplay',timeout=8000)
    assert not errors, errors
    print('v1.14 browser QA passed: smart sidebar, command palette, notifications, recovery auto-start, mobile maze')
    browser.close()
