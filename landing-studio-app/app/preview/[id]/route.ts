import {projectFor} from '../../../lib/db';
import {render} from '../../../lib/render';
export const dynamic='force-dynamic';
export async function GET(r:Request,{params}:any){const {id}=await params;const p=await projectFor(r,id);if(!p)return new Response('Aperçu privé. Connectez-vous depuis Landing Studio.',{status:403});return new Response(render(JSON.parse(p.data),p.id,true),{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'private,no-store','X-Content-Type-Options':'nosniff'}})}
