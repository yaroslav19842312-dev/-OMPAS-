"use client";
import { useState } from "react";

type Q={id:number;block:string;text:string;options:{id:number;text:string}[]};
type Result={leadingProfile:string;secondaryProfile:string;leadingProfiles?:string[];secondaryProfiles?:string[];isTie?:boolean;profileScores:Record<string,number>;motivations:{name:string;score:number}[];values:{name:string;score:number}[];vector:{name:string;score:number}[];directions:{name:string;score:number}[];behaviorNote:string;characterNote:string;controlNote:string;disclaimer:string};

const Dots=()=> <div className="dotFrame" aria-hidden="true">{Array.from({length:108}).map((_,i)=><i key={i}/>)}</div>;
const Compass=()=> <div className="compass" aria-hidden="true"><span className="ring"/><span className="north">N</span><span className="south">S</span><span className="west">W</span><span className="east">E</span><span className="needle">◆</span><span className="hub"/></div>;
const Shell=({children}:{children:React.ReactNode})=> <main className="page"><div className="frame"><Dots/><div className="ornament o1">❧</div><div className="ornament o2">❧</div><div className="ornament o3">❧</div><div className="ornament o4">❧</div><Compass/>{children}<div className="mountains" aria-hidden="true"><span/><span/><span/></div></div></main>;

