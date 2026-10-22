import {TaskInput,CRM,SHAREPOINT,SLACK,slackKeywords,normalize,enforceIdentity,type Invoke,type Task,type Evidence} from './contracts';
export async function gather(raw:unknown,userId:string,invoke:Invoke):Promise<Task>{
 enforceIdentity(userId);const input=TaskInput.parse(raw);const start=Date.now();
 async function read(specialist:string,connector:string,action:string,args:Record<string,any>,kind:'CRM'|'SharePoint'|'Slack'):Promise<Evidence>{
 const began=Date.now();let timer:ReturnType<typeof setTimeout>|undefined;
 try{const r=await Promise.race([invoke(connector,action,args),new Promise<any>(resolve=>{timer=setTimeout(()=>resolve({status:'timeout',message:'Källan hann inte svara. Ingen automatisk omkörning.'}),25000);})]);
 return {specialist,connector,action,status:r.status,checkedAt:new Date().toISOString(),durationMs:Date.now()-began,permission:'current-user-delegated',sources:r.status==='success'?normalize(kind,r.result):[],message:r.message,requestId:r.requestId,retryAfterMs:r.retryAfterMs,diagnostics:r.status==='success'?undefined:r.result};
 }catch{return {specialist,connector,action,status:'upstream_error',checkedAt:new Date().toISOString(),durationMs:Date.now()-began,permission:'current-user-delegated',sources:[],message:'Källan kunde inte läsas.'};}finally{clearTimeout(timer);}}
 const jobs=[read('Knowledge Agent',SHAREPOINT,'search',{query:input.query,topn:8},'SharePoint')];
 if(input.customer)jobs.unshift(read('CRM Agent',CRM,'search_customers',{query:input.customer},'CRM'));
 jobs.push(read('Knowledge Agent · Slack',SLACK,'slack_search_public',{keywords:slackKeywords(input.query),natural_language_query:input.goal,content_types:'messages',include_context:false,include_bots:false,limit:8,response_format:'detailed'},'Slack'));
 const evidence=await Promise.all(jobs);const gaps:string[]=[];
 for(const e of evidence){if(e.status!=='success')gaps.push(`${e.specialist}: ${e.status}.`);else if(!e.sources.length)gaps.push(`${e.specialist}: inga träffar i denna sökning.`);}
 const customers=evidence.find(e=>e.specialist==='CRM Agent')?.sources||[];
 if(customers.length>1)gaps.push('Flera kundkort matchar. Välj rätt juridisk kund innan kunduppgifter sammanställs.');
 if(input.operation==='find_internal_expertise')gaps.push('Nätverk och metodexpertis är ännu inte implementerade; dessa sökträffar bevisar inga personliga relationer.');
 gaps.push('Slack: avgränsat urval i offentliga kanaler. Inlägg är källuppgifter, inte oberoende bekräftelse eller godkänt material.');
 gaps.push('Dokumentinnehåll och rätt till återanvändning behöver granskas. Sökresultat bevisar inte att en mall är godkänd.');
 return {id:crypto.randomUUID(),...input,status:customers.length>1?'needs_input':evidence.some(e=>e.status!=='success'||!e.sources.length)?'partial':'sources_ready',createdAt:new Date().toISOString(),evidence,gaps,deliverable:'',aiStatus:'disabled_no_key',durationMs:Date.now()-start};
}
export const specialists=[
{name:'CRM Agent',role:'Kundidentitet och registrerade kontaktuppgifter',tool:'Doings CRM · search_customers',state:'Läsning implementerad'},
{name:'Knowledge Agent',role:'Hitta och läsa dokument med dina rättigheter',tool:'SharePoint · search / fetch + Slack · public search',state:'Läsning implementerad'},
{name:'Project Agent',role:'Jämförbara uppdrag och tidigare leveranser',tool:'Kräver avgränsning mellan kunder',state:'Ej aktiverad'},
{name:'Network Agent',role:'Kontaktvägar med tydlig relationsstatus',tool:'Eget och delat nätverk återstår',state:'Ej aktiverad'},
{name:'Production Agent',role:'Workshopdesign med mål, tider och facilitering',tool:'OpenAI Agents SDK',state:'Väntar på API-konfiguration'},
{name:'Quality Agent',role:'Källreferenser, osäkerhet och fullständighet',tool:'Deterministiska kontroller + SDK',state:'Grundkontroller aktiva'}];
