from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from harness import mount, ROOT, browser_options

OUT=ROOT/'qa-results/v1.12'; OUT.mkdir(parents=True, exist_ok=True)
results=[]

def overflow(page):
    return page.evaluate('''()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth})''')

def run_case(browser,width,name):
    page=browser.new_page(viewport={'width':width,'height':1000 if width>600 else 900},reduced_motion='reduce')
    page.set_default_timeout(10000)
    errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    mount(page,'feedback')
    page.wait_for_selector('.feedback-form')
    assert page.locator('.feedback-form').count()==1
    assert page.locator('.nav-item').filter(has_text='Feedback').count()>=1
    assert '@gmail.com' not in page.locator('body').inner_text()
    ov=overflow(page); assert ov['document']<=width,(width,ov)
    page.evaluate('''()=>{window.fetch=async()=>({ok:true,status:200,json:async()=>({success:true})});}''')
    page.locator('.feedback-field input').first.fill('Maze mobile feedback')
    page.locator('.feedback-field textarea').fill('The maze controls are clear, but I would like a larger touch target on smaller phones.')
    page.locator('.feedback-form button[type="submit"]').click()
    page.wait_for_selector('.feedback-alert.success')
    assert page.locator('.feedback-receipt').count()==1
    page.screenshot(path=str(OUT/name),full_page=True)
    results.append({'width':width,'overflow':ov,'jsErrors':errors,'passed':not errors})
    page.close()

with sync_playwright() as p:
    browser=p.chromium.launch(**browser_options())
    run_case(browser,1440,'feedback-1440.png')
    run_case(browser,390,'feedback-390.png')
    browser.close()

(OUT/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results,indent=2))
if not all(r['passed'] for r in results): raise SystemExit(1)
