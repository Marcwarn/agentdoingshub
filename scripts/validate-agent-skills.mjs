import fs from "node:fs";
import path from "node:path";

const root = path.resolve("agent-skills");
const expected = ["doings-operating-system","chief-of-staff","marta-workshop","lo-leadership","kim-customer","vera-change","saga-research","nils-learning","cleo-messaging","amir-strategy","alex-ai-workflows","iris-quality"];
const cases = JSON.parse(fs.readFileSync(path.join(root,"evals","cases.json"),"utf8"));
const errors = [];
for (const skill of expected) {
  const file = path.join(root,skill,"SKILL.md");
  if (!fs.existsSync(file)) { errors.push(`${skill}: missing SKILL.md`); continue; }
  const text = fs.readFileSync(file,"utf8");
  const fm = text.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) errors.push(`${skill}: invalid frontmatter`);
  const name = fm?.[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
  const description = fm?.[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
  if (name !== skill) errors.push(`${skill}: name must equal directory`);
  if (!description || description.length > 1024 || !/Use (for|when|before)/.test(description)) errors.push(`${skill}: description must say when to use it`);
  if (/TODO|placeholder/i.test(text)) errors.push(`${skill}: unfinished content`);
  const openai = path.join(root,skill,"agents","openai.yaml");
  if (!fs.existsSync(openai)) errors.push(`${skill}: missing agents/openai.yaml`);
  else if (!fs.readFileSync(openai,"utf8").includes(`$${skill}`)) errors.push(`${skill}: default_prompt must mention $${skill}`);
}
const specialistSkills = expected.filter((x)=>x!=="doings-operating-system");
for (const skill of specialistSkills) {
  if (!cases.some((c)=>c.skill===skill)) errors.push(`${skill}: missing eval case`);
}
if (errors.length) { console.error(errors.join("\n")); process.exit(1); }
console.log(`Validated ${expected.length} skills and ${cases.length} eval cases.`);
