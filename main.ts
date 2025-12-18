import { gemini } from "./clients/gemini.ts";
import { groq } from "./clients/groq.ts";
import { app } from "./clients/hono.ts";
import { openRouter } from "./clients/openRouter.ts";
import { respTemp } from "./data/respTemplate.ts";
import { getProvidor } from "./utils/getProvidor.ts";

const authKey = Deno.env.get("AUTH_KEY");

app.post("/", async (hctx) => {
  // Get auth header and verify equality
  const authHeader = hctx.req.header("Authorization");
  if (authHeader !== authKey) {
    return hctx.json({ auth: false }, 404);
  }

  // Get request arguments
  const reqBody = (await hctx.req.json()) ?? {};
  const reqPrompt = reqBody.prompt;
  const reqSystemPrompt =
    reqBody.systemPrompt ?? "You Are A Helpful Ai Assistant";
  const reqProvidor = reqBody.providor;
  const reqReasoning = reqBody.reasoning ?? "medium";

  // Early return if no prompt
  if (!reqPrompt) {
    return hctx.json({ ...respTemp, error: "No Provided Prompt" }, 400);
  }
  respTemp.auth = true; // Set Auth === True

  // Determine which providor to use
  const providor = reqProvidor ?? (await getProvidor());
  respTemp.providor = providor; // Set Selected Providor

  let aiResponse;

  switch (providor) {
    case "groq": {
      aiResponse = await groq.chat.completions
        .create({
          model: "llama-3.3-70b-versatile",
          messages: [
            reqSystemPrompt && { role: "system", content: reqSystemPrompt },
            { role: "user", content: reqPrompt },
          ],
        })
        .then((x) => x.choices[0].message.content, null);
      break;
    }

    case "openrouter":
      {
        aiResponse = await openRouter.chat
          .send({
            model: "tngtech/deepseek-r1t-chimera:free",
            messages: [
              reqSystemPrompt && { role: "system", content: reqSystemPrompt },
              { role: "user", content: reqPrompt },
            ],
            reasoning: { effort: reqReasoning },
          })
          .then((x) => x.choices[0].message.content, null);
      }
      break;

    case "gemini": {
      aiResponse = await gemini.models
        .generateContent({
          model: "gemini-2.5-flash",
          config: { systemInstruction: reqSystemPrompt },
          contents: reqPrompt,
        })
        .then((x) => x.text, null);
    }
  }

  respTemp.message = (aiResponse ?? null) as string | null;
  !respTemp.message && (respTemp.error = "Error Generating Response.");
  return hctx.json(respTemp, 200);
});

Deno.serve(app.fetch);
