from playwright.sync_api import sync_playwright
from harness import mount,browser_options
import json
errors=[]
now=1790840000000
match={'id':'match-v117','gameId':'maze','time':now,'dateKey':'2026-10-01','mode':'ranked','outcome':'completed','schoolLevel':'universitas','universityDifficulty':'hard','challengeCode':'BA-MAZE-1DIACHZ','durationMs':65000,'performance':94,'grade':'A','hintsUsed':0,'rankedDelta':16,'xp':80,'isPersonalBest':True,'previousBestMs':80000,'replay':[{'t':5000,'type':'key','label':'ArrowUp'}],'integrity':{'recoveryCount':0,'visibilityChanges':0}}
base={'ba_onboarding_v1':json.dumps({'completedAt':1,'version':'1.15'}),'ba_data_schema':'17','ba_match_history_v1':json.dumps([match]),'ba_selected_replay_v1':'match-v117','ba_profile_v1':json.dumps({'name':'Fauzi','xp':1500,'rankedPoints':520,'completions':8,'playDates':['2026-10-01'],'perGame':{'maze':{'completions':4,'xp':500,'masteryXp':120,'lastPlayedAt':now}},'xpEvents':[],'completionEvents':[]})}
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    for route,selector,width in [
        ('profiles','.local-profiles-page',1440),('showcase','.showcase-page',1440),('share-result','.result-card-page',1440),
        ('arena-cup','.arena-cup-page',1440),('practice-lab','.practice-lab-page',1440),('save-slots','.save-slots-page',1440),
        ('storage-center','.storage-center-page',390),('diagnostics','.diagnostics-page',390),('controls','.controls-page',390),('settings','.v117-tools-panel',390)]:
        page=browser.new_page(viewport={'width':width,'height':900}); page.on('pageerror',lambda e:errors.append(f'{route}: {e}')); mount(page,route,'id',base); page.wait_for_selector(selector,timeout=10000); assert page.evaluate('document.documentElement.scrollWidth')<=width,(route,page.evaluate('document.documentElement.scrollWidth'))
        if route=='profiles':
            page.locator('.profile-create-form input').fill('Guest'); page.locator('.profile-create-form .ba-button').click(); assert page.locator('.local-profile-grid article').count()>=2
        if route=='arena-cup':
            assert page.locator('.cup-start-card').count()==1
        if route=='practice-lab':
            assert page.locator('.practice-lab-grid article').count()==12
        page.close()
    assert not errors,errors
    print('v1.17 browser QA passed: profiles, showcase, result card, Arena Cup, Practice Lab, Save Slots, Storage, Diagnostics, Controls, Settings')
    browser.close()