export default function Home(){
 const [showInstructions,setShowInstructions]=useState(false),[started,setStarted]=useState(false),[q,setQ]=useState<Q|null>(null),[answers,setAnswers]=useState<Record<string,number>>({});
 const [loading,setLoading]=useState(false),[error,setError]=useState(""),[result,setResult]=useState<Result|null>(null);
 const answered=Object.keys(answers).length;
 async function load(id:number){setLoading(true);setError("");try{const r=await fetch(`/api/question/${id}`,{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error);setQ(d)}catch(e:any){setError(e.message||"Ошибка")}finally{setLoading(false)}}
 function start(){setStarted(true);load(1)}
 function back(){if(!q||loading||q.id<=1)return;load(q.id-1)}
 function choose(id:number){if(!q)return;const next={...answers,[String(q.id)]:id};setAnswers(next);if(q.id<80)load(q.id+1);else submit(next)}
 async function submit(a:Record<string,number>){setLoading(true);setError("");try{const r=await fetch("/api/result",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({answers:a})});const d=await r.json();if(!r.ok)throw Error(d.error);setResult(d);setQ(null)}catch(e:any){setError(e.message||"Ошибка расчёта")}finally{setLoading(false)}}
 if(result)return <ResultView result={result} restart={()=>{setResult(null);setAnswers({});setStarted(false);setShowInstructions(false);}}/>;
 return <Shell>{showInstructions&&!started?
 <section className="test" style={{maxWidth:"740px",margin:"0 auto",padding:"28px 20px",textAlign:"left"}}>
  <div className="brand mini">КУЛАВЕДА · КОМПАС</div>
  <h1 style={{textAlign:"center",margin:"18px 0"}}>Как проходить КОМПАС?</h1>
  <p>Этот тест поможет тебе лучше понять свои интересы, склонности и направления, которые хочется попробовать.</p>
  <p><strong>Здесь нет правильных или неправильных ответов.</strong> Важно то, что выбираешь именно ты.</p>
  <ol style={{lineHeight:1.9,paddingLeft:"24px"}}>
   <li>Прочитай вопрос и все четыре ответа.</li>
   <li>Прислушайся к себе: какой ответ откликнулся первым?</li>
   <li>Выбирай интуитивно, не раздумывая слишком долго.</li>
   <li>Отвечай искренне, а не так, как ожидают родители, учителя или друзья.</li>
   <li>Не выбирай вариант только потому, что он кажется престижным или «правильным».</li>
   <li>Если ничего сразу не откликнулось, спокойно подумай и выбери наиболее близкое. Не угадывай.</li>
  </ol>
  <p><strong>Главное — твой первый искренний отклик!</strong> КОМПАС не решает, кем тебе быть, а помогает лучше узнать себя.</p>
  <p style={{fontSize:"0.9em"}}>В некоторых вопросах есть особая инструкция — внимательно прочитай её.</p>
  <div style={{display:"flex",gap:"12px",flexWrap:"wrap",justifyContent:"center",marginTop:"24px"}}>
   <button className="scrollBtn scrollSmall" type="button" onClick={()=>setShowInstructions(false)}>← НАЗАД</button>
   <button className="scrollBtn scrollSmall" type="button" onClick={start}>НАЧАТЬ 80 ВОПРОСОВ →</button>
  </div>
 </section>
 :!started?
 <>
 <section className="approvedDesktop" aria-label="КОМПАС — путь к осознанному выбору">
   <img src="/assets/approved-home-desktop.webp" alt="КОМПАС: путешественник на фоне гор, старинный компас и свиток с приглашением начать исследование" />
   <button className="approvedDesktopCTA" type="button" onClick={()=>setShowInstructions(true)} aria-label="Начать исследование — 80 вопросов"><span className="srOnly">НАЧАТЬ ИССЛЕДОВАНИЕ</span></button>
 </section>
 <section className="approvedMobile" aria-label="КОМПАС — путь к осознанному выбору">
   <div className="approvedMobileBrand">КУЛАВЕДА · СЕМЬЯВЕДЕНИЕ</div>
   <div className="approvedMobileKicker">ПУТЬ К ОСОЗНАННОМУ ВЫБОРУ</div>
   <img className="approvedMobileLogo" src="/assets/approved-logo-mobile.png" alt="КОМПАС — название на старинном свитке с розой ветров вместо буквы О" />
   <h2>Познай себя. Найди свою силу.<br/>Создавай свой путь.</h2>
   <p className="approvedMobileLead">80 вопросов помогут заметить твои интересы, природные склонности, мотивацию, ценности и привычки.</p>
   <button className="approvedMobileCTA" type="button" onClick={()=>setShowInstructions(true)} aria-label="Начать исследование"><img src="/assets/approved-cta-mobile.png" alt=""/><span className="srOnly">НАЧАТЬ ИССЛЕДОВАНИЕ</span></button>
   <div className="approvedMobileNote"><b>КОМПАС не выбирает профессию за тебя.</b><br/>Он показывает направления, которые стоит проверить в реальной жизни.</div>
   <p className="approvedMobileTime">Ориентировочное время: 15–25 минут</p>
   <div className="approvedMobileMotto">ПОЗНАВАЙ · РАЗВИВАЙ · СОЗДАВАЙ</div>
   <footer className="approvedMobileCopyright">© 2026 Бобрецкий Ярослав Олегович<br/>КОМПАС — система профессионального самоопределения<br/>Все права защищены.</footer>
 </section>
 </>
 :<section className="test"><div className="brand mini">КУЛАВЕДА · КОМПАС</div><div className="topline"><span>{q?.block||"ИССЛЕДОВАНИЕ"}</span><b>{Math.min(answered+1,80)} / 80</b></div><div className="progress"><div style={{width:`${answered/80*100}%`}}/></div>{loading&&<div className="loading">Открываем следующий вопрос…</div>}{q&&!loading&&<><div className="qnum">ВОПРОС {q.id}</div><h2>{q.text}</h2><div className="options">{q.options.map((o,i)=><button key={o.id} className="option parchmentOption" onClick={()=>choose(o.id)}><span className="letter">{["А","Б","В","Г"][i]}</span><span>{o.text}</span><em>›</em></button>)}</div><div className="questionActions"><button type="button" className="scrollBtn scrollSmall" onClick={back} disabled={q.id===1}>← НАЗАД</button></div><p className="hint">Отвечай так, как тебе ближе. В некоторых вопросах есть специальная инструкция — прочитай её внимательно.</p></>}{error&&<div className="error">{error}</div>}</section>}</Shell>;
}

