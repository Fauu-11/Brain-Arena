from playwright.sync_api import sync_playwright
from harness import mount,browser_options
import json

base={
    'ba_onboarding_v1':json.dumps({'completedAt':1,'version':'1.19'}),
    'ba_data_schema':'19',
    'ba_profile_v1':json.dumps({'name':'Cloud QA','xp':1800,'rankedPoints':320,'completions':8,'playDates':['2026-10-01'],'perGame':{},'xpEvents':[],'completionEvents':[]})
}
checks=[
    ('home','.home-page',390,844),
    ('settings','.settings-page',768,900),
    ('cloud-readiness','.cloud-readiness-page',390,844),
    ('diagnostics','.diagnostics-page',768,900),
]
errors=[]
with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    for route,selector,width,height in checks:
        page=browser.new_page(viewport={'width':width,'height':height})
        page.on('pageerror',lambda e,r=route: errors.append(f'{r}: {e}'))
        mount(page,route,'id',base)
        page.wait_for_selector(selector,timeout=10000)
        page.wait_for_timeout(350)
        overflow=page.evaluate('document.documentElement.scrollWidth')
        assert overflow<=width,(route,width,overflow)
        if route=='cloud-readiness':
            page.wait_for_selector('.cloud-readiness-grid article',timeout=10000)
            assert page.locator('.cloud-readiness-grid article').count()>=8
            assert 'Guest' not in page.locator('.cloud-readiness-hero').inner_text() or page.locator('.cloud-readiness-hero code').count()==1
        if route=='diagnostics':
            page.wait_for_selector('.diagnostic-grid article',timeout=10000)
            assert page.locator('.diagnostic-grid article').count()>=11
        page.close()
    assert not errors,errors
    print('v1.19 Supabase readiness QA passed at 390px and 768px with no page errors')
    browser.close()
