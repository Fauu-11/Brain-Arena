from pathlib import Path
import json, sys
from playwright.sync_api import sync_playwright
sys.path.insert(0, str(Path(__file__).resolve().parent))
from harness import mount, ROOT, browser_options
OUT=ROOT/'qa-results/minesweeper-browser'; OUT.mkdir(parents=True, exist_ok=True)
results=[]
with sync_playwright() as p:
    b=p.chromium.launch(**browser_options())
    for width,height in [(1440,1000),(390,844),(320,800)]:
        page=b.new_page(viewport={'width':width,'height':height})
        errors=[]; page.on('pageerror', lambda e: errors.append(str(e)))
        rec={'width':width}
        try:
            mount(page,'minesweeper')
            page.locator('.play-levels button').first.click()
            page.locator('.play-setup-actions .uw-btn-primary').first.click()
            page.wait_for_selector('.ms-board')
            assert page.locator('[data-ms-cell]').count()==81
            # First click must be safe and should reveal at least one cell.
            page.locator('[data-ms-cell]').nth(40).click()
            page.wait_for_timeout(80)
            assert page.locator('[data-ms-cell].open').count()>=1
            assert page.locator('[data-ms-cell].mine-hit').count()==0
            rec['firstClickSafe']=True
            # Flag mode works without opening the selected covered cell.
            page.locator('.ms-flag-mode').click()
            covered=page.locator('[data-ms-cell]:not(.open)').first
            covered.click(); page.wait_for_timeout(40)
            assert covered.get_attribute('aria-pressed')=='true'
            rec['flagMode']=True
            # Pause overlays board and resume removes overlay.
            page.locator('.ms-small-button').filter(has_text='Jeda').click()
            assert page.locator('.ms-pause-cover').count()==1
            page.locator('.ms-small-button').filter(has_text='Lanjut').click()
            assert page.locator('.ms-pause-cover').count()==0
            rec['pause']=True
            # No page-level horizontal overflow; expert board is intentionally scrollable inside its board shell.
            rec['documentWidth']=page.evaluate('document.documentElement.scrollWidth')
            assert rec['documentWidth']<=width
            page.screenshot(path=str(OUT/f'minesweeper-play-{width}.png'), full_page=True)
            rec['passed']=not errors
        except Exception as e:
            rec['passed']=False; rec['exception']=str(e)[:1200]
            page.screenshot(path=str(OUT/f'minesweeper-error-{width}.png'), full_page=True)
        rec['jsErrors']=errors
        results.append(rec); print(json.dumps(rec), flush=True); page.close()
    b.close()
(OUT/'results.json').write_text(json.dumps(results,indent=2))
if not all(r['passed'] for r in results): raise SystemExit(1)
