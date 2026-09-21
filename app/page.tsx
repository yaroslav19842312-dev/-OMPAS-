"use client";
import { useState } from "react";

type Q={id:number;block:string;text:string;options:{id:number;text:string}[]};
type Result={leadingProfile:string;secondaryProfile:string;profileGap:number;profileScores:Record<string,number>;profileLevels:Record<string,string>;vector:{action:number;relationship:number};motivations:{name:string;score:number}[];values:{name:string;score:number}[];behaviorScore:number;directions:{name:string;description:string;score:number;hypothesis:string}[];disclaimer:string};

const Dots=()=> <div className="dotFrame" aria-hidden="true">{Array.from({length:108}).map((_,i)=><i key={i}/>)}</div>;
const Compass=()=> <div className="compass" aria-hidden="true"><span className="ring"/><span className="north">N</span><span className="south">S</span><span className="west">W</span><span className="east">E</span><span className="needle">◆</span><span className="hub"/></div>;
const Shell=({children}:{children:React.ReactNode})=> <main className="page"><div className="frame"><Dots/><div className="ornament o1">❧</div><div className="ornament o2">❧</div><div className="ornament o3">❧</div><div className="ornament o4">❧</div><Compass/>{children}<div className="mountains" aria-hidden="true"><span/><span/><span/></div></div></main>;

export default function Home(){
 const [started,setStarted]=useState(false),[q,setQ]=useState<Q|null>(null),[answers,setAnswers]=useState<Record<string,number>>({});
 const [loading,setLoading]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<Result|null>(null);
 const answered=Object.keys(answers).length;
 async function load(id:number){setLoading(true);setError("");try{const r=await fetch(`/api/question/${id}`,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setQ(d)}catch(e:any){setError(e.message||"Ошибка")}finally{setLoading(false)}}
 function start(){setStarted(true);load(1)}
 function choose(id:number){if(!q)return;const next={...answers,[String(q.id)]:id};setAnswers(next);if(q.id<56)load(q.id+1);else submit(next)}
 async function submit(a:Record<string,number>){setLoading(true);setError("");try{const r=await fetch("/api/result",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers:a})});const d=await r.json();if(!r.ok)throw Error(d.error);setResult(d);setQ(null)}catch(e:any){setError(e.message||"Ошибка расчёта")}finally{setLoading(false)}}
 if(result)return <ResultView result={result} restart={()=>{setResult(null);setAnswers({});setStarted(false);}}/>;
 return <Shell>{!started?
 <section className="hero"><div className="brand">КУЛАВЕДА <b>·</b> СЕМЬЯВЕДЕНИЕ</div><div className="kicker">ПУТЬ К ОСОЗНАННОМУ ВЫБОРУ</div><h1>КОМПАС</h1><h2>Познай себя. Найди свою силу.<br/>Создавай свой путь.</h2><p className="lead">56 вопросов помогут заметить твои интересы, способности, способ действия, мотивацию и ценности.</p><div className="note"><b>КОМПАС не выбирает профессию за тебя.</b><br/>Он показывает направления, которые стоит проверить в реальной жизни.</div><button className="goldBtn" onClick={start}>НАЧАТЬ ИССЛЕДОВАНИЕ <span>→</span></button><p className="small">Ориентировочное время: 10–15 минут</p><div className="motto">ПОЗНАВАЙ <b>•</b> РАЗВИВАЙ <b>•</b> СОЗДАВАЙ</div></section>
 :<section className="test"><div className="brand mini">КУЛАВЕДА · КОМПАС</div><div className="topline"><span>{q?.block||"ИССЛЕДОВАНИЕ"}</span><b>{Math.min(answered+1,56)} / 56</b></div><div className="progress"><div style={{width:`${answered/56*100}%`}}/></div>{loading&&<div className="loading">Открываем следующий вопрос…</div>}{q&&!loading&&<><div className="qnum">ВОПРОС {q.id}</div><h2>{q.text}</h2><div className="options">{q.options.map((o,i)=><button key={o.id} className="option" onClick={()=>choose(o.id)}><span className="letter">{["А","Б","В","Г"][i]}</span><span>{o.text}</span><em>›</em></button>)}</div><p className="hint">Здесь нет правильных ответов. Выбирай то, что действительно ближе тебе.</p></>}{error&&<div className="error">{error}</div>}</section>}</Shell>;
}

function ResultView({result,restart}:{result:Result;restart:()=>void}){
 const ps=[["mentor","Наставник"],["leader","Руководитель"],["entrepreneur","Предприниматель"],["master","Мастер"]];
 return <Shell><section className="results"><div className="brand mini">КУЛАВЕДА · СЕМЬЯВЕДЕНИЕ</div><div className="kicker">ТВОЙ ЛИЧНЫЙ КОМПАС</div><h1>{result.leadingProfile}</h1><p className="lead">Ведущее направление. Рядом с ним — <b>{result.secondaryProfile}</b>. Это не ярлык, а гипотеза для исследования себя.</p>
 <div className="cards">{ps.map(([k,n])=><div className="card" key={k}><div className="cardHead"><span>{n}</span><strong>{result.profileScores[k]}</strong></div><div className="bar"><div style={{width:`${result.profileScores[k]}%`}}/></div><div className="level">{result.profileLevels[k]}</div></div>)}</div>
 <div className="grid2"><div className="panel"><h3>Твой вектор</h3><p>Действие <b>{result.vector.action}</b></p><p>Отношения <b>{result.vector.relationship}</b></p></div><div className="panel"><h3>Практический блок</h3><div className="bigScore">{result.behaviorScore}<small>/100</small></div></div></div>
 <div className="grid2"><div className="panel"><h3>Что тебя мотивирует</h3>{result.motivations.map(x=><p key={x.name}>• {x.name} — <b>{x.score}</b></p>)}</div><div className="panel"><h3>Что для тебя важно</h3>{result.values.map(x=><p key={x.name}>• {x.name} — <b>{x.score}</b></p>)}</div></div>
 <div className="panel directions"><h3>Направления для исследования</h3>{result.directions.slice(0,5).map((d,i)=><div className="direction" key={d.name}><span className="rank">0{i+1}</span><div><b>{d.name}</b><span>{d.description}</span></div><strong>{d.score}</strong></div>)}</div>
 <div className="note"><b>Следующий шаг:</b> выбери 1–2 направления, попробуй их в действии и сравни ожидание с реальным опытом.</div>
 <div className="resultActions"><a className="goldBtn actionLink" href="/docs/kompas-professions-varna-checklist.pdf" target="_blank" rel="noopener noreferrer">ИССЛЕДОВАТЬ ПРОФЕССИИ <span>→</span></a><button className="ghostBtn" onClick={restart}>Пройти ещё раз</button></div>
 <p className="small">Профессии сгруппированы по четырём направлениям реализации: Мастер, Предприниматель, Руководитель и Наставник. Многие профессии сочетают несколько направлений.</p><p className="small">{result.disclaimer}</p></section></Shell>;
}
