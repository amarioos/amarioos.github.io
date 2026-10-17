'use client';
import { useState, useEffect, useRef } from 'react';
import { Plus, ArrowUpRight, ArrowLeft, Layers, ShoppingBag, BarChart3, MousePointer2, Settings, Upload, Check, ChevronRight, ExternalLink, RefreshCw, Download, Globe, Smartphone, Monitor, Save, Sparkles, FileText, Copy, Search, Menu, X, Palette, Trash2, ImageIcon, Link2, ChevronLeft } from 'lucide-react';
import {CreativePanel,TargetFields,PalettePicker,ContentExtras} from './creative-panel';
import { empty, Product,VisualKind } from '../lib/product';
const nav = [['Mes pages', Layers], ['Commandes', ShoppingBag], ['Statistiques', BarChart3], ['Heatmap', MousePointer2], ['Intégrations', Settings]] as const;
const ratio = (n: number, d: number) => d ? (n / d * 100).toFixed(1) + '%' : '0%';
const fmt = (n: any) => Number(n || 0).toLocaleString('fr-FR');
const date = (n: number) => new Date(n).toLocaleString('fr-MA');
export default function Studio({ email }: {
    email: string;
}) {
    const [tab, setTab] = useState(0), [projects, setProjects] = useState<any[]>([]), [worker, setWorker] = useState<any>(null), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [error, setError] = useState(''), [editor, setEditor] = useState(false), [step, setStep] = useState(0), [product, setProduct] = useState<Product>({ ...empty }), [current, setCurrent] = useState<any>(null), [dirty, setDirty] = useState(false), [mobile, setMobile] = useState(true), [menu, setMenu] = useState(false), [filter, setFilter] = useState(''), [test, setTest] = useState(false), [days, setDays] = useState(30), [metrics, setMetrics] = useState<any>(null), [orders, setOrders] = useState<any[]>([]), [total, setTotal] = useState(0), [page, setPage] = useState(1), [query, setQuery] = useState(''), [status, setStatus] = useState(''), [section, setSection] = useState('hero'), [device, setDevice] = useState('all'), [publishConsent, setPublishConsent] = useState(false), [aiConsent, setAiConsent] = useState(false), [uploading, setUploading] = useState(false), [aiAvailable, setAiAvailable] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const [imageAvailable,setImageAvailable]=useState(false),[visualConsent,setVisualConsent]=useState(false),[creativeProgress,setCreativeProgress]=useState('');
    const activeProject=useRef<string|null>(null);
    async function api(path: string, body?: any) { const r = await fetch('/api/' + path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : undefined); const j: any = await r.json(); if (!r.ok)
        throw Error(j.error || 'Opération impossible'); return j; }
    async function loadProjects() { const j = await api('projects'); setProjects(j.projects); setWorker(j.worker); setAiAvailable(!!j.ai?.available);setImageAvailable(!!j.ai?.images); return j.projects; }
    async function refresh() { setBusy(true); setError(''); try {
        await loadProjects();
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    useEffect(() => { refresh(); }, []);
    useEffect(() => { const t = setInterval(() => { if (document.visibilityState === 'visible')
        loadProjects().catch(() => { }); }, 30000); return () => clearInterval(t); }, []);
    const params = () => new URLSearchParams({ project: filter, test: test ? '1' : '0', days: String(days) }).toString();
    async function loadMetrics() { setMetrics(await api('analytics?' + params())); }
    async function loadOrders() { const q = new URLSearchParams({ project: filter, test: test ? '1' : '0', q: query, status, page: String(page) }); const j = await api('orders?' + q); setOrders(j.orders); setTotal(j.total); }
    useEffect(() => { if (!editor && [2, 3].includes(tab)) {
        setBusy(true);
        loadMetrics().catch((e: any) => setError(e.message)).finally(() => setBusy(false));
    } }, [tab, filter, test, days, editor]);
    useEffect(() => { if (!editor && tab === 1) {
        const t = setTimeout(() => { setBusy(true); loadOrders().catch((e: any) => setError(e.message)).finally(() => setBusy(false)); }, 250);
        return () => clearTimeout(t);
    } }, [tab, filter, test, page, query, status, editor]);
    useEffect(() => { setPage(1); }, [filter, test, query, status]);
    function start(p?: any) { activeProject.current=p?.id||null;setVisualConsent(false); setCurrent(p || null); setProduct(p ? { ...empty, ...p.data } : { ...empty }); setEditor(true); setStep(p ? 2 : 0); setDirty(false); setPublishConsent(false); setAiConsent(false); setError(''); setNotice(''); }
    function change(p: Partial<Product>) { setProduct(old => ({ ...old, ...p })); setDirty(true); }
    async function save(data = product) { setBusy(true); setError(''); try {
        const j = await api('save', { id: current?.id, revision: current?.revision, data });
        activeProject.current=j.project.id;setCurrent(j.project);
        setProduct(j.project.data);
        setDirty(false);
        await loadProjects();
        setNotice('Votre page est sauvegardée.');
        return j.project;
    }
    catch (e: any) {
        setError(e.message);
        return null;
    }
    finally {
        setBusy(false);
    } }
    async function generate() { setBusy(true); setError(''); try {
        const j = await api('generate', { data: product });
        change(j.data);
        const p = await save(j.data);
        if (p)
            setStep(2);
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function upload(file?: File,kind?:VisualKind) { if (!file)
        return; setUploading(true); setError(''); try {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 15000000)
            throw Error('Choisissez une photo JPEG, PNG ou WebP de moins de 15 Mo.');
        const bitmap = await createImageBitmap(file);
        const scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(bitmap.width * scale);
        canvas.height = Math.round(bitmap.height * scale);
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
        bitmap.close();
        const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(Error('Image illisible')), 'image/webp', .87));
        if (blob.size > 3000000)
            throw Error('Photo trop volumineuse après optimisation.');
        const form = new FormData();
        form.append('file', blob, 'product.webp');
        const r = await fetch('/api/upload', { method: 'POST', body: form });
        const j: any = await r.json();
        if (!r.ok)
            throw Error(j.error);
        change(kind?{visuals:[...product.visuals.filter(v=>v.kind!==kind),{image:j.id,kind,caption:'',generated:false}]}:{image:j.id,visuals:[]});
        setNotice('Photo optimisée et importée.');
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setUploading(false);
        if (fileRef.current)
            fileRef.current.value = '';
    } }
    async function createCampaign(kinds:VisualKind[],copy=false){
        setError('');setBusy(true);setCreativeProgress('Sauvegarde de votre produit…');
        try{
            let p=dirty?await save():current;
            if(!p){setCreativeProgress('');return;}
            setBusy(true);
            const total=kinds.length+(copy?1:0);let n=0;
            const apply=(row:any)=>{p=row;if(activeProject.current===row.id){setCurrent(row);setProduct(row.data);setDirty(false);}};
            if(copy){setCreativeProgress(`${++n} / ${total} · Rédaction de votre campagne…`);const j=await api('ai',{id:p.id,revision:p.revision,consent:visualConsent});apply(j.project);}
            for(const kind of kinds){
                setCreativeProgress(`${++n} / ${total} · ${kind==='lifestyle'?'Une personne utilise votre produit':kind==='detail'?'Le produit en détail':'Une autre scène du quotidien'}…`);
                const j=await api('visual',{id:p.id,revision:p.revision,consent:visualConsent,kind});apply(j.project);
            }
            await loadProjects();setNotice('Votre campagne est prête. Vérifiez les textes et les illustrations dans l’aperçu avant publication.');
        }catch(e:any){setError(e.message);await loadProjects().catch(()=>{});}finally{setBusy(false);setCreativeProgress('');}
    }
    async function queue(kind: 'publish' | 'ai') { setError(''); setBusy(true); try {
        const p = dirty ? await save() : current;
        if (!p)
            return;
        await api(kind, { id: p.id, revision: p.revision, consent: kind === 'publish' ? publishConsent : aiConsent });
        const rows = await loadProjects();
        const fresh = rows.find((v: any) => v.id === p.id);
        if (fresh)
            setCurrent(fresh);
        setNotice(kind === 'publish' ? 'Publication demandée. GitHub va traiter votre page automatiquement.' : 'Le contenu IA est prêt. Chargez le résultat pour le relire avant publication.');
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function demo(clear = false) { if (!filter) {
        setError('Sélectionnez une page pour gérer ses données de test.');
        return;
    } setBusy(true); setError(''); try {
        await api(clear ? 'clear-demo' : 'demo', { id: filter });
        setTest(true);
        await loadMetrics();
        if (tab === 1)
            await loadOrders();
        setNotice(clear ? 'Données de test supprimées.' : 'Jeu de démonstration créé dans le mode Test.');
    }
    catch (e: any) {
        setError(e.message);
    }
    finally {
        setBusy(false);
    } }
    async function orderStatus(id: string, status: string) { try {
        await api('order-status', { id, status });
        await loadOrders();
    }
    catch (e: any) {
        setError(e.message);
    } }
    function exportCSV() { location.href = '/api/orders?' + new URLSearchParams({ project: filter, test: test ? '1' : '0', q: query, status, csv: '1' }); }
    useEffect(() => { if (editor || ![1, 2, 3].includes(tab))
        return; const t = setInterval(() => { if (document.visibilityState !== 'visible')
        return; (tab === 1 ? loadOrders() : loadMetrics()).catch(() => { }); }, 30000); return () => clearInterval(t); }, [tab, filter, test, days, page, query, status, editor]);
    const selectedProject = projects.find(p => p.id === filter);
    const stats = metrics?.metrics || {}, trend = metrics?.trend || [], points = (metrics?.clicks || []).filter((p: any) => p.section === section && (device === 'all' || p.device === device));
    const fresh = projects.find(p => p.id === current?.id) || current;
    const published = projects.filter(p => p.published).length;
    return <div className="workspace"><aside className={menu ? 'sidebar open' : 'sidebar'}><a className="logo" href="/">landing<span>studio.</span></a><span className="workspace-label">VOTRE ESPACE CRÉATIF</span><nav>{nav.map(([l, I], i) => <button disabled={!!creativeProgress} className={tab === i && !editor ? 'active' : ''} key={l} onClick={() => { setEditor(false); setTab(i); setMenu(false); setError(''); setNotice(''); }}><I size={18}/>{l}</button>)}</nav><div className="sidebar-tip"><Sparkles size={20}/><b>Une idée. Une page.</b><p>La prochaine campagne commence avec une photo.</p><button disabled={!!creativeProgress} onClick={() => start()}>Créer une page <Plus size={15}/></button></div><div className="account"><span>{email.slice(0, 2).toUpperCase()}</span><div><b>Mon espace</b><small>{email}</small></div></div><a className="logout" href="/signout-with-chatgpt?return_to=/">Déconnexion</a></aside><div className="main"><header className="topbar"><button className="icon-button mobile-menu" aria-label="Menu" onClick={() => setMenu(!menu)}>{menu ? <X /> : <Menu />}</button><div>Workspace <ChevronRight size={12}/><b>{editor ? 'Création de page' : nav[tab][0]}</b></div><span className="beta">LANDING STUDIO / CRÉATIF</span></header>
    <div className="content">{editor ? <><div className="editor-heading"><button className="back" disabled={!!creativeProgress} onClick={() => { setEditor(false); setNotice(''); setError(''); }}><ArrowLeft size={16}/>Mes pages</button><div><span className={'status ' + (dirty ? 'pending' : '')}>{dirty ? 'Modifications non sauvegardées' : current ? 'Sauvegardé' : 'Nouveau projet'}</span><button className="secondary" disabled={busy || uploading} onClick={() => save()}><Save size={15}/>Sauvegarder</button></div></div><div className="page-heading"><div><p className="eyebrow">DE LA FICHE PRODUIT À LA CAMPAGNE</p><h1>{current ? product.name || 'Votre page' : 'Créons votre prochaine page'}<em>.</em></h1><p>Un produit, une identité visuelle, une expérience prête à convertir.</p></div></div><div className="stepper">{['Le produit', 'Le style', 'Textes & visuels', 'Aperçu & publication'].map((s, i) => <button key={s} disabled={!!creativeProgress} className={step === i ? 'selected' : step > i ? 'completed' : ''} onClick={() => setStep(i)}><span>{step > i ? <Check size={13}/> : i + 1}</span>{s}</button>)}</div><Messages error={error} notice={notice}/>
        {step === 0 && <div className="editor-grid"><section className="panel"><div className="panel-header"><div><p className="eyebrow">01 / LE POINT DE DÉPART</p><h2>Présentez votre produit.</h2></div><ImageIcon size={22}/></div><div className="form-stack"><Field label="Nom du produit *"><input value={product.name} maxLength={120} onChange={e => change({ name: e.target.value })} placeholder="Ex. Bouteille de promenade 3 en 1"/></Field><Field label="Description et caractéristiques *"><textarea value={product.description} rows={8} maxLength={5000} onChange={e => change({ description: e.target.value })} placeholder={'Décrivez le produit avec vos propres mots.\nAjoutez une caractéristique par ligne :\n• Ce qu’il fait\n• À qui il s’adresse\n• Les détails que vous pouvez confirmer'}/><small>Le moteur instantané structure les informations dans leur langue d’origine. L’option IA peut les reformuler et les traduire dans la langue choisie.</small></Field><div className="two-fields"><Field label="Langue de la page"><select value={product.language} onChange={e => change({ language: e.target.value as any })}><option value="fr">Français</option><option value="en">English</option><option value="darija">الدارجة المغربية</option><option value="ar">العربية السعودية</option></select></Field><Field label="Marché / validation téléphone"><select value={product.country} onChange={e => change({ country: e.target.value as any, currency: e.target.value === 'SA' ? 'SAR' : e.target.value === 'MA' ? 'MAD' : product.currency })}><option value="MA">Maroc</option><option value="SA">Arabie saoudite</option><option value="OTHER">International</option></select></Field></div><TargetFields product={product} change={change}/></div></section><section className="panel upload-panel"><p className="eyebrow">LE PRODUIT AU PREMIER PLAN</p><h2>Votre photo fait la différence.</h2><div className={'upload-zone ' + (product.image ? 'has-image' : '')} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); upload(e.dataTransfer.files[0]); }}>{product.image ? <img src={'/api/image/' + product.image} alt="Photo du produit"/> : <><div className="upload-icon"><Upload size={28}/></div><h3>Déposez votre photo ici</h3><p>Fond uni, bonne lumière, produit bien visible.</p></>}<button className="secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>{uploading ? 'Optimisation en cours…' : product.image ? 'Changer de photo' : 'Choisir une photo'}</button><small>JPEG, PNG, WebP · optimisation automatique</small><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={e => upload(e.target.files?.[0])}/></div><div className="tip-row"><Check size={16}/><p>Votre photo est conservée. Aucun changement de forme ou de couleur du produit.</p></div></section></div>}
        {step === 1 && <><section className="panel"><div className="panel-header"><div><p className="eyebrow">02 / L’IDENTITÉ DE VOTRE PAGE</p><h2>Choisissez votre direction.</h2></div><Palette size={22}/></div><div className="template-grid">{[{ id: 'conversion', name: 'Conversion', desc: 'Dynamique, chaleureux, orienté commande.', color: '#ef6748', bg: '#fff8f0' }, { id: 'editorial', name: 'Éditorial', desc: 'Clair, élégant, des détails qui respirent.', color: '#276b59', bg: '#faf6ec' }, { id: 'premium', name: 'Premium', desc: 'Contrastes profonds et présentation affirmée.', color: '#c5a66a', bg: '#1c231d' }].map(t => <button key={t.id} className={'template ' + (product.style === t.id ? 'chosen' : '')} onClick={() => change({ style: t.id as any })}><div className="template-preview" style={{ background: t.bg, color: t.id === 'premium' ? '#fff' : '#21382b' }}><div className="template-nav"><span>Votre marque</span><i style={{ background: t.color }}/></div><div className="template-hero"><span><b>Votre produit.<br />Votre histoire.</b><i style={{ background: t.color }}/></span><div style={{ background: t.color + '25' }}>{product.image ? <img src={'/api/image/' + product.image} alt=""/> : <span />}</div></div><div className="template-lines"><i /><i /><i /></div></div><div className="template-info"><b>{t.name}</b><span>{product.style === t.id ? <Check size={15}/> : <span className="radio"/>}</span><p>{t.desc}</p></div></button>)}</div><PalettePicker product={product} change={change}/><div className="two-fields settings-fields"><Field label="Couleur principale"><div className="color-field"><input type="color" value={product.color} onChange={e => change({ color: e.target.value })}/><code>{product.color}</code></div></Field><Field label="Nom de la marque"><input value={product.brand} onChange={e => change({ brand: e.target.value })} placeholder="Votre marque (facultatif)"/></Field></div></section><section className="panel"><div className="panel-header"><div><p className="eyebrow">L’OFFRE ET LE CONTACT</p><h2>Les détails qui rassurent.</h2></div></div><div className="three-fields"><Field label="Prix de vente · facultatif"><input type="number" min="0" step=".01" value={product.price ?? ''} onChange={e => change({ price: e.target.value === '' ? null : +e.target.value })} placeholder="Ex. 149"/></Field><Field label="Prix de référence · facultatif"><input type="number" min="0" step=".01" value={product.oldPrice ?? ''} onChange={e => change({ oldPrice: e.target.value === '' ? null : +e.target.value })} placeholder="Uniquement s’il est réel"/></Field><Field label="Devise"><select value={product.currency} onChange={e => change({ currency: e.target.value })}>{['MAD', 'SAR', 'EUR', 'USD'].map(c => <option key={c}>{c}</option>)}</select></Field></div><div className="two-fields settings-fields"><Field label="Téléphone de contact"><input value={product.phone} onChange={e => change({ phone: e.target.value })} placeholder="+212…"/></Field><Field label="Livraison"><input value={product.delivery} onChange={e => change({ delivery: e.target.value })} placeholder="Vos conditions, si elles sont confirmées"/></Field><Field label="Modalités de paiement"><input value={product.payment} onChange={e => change({ payment: e.target.value })} placeholder="Ex. Paiement à la livraison"/></Field><Field label="Information de confidentialité"><textarea rows={2} value={product.privacy} onChange={e => change({ privacy: e.target.value })} placeholder="Coordonnées du responsable et traitement des demandes"/></Field></div></section></>}
        {step === 2 && <><fieldset className="content-lock" disabled={!!creativeProgress}><div className="editor-grid content-editor"><section className="panel"><div className="panel-header"><div><p className="eyebrow">03 / LES MOTS QUI PRÉSENTENT VOTRE PRODUIT</p><h2>Une page qui vous ressemble.</h2></div><button className="secondary" disabled={busy || !product.image} onClick={generate}><RefreshCw size={14}/>Générer les textes</button></div><div className="form-stack"><Field label="Accroche principale"><textarea rows={3} value={product.headline} onChange={e => change({ headline: e.target.value })} dir={['ar', 'darija'].includes(product.language) ? 'rtl' : 'ltr'}/></Field><Field label="Sous-titre"><textarea rows={3} value={product.subtitle} onChange={e => change({ subtitle: e.target.value })} dir={['ar', 'darija'].includes(product.language) ? 'rtl' : 'ltr'}/></Field><Field label="Bouton de commande"><input value={product.cta} onChange={e => change({ cta: e.target.value })}/></Field><Field label="Caractéristiques · une par ligne"><textarea rows={7} value={product.features.join('\n')} onChange={e => change({ features: e.target.value.split('\n').slice(0, 6) })}/></Field><ContentExtras product={product} change={change}/></div></section><div><section className="panel ai-panel"><span className="ai-icon"><Sparkles size={22}/></span><p className="eyebrow">POUR ALLER PLUS LOIN</p><h2>Affinez le texte avec l’IA.</h2><p>Le service IA peut reformuler les informations du produit dans la langue choisie. Le résultat revient ici, à relire avant publication.</p><label className="check"><input type="checkbox" checked={aiConsent} onChange={e => setAiConsent(e.target.checked)}/>J’autorise l’envoi du nom, de la description et de la photo au service OpenAI pour cette génération.</label><button className="primary" disabled={busy || !aiConsent || !aiAvailable || fresh?.ai_status === 'running'} onClick={() => queue('ai')}><Sparkles size={15}/>{fresh?.ai_status === 'running' ? 'Génération IA en cours…' : 'Améliorer avec l’IA'}</button>{fresh?.ai_status === 'ready' && <div className="ai-result"><b>Le nouveau contenu est prêt.</b><button className="text-button" onClick={() => { setCurrent(fresh); setProduct(fresh.data); setDirty(false); }}>Charger le résultat →</button></div>}{fresh?.ai_error && <p className="inline-error">{fresh.ai_error}</p>}<small>{!aiAvailable && <b>IA non configurée. </b>}{aiAvailable?'OpenAI configuré. ':'Connexion API administrateur requise. '}Les générations utilisent votre crédit API OpenAI. Le moteur instantané reste disponible sans génération IA.</small></section><section className="panel"><div className="panel-header"><h2>Questions fréquentes</h2><button className="icon-button" aria-label="Ajouter une question" onClick={() => change({ faqs: [...product.faqs, { q: '', a: '' }] })}><Plus size={16}/></button></div>{product.faqs.map((f, i) => <div className="faq-edit" key={i}><input aria-label={'Question ' + (i + 1)} value={f.q} onChange={e => change({ faqs: product.faqs.map((v, j) => j === i ? { ...v, q: e.target.value } : v) })}/><textarea aria-label={'Réponse ' + (i + 1)} rows={3} value={f.a} onChange={e => change({ faqs: product.faqs.map((v, j) => j === i ? { ...v, a: e.target.value } : v) })}/><button className="text-button" onClick={() => change({ faqs: product.faqs.filter((_, j) => j !== i) })}>Supprimer</button></div>)}</section></div></div></fieldset><CreativePanel product={product} change={change} available={imageAvailable} busy={busy||uploading||!!creativeProgress} progress={creativeProgress} consent={visualConsent} onConsent={setVisualConsent} onGenerate={createCampaign} onUpload={upload} error={fresh?.visual_error}/></>}
        {step === 3 && <div className="preview-layout"><section className="panel preview-panel"><div className="preview-toolbar"><div className="segmented"><button className={mobile ? 'selected' : ''} onClick={() => setMobile(true)}><Smartphone size={15}/>Mobile</button><button className={!mobile ? 'selected' : ''} onClick={() => setMobile(false)}><Monitor size={15}/>Desktop</button></div>{current && <a href={'/preview/' + current.id} className="icon-button" target="_blank" rel="noopener" aria-label="Ouvrir l’aperçu"><ExternalLink size={16}/></a>}</div>{current ? <><div className={'preview-frame ' + (mobile ? 'phone-frame' : 'desktop-frame')}><iframe key={current.revision} title="Aperçu de la landing page" src={'/preview/' + current.id + '?v=' + current.revision} sandbox="allow-scripts allow-forms allow-same-origin"/></div>{dirty && <p className="preview-dirty">Sauvegardez vos modifications pour actualiser l’aperçu.</p>}</> : <div className="empty"><Layers /><h3>Sauvegardez votre page.</h3><p>Votre aperçu sera disponible après la génération et la sauvegarde.</p><button className="primary" onClick={generate} disabled={busy}>Générer ma page</button></div>}</section><div><section className="panel publish-panel"><div className="publish-icon"><Globe size={25}/></div><p className="eyebrow">VOTRE CAMPAGNE, EN LIGNE</p><h2>Prêt à partager ?</h2><p>Votre page sera publiée dans un dossier dédié sur votre hébergement GitHub Pages.</p><div className="publish-steps"><div><Check size={14}/><span>Design responsive et photo optimisée</span></div><div><Check size={14}/><span>Formulaire connecté au back-office</span></div><div><Check size={14}/><span>Suivi des visites et des conversions</span></div></div><label className="check"><input type="checkbox" checked={publishConsent} onChange={e => setPublishConsent(e.target.checked)}/>Je valide le contenu et j’autorise la publication publique du produit, de ses textes et de tous ses visuels sur GitHub.</label><button className="primary" disabled={busy || !current || !publishConsent || fresh?.status === 'queued'} onClick={() => queue('publish')}><Globe size={16}/>{fresh?.status === 'queued' ? 'Publication en attente…' : fresh?.published ? 'Mettre à jour sur GitHub' : 'Publier sur GitHub'}</button><small>La file est vérifiée environ toutes les 5 minutes. Les délais GitHub peuvent varier.</small>{fresh?.error && <p className="inline-error">{fresh.error}</p>}{fresh?.published && <div className="live-link"><b>Votre page est en ligne</b><a href={fresh.published} target="_blank" rel="noopener">Ouvrir la page <ArrowUpRight size={15}/></a><button className="text-button" onClick={() => navigator.clipboard.writeText(fresh.published).then(() => setNotice('Lien copié.')).catch(() => setError('Copie indisponible : ouvrez le lien.'))}>Copier le lien</button>{fresh.published_revision !== current?.revision && <small>Des modifications sauvegardées ne sont pas encore publiées.</small>}</div>}</section><section className="panel compact-panel"><h3>Votre code vous appartient.</h3><p>Exportez la version HTML de test et conservez votre page.</p>{current && <a className="secondary" href={'/api/download/' + current.id}><Download size={15}/>Exporter HTML</a>}</section></div></div>}
        <div className="editor-bottom"><button className="secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}><ChevronLeft size={15}/>Précédent</button><span>Étape {step + 1} / 4</span>{step < 3 ? <button className="primary" disabled={busy || uploading} onClick={step === 1 ? generate : () => setStep(s => s + 1)}>{step === 1 ? <><Sparkles size={15}/>Générer ma page</> : <>Continuer<ChevronRight size={15}/></>}</button> : <button className="secondary" disabled={busy} onClick={() => save()}><Save size={15}/>Sauvegarder</button>}</div></> : <><div className="page-heading"><div><p className="eyebrow">VOTRE PROCHAINE GRANDE IDÉE COMMENCE ICI</p><h1>{['Vos pages, vos possibilités', 'Chaque commande compte', 'Comprenez ce qui convertit', 'L’attention, en un regard', 'Connectez vos campagnes'][tab]}<em>.</em></h1><p>{['Créez, personnalisez et publiez vos campagnes produit depuis un seul espace.', 'Les demandes reçues sur toutes vos landing pages, réunies ici.', 'Des mesures réelles, du premier scroll à l’envoi du formulaire.', 'Visualisez les zones cliquées, sans enregistrer le contenu des champs.', 'Configurez les pixels de chaque page et surveillez la publication.'][tab]}</p></div><button className="primary" onClick={() => start()}><Plus size={16}/>Nouvelle page</button></div><Messages error={error} notice={notice}/>
            {tab === 0 ? <><div className="overview-strip"><div><span>VOS PROJETS</span><b>{fmt(projects.length)}</b></div><div><span>PAGES PUBLIÉES</span><b>{fmt(published)}</b></div><div><span>EN PRÉPARATION</span><b>{fmt(projects.filter(p => !p.published).length)}</b></div><div className="strip-note"><Sparkles size={23}/><p>Une photo, quelques mots.<br /><b>Une nouvelle campagne.</b></p></div></div><div className="section-heading"><h2>Votre collection de pages <span>{projects.length}</span></h2><button className="text-button" onClick={refresh} disabled={busy}><RefreshCw size={14}/>Actualiser</button></div><div className="project-grid"><button className="new-project-card" onClick={() => start()}><span><Plus size={27}/></span><h3>Votre prochaine campagne</h3><p>Ajoutez un produit.<br />Laissez votre page prendre forme.</p><b>Créer une nouvelle page →</b></button>{projects.map(p => <article className="project-card" key={p.id}><button className={'project-cover ' + p.data.style} style={{ background: p.data.style === 'premium' ? '#252b23' : p.data.style === 'editorial' ? '#f0eadd' : '#fbede5' }} onClick={() => start(p)}><span className={'status ' + (p.status === 'queued' ? 'pending' : p.published ? 'live' : '')}>{p.status === 'queued' ? 'En publication' : p.published ? 'En ligne' : 'Brouillon'}</span><img src={'/api/image/' + p.data.image} alt={p.data.name} loading="lazy"/><span className="cover-accent" style={{ background: p.data.color }}/></button><div className="project-info"><div><h3>{p.data.name}</h3><span className="language-tag">{{ fr: 'FR', en: 'EN', darija: 'دارجة', ar: 'العربية' }[p.data.language as 'fr']}</span></div><p>{p.data.brand || 'Votre marque'} · {p.data.style}</p><div className="project-bottom"><small>Modifié le {new Date(p.updated).toLocaleDateString('fr-MA')}</small><button className="text-button" onClick={() => start(p)}>Modifier <ArrowUpRight size={14}/></button></div>{p.published && <a className="project-live" href={p.published} target="_blank" rel="noopener">Voir la page <ExternalLink size={12}/></a>}</div></article>)}</div></> : <><div className="filters"><select aria-label="Sélectionner une page" value={filter} onChange={e => setFilter(e.target.value)}><option value="">Toutes les pages</option>{projects.map(p => <option key={p.id} value={p.id}>{p.data.name}</option>)}</select><div className="segmented"><button className={!test ? 'selected' : ''} onClick={() => setTest(false)}>Réel</button><button className={test ? 'selected' : ''} onClick={() => setTest(true)}>Test / démo</button></div>{[2, 3].includes(tab) && <select aria-label="Période" value={days} onChange={e => setDays(+e.target.value)}><option value="7">7 derniers jours</option><option value="30">30 derniers jours</option><option value="90">90 derniers jours</option></select>}{busy && <span className="loading-note">Mise à jour…</span>}</div>{test && <div className="test-banner">MODE TEST · Essais d’aperçu et données fictives, séparés des commandes et visites réelles.</div>}
            {tab === 1 && <section className="panel"><div className="panel-header"><h2>{total} commandes</h2><button className="secondary" onClick={exportCSV}><Download size={14}/>Exporter CSV</button></div><div className="table-filters"><div className="search"><Search size={15}/><input aria-label="Rechercher une commande" value={query} onChange={e => setQuery(e.target.value)} placeholder="Nom, téléphone, ville…"/></div><select aria-label="Filtrer par statut" value={status} onChange={e => setStatus(e.target.value)}><option value="">Tous les statuts</option>{['Nouveau', 'Contacté', 'Confirmé', 'Livré', 'Annulé'].map(s => <option key={s}>{s}</option>)}</select></div>{orders.length ? <div className="table-wrap"><table><thead><tr><th>Client</th><th>Produit</th><th>Livraison</th><th>Qté</th><th>Date</th><th>Statut</th></tr></thead><tbody>{orders.map(o => <tr key={o.id}><td><b>{o.name}</b><small>{o.phone}</small><small>#{o.id.slice(0, 8)}</small></td><td>{o.product}</td><td><b>{o.city}</b><small>{o.address}</small></td><td>{o.quantity}</td><td>{date(o.created)}</td><td><select aria-label={'Statut de ' + o.name} value={o.status} onChange={e => orderStatus(o.id, e.target.value)}>{['Nouveau', 'Contacté', 'Confirmé', 'Livré', 'Annulé'].map(s => <option key={s}>{s}</option>)}</select></td></tr>)}</tbody></table></div> : <Empty text="Les commandes de vos pages apparaîtront ici."/>}<div className="pagination"><button className="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Précédent</button><span>Page {page} / {Math.max(1, Math.ceil(total / 50))}</span><button className="secondary" disabled={page * 50 >= total} onClick={() => setPage(p => p + 1)}>Suivant →</button></div></section>}
            {tab === 2 && <><div className="metric-grid">{[['Visites', fmt(stats.visits), 'Sessions enregistrées'], ['Visiteurs uniques', fmt(stats.visitors), 'Identifiants navigateur'], ['Commandes', fmt(stats.orders), 'Demandes enregistrées'], ['Conversion', ratio(stats.submitted, stats.visits), 'Envois / sessions']].map(([l, n, s]) => <article className="metric" key={l}><p>{l}<ArrowUpRight size={16}/></p><b>{n}</b><small>{s}</small></article>)}</div><div className="analytics-grid"><section className="panel"><div className="panel-header"><h2>Le rythme de vos campagnes</h2><span className="subtle">Sessions par jour · UTC</span></div>{trend.length ? <div className="chart">{trend.map((t: any) => <div className="chart-column" key={t.day} title={`${t.day} · ${t.visits} visites · ${t.leads} envois`}><i style={{ height: Math.max(3, t.visits / Math.max(1, ...trend.map((v: any) => v.visits)) * 100) + '%' }}/><span>{t.day.slice(5)}</span></div>)}</div> : <Empty text="Le graphique évoluera avec vos premières visites."/>}</section><section className="panel"><div className="panel-header"><h2>Le parcours de conversion</h2></div>{[['Visite', stats.visits], ['Formulaire vu', stats.viewed], ['Saisie commencée', stats.started], ['Commande envoyée', stats.submitted]].map(([l, n], i) => <Meter key={String(l)} label={String(l)} n={n || 0} total={stats.visits || 0} index={i}/>)}</section></div><div className="analytics-grid"><section className="panel"><div className="panel-header"><h2>Profondeur de lecture</h2><span className="subtle">Sessions ayant atteint le palier</span></div>{[25, 50, 75, 100].map((n, i) => <Meter key={n} label={n + '% de la page'} n={stats['d' + n] || 0} total={stats.visits || 0} index={i}/>)}<p className="fine-print">100% = bas de page atteint. Les bloqueurs et le refus de chargement peuvent réduire les mesures.</p></section><section className="panel"><div className="panel-header"><h2>Où perd-on des demandes ?</h2></div><div className="abandon-number">{ratio(stats.abandoned, (stats.started || 0) - (stats.active || 0))}<small>d’abandon parmi les saisies terminées ou inactives</small></div><div className="summary-row"><span>Abandons · 30 min sans activité</span><b>{fmt(stats.abandoned)}</b></div><div className="summary-row"><span>Saisies encore actives</span><b>{fmt(stats.active)}</b></div><div className="summary-row"><span>Sessions avec clic CTA</span><b>{fmt(stats.cta)} · {ratio(stats.cta, stats.visits)}</b></div></section></div></>}
            {tab === 3 && <section className="panel"><div className="panel-header"><h2>Carte de clics</h2><span className="subtle">{points.length} points affichés</span></div><div className="table-filters"><select aria-label="Section" value={section} onChange={e => setSection(e.target.value)}>{['hero', 'benefits', 'lifestyle', 'usecases', 'details', 'usage', 'steps', 'faq', 'closing', 'order'].map(s => <option key={s}>{s}</option>)}</select><select aria-label="Appareil" value={device} onChange={e => setDevice(e.target.value)}><option value="all">Tous les appareils</option><option value="mobile">Mobile</option><option value="desktop">Desktop</option></select></div><div className="heatmap-layout"><div className={'heatmap ' + (device === 'mobile' ? 'narrow' : '')}><div className="heat-background"><p>{section.toUpperCase()}</p><h2>{selectedProject?.data.name || 'Votre campagne'}</h2>{section === 'order' ? <div className="heat-fields"><i /><i /><i /><i /></div> : selectedProject ? <img src={'/api/image/' + selectedProject.data.image} alt="Repère produit"/> : <div className="heat-placeholder"><ImageIcon size={60}/></div>}<span>Commander maintenant →</span></div>{points.map((p: any, i: number) => <i key={i} className="heat-point" style={{ left: p.x * 100 + '%', top: p.y * 100 + '%' }}/>)}</div><div className="heat-description"><MousePointer2 size={24}/><h3>Voyez ce qui attire l’attention.</h3><p>Les points représentent des clics réels, normalisés dans leur section. Le fond est un repère schématique, pas une capture exacte.</p><p>Sélectionnez une page et un appareil pour comparer des mises en page cohérentes.</p><div className="heat-scale"/><div className="scale-label"><span>Faible densité</span><span>Forte densité</span></div><p className="fine-print">Aucune valeur saisie n’est collectée dans les points de clic. Affichage des 3 000 derniers points de la période.</p></div></div></section>}
            {tab === 4 && <><div className="integration-grid"><section className="panel"><div className="panel-header"><div><p className="eyebrow">MESURE PUBLICITAIRE</p><h2>Les bons signaux, par page.</h2></div><Link2 size={23}/></div>{selectedProject ? <PixelForm key={selectedProject.id} project={selectedProject} onSave={async (data) => { setBusy(true); setError(''); try {
                await api('save', { id: selectedProject.id, revision: selectedProject.revision, data });
                await loadProjects();
                setNotice('Pixels sauvegardés. Publiez la nouvelle version pour les activer.');
            }
            catch (e: any) {
                setError(e.message);
            }
            finally {
                setBusy(false);
            } }} busy={busy}/> : <Empty text="Sélectionnez une page pour configurer ses pixels."/>}<p className="fine-print">Les scripts publicitaires attendent le consentement du visiteur. Les événements Lead / SubmitForm / generate_lead suivent uniquement un enregistrement réussi du formulaire.</p></section><section className="panel publisher-panel"><div className="panel-header"><div><p className="eyebrow">PUBLICATION AUTOMATIQUE</p><h2>GitHub est votre vitrine.</h2></div><Globe size={25}/></div><div className="connection-row"><span className={'connection-dot ' + (worker && Date.now() - worker.seen < 1200000 ? 'connected' : '')}/><div><b>{worker && Date.now() - worker.seen < 1200000 ? 'Worker actif' : 'En attente du prochain passage'}</b><small>{worker ? 'Dernier passage : ' + date(worker.seen) : 'Le worker signale ici son premier passage.'}</small></div></div><div className="repo-card"><code>amarioos / amarioos.github.io</code><p>Une page par produit dans <b>/generated/</b>.</p><a href="https://github.com/amarioos/amarioos.github.io/actions/workflows/landing-studio.yml" target="_blank" rel="noopener">Voir la file GitHub <ArrowUpRight size={14}/></a></div><p>Les demandes de publication sont traitées par GitHub Actions, environ toutes les 5 minutes. Le lien n’est marqué publié qu’après le déploiement réussi.</p><small>Les délais et quotas dépendent de GitHub. Les mises à jour gardent la même adresse.</small></section></div><section className="panel demo-panel"><div><span className="test-tag">TESTS & DÉMONSTRATION</span><h2>Explorez avant de lancer.</h2><p>100 sessions, 15 commandes fictives et une carte de clics. Sélectionnez d’abord la page à tester.</p></div><div><button className="primary" disabled={busy || !filter} onClick={() => demo()}>dumb data</button><button className="secondary" disabled={busy || !filter} onClick={() => demo(true)}><Trash2 size={15}/>Supprimer les tests</button></div></section></>}
            </>}
        <div className="workspace-footer"><span>Landing Studio · Du produit à la campagne.</span><span>Stockage persistant · Pages rapides · Mobile & RTL</span></div></>}
    </div></div></div>;
}
function Field({ label, children }: {
    label: string;
    children: React.ReactNode;
}) { return <label className="field"><span>{label}</span>{children}</label>; }
function Messages({ error, notice }: {
    error: string;
    notice: string;
}) { return <>{error && <div className="message error-message" role="alert">{error}</div>}{notice && <div className="message notice-message" role="status"><Check size={15}/>{notice}</div>}</>; }
function Empty({ text }: {
    text: string;
}) { return <div className="empty"><Layers size={30}/><h3>{text}</h3><p>Vos résultats s’affichent dès leur enregistrement.</p></div>; }
function Meter({ label, n, total, index }: {
    label: string;
    n: number;
    total: number;
    index: number;
}) { return <div className="meter-row"><p><span><small>0{index + 1}</small>{label}</span><b>{fmt(n)} <small>{ratio(n, total)}</small></b></p><div><i style={{ width: ratio(n, total) }}/></div></div>; }
function PixelForm({ project, onSave, busy }: {
    project: any;
    onSave: (d: any) => void;
    busy: boolean;
}) { const [p, setP] = useState(project.data); return <><div className="form-stack"><Field label="Meta Pixel ID"><input value={p.meta} inputMode="numeric" onChange={e => setP({ ...p, meta: e.target.value })} placeholder="Ex. 123456789012345"/></Field><Field label="TikTok Pixel ID"><input value={p.tiktok} onChange={e => setP({ ...p, tiktok: e.target.value })} placeholder="Identifiant du pixel TikTok"/></Field><Field label="Google Analytics 4"><input value={p.ga} onChange={e => setP({ ...p, ga: e.target.value.toUpperCase() })} placeholder="G-XXXXXXXXXX"/></Field></div><button className="primary pixel-save" onClick={() => onSave(p)} disabled={busy}><Save size={14}/>Sauvegarder les pixels</button></>; }
