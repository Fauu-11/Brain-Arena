import json
from playwright.sync_api import expect, sync_playwright
from harness import mount, browser_options

errors = []
base = {
    'ba_onboarding_v1': json.dumps({'completedAt': 1, 'version': '1.15'}),
    'ba_data_schema': '16',
    'ba_pinned_games_v2': json.dumps(['maze', 'sudoku', 'game2048']),
    'ba_favorites_v2': json.dumps(['maze', 'sudoku']),
}

with sync_playwright() as p:
    browser = p.chromium.launch(**browser_options())
    page = browser.new_page(viewport={'width': 1440, 'height': 1000})
    page.on('pageerror', lambda e: errors.append(str(e)))
    # The legacy home QA now exercises the full catalog on #/games.
    mount(page, 'games', 'id', base)
    page.wait_for_selector('.catalog-refresh .pinned-v2-section')
    catalog = page.locator('.catalog-section')
    cards = catalog.locator('.game-grid .game-card')
    pins = page.locator('.pinned-v2-grid article')
    pin_titles = pins.locator('.pinned-v2-main strong')
    search = catalog.get_by_role('textbox', name='Cari dalam katalog game')
    difficulty = catalog.get_by_role('combobox', name='Filter kesulitan')
    status = catalog.get_by_role('combobox', name='Filter status')

    expect(pins).to_have_count(3)
    expect(catalog.locator('.filter-v2-select select')).to_have_count(2)
    expect(pin_titles).to_have_text(['Maze Escape', 'Sudoku Buta', '2048'])
    expect(pins.first.get_by_role('button', name='Naikkan Maze Escape', exact=True)).to_be_disabled()
    expect(pins.last.get_by_role('button', name='Turunkan 2048', exact=True)).to_be_disabled()
    pins.nth(1).get_by_role('button', name='Naikkan Sudoku Buta', exact=True).click()
    expect(pin_titles).to_have_text(['Sudoku Buta', 'Maze Escape', '2048'])
    pins.first.get_by_role('button', name='Turunkan Sudoku Buta', exact=True).click()
    expect(pin_titles).to_have_text(['Maze Escape', 'Sudoku Buta', '2048'])

    total_games = cards.count()
    assert total_games > 3, total_games
    status.select_option('favorite')
    expect(cards).to_have_count(2)
    difficulty.select_option('hard')
    expect(cards).to_have_count(1)
    expect(cards).to_have_attribute('data-game', 'maze')
    search.fill('no matching game v116')
    expect(cards).to_have_count(0)
    catalog.get_by_role('button', name='Reset filter', exact=True).click()
    expect(search).to_have_value('')
    expect(difficulty).to_have_value('all')
    expect(status).to_have_value('all')
    expect(cards).to_have_count(total_games)

    search.fill('sudoku')
    expect(cards).to_have_count(1)
    card = catalog.locator('.game-card[data-game="sudoku"]')
    save = card.locator('details.game-save')
    favorite = save.locator('.favorite-button')
    pin = save.locator('.pin-button')
    expect(favorite).not_to_be_visible()
    expect(pin).not_to_be_visible()
    save.locator('summary').click()
    expect(favorite).to_have_attribute('aria-pressed', 'true')
    expect(pin).to_have_attribute('aria-pressed', 'true')
    favorite.click()
    expect(favorite).to_have_attribute('aria-pressed', 'false')
    favorite.click()
    expect(favorite).to_have_attribute('aria-pressed', 'true')
    pin.click()
    expect(pin).to_have_attribute('aria-pressed', 'false')
    expect(pin_titles).to_have_text(['Maze Escape', '2048'])
    pin.click()
    expect(pin).to_have_attribute('aria-pressed', 'true')
    expect(pin_titles).to_have_text(['Maze Escape', '2048', 'Sudoku Buta'])

    search.fill('')
    status.select_option('pinned')
    expect(cards).to_have_count(3)
    status.select_option('favorite')
    expect(cards).to_have_count(2)
    page.close()
    assert not errors, errors
    print('v1.16 catalog QA passed: pinned games v2, save options and search/filter v2 on #/games')
    browser.close()
