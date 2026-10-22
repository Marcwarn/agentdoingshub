import {getChatGPTUser} from '@/app/chatgpt-auth';
import {connectorsForRequest} from '@/lib/connectors';
import {gather} from '@/core/orchestrator';
import {validOrigin} from '@/core/contracts';
import {save,list,auditList} from '@/core/store';
export const dynamic='force-dynamic';
const reply=(v:unknown,s=200)=>Response.json(v,{status:s,headers:{'Cache-Control':'private, no-store'}});
export async function GET(){const u=await getChatGPTUser();if(!u)return reply({error:'Logga in för att se ditt arbete.'},401);try{return reply({tasks:await list(u.userId),audit:await auditList(u.userId)});}catch{return reply({error:'Historiken kunde inte läsas.'},503);}}
export async function POST(req:Request){const u=await getChatGPTUser();if(!u)return reply({error:'Logga in med ChatGPT.',signIn:'/signin-with-chatgpt?return_to=%2F'},401);if(!validOrigin(req.headers.get('origin'),req.url))return reply({error:'Otillåtet ursprung.'},403);
 try{const text=await req.text();if(text.length>6000)return reply({error:'För lång uppgift.'},413);const input=JSON.parse(text);const task=await gather(input,u.userId,connectorsForRequest().invoke);try{await save(u.userId,task);}catch{return reply({task,warning:'Underlaget är hämtat men historiken kunde inte sparas.'});}return reply({task});}catch{return reply({error:'Kontrollera uppgift, kund och sökord.'},400);}}
