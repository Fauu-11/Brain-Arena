"""v1.2 browser checks using the same offline harness as v1.1.
No production test hooks. Randomness/clock are controlled only in this harness.
"""
import json, re, traceback
from pathlib import Path
from playwright.sync_api import sync_playwright
from harness import mount, ROOT, browser_options
OUT = ROOT / 'qa-results/duel-browser'
OUT.mkdir(parents=True, exist_ok=True)
results = []

def new_page(browser, width=1440, language='id', reduced=True, clock=False):
    page = browser.new_page(viewport={'width':width, 'height':1000 if width > 600 else 900}, reduced_motion='reduce' if reduced else 'no-preference')
    page.set_default_timeout(7000)
    errors=[]
    page.on('pageerror',lambda e: errors.append(str(e)))
    page.evaluate('''() => { let seed=918273; Math.random=()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;}; }''')
    if clock: page.clock.install()
    mount(page, 'suwit', language)
    return page, errors

def start(page, level=2, clock=False, shot=None):
    page.locator('.play-levels button').nth(level).click()
    page.locator('.play-setup-actions .uw-btn-primary').click()
    assert page.locator('.rps-net-face').count()==6
    faces = {e.get_attribute('data-net-face'):e.get_attribute('data-shape') for e in page.locator('.rps-net-face').all()}
    if shot: page.screenshot(path=str(OUT/f'net-{shot}.png'),full_page=True)
    page.locator('.rps-start-button').click()
    assert page.locator('[data-game="rps"]').get_attribute('data-state')=='folding'
    if clock: page.clock.run_for(400)
    page.wait_for_selector('.rps-gameplay')
    assert page.locator('.rps-die').get_attribute('data-top')==faces['top']
    assert page.locator('.rps-cell').count()==49
    return faces

def roll(c,d):
    t,b,f,k,l,r=[c[p] for p in ['top','bottom','front','back','left','right']]
    v={'down':[k,f,t,b,l,r], 'up':[f,k,b,t,l,r], 'right':[l,r,f,k,b,t], 'left':[r,l,f,k,t,b]}[d]
    return dict(zip(['top','bottom','front','back','left','right'],v))

def outcome(a,b):
    return 'draw' if a==b else 'win' if {'rock':'scissors','paper':'rock','scissors':'paper'}[a]==b else 'lose'

def options(position, faces, board, count):
    paths=[]
    delta={'down':(0,1),'right':(1,0),'up':(0,-1),'left':(-1,0)}
    opp={'down':'up','up':'down','left':'right','right':'left'}
    def visit(pos,cube,moves):
        if len(moves)==count:
            tile=board[(pos[1]-1)*7+pos[0]]
            paths.append((outcome(cube['bottom'],tile), moves, pos, cube))
            return
        for d,(dx,dy) in delta.items():
            if pos[1]==0 and d!='down':continue
            if moves and opp[moves[-1]]==d:continue
            new=(pos[0]+dx,pos[1]+dy)
            if 0<=new[0]<7 and 1<=new[1]<=7:visit(new,roll(cube,d),moves+[d])
    visit(position,faces,[])
    return paths

