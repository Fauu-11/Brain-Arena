from pathlib import Path
import sys,json,itertools,re,time
from playwright.sync_api import sync_playwright
from harness import mount, ROOT, browser_options
OUT=ROOT/'qa-results/browser'; OUT.mkdir(parents=True, exist_ok=True)
results=[]

def shot(page,name):
 page.evaluate('()=>{document.activeElement?.blur();window.scrollTo(0,0)}')
 page.wait_for_timeout(80)
 page.screenshot(path=str(OUT/(name+'.png')),full_page=True)

def run(name, fn, width=390,lang='id',game='sudoku'):
 page=b.new_page(viewport={'width':width,'height':900})
 page.set_default_timeout(5000)
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 try:
  mount(page,game,lang)
  detail=fn(page)
  assert not errors,errors
  results.append({'name':name,'passed':True,'detail':detail,'errors':errors})
 except Exception as e:
  results.append({'name':name,'passed':False,'error':str(e)[:1200],'errors':errors})
  shot(page,name+'-error')
 print(json.dumps(results[-1]),flush=True)
 page.close()

def sudoku_finish(page):
 page.locator('.play-levels button').first.click();page.locator('.play-setup-actions .uw-btn-primary').click()
 solution=page.locator('[data-sudoku-memo]').all_text_contents()
 page.locator('.memory-phase .uw-btn').click()
 for i,val in enumerate(solution):
  cell=page.locator(f'[data-sudoku-cell="{i}"]')
  if not cell.inner_text().strip():
   cell.click();page.keyboard.press(val.strip())
 page.locator('.sudoku-actions .uw-btn-primary').click()
 page.wait_for_selector('.play-result')
 shot(page,'sudoku-result-mobile')
 page.locator('.play-result-actions .uw-btn-primary').click()
 assert page.locator('.arena-game').get_attribute('data-state')=='start'
 return 'Solved via memorized board; result and restart work.'

def cube_finish(page):
 page.locator('.play-levels button').first.click();page.locator('.play-setup-actions .uw-btn-primary').click()
 for i in range(5):
  page.locator('.cube-answer-form input').wait_for(state='visible')
  page.wait_for_function('!document.querySelector(".cube-answer-form input").disabled')
  total=page.locator('.cube-play-panel [data-cube-voxel]').count()
  page.locator('.cube-answer-form input').fill(str(total));page.locator('.cube-answer-form button').click()
  if i<4: page.wait_for_timeout(1250)
 page.wait_for_selector('.play-result',timeout=7000)
 assert page.locator('.play-result-scores').inner_text().find('5/5')!=-1
 shot(page,'cube-result-desktop')
 return 'Five correct cube counts; final 5/5 and level breakdown rendered.'

def pixel_finish(page):
 page.locator('.play-levels button').first.click();page.locator('.play-setup-actions .uw-btn-primary').click()
 data=page.evaluate('''()=>{const bits=grid=>[...grid.children].map(c=>c.style.backgroundColor!=='rgba(255, 255, 255, 0.05)');return {target:bits(document.querySelector('.pixel-targets [style*="grid-template-columns"]')),cards:[...document.querySelectorAll('.pixel-board>[role="button"]')].map(c=>bits(c.firstElementChild))}}''')
 match=None
 for n in range(1,len(data['cards'])+1):
  for ids in itertools.combinations(range(len(data['cards'])),n):
   sums=[sum(data['cards'][i][k] for i in ids) for k in range(15)]
   if all(v==int(t) for v,t in zip(sums,data['target'])):match=ids;break
  if match:break
 assert match,'No valid combination from visible pixels'
 for i in match:
  card=page.locator('.pixel-board>[role="button"]').nth(i)
  card.focus();page.keyboard.press('Enter')
  assert card.get_attribute('aria-pressed')=='true'
 page.get_by_role('button',name=re.compile('Periksa Terpilih')).click()
 page.wait_for_selector('.play-result')
 shot(page,'pixel-result-desktop')
 return 'Solved by visible pixel patterns using keyboard activation; result rendered.'

def prime_turn(page):
 page.locator('.play-levels button').first.click();page.locator('.play-setup-actions .uw-btn-secondary').click()
 nums=page.locator('.prime-board button').all_text_contents()
 i=next(i for i,s in enumerate(nums) if s.strip().isdigit() and int(s)>1 and all(int(s)%d for d in range(2,int(int(s)**.5)+1)))
 page.locator('.prime-board button').nth(i).click()
 page.wait_for_timeout(250)
 assert page.locator('.play-player.player-1>strong').inner_text().startswith('1')
 return 'Local duel starts, correct prime scores one point.'

