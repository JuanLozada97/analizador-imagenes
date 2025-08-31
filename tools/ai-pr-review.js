import { Octokit } from "@octokit/rest";
import OpenAI from "openai";

const {
  GITHUB_TOKEN,
  OPENAI_API_KEY,
  GITHUB_REPOSITORY,
  PR_NUMBER
} = process.env;

if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN");
if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");
if (!GITHUB_REPOSITORY) throw new Error("Missing GITHUB_REPOSITORY");
if (!PR_NUMBER) throw new Error("Missing PR_NUMBER");

const [owner, repo] = GITHUB_REPOSITORY.split("/");

const octokit = new Octokit({ auth: GITHUB_TOKEN });
const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const MAX_CHARS = 45000;

function truncate(str, max = MAX_CHARS) {
  return str && str.length > max ? str.slice(0, max) + "\n\n[...truncated...]" : (str || "");
}

async function getPrContext() {
  const { data: pr } = await octokit.pulls.get({ owner, repo, pull_number: Number(PR_NUMBER) });
  const files = await octokit.paginate(octokit.pulls.listFiles, {
    owner, repo, pull_number: Number(PR_NUMBER), per_page: 100
  });

  const diffs = files.map(f => {
    const header = `--- ${f.filename} (${f.status}, +${f.additions}/-${f.deletions})`;
    const patch = f.patch ? `\n${f.patch}` : "\n[No textual patch available (binary or too large)]";
    return `${header}${patch}`;
  }).join("\n\n");

  return {
    title: pr.title,
    body: pr.body || "",
    base: pr.base.ref,
    head: pr.head.ref,
    changedFilesCount: pr.changed_files,
    additions: pr.additions,
    deletions: pr.deletions,
    diffs
  };
}

function buildPrompt(ctx) {
  const intro = `
Actúa como un revisor de código senior especializado en Node.js (Express), React, seguridad y buenas prácticas.
Analiza el PR y entrega hallazgos concretos y accionables. Sé conciso pero específico.
Prioriza: errores probables, seguridad, performance, DX, consistencia, y cobertura de tests.

Formato de salida SOLAMENTE:
1) Resumen ejecutivo (2-4 bullets)
2) Hallazgos por categoría
   - Bugs / Correctness
   - Seguridad
   - Rendimiento
   - Mantenibilidad / Clean Code
   - Frontend UX/Accesibilidad
   - Infra/DevOps (si aplica)
3) Recomendaciones accionables (checklist)
4) Riesgo y prioridad (Bajo/Medio/Alto)

Evita comentarios genéricos; referencia líneas y archivos si es posible.
`;

  const context = `
PR Title: ${ctx.title}
Base/Head: ${ctx.base} <- ${ctx.head}
Changed Files: ${ctx.changedFilesCount}, +${ctx.additions}/-${ctx.deletions}

PR Description:
${ctx.body}

Diff (truncado si es muy grande):
${truncate(ctx.diffs)}
`;

  return `${intro}\n\n${context}`;
}

async function review() {
  const ctx = await getPrContext();
  const prompt = buildPrompt(ctx);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      { role: "system", content: "Eres un revisor de PR estricto y útil." },
      { role: "user", content: prompt }
    ]
  });

  const content = response.choices?.[0]?.message?.content?.trim() || "No hay comentarios.";

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: Number(PR_NUMBER),
    body:
`🤖 **AI PR Review**
  
${content}

---
> _Modelo_: gpt-4o-mini • _Automático_: cada push al PR
`
  });

  console.log("AI review posted.");
}

review().catch(err => {
  console.error(err);
  octokit.issues.createComment({
    owner,
    repo,
    issue_number: Number(PR_NUMBER),
    body: `⚠️ **AI PR Review** falló: \`${String(err?.message || err)}\``
  }).catch(() => {});
  process.exit(1);
});