function ResultView({result,restart}:{result:Result;restart:()=>void}){
 const ps=[["master","Мастер"],["entrepreneur","Предприниматель"],["leader","Руководитель"],["mentor","Учитель-Мудрец"]];
 return <Shell><section className="results"><div className="brand mini">КУЛАВЕДА · СЕМЬЯВЕДЕНИЕ</div><div className="kicker">ТВОЙ ЛИЧНЫЙ КОМПАС</div><h1>{result.isTie ? "Твои ведущие направления" : result.leadingProfile}</h1>
 <p className="lead">{result.isTie
 ? <>У тебя одинаково часто встречаются ответы по нескольким направлениям: <b>{(result.leadingProfiles||[]).join(" · ")}</b>. Это сочетание интересов, а не ошибка. Исследуй эти направления на практике.</>
 : <>Это направление ты выбирал чаще всего. Следом — <b>{result.secondaryProfile}</b>. Исследуй оба направления на практике.</>}</p>
 <div className="cards">{ps.map(([k,n])=><div className="card" key={k}><div className="cardHead"><span>{n}</span><strong>{result.profileScores[k]}%</strong></div><div className="bar"><div style={{width:`${result.profileScores[k]}%`}}/></div></div>)}</div>
 <div className="note">Проценты отражают выбор ответов в 24 вопросах о профессиональных направлениях; вместе они составляют 100% (возможна погрешность округления).</div>
 <div className="grid2"><div className="panel"><h3>Что тебя мотивирует</h3>{result.motivations.map(x=><p key={x.name}>• {x.name} — <b>{x.score} из 8</b></p>)}</div><div className="panel"><h3>Что для тебя важно</h3>{result.values.map(x=><p key={x.name}>• {x.name} — <b>{x.score} из 8</b></p>)}</div></div>
 <div className="panel"><h3>Твой вектор действий</h3>{result.vector.map(x=><p key={x.name}>• {x.name} — <b>{x.score} из 6</b></p>)}</div>
 <div className="panel"><h3>Поведение и характер</h3><p>{result.behaviorNote}</p><p>{result.characterNote}</p></div>
 <div className="note"><b>Следующий шаг:</b> выбери 1–2 направления, попробуй их в действии и сравни ожидания с реальным опытом.</div>
 <div className="bonusPanel"><div className="bonusKicker">ТВОЙ БОНУС</div><h3>4 путеводителя по профессиям</h3><p>Многие профессии соединяют сразу несколько направлений.</p><div className="bonusGrid"><a className="bonusLink" href="/docs/kompas-master.pdf" target="_blank" rel="noopener noreferrer"><b>МАСТЕР</b><span>Открыть PDF →</span></a><a className="bonusLink" href="/docs/kompas-predprinimatel.pdf" target="_blank" rel="noopener noreferrer"><b>ПРЕДПРИНИМАТЕЛЬ</b><span>Открыть PDF →</span></a><a className="bonusLink" href="/docs/kompas-rukovoditel.pdf" target="_blank" rel="noopener noreferrer"><b>РУКОВОДИТЕЛЬ</b><span>Открыть PDF →</span></a><a className="bonusLink" href="/docs/kompas-uchitel-mudrec.pdf" target="_blank" rel="noopener noreferrer"><b>УЧИТЕЛЬ-МУДРЕЦ</b><span>Открыть PDF →</span></a></div></div>
 <div className="resultActions"><button className="ghostBtn scrollBtn scrollSmall" onClick={restart}>ПРОЙТИ ЕЩЁ РАЗ ↻</button></div>
 <div className="resultActions" style={{marginTop:"14px"}}><a className="ghostBtn" href="https://forms.yandex.ru/u/6acd2aea1f1eb57bc900031b" target="_blank" rel="noopener noreferrer" style={{display:"inline-block",textDecoration:"none",textAlign:"center"}}>Помоги нам сделать КОМПАС точнее!</a></div><p className="small">{result.disclaimer}</p>
 <footer style={{textAlign:"center",marginTop:"32px",padding:"20px 12px",borderTop:"1px solid rgba(139,105,45,0.45)",color:"#214b3b",fontSize:"14px",lineHeight:"1.8"}}><div>© 2026 Бобрецкий Ярослав Олегович</div><div><strong>КОМПАС — система профессионального самоопределения</strong></div><div>Автор проекта: Бобрецкий Ярослав Олегович</div><div style={{fontSize:"12px",opacity:0.8}}>Все права на оригинальные авторские материалы защищены.</div></footer></section></Shell>;
}