def do_turn(page,faces,wanted='win',shot=None):
    pos=tuple(map(int,page.locator('.rps-die-position').get_attribute('data-position').split(',')))
    board=page.locator('.rps-cell').evaluate_all('(els)=>els.map(e=>e.dataset.tile)')
    n=page.locator('.rps-move-slot').count()
    candidates=options(pos,faces,board,n)
    chosen=next((c for c in candidates if c[0]==wanted),candidates[0])
    expected,moves,destination,cube=chosen
    for d in moves: page.locator(f'[data-direction="{d}"]').click()
    assert page.locator('[data-action="roll"]').is_enabled()
    if shot: page.screenshot(path=str(OUT/f'planned-{shot}.png'),full_page=True)
    page.locator('[data-action="roll"]').click()
    timer=page.locator('.play-turn-clock strong').inner_text()
    assert page.locator('[data-action="undo"]').is_disabled()
    assert page.locator('[data-action="clear"]').is_disabled()
    page.wait_for_selector('.rps-result-dialog[open]')
    actual=page.locator('[data-outcome]').get_attribute('data-outcome')
    assert actual==expected,(expected,actual,moves)
    assert page.locator('.play-turn-clock strong').inner_text()==timer, 'Timer changed after rolling began'
    assert page.locator('.rps-die-position').get_attribute('data-position')==','.join(map(str,destination))
    if shot: page.screenshot(path=str(OUT/f'result-{shot}.png'),full_page=True)
    page.locator('[data-action="acknowledge"]').click()
    page.wait_for_timeout(60)
    if page.locator('.rps-gameplay').count():
        assert page.locator('.rps-die-position').get_attribute('data-position')==','.join(map(str,destination))
        assert page.locator('.rps-die').get_attribute('data-top')==cube['top']
    return cube,expected

def bounds(page):
    return page.evaluate('''() => {const w=innerWidth,stage=document.querySelector('.play-stage').getBoundingClientRect();
      return {width:w,doc:document.documentElement.scrollWidth,clipped:[...document.querySelectorAll('.rps-controls button,.rps-move-slots,.rps-board-wrap')].filter(e=>{const r=e.getBoundingClientRect();return r.left<stage.left-1||r.right>stage.right+1;}).map(e=>e.className)};}''')

def run(browser,name,fn,**kwargs):
    page,errors=new_page(browser,**kwargs)
    rec={'name':name}
    try:
        rec['details']=fn(page)
        assert not errors,errors
        rec['passed']=True
    except Exception as e:
        rec.update(passed=False,error=str(e),traceback=traceback.format_exc())
        page.screenshot(path=str(OUT/f'ERROR-{name}.png'),full_page=True)
    rec['jsErrors']=errors
    results.append(rec)
    print(json.dumps(rec),flush=True)
    page.close()

def responsive(page,width):
    faces=start(page,level=3,shot=width)
    rect=bounds(page); assert rect['doc']<=width and not rect['clipped'],rect
    assert page.locator('.rps-cell svg[data-rps-icon]').count()==49
    assert all(page.locator(f'[data-direction="{d}"]').is_disabled() for d in ['up','left','right'])
    assert page.locator('[data-direction="down"]').is_enabled()
    page.screenshot(path=str(OUT/f'play-{width}.png'),full_page=True)
    faces,result=do_turn(page,faces,shot=width)
    assert page.locator('.rps-gameplay').get_attribute('data-turn')=='2'
    rect2=bounds(page);assert rect2['doc']<=width and not rect2['clipped'],rect2
    return {'bounds':rect,'result':result,'secondTurn':True}

def controls(page):
    start(page,level=0)
    page.locator('[data-direction="down"]').click()
    assert page.locator('[data-direction="up"]').is_disabled()
    page.evaluate('document.activeElement.blur()')
    page.keyboard.press('ArrowRight')
    assert page.locator('.rps-move-slot.filled').count()==2
    page.keyboard.press('Backspace')
    assert page.locator('.rps-move-slot.filled').count()==1
    page.keyboard.press('Delete')
    assert page.locator('.rps-move-slot.filled').count()==0
    page.keyboard.press('ArrowLeft')
    assert page.locator('.rps-move-slot.filled').count()==0
    for _ in range(6): page.keyboard.press('s')
    assert page.locator('.rps-move-slot.filled').count()==3
    page.keyboard.press('Enter')
    page.wait_for_selector('.rps-result-dialog[open]')
    assert page.locator('dialog[open]').count()==1
    page.wait_for_function("document.activeElement?.dataset.action === 'acknowledge'")
    page.keyboard.press('Enter')
    page.wait_for_selector('.rps-gameplay[data-turn="2"]')
    return 'Arrow/WASD, undo, clear, boundary, max-count and keyboard result confirmation passed.'

