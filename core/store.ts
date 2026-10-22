import {getDb} from '@/db';
import {tasks,audit} from '@/db/schema';
import {and,eq,gt,desc,lt} from 'drizzle-orm';
import {enforceIdentity,type Task} from './contracts';
export async function log(owner:string,taskId:string,event:string,detail:unknown){enforceIdentity(owner);await getDb().insert(audit).values({id:crypto.randomUUID(),owner,taskId,event,at:new Date().toISOString(),detail:JSON.stringify(detail)});}
export async function save(owner:string,t:Task){enforceIdentity(owner);const expiresAt=new Date(Date.now()+30*86400000).toISOString();
 // Persist operational metadata only, never retrieved document bodies, links, contacts or model output.
 const metadata=JSON.stringify({query:t.query,customer:t.customer,operation:t.operation,gaps:t.gaps,evidence:t.evidence.map(e=>({specialist:e.specialist,status:e.status,checkedAt:e.checkedAt,durationMs:e.durationMs,sourceCount:e.sources.length})),aiStatus:t.aiStatus});
 await getDb().insert(tasks).values({id:t.id,owner,goal:t.goal,status:t.status,createdAt:t.createdAt,expiresAt,metadata});
 for(const e of t.evidence)await log(owner,t.id,'source_read',{connector:e.connector,action:e.action,status:e.status,count:e.sources.length,requestId:e.requestId});}
export async function list(owner:string){enforceIdentity(owner);await purge(owner);return getDb().select().from(tasks).where(and(eq(tasks.owner,owner),gt(tasks.expiresAt,new Date().toISOString()))).orderBy(desc(tasks.createdAt)).limit(30);}
export async function get(owner:string,id:string){enforceIdentity(owner);const [t]=await getDb().select().from(tasks).where(and(eq(tasks.id,id),eq(tasks.owner,owner),gt(tasks.expiresAt,new Date().toISOString())));return t;}
export async function remove(owner:string,id:string){enforceIdentity(owner);await getDb().delete(audit).where(and(eq(audit.owner,owner),eq(audit.taskId,id)));await getDb().delete(tasks).where(and(eq(tasks.owner,owner),eq(tasks.id,id)));}
export async function purge(owner:string){const now=new Date().toISOString();await getDb().delete(tasks).where(and(eq(tasks.owner,owner),lt(tasks.expiresAt,now)));await getDb().delete(audit).where(and(eq(audit.owner,owner),lt(audit.at,new Date(Date.now()-30*86400000).toISOString())));}
export async function auditList(owner:string){enforceIdentity(owner);await purge(owner);return getDb().select().from(audit).where(eq(audit.owner,owner)).orderBy(desc(audit.at)).limit(50);}
