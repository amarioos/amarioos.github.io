import {env} from 'cloudflare:workers';
export const runtime=()=>env as any;
export const database=()=>runtime().DB;
export function identity(r:Request){const id=r.headers.get('oai-authenticated-user-id'),email=r.headers.get('oai-authenticated-user-email');return id&&email?{id,email,admin:email.toLowerCase()===String(runtime().ADMIN_EMAIL||'').toLowerCase()}:null}
export async function projectFor(r:Request,id:string){const user=identity(r);if(!user)return null;const p=await database().prepare('SELECT * FROM projects WHERE id=?').bind(id).first();return p&&(p.owner===user.id||user.admin)?p:null}
