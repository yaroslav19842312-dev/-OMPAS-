
"use client";
import { useMemo, useState } from "react";

type Q={id:number;block:string;text:string;options:{id:number;text:string}[]};
type Result={leadingProfile:string;secondaryProfile:string;profileGap:number;profileScores:Record<string,number>;profileLevels:Record<string,string>;vector:{action:number;relationship:number};motivations:{name:string;score:number}[];values:{name:string;score:number}[];behaviorScore:number;directions:{name:string;description:string;score:number;hypothesis:string}[];disclaimer:string};

export default function Home(){
 const [started,setStarted]=useState(false),[q,setQ]=useState<Q|null>(null),[answers,setAnswers]=useState<Record<string,number>>({});
 const [loading,setLoading]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<Result|null>(null);
 const answered=Object.keys(answers).length;
 async function load(id:number){setLoading(true);setError("");try{const r=await fetch(`/api/question/${id}`,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setQ(d)}catch(e:any){setError(e.message||"Ошибка")}finally{setLoading(false)}}
 function start(){setStarted(true);load(1)}
 function choose(id:number){if(!q)return;const next={...answers,[String(q.id)]:id};setAnswers(next);if(q.id<56)load(q.id+1);else submit(next)}
 async function submit(a:Record<string,number>){setLoading(true);setError("");try{const r=await fetch("/api/result",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers:a})});const d=await r.json();if(!r.ok)throw Error(d.error);setResult(d);setQ(null)}catch(e:any){setError(e.message||"Ошибка расчёта")}finally{setLoading(false)}}
 if(result)return <ResultView result={result} restart={()=>{setResult(null);setAnswers({});setStarted(false);}}/>
 return <main className="page"><div className="frame"><div className="dots">{Array.from({length:54}).map((_,i)=><span key={i}/>)}</div>
 {!started?<section className="hero"><div className="compass">✦</div><div className="eyebrow">КУЛАВЕДА · СЕМЬЯВЕДЕНИЕ</div><h1>КОМПАС</h1><h2>Познай себя. Найди свою силу.</h2><p className="lead">56 вопросов, которые помогают заметить свои интересы, способности, способ действия, мотивацию и ценности.</p><div className="note"><b>Важно:</b> это не выбор профессии и не диагноз. Результат — гипотеза, которую нужно проверить действием.</div><button className="goldBtn" onClick={start}>Начать исследование</button><p className="small">Ориентировочное время: 10–15 минут.</p></section>
 :<section className="test"><div className="topline"><span>{q?.block||"КОМПАС"}</span><span>{answered}/56</span></div><div className="progress"><div style={{width:`${answered/56*100}%`}}/></div>{loading&&<div className="loading">Загружаю вопрос…</div>}{q&&!loading&&<><div className="qnum">ВОПРОС {q.id} ИЗ 56</div><h2>{q.text}</h2><div className="options">{q.options.map(o=><button key={o.id} className="option" onClick={()=>choose(o.id)}><span className="letter">{["А","Б","В","Г"][o.id-1]}</span><span>{o.text}</span></button>)}</div><p className="hint">Нет правильного ответа. Выбирай то, что действительно ближе тебе.</p></>}{error&&<div className="error">{error}</div>}</section>}
 </div></main>
}

function ResultView({result,restart}:{result:Result;restart:()=>void}){
 const ps=[["mentor","Наставник"],["leader","Руководитель"],["entrepreneur","Предприниматель"],["master","Мастер"]];
 return <main className="page"><div className="frame"><div className="dots">{Array.from({length:54}).map((_,i)=><span key={i}/>)}</div><section className="results">
 <div className="eyebrow">ТВОЙ КОМПАС</div><h1>{result.leadingProfile}</h1><p className="lead">Ведущий профиль. Рядом с ним — <b>{result.secondaryProfile}</b>.</p>
 <div className="cards">{ps.map(([k,n])=><div className="card" key={k}><div className="cardTitle">{n}</div><div className="bar"><div style={{width:`${result.profileScores[k]}%`}}/></div><div className="score">{result.profileScores[k]} <small>/100</small></div><div className="level">{result.profileLevels[k]}</div></div>)}</div>
 <div className="grid2"><div className="panel"><h3>Векторы</h3><p>Действие: <b>{result.vector.action}</b></p><p>Отношения: <b>{result.vector.relationship}</b></p></div><div className="panel"><h3>Поведение</h3><p>Практический блок: <b>{result.behaviorScore}</b>/100</p></div></div>
 <div className="grid2"><div className="panel"><h3>Топ-3 мотива</h3>{result.motivations.map(x=><p key={x.name}>• {x.name} — {x.score}</p>)}</div><div className="panel"><h3>Топ-3 ценности</h3>{result.values.map(x=><p key={x.name}>• {x.name} — {x.score}</p>)}</div></div>
 <div className="panel"><h3>Направления для исследования</h3>{result.directions.slice(0,5).map(d=><div className="direction" key={d.name}><div><b>{d.name}</b><span>{d.description}</span></div><strong>{d.score}</strong></div>)}</div>
 <div className="note"><b>Следующий шаг:</b> выбери 1–2 направления и проведи профессиональную пробу. Сравни ожидание с реальным опытом.</div>
 <div className="resultActions">
   <a className="goldBtn actionLink" href="/docs/kompas-professions-varna-checklist.pdf" target="_blank" rel="noopener noreferrer">Исследовать профессии · PDF</a>
   <button className="ghostBtn" onClick={restart}>Пройти ещё раз</button>
 </div>
 <p className="small">В справочнике профессии распределены по преобладающей функции: Мастер, Предприниматель, Руководитель, Наставник. Смешанные роли отмечены отдельно.</p>
 <p className="small">{result.disclaimer}</p>
 </section></div></main>
}
