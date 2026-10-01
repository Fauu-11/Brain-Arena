from playwright.sync_api import sync_playwright
from harness import mount,browser_options
import json
errors=[]
now=1790840000000
match={'id':'match-v116','gameId':'maze','time':now,'dateKey':'2026-10-01','mode':'ranked','outcome':'completed','schoolLevel':'universitas','universityDifficulty':'hard','challengeCode':'BA-MAZE-1DIACHZ','durationMs':65000,'performance':92,'grade':'A','hintsUsed':1,'rankedDelta':14,'xp':80,'isPersonalBest':True,'previousBestMs':80000,'replay':[{'t':5000,'type':'key','label':'ArrowUp'},{'t':6000,'type':'key','label':'ArrowDown'},{'t':12000,'type':'hint','label':'Brain Coach #1'}],'integrity':{'recoveryCount':0,'visibilityChanges':1}}
base={'ba_onboarding_v1':json.dumps({'completedAt':1,'version':'1.15'}),'ba_match_history_v1':json.dumps([match]),'ba_selected_replay_v1':'match-v116','ba_pinned_games_v2':json.dumps(['maze','sudoku','game2048']),'ba_profile_v1':json.dumps({'name':'Fauzi','xp':500,'rankedPoints':120,'completions':2,'playDates':['2026-10-01'],'perGame':{'maze':{'completions':2,'xp':160,'masteryXp':50,'lastPlayedAt':now}},'xpEvents':[],'completionEvents':[{'gameId':'maze','dateKey':'2026-10-01','time':now}]})}
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));mount(page,'replay','id',base);page.wait_for_selector('.replay-v2-page');assert page.locator('.replay-scrubber input[type="range"]').count()==1;assert page.locator('.replay-coach-v2').count()==1;page.close()
    page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));mount(page,'statistics','id',base);page.wait_for_selector('.analytics-v2-toolbar');assert page.locator('.analytics-range button').count()==4;page.close()
    page=browser.new_page(viewport={'width':390,'height':844});page.on('pageerror',lambda e:errors.append(str(e)));mount(page,'settings','id',base);page.wait_for_selector('.auto-backup-panel');page.close()
    page=browser.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));mount(page,'activity-calendar','id',base);page.wait_for_selector('.calendar-heatmap-grid');assert page.locator('.calendar-cell').count()==91;page.close()
    assert not errors,errors
    print('v1.16 browser QA passed: replay v2, analytics v2, automatic backup UI, activity calendar')
    browser.close()
