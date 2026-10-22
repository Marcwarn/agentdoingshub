// Developer harness: native tool relay, never deployed, no fixture data.
import {createInterface} from 'node:readline';import {gather} from '../core/orchestrator';
const pending=new Map<string,(r:any)=>void>();const rl=createInterface({input:process.stdin});rl.on('line',line=>{try{const r=JSON.parse(line);pending.get(r.id)?.(r.result);pending.delete(r.id);}catch{}});
const r=await gather({goal:'Verifiera workshopunderlag',customer:'Nordiska',query:'psykologisk trygghet'},'authoring-session',async(connector,action,args)=>new Promise(resolve=>{const id=crypto.randomUUID();pending.set(id,resolve);process.stdout.write(JSON.stringify({id,connector,action,args})+'\n');}));
console.log(JSON.stringify({verified:true,status:r.status,evidence:r.evidence.map(e=>({specialist:e.specialist,status:e.status,sources:e.sources.length})),aiStatus:r.aiStatus}));rl.close();
