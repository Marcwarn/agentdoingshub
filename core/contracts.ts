import { z } from 'zod';
export const TaskInput = z.object({ goal:z.string().min(3).max(2000), customer:z.string().max(160).default(''), query:z.string().min(2).max(200), operation:z.enum(['search_company_knowledge','prepare_customer_brief','design_workshop','find_internal_expertise']).default('design_workshop') }).strict();
export type Input = z.infer<typeof TaskInput>;
export type Source = {id:string;title:string;url?:string;fetchUrl?:string;modified?:string;kind:'CRM'|'SharePoint'|'Slack';details:string;verifiedContent:boolean};
export type Evidence = {specialist:string;connector:string;action:string;status:string;checkedAt:string;durationMs:number;permission:'current-user-delegated';sources:Source[];message?:string;requestId?:string;retryAfterMs?:number;diagnostics?:unknown};
export type Task = {id:string;goal:string;customer:string;query:string;operation:Input['operation'];status:string;createdAt:string;evidence:Evidence[];gaps:string[];deliverable:string;aiStatus:string;durationMs:number};
export type Invoke = (connector:string,action:string,args:Record<string,any>)=>Promise<any>;
export const SLACK='asdk_app_69a1d78e929881919bba0dbda1f6436d';
export const CRM='asdk_app_6ac8fbb4ab088191bbea0101b5ac91e4';
export const SHAREPOINT='connector_1e4f6a44acf14e3ca1d96672f8c945bc';
export function safeUrl(value:unknown){try{const u=new URL(String(value));return u.protocol==='https:'?u.href:undefined;}catch{return undefined;}}
export function unpack(result:any):any {if(result?.structuredContent!==undefined)return result.structuredContent;for(const c of result?.content||[])if(c.type==='text'){try{return JSON.parse(c.text);}catch{}}return null;}
export function normalize(kind:'CRM'|'SharePoint'|'Slack',result:any):Source[]{const data=unpack(result);if(kind==='Slack')return normalizeSlack(data);const rows=Array.isArray(data)?data:data?.results||data?.customers||[];return rows.slice(0,20).map((r:any)=>({id:String(r.id||r.item_id||r.document_id||''),title:String(r.name||r.title||'Källa utan titel'),url:safeUrl(r.web_url||r.url),fetchUrl:kind==='SharePoint'?safeUrl(r.url):undefined,modified:r.updated_at||r.modified_at,kind,verifiedContent:false,details:kind==='CRM'?[r.industry,r.contact_person&&`Registrerad kontakt: ${r.contact_person}`,r.kam_contact&&`Registrerat kundansvar: ${r.kam_contact}`].filter(Boolean).join(' · '):'Sökträff. Innehållet är inte granskat. Kundspecifikt material kräver bedömning före återanvändning.'}));}
export function enforceIdentity(userId:string|undefined){if(!userId)throw new Error('UNAUTHENTICATED');}
export function owns(owner:string,user:string){enforceIdentity(user);return owner===user;}
export function validOrigin(origin:string|null,url:string){return origin!==null&&origin===new URL(url).origin;}

// The discovered Slack action returns a JSON envelope containing formatted message results.
export function slackKeywords(query:string):string[]{return (query.match(/[\p{L}\p{N}_-]+/gu)||[]).slice(0,8);}
export function normalizeSlack(data:any):Source[]{
 const text:string=typeof data?.results==='string'?data.results:'';
 if(!text){if(data?.results===undefined)throw new Error('UNRECOGNIZED_SLACK_RESPONSE');return [];}
 const blocks=text.split(/### Result \d+ of \d+/).slice(1);
 if(!blocks.length&&!/0 results|no results|no messages|no matches/i.test(text))throw new Error('UNRECOGNIZED_SLACK_RESPONSE');
 return blocks.slice(0,8).map((block,i)=>{
 const channel=block.match(/Channel: (.+?) \(ID:/)?.[1]||'Slack';
 const author=block.match(/From: (.+?)(?: <| \(ID:|\n)/)?.[1]||'Avsändare saknas';
 const ts=block.match(/Message_ts: (\d+(?:\.\d+)?)/)?.[1];
 const url=safeUrl(block.match(/Permalink: \[link\]\(([^)]+)\)/)?.[1]);
 const body=(block.split(/\nText: ?\n/)[1]||'Meddelandet saknar text.').split(/\n---/)[0].trim().slice(0,1800);
 return {id:ts||url||String(i),title:channel+' · '+author,url,modified:ts?new Date(Number(ts)*1000).toISOString():undefined,kind:'Slack',details:body,verifiedContent:false};
 });
}
