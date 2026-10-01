from pathlib import Path
import json,sys
from playwright.sync_api import sync_playwright
sys.path.insert(0,str(Path(__file__).resolve().parent))
from harness import mount,browser_options
GAMES=['300','prime','pixel','mnm','cube','rps','sudoku','minesweeper','maze','memory-matrix','nonogram','2048']
results=[]
with sync_playwright() as p:
 b=p.chromium.launch(**browser_options())
 for g in GAMES:
  page=b.new_page(viewport={'width':390,'height':900},reduced_motion='reduce'); page.set_default_timeout(10000); errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
  rec={'game':g}
  try:
   mount(page,g)
   if g=='300':
    page.locator('.play-mode-button').first.click()
   else:
    page.locator('.play-levels button').last.click()
   page.locator('.play-university-difficulty button').last.click()
   if g=='300': page.locator('.arithmetic-config .uw-btn-primary').click()
   else: page.locator('.play-setup-actions .uw-btn-primary').first.click()
   if g=='rps':
    page.locator('.rps-planar>button').click();page.wait_for_selector('.rps-gameplay')
   page.wait_for_timeout(180)
   counts={
    'prime':('.prime-board button',25),'rps':('.rps-arena>div',49),'sudoku':('[data-sudoku-memo]',81),
    'minesweeper':('.ms-cell',864),'maze':('.maze-cell',1024),'memory-matrix':('[data-matrix-cell]',64),
    'nonogram':('.nonogram-grid button',400),'2048':('.g2048-tile',16)
   }
   if g in counts:
    sel,n=counts[g]; got=page.locator(sel).count(); rec['cells']=got; assert got==n,(g,got,n)
   if g=='300': assert page.locator('.arithmetic-practice').count()==1
   if g=='pixel': assert page.locator('.pixel-board>[role="button"]').count()>=20
   if g=='cube': assert page.locator('[data-cube-voxel]').count()>0
   if g=='mnm': assert page.locator('.mnm-board').count()==1
   rec['width']=page.evaluate('document.documentElement.scrollWidth');assert rec['width']<=390,(g,rec['width'])
   assert not errors,errors
   rec['passed']=True
  except Exception as e:
   rec['passed']=False;rec['error']=str(e)[:1400]
  rec['jsErrors']=errors;results.append(rec);print(json.dumps(rec),flush=True);page.close()
 b.close()
if not all(r['passed'] for r in results):raise SystemExit(1)