def pause_timeout(page):
    start(page,clock=True)
    page.clock.run_for(1100)
    before=page.locator('.play-turn-clock strong').inner_text()
    page.locator('.play-rules-link').click()
    page.wait_for_timeout(60)
    page.clock.fast_forward(10000)
    assert page.locator('.play-turn-clock strong').inner_text()==before
    page.keyboard.press('ArrowDown')
    assert page.locator('.rps-move-slot.filled').count()==0
    page.keyboard.press('Escape');page.wait_for_timeout(60)
    page.clock.fast_forward(22000)
    page.wait_for_selector('[data-outcome="timeout"]')
    page.screenshot(path=str(OUT/'timeout-mobile.png'),full_page=True)
    page.locator('[data-action="acknowledge"]').click()
    page.wait_for_selector('.rps-gameplay[data-turn="2"]')
    assert page.locator('.play-player.player-1>strong').inner_text().startswith('-1')
    assert page.locator('.rps-die-position').get_attribute('data-position')=='3,0'
    assert page.locator('.play-turn-clock strong').inner_text().startswith('20')
    return 'Rules pause the timer and keys. Timeout deducts one point exactly once; next turn starts at unchanged START.'

def all_outcomes(page):
    faces=start(page)
    observed=[]
    for wanted in ['lose','win','draw']:
        faces,actual=do_turn(page,faces,wanted=wanted)
        assert actual==wanted,(wanted,actual)
        observed.append(actual)
    assert page.locator('.play-player.player-1>strong').inner_text().startswith('-1')
    assert page.locator('.play-player.player-2>strong').inner_text().startswith('1')
    return observed

def full_match(page):
    faces=start(page)
    turns=0
    while page.locator('.rps-gameplay').count() and turns<32:
        faces,_=do_turn(page,faces)
        turns+=1
    assert page.locator('.play-result').count()==1,'No match-end state'
    page.screenshot(path=str(OUT/'match-complete.png'),full_page=True)
    assert '4' in page.locator('.play-result-scores').inner_text()
    page.locator('.play-result-actions .uw-btn-primary').click()
    assert page.locator('[data-game="rps"]').get_attribute('data-state')=='planar'
    page.locator('.rps-start-button').click();page.wait_for_selector('.rps-gameplay')
    assert page.locator('.rps-gameplay').get_attribute('data-turn')=='1'
    for n in (1,2):assert page.locator(f'.play-player.player-{n}>strong').inner_text().startswith('0')
    return {'completedTurns':turns,'restartScores':[0,0]}

def exit_midroll(page):
    start(page,level=0)
    for _ in range(3):page.locator('[data-direction="down"]').click()
    page.locator('[data-action="roll"]').click()
    page.locator('.play-back').click();page.wait_for_timeout(2100)
    assert page.locator('.arena-game').count()==0
    assert page.locator('dialog[open]').count()==0
    return 'Navigation unmounts the game and cancels pending roll callbacks.'

def language(page):
    faces=start(page)
    assert 'Dice Duel' in page.locator('.play-hero h1').inner_text()
    assert page.get_by_role('button',name='Move Down',exact=True).count()==1
    do_turn(page,faces)
    page.locator('.language-button').click()
    assert 'Duel Dadu' in page.locator('.play-hero h1').inner_text()
    assert page.locator('.rps-gameplay').get_attribute('data-turn')=='2'
    return 'English start, roll, result and live Indonesian switch keep the current match.'

with sync_playwright() as p:
    b=p.chromium.launch(**browser_options())
    for width in [320,390,768,1440]:run(b,f'responsive-{width}',lambda pg,w=width:responsive(pg,w),width=width)
    run(b,'keyboard-and-editing',controls)
    run(b,'rules-pause-timeout',pause_timeout,width=390,clock=True)
    run(b,'win-lose-draw-negative',all_outcomes,width=390)
    run(b,'complete-match-and-restart',full_match)
    run(b,'exit-midroll',exit_midroll,reduced=False)
    run(b,'live-language',language,language='en',width=390)
    b.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
if not all(r['passed'] for r in results):raise SystemExit(1)
