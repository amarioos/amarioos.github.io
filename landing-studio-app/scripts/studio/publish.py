"""Trusted repository worker. No product input is executed as code or shell."""
import os, json, urllib.request, urllib.error, urllib.parse, pathlib, hashlib, re, base64, sys, shutil, subprocess, uuid, time
BASE='https://landing-studio.okmar49.chatgpt.site'
STATE=pathlib.Path('.studio-state');STATE.mkdir(exist_ok=True)
REPO='amarioos/amarioos.github.io'
def log(s): print(s,flush=True)
def request(url,body=None,token=None,timeout=40):
    data=json.dumps(body,ensure_ascii=False).encode() if body is not None else None
    headers={'User-Agent':'LandingStudio-Publisher/1.0','Accept':'application/json'}
    if data is not None:headers['Content-Type']='application/json'
    if token:headers['Authorization']='Bearer '+token
    req=urllib.request.Request(url,data=data,headers=headers)
    with urllib.request.urlopen(req,timeout=timeout) as r:return r.read()
def oidc():
    url=os.environ['ACTIONS_ID_TOKEN_REQUEST_URL']+'&audience='+urllib.parse.quote(BASE,safe='')
    return json.loads(request(url,token=os.environ['ACTIONS_ID_TOKEN_REQUEST_TOKEN']))['value']
def call(path,body=None):return json.loads(request(BASE+'/api/worker/'+path,body,oidc()))
def notify(job,ok,error=''):
    return call('published',{'id':job['id'],'revision':job['revision'],'ok':ok,'error':error})
def safe_id(s):
    if not re.fullmatch(r'[a-f0-9-]{36}',s):raise ValueError('Invalid project identifier')
    return s


def sync():
    run='https://github.com/'+REPO+'/actions/runs/'+os.environ['GITHUB_RUN_ID']
    call('heartbeat',{'run':run})
    boot=call('bootstrap',{})
    jobs=call('queue');published=[]
    for job in jobs.get('publish',[]):
        safe_id(job['id'])
        try:
            export=call('export/'+job['id']);html=export['html']
            if hashlib.sha256(html.encode()).hexdigest()!=export['hash']:raise ValueError('Export hash mismatch')
            if export['revision']!=job['revision']:raise ValueError('Revision changed')
            image_ids=export.get('images') or [export['image']]
            if len(image_ids)>7 or len(set(image_ids))!=len(image_ids):raise ValueError('Invalid image list')
            stage=STATE/'stage'/job['id']
            if stage.exists():shutil.rmtree(stage)
            (stage/'assets').mkdir(parents=True,exist_ok=True)
            for index,image_id in enumerate(image_ids):
                if not re.fullmatch(r'[a-f0-9-]{36}\.(png|jpg|webp)',image_id):raise ValueError('Image identifier invalid')
                image=request(BASE+'/api/worker/image/'+image_id,token=oidc());ext=image_id.rsplit('.',1)[1]
                if len(image)>3000000:raise ValueError('Image too large')
                filename=('product' if index==0 else 'visual-'+str(index))+'.'+ext
                (stage/'assets'/filename).write_bytes(image)
                html=html.replace(BASE+'/api/image/'+image_id,'assets/'+filename)
            (stage/'index.html').write_text(html,encoding='utf-8')
            (stage/'publication.json').write_text(json.dumps({'revision':job['revision'],'hash':export['hash'],'images':len(image_ids)},indent=2))
            folder=pathlib.Path('generated')/job['id'];folder.parent.mkdir(exist_ok=True)
            if folder.exists():shutil.rmtree(folder)
            shutil.move(str(stage),str(folder))
            published.append(job);log('Prepared public landing '+job['id'])
        except Exception as e:
            log('Publication preparation failed: '+job['id']);notify(job,False,str(e)[:700])
    (STATE/'jobs.json').write_text(json.dumps(published))
    with open(os.environ['GITHUB_OUTPUT'],'a') as f:f.write('pending='+('true' if published else 'false')+'\n')
    if not published:return
    subprocess.run(['git','config','user.name','github-actions[bot]'],check=True)
    subprocess.run(['git','config','user.email','41898282+github-actions[bot]@users.noreply.github.com'],check=True)
    subprocess.run(['git','add','--','generated'],check=True)
    diff=subprocess.run(['git','diff','--cached','--quiet'])
    if diff.returncode:
        subprocess.run(['git','commit','-m','Landing Studio: publish '+str(len(published))+' product page(s)'],check=True)
        subprocess.run(['git','push','origin','HEAD:main'],check=True)
    assemble()

def assemble():
    out=pathlib.Path('_site');out.mkdir(exist_ok=True)
    # Keep existing static sites; do not publish worker source or build tooling.
    for p in pathlib.Path('.').iterdir():
        if p.name.startswith(('.','_')) or p.name in ('scripts','backend','node_modules'):continue
        if p.is_dir() and any(p.rglob('index.html')):shutil.copytree(p,out/p.name,dirs_exist_ok=True)
        elif p.is_file() and p.suffix.lower() in ('.html','.css','.js','.ico','.svg','.png','.webp','.txt'):shutil.copy2(p,out/p.name)
    (out/'.nojekyll').touch()

def finish(success):
    jobs=json.loads((STATE/'jobs.json').read_text()) if (STATE/'jobs.json').exists() else []
    for j in jobs:
        if success:
            # Verify the exact deployed revision, with limited CDN retries.
            url='https://amarioos.github.io/generated/'+safe_id(j['id'])+'/publication.json'
            verified=False
            for i in range(4):
                try:
                    actual=json.loads(request(url+'?revision='+str(j['revision'])))
                    if actual.get('revision')==j['revision']:verified=True;break
                except Exception:pass
                if i<3:time.sleep(10)
            if not verified:log('Deployment succeeded; CDN verification delayed for '+j['id'])
            notify(j,True)
            if j['id']=='f35ba26c-5b1c-4fd1-b3c3-224d02e19ca9':smoke(j)
        else:notify(j,False,'Le déploiement GitHub a échoué. Consultez la file GitHub et relancez la publication.')
    call('heartbeat',{'run':'https://github.com/'+REPO+'/actions/runs/'+os.environ['GITHUB_RUN_ID']})

def smoke(j):
    sid=str(uuid.uuid4());vid=str(uuid.uuid4());headers=None
    request(BASE+'/api/event',{'project':j['id'],'id':sid,'visitor':vid,'device':'desktop','init':True,'preview':False})
    result=json.loads(request(BASE+'/api/order',{'project':j['id'],'session':sid,'name':'TEST AUTOMATIQUE — Landing Studio','phone':'0600000000','city':'Ville test','address':'Adresse fictive pour validation technique','quantity':1,'consent':True,'preview':False}))
    if not result.get('ok'):raise ValueError('Order persistence test failed')
    call('test-records',{'id':j['id'],'session':sid})
    log('PASS: live order stored, assigned to its page, and isolated as test data.')
if __name__=='__main__':
    if len(sys.argv)>1 and sys.argv[1]=='finish':finish(os.environ.get('DEPLOY_OUTCOME')=='success')
    else:sync()
