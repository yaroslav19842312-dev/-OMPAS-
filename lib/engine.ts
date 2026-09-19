
import { professionalDirections, profiles, questions } from "./data";

type AnswerMap = Record<string, number>;

const PROFILE_KEYS = ["mentor","leader","entrepreneur","master"] as const;
const PROFILE_LABELS: Record<(typeof PROFILE_KEYS)[number], string> = {
  mentor: "Наставник",
  leader: "Руководитель",
  entrepreneur: "Предприниматель",
  master: "Мастер",
};

const level = (v: number) =>
  v < 40 ? "Слабое" :
  v < 60 ? "Умеренное" :
  v < 75 ? "Выраженное" :
  v < 90 ? "Сильное" : "Очень сильное";

const hypothesis = (v: number) =>
  v < 40 ? "Слабая гипотеза" :
  v < 60 ? "Умеренная гипотеза" :
  v < 75 ? "Выраженная гипотеза" :
  v < 90 ? "Сильная гипотеза" : "Очень сильная гипотеза";

function countIn(values: string[], allowed: readonly string[]) {
  return values.reduce((n, x) => n + (allowed.includes(x) ? 1 : 0), 0);
}

export function calculateResult(answers: AnswerMap) {
  const q = (id: number) => {
    const v = Number(answers[String(id)]);
    return Number.isInteger(v) && v >= 1 && v <= 4 ? v : null;
  };

  const selected = (id: number) => {
    const a = q(id);
    if (!a) return null;
    // questions are intentionally kept server-side; this function receives
    // the answer and accesses the server-only question bank.
    return questions[id - 1]?.options[a - 1]?.meta ?? null;
  };

  const all = Array.from({length:56}, (_,i) => selected(i+1));

  const controlPassed = q(56) === 3;
  if (!controlPassed) {
    throw new Error("Контрольный вопрос №56 не пройден.");
  }

  const missing = all.some(x => !x);
  if (missing) throw new Error("Не все 56 ответов заполнены.");

  const profileRaw = {
    mentor: all.reduce((s,m:any)=>s + Number(m.mentor||0),0),
    leader: all.reduce((s,m:any)=>s + Number(m.leader||0),0),
    entrepreneur: all.reduce((s,m:any)=>s + Number(m.entrepreneur||0),0),
    master: all.reduce((s,m:any)=>s + Number(m.master||0),0),
  };
  const profileMax = 24;
  const profileScores = Object.fromEntries(PROFILE_KEYS.map(k => [k, Math.round(profileRaw[k]/profileMax*1000)/10])) as Record<string,number>;

  const actionRaw = all.slice(24,30).reduce((s,m:any)=>s+Number(m.action||0),0);
  const relationRaw = all.slice(24,30).reduce((s,m:any)=>s+Number(m.relationship||0),0);
  const action = Math.round(actionRaw/6*1000)/10;
  const relationship = Math.round(relationRaw/6*1000)/10;

  const motivations = all.slice(30,38).map((m:any)=>m.motivation).filter(Boolean) as string[];
  const values = all.slice(38,46).map((m:any)=>m.value).filter(Boolean) as string[];
  const behaviors = all.slice(46,52).reduce((s,m:any)=>s+Number(m.behavior||0),0);
  const behaviorScore = Math.round(behaviors/6*1000)/10;

  const motivationCounts: Record<string,number> = {};
  motivations.forEach(x=>motivationCounts[x]=(motivationCounts[x]||0)+1);
  const valueCounts: Record<string,number> = {};
  values.forEach(x=>valueCounts[x]=(valueCounts[x]||0)+1);

  const top3 = (obj: Record<string,number>) =>
    Object.entries(obj).sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0])).slice(0,3)
      .map(([name,score])=>({name,score}));

  const directionScores = professionalDirections.map(d => {
    const interestScore = countIn(all.slice(0,8).map((m:any)=>m.interest).filter(Boolean), d.interest) / 8 * 100;
    const abilityScore = countIn(all.slice(8,16).map((m:any)=>m.ability).filter(Boolean), d.ability) / 8 * 100;
    const actionScore = Math.min(100, action * d.actionFactor * 0.6 + relationship * d.relationshipFactor * 0.4);
    const motivationScore = Math.min(100, countIn(motivations, d.motivation) / 8 * 100);
    const valueScore = Math.min(100, countIn(values, d.value) / 8 * 100);
    const behavior = behaviorScore;
    const total = interestScore*0.25 + abilityScore*0.25 + actionScore*0.20 +
                   motivationScore*0.15 + valueScore*0.10 + behavior*0.05;
    return {
      name:d.name,
      description:d.description,
      profiles:d.profiles,
      score:Math.round(total*10)/10,
      hypothesis:hypothesis(total)
    };
  }).sort((a,b)=>b.score-a.score);

  const sortedProfiles = Object.entries(profileScores).sort((a,b)=>b[1]-a[1]);
  const gap = sortedProfiles.length > 1 ? sortedProfiles[0][1]-sortedProfiles[1][1] : 100;

  return {
    version:"KOMPAS Engine 1.0-MVP",
    profileScores,
    profileLevels:Object.fromEntries(Object.entries(profileScores).map(([k,v])=>[k,level(v)])),
    leadingProfile: PROFILE_LABELS[sortedProfiles[0][0] as keyof typeof PROFILE_LABELS],
    secondaryProfile: PROFILE_LABELS[sortedProfiles[1][0] as keyof typeof PROFILE_LABELS],
    profileGap: Math.round(gap*10)/10,
    vector:{action,relationship},
    motivations:top3(motivationCounts),
    values:top3(valueCounts),
    behaviorScore,
    directions:directionScores,
    controlPassed:true,
    disclaimer:"Результат — рабочая гипотеза для исследования себя, а не диагноз и не предписание профессии."
  };
}
