import bank from "./kompas80.json";
export const questions = bank.items.map(q => ({id:q.id, block:q.block, text:q.prompt, options:q.options.map((o,i)=>({id:i+1,text:o.text}))}));
export { bank };
