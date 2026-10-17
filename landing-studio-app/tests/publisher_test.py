"""Publication copies every approved asset and keeps failed preparations isolated."""
import importlib.util, pathlib, tempfile, os, json, hashlib, unittest
from unittest.mock import patch
from types import SimpleNamespace
SCRIPT=pathlib.Path(__file__).resolve().parents[1]/'scripts/studio/publish.py'
class PublisherTest(unittest.TestCase):
 def test_multiple_assets_and_failed_preparation(self):
  original=os.getcwd()
  with tempfile.TemporaryDirectory() as temp:
   os.chdir(temp)
   try:
    spec=importlib.util.spec_from_file_location('publisher',SCRIPT);m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
    good='11111111-1111-4111-8111-111111111111';bad='22222222-2222-4222-8222-222222222222'
    a='33333333-3333-4333-8333-333333333333.webp';b='44444444-4444-4444-8444-444444444444.webp';missing='55555555-5555-4555-8555-555555555555.webp'
    old=pathlib.Path('generated')/bad;old.mkdir(parents=True);(old/'index.html').write_text('previous successful publication')
    notifications=[]
    def call(path,body=None):
     if path=='queue':return {'publish':[{'id':good,'revision':2},{'id':bad,'revision':2}]}
     if path.startswith('export/'):
      images=[a,b] if path.endswith(good) else [a,missing]
      html='<html>'+''.join('<img src="'+m.BASE+'/api/image/'+x+'">' for x in images)+'</html>'
      return {'html':html,'revision':2,'image':a,'images':images,'hash':hashlib.sha256(html.encode()).hexdigest()}
     return {}
    def request(url,**kw):
     if url.endswith(missing):raise ValueError('Missing image')
     return b'RIFF0000WEBPsample'
    with patch.object(m,'call',call),patch.object(m,'request',request),patch.object(m,'oidc',lambda:'fake-oidc'),patch.object(m,'notify',lambda job,ok,error='':notifications.append((job['id'],ok))),patch.object(m.subprocess,'run',lambda *a,**kw:SimpleNamespace(returncode=0)),patch.dict(os.environ,{'GITHUB_RUN_ID':'123','GITHUB_OUTPUT':str(pathlib.Path(temp)/'output')}):
     m.sync()
    folder=pathlib.Path('generated')/good
    self.assertTrue((folder/'assets/product.webp').exists());self.assertTrue((folder/'assets/visual-1.webp').exists())
    self.assertIn('assets/visual-1.webp',(folder/'index.html').read_text());self.assertNotIn('/api/image/',(folder/'index.html').read_text())
    self.assertEqual(json.loads((folder/'publication.json').read_text())['images'],2)
    self.assertEqual((old/'index.html').read_text(),'previous successful publication')
    self.assertEqual(notifications,[(bad,False)]);self.assertEqual(json.loads((m.STATE/'jobs.json').read_text()),[{'id':good,'revision':2}])
   finally:os.chdir(original)
if __name__=='__main__':unittest.main()
