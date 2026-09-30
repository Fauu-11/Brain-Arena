from pathlib import Path
import sys, json
from playwright.sync_api import sync_playwright
from harness import mount, ROOT, browser_options
OUT=ROOT/'qa-results/browser'; OUT.mkdir(parents=True, exist_ok=True)
GAMES=['300','prime','pixel','mnm','cube','rps','sudoku','minesweeper']

def overflow(page):
 return page.evaluate('''()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth,offenders:[...document.querySelectorAll('.arena-game *')].filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0 && (r.right>innerWidth+1 || r.left < -1) && s.position!=='absolute' && s.visibility!=='hidden' && !e.closest('.play-hero-art');}).slice(0,10).map(e=>({tag:e.tagName,cls:e.className?.baseVal??e.className,rect: {width:e.getBoundingClientRect().width,right:e.getBoundingClientRect().right},text:e.textContent.slice(0,60)}))})''')

def play(page,g):
 page.locator('.play-levels button').first.click()
 page.locator('.play-setup-actions .uw-btn-primary').first.click()
 if g=='300': page.locator('.arithmetic-config .uw-btn-primary').click()
 if g=='rps':
  page.locator('.rps-planar').wait_for()
  page.locator('.rps-planar>button').click()
  page.wait_for_selector('.rps-gameplay',timeout=6000)
 if g in ['mnm','sudoku']:
  page.locator('.memory-phase .uw-btn').click()
 page.wait_for_timeout(220)

results=[]
with sync_playwright() as p:
 b=p.chromium.launch(**browser_options())
 for w,h in [(1440,1000),(390,844),(320,800)]:
  for g in GAMES:
   page=b.new_page(viewport={'width':w,'height':h})
   errors=[]
   page.on('pageerror',lambda e:errors.append(str(e)))
   rec={'game':g,'width':w}
   try:
    mount(page,g)
    page.locator(f'.arena-game[data-game="{g}"]').wait_for()
    rec['setupOverflow']=overflow(page)
    page.evaluate('()=>{document.activeElement?.blur();window.scrollTo(0,0)}')
    page.wait_for_timeout(80)
    page.screenshot(path=str(OUT/f'{g}-setup-{w}.png'),full_page=True)
    # All four level buttons remain interactive and selected state is explicit.
    for i in range(4):
     page.locator('.play-levels button').nth(i).click()
     assert page.locator('.play-levels button').nth(i).get_attribute('aria-pressed')=='true'
    rec['fourLevels']=True
    # Open rules and dismiss using keyboard: dialog must not eat game keys.
    page.locator('.play-rules-link').click()
    assert page.locator('dialog[open]').count()==1
    page.keyboard.press('Escape')
    assert page.locator('dialog[open]').count()==0
    rec['rulesDialog']=True
    play(page,g)
    rec['activeState']=page.locator('.arena-game').get_attribute('data-state')
    rec['activeOverflow']=overflow(page)
    page.evaluate('()=>{document.activeElement?.blur();window.scrollTo(0,0)}')
    page.wait_for_timeout(80)
    page.screenshot(path=str(OUT/f'{g}-play-{w}.png'),full_page=True)
    rec['passed']=rec['activeState'] in ['playing','practice','match'] and not errors and rec['setupOverflow']['document']<=w and rec['activeOverflow']['document']<=w
   except Exception as e:
    rec['passed']=False; rec['exception']=str(e)[:1100]
    page.screenshot(path=str(OUT/f'{g}-error-{w}.png'),full_page=True)
   rec['jsErrors']=errors
   results.append(rec)
   print(json.dumps(rec,ensure_ascii=True),flush=True)
   page.close()
 b.close()
(OUT/'smoke-results.json').write_text(json.dumps(results,indent=2))

if not all(result['passed'] for result in results):
 raise SystemExit(1)
