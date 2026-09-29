# QA-only in-memory harness. Does not test native HTTP-origin storage.
from pathlib import Path
import posixpath, re, json
ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / 'dist'

def browser_options():
    import os, shutil
    options = {'headless': True}
    executable = os.environ.get('CHROMIUM_EXECUTABLE') or shutil.which('chromium')
    if executable:
        options['executable_path'] = executable
    if os.name == 'posix':
        options['args'] = ['--no-sandbox']
    return options


def mount(page, route='sudoku', language='id'):
    modules={}
    for path in DIST.rglob('*.js'):
        key=path.relative_to(DIST).as_posix()
        text=path.read_text()
        def fix(m):
            target=posixpath.normpath(posixpath.join(posixpath.dirname(key),m.group(2)))
            return m.group(1)+'arena/'+target+m.group(3)
        text=re.sub(r'([\'\"])(\.{1,2}/[^\'\"]+\.js)([\'\"])',fix,text)
        modules['arena/'+key]=text
    css='\n'.join(p.read_text() for p in (DIST/'assets').glob('*.css'))
    page.set_content('<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><style>'+css+'</style></head><body><div id="root"></div></body></html>')
    page.evaluate('''({modules, route, language}) => {
        const store = {uw_lang: language, ba_muted: 'true'};
        window.__qaStorage = store;
        Object.defineProperty(window, 'localStorage', {configurable:true, value:{getItem: k => Object.hasOwn(store,k) ? store[k] : null, setItem:(k,v)=>store[k]=String(v), removeItem:k=>delete store[k], clear:()=>Object.keys(store).forEach(k=>delete store[k])}});
        location.hash = '#/'+route;
        const urls={};
        for(const [key,code] of Object.entries(modules)) urls[key]=URL.createObjectURL(new Blob([code], {type:'text/javascript'}));
        const vendor=Object.keys(urls).find(k=>k.endsWith('/react.js'));
        const vendorDir=vendor.slice(0,-8);
        const imports={...urls,react:urls[vendor],'react-dom':urls[vendorDir+'react-dom.js'],'react-dom/client':urls[vendorDir+'react-dom-client.js']};
        const map=document.createElement('script');map.type='importmap';map.textContent=JSON.stringify({imports});document.head.appendChild(map);
        const main=document.createElement('script');main.type='module';main.src=urls[Object.keys(urls).find(k=>k.endsWith('/main.js'))];document.body.appendChild(main);
    }''', {'modules':modules,'route':route,'language':language})
    page.wait_for_selector('.ba-app',timeout=15000)
    page.wait_for_timeout(300)