def mnm_pair(page):
 page.locator('.play-levels button').first.click();page.locator('.play-setup-actions .uw-btn-secondary').click()
 nums=page.locator('.mnm-board button').all_text_contents()
 pair=next((i,j) for i in range(len(nums)) for j in range(i+1,len(nums)) if nums[i]==nums[j])
 page.locator('.memory-phase .uw-btn').click()
 for i in pair:page.locator('.mnm-board button').nth(i).click()
 page.wait_for_timeout(1000)
 assert page.locator('.play-player.player-1>strong').inner_text().startswith('1')
 return 'Local duel starts, matching remembered chips scores one point.'

def rps_roll(page):
 page.locator('.play-levels button').first.click();page.locator('.play-setup-actions .uw-btn-primary').click();page.locator('.rps-planar>button').click()
 page.wait_for_selector('.rps-gameplay')
 for i in range(3):page.locator('[data-direction="down"]').click()
 assert page.get_by_role('button',name='PUTAR',exact=True).is_enabled()
 page.get_by_role('button',name='PUTAR',exact=True).click()
 page.wait_for_selector('.rps-result-dialog[open]',timeout=6000)
 shot(page,'rps-battle-mobile')
 page.locator('[data-action="acknowledge"]').click()
 assert page.locator('.rps-result-dialog[open]').count()==0
 return 'Plan three moves, roll die, show battle feedback and continue.'

def advanced(page,g):
 page.locator('.play-levels button').nth(3).click();page.locator('.play-setup-actions .uw-btn-primary').click()
 if g in ['sudoku','mnm']:page.locator('.memory-phase .uw-btn').click()
 if g=='rps':
  page.locator('.rps-planar>button').click()
  page.wait_for_selector('.rps-gameplay')
 rect=page.evaluate('''()=>{const stage=document.querySelector('.play-stage').getBoundingClientRect();return [...document.querySelectorAll('.play-stage-body button,.play-stage-body [role="button"],.play-stage-body input')].filter(el=>{const r=el.getBoundingClientRect();return r.width && (r.right>stage.right+1 || r.left<stage.left-1)}).map(el=>el.outerHTML.slice(0,220))}''')
 assert not rect,rect
 if g=='sudoku':assert page.locator('[data-sudoku-cell]').count()==81
 if g=='rps':assert page.locator('.rps-arena>div').count()==49
 shot(page,g+'-advanced-mobile')
 return 'Largest board fits stage; no clipped controls.'

def arithmetic(page):
 page.locator('.play-levels button').first.click()
 page.locator('.play-mode-button').nth(1).click()
 page.get_by_role('button',name='30 Soal',exact=True).click()
 page.locator('.arithmetic-config .uw-btn-primary').click()
 assert page.locator('input[data-wrong]').count()==30
 page.locator('input[data-wrong]').first.fill('123456')
 page.get_by_role('button',name=re.compile('KIRIM HALAMAN')).click()
 assert page.locator('input[data-wrong]').first.is_disabled()
 shot(page,'arithmetic-arena-mobile')
 return 'Arena mode renders 30 inputs; invalid submission triggers original lock penalty.'

def favorite_lang(page):
 page.locator('.play-tool').click();assert page.locator('.play-tool').get_attribute('aria-pressed')=='true'
 page.locator('.language-button').click();assert page.locator('html').get_attribute('lang')=='en'
 assert 'Blind Sudoku' in page.locator('.play-hero h1').inner_text()
 page.locator('.play-tool').click();assert page.locator('.play-tool').get_attribute('aria-pressed')=='false'
 return 'Game favorite toggle and live ID/EN language switch work.'

with sync_playwright() as p:
 b=p.chromium.launch(**browser_options())
 run('sudoku-complete-restart',sudoku_finish)
 run('cube-complete',cube_finish,width=1440,game='cube')
 run('pixel-complete',pixel_finish,width=1440,game='pixel')
 run('prime-local-duel',prime_turn,game='prime')
 run('mnm-local-duel',mnm_pair,game='mnm')
 run('rps-roll',rps_roll,game='rps')
 for g in ['sudoku','mnm','rps','pixel','prime']:
  run(g+'-largest-board',lambda page,g=g:advanced(page,g),width=320,game=g)
 run('arithmetic-arena',arithmetic,game='300')
 run('favorites-language',favorite_lang)
 for g in ['300','prime','pixel','mnm','cube','rps','sudoku']:
  run(g+'-english',lambda page: page.locator('.play-setup-heading h2').inner_text(),lang='en',game=g)
 b.close()
(OUT/'functional-results.json').write_text(json.dumps(results,indent=2))

if not all(result['passed'] for result in results):
 raise SystemExit(1)
