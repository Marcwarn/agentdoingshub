'use client';
import {useEffect,useRef,useState} from 'react';
import {Mic,Square,Volume2} from 'lucide-react';

type Result={isFinal:boolean;0:{transcript:string}};
type Recognition={lang:string;continuous:boolean;interimResults:boolean;onresult:((event:{results:ArrayLike<Result>})=>void)|null;onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;start:()=>void;stop:()=>void;abort:()=>void};
type SpeechWindow=Window&{SpeechRecognition?:new()=>Recognition;webkitSpeechRecognition?:new()=>Recognition};

export function VoiceInput({context,text,onChange,onActive}:{context:string;text:string;onChange:(text:string)=>void;onActive:(active:boolean)=>void}){
 const [supported,setSupported]=useState<boolean|null>(null);
 const [state,setState]=useState<'idle'|'listening'|'stopping'>('idle');
 const [interim,setInterim]=useState('');const [notice,setNotice]=useState('');
 const recognition=useRef<Recognition|null>(null);const update=useRef(onChange);update.current=onChange;
 const active=useRef(onActive);active.current=onActive;
 function dispose(){const r=recognition.current;recognition.current=null;if(r){r.onresult=null;r.onerror=null;r.onend=null;r.abort();}active.current(false);}
 useEffect(()=>{const w=window as SpeechWindow;setSupported(Boolean(w.SpeechRecognition||w.webkitSpeechRecognition));},[]);
 useEffect(()=>{dispose();setState('idle');setInterim('');setNotice('');return dispose;},[context]);
 useEffect(()=>{const stop=()=>{if(document.hidden){dispose();setState('idle');setInterim('');}};document.addEventListener('visibilitychange',stop);return()=>document.removeEventListener('visibilitychange',stop);},[]);
 function toggle(){
  if(recognition.current){setState('stopping');recognition.current.stop();return;}
  const w=window as SpeechWindow;const Constructor=w.SpeechRecognition||w.webkitSpeechRecognition;if(!Constructor)return;
  window.speechSynthesis?.cancel();const r=new Constructor();const base=text.trim();recognition.current=r;
  r.lang='sv-SE';r.continuous=true;r.interimResults=true;
  r.onresult=event=>{if(recognition.current!==r)return;let final='',pending='';for(let i=0;i<event.results.length;i++){const result=event.results[i];if(result.isFinal)final+=result[0].transcript+' ';else pending+=result[0].transcript+' ';}const next=[base,final.trim()].filter(Boolean).join(' ');update.current(next.slice(0,1800));setInterim(pending.trim());if(next.length>=1800){setNotice('Textfältet är fullt. Granska texten innan du skickar.');setState('stopping');r.stop();}};
  r.onerror=event=>{if(recognition.current!==r)return;const errors:Record<string,string>={'not-allowed':'Mikrofonen är blockerad. Tillåt mikrofonåtkomst för webbplatsen och försök igen.','service-not-allowed':'Taligenkänning är inte tillåten i den här webbläsaren.','audio-capture':'Ingen mikrofon hittades. Kontrollera din ljudingång.','network':'Taligenkänningen kunde inte ansluta. Kontrollera nätverket och försök igen.','no-speech':'Inget tal uppfattades. Försök igen.','language-not-supported':'Svenska stöds inte av webbläsarens taligenkänning.'};setNotice(errors[event.error]||'Taligenkänningen avbröts. Din färdiga text finns kvar.');dispose();setState('idle');setInterim('');};
  r.onend=()=>{if(recognition.current!==r)return;recognition.current=null;active.current(false);setState('idle');setInterim('');};
  setNotice('');setInterim('');setState('listening');active.current(true);
  try{r.start();}catch{dispose();setState('idle');setNotice('Mikrofonen kunde inte startas. Försök igen.');}
 }
 return <div className="voice-input"><div className="voice-row"><button type="button" className={`voice-button ${state!=='idle'?'listening':''}`} disabled={supported!==true||state==='stopping'} aria-pressed={state!=='idle'} onClick={toggle}>{state==='idle'?<Mic size={16}/>:<Square size={15}/>} {state==='idle'?'Prata':state==='stopping'?'Avslutar…':'Stoppa mikrofon'}</button><span role="status">{state==='listening'?'Lyssnar på svenska…':state==='stopping'?'Färdigställer text…':'Tala, granska och skicka'}</span></div>{interim&&<p className="voice-interim" aria-live="polite">{interim}</p>}{notice&&<p className="voice-notice" role="alert">{notice}</p>}{supported===false&&<p className="voice-notice">Taligenkänning saknas här. Öppna hubben i en webbläsare med stöd för taligenkänning, eller skriv ditt meddelande.</p>}<small>Webbläsarens taltjänst kan behandla ljudet. Hubben sparar ingen ljudinspelning. Texten skickas först när du trycker på pilen.</small></div>;
}

export function ReadAloud({text,context,disabled=false}:{text:string;context:string;disabled?:boolean}){
 const [supported,setSupported]=useState(false);const [speaking,setSpeaking]=useState(false);const [error,setError]=useState('');const utterance=useRef<SpeechSynthesisUtterance|null>(null);
 function stop(){if(utterance.current){utterance.current.onend=null;utterance.current.onerror=null;utterance.current=null;window.speechSynthesis?.cancel();}setSpeaking(false);}
 useEffect(()=>{setSupported('speechSynthesis' in window);return stop;},[context]);
 useEffect(()=>{const stopHidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',stopHidden);return()=>document.removeEventListener('visibilitychange',stopHidden);},[]);
 function toggle(){if(speaking){stop();return;}const synth=window.speechSynthesis;setError('');synth.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='sv-SE';const voice=synth.getVoices().find(v=>v.lang.toLowerCase().startsWith('sv'));if(voice)u.voice=voice;u.onend=()=>{if(utterance.current!==u)return;utterance.current=null;setSpeaking(false);};u.onerror=e=>{if(utterance.current!==u)return;utterance.current=null;setSpeaking(false);if(e.error!=='canceled'&&e.error!=='interrupted')setError('Uppläsningen kunde inte startas.');};utterance.current=u;setSpeaking(true);synth.speak(u);}
 return supported?<><button type="button" className="read-aloud" disabled={disabled} aria-pressed={speaking} onClick={toggle}>{speaking?<Square size={13}/>:<Volume2 size={14}/>} {speaking?'Stoppa uppläsning':'Lyssna'}</button>{error&&<span role="status">{error}</span>}</>:null;
}
