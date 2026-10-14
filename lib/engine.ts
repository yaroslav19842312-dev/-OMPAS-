import { bank } from "./data";
type Answers = Record<string,number>;
const keys = ["master","entrepreneur","leader","mentor"] as const;
const round = (x:number)=>Math.round(x*10)/10;
function countKeys(items:typeof bank.items,answers:Answers){
 const counts:Record<string,number>={};
 for(const q of items){const k=q.options[answers[String(q.id)]-1]?.key;if(k)counts[k]=(counts[k]||0)+1;}
 return counts;
}
export function calculateResult(answers:Answers){
 if(!answers || typeof answers!=="object" || Array.isArray(answers) || Object.keys(answers).length!==80)throw Error("Нужно ответить на все 80 вопросов.");
 for(let i=1;i<=80;i++)if(!Number.isInteger(answers[String(i)]) || answers[String(i)]<1 || answers[String(i)]>4)throw Error(`Проверь ответ на вопрос №${i}.`);
 const slice=(start:number,end:number)=>bank.items.slice(start-1,end);
 const professional=countKeys(slice(1,24),answers);
 const profileScores:Record<string,number>={};for(const k of keys)profileScores[k]=round((professional[k]||0)/24*100);
 const sorted=[...keys].sort((a,b)=>profileScores[b]-profileScores[a]||keys.indexOf(a)-keys.indexOf(b));
 const maxScore=profileScores[sorted[0]];
 const leaders=sorted.filter(k=>profileScores[k]===maxScore);
 const isTie=leaders.length>1;
 const nextScore=sorted.find(k=>profileScores[k]<maxScore);
 const runners=nextScore ? sorted.filter(k=>profileScores[k]===profileScores[nextScore]) : [];
 const labels=bank.directions as Record<string,string>;
 const top=(start:number,end:number,dict:Record<string,string>)=>Object.entries(countKeys(slice(start,end),answers)).sort((a,b)=>b[1]-a[1]).map(([key,count])=>({name:dict[key]||key,score:count}));
 const motivation=top(25,32,bank.motivation_labels), values=top(33,40,bank.value_labels), vector=top(51,56,bank.vector_labels);
 return {version:"КОМПАС 80 — пилотная методика 1.0", leadingProfile:isTie?"Сочетание направлений":labels[sorted[0]],secondaryProfile:isTie?"":labels[sorted[1]],leadingProfiles:leaders.map(k=>labels[k]),secondaryProfiles:runners.map(k=>labels[k]),isTie,profileScores, motivations:motivation,values,vector,professionalCounts:professional,
 directions:sorted.map(k=>({name:labels[k],score:profileScores[k]})),
 behaviorNote:"Ответы на вопросы о поведении предназначены для личного размышления и не оцениваются в баллах.",
 characterNote:"Блок «Характер» помогает задуматься о привычках и поведении. Баллы, рейтинги и психологические ярлыки по нему не рассчитываются.",
 controlNote:"Контрольные вопросы используются только для изучения качества опросника и не лишают участника результата.",
 disclaimer:"КОМПАС — исследовательский инструмент самопознания, а не психодиагностическое заключение. Проценты показывают долю выбранных ответов по четырём направлениям в вопросах 1–24, а не врождённые способности или вероятность успеха в профессии."};
}
