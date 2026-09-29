"""Optional HTTP checks. Start node scripts/serve.mjs in another terminal first."""
from pathlib import Path
import urllib.request, urllib.error, gzip, json, os
ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get('ARENA_TEST_URL','http://127.0.0.1:4173').rstrip('/')
results=[]
for file in sorted((ROOT/'dist').rglob('*')):
 if not file.is_file():continue
 relative=file.relative_to(ROOT/'dist').as_posix()
 with urllib.request.urlopen(BASE+'/'+relative,timeout=10) as response:
  body=response.read();content_type=response.headers['Content-Type']
  assert body==file.read_bytes(),relative
  if file.suffix=='.js':assert 'javascript' in content_type,relative
  if file.suffix=='.css':assert 'text/css' in content_type,relative
  results.append({'asset':relative,'passed':True,'status':response.status,'contentType':content_type})
req=urllib.request.Request(BASE+'/index.html',headers={'Accept-Encoding':'gzip'})
with urllib.request.urlopen(req,timeout=10) as response:
 assert response.headers['Content-Encoding']=='gzip'
 assert gzip.decompress(response.read())==(ROOT/'dist/index.html').read_bytes()
results.append({'check':'gzip-index','passed':True})
for route,method,status in [('/missing.file','GET',404),('/','POST',405),('/%2e%2e%2fpackage.json','GET',403)]:
 try:
  urllib.request.urlopen(urllib.request.Request(BASE+route,method=method),timeout=10)
  raise AssertionError(f'{method} {route} unexpectedly allowed')
 except urllib.error.HTTPError as e:assert e.code==status,(route,e.code,status)
 results.append({'check':method+' '+route,'passed':True,'status':status})
(ROOT/'qa-results').mkdir(exist_ok=True)
(ROOT/'qa-results/http-results.json').write_text(json.dumps(results,indent=2))
print(f'{len(results)} HTTP checks passed ({len(results)-4} assets plus 4 response checks).')
