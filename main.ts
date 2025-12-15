import { groq } from "./clients/groq.ts";
import { app } from "./clients/hono.ts";
import { openRouter } from "./clients/openRouter.ts";

const randomNumber = Math.floor(Math.random() * 2);
const authKey = Deno.env.get("AUTH_KEY");

app.post("/", async (hctx) => {
  const suthHeader = hctx.req.header("Authorization");

  if (suthHeader != authKey) {
    return hctx.json({ auth: false }, 404);
  }

  const body = await hctx.req.json();
  const prompt = body.prompt;
  const systemPrompt = body.systemPrompt ?? "You Are A Helpful Ai Assistant";
  const model = body.model ?? "llama-3.3-70b-versatile";
  const reasoning = body.reasoning ?? "medium";

  if (!prompt)
    return hctx.json({ auth: true, error: "no provided prompt" }, 400);

  let aiRequest;
  if (randomNumber === 0) {
    aiRequest = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        systemPrompt && { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
    });
  } else {
    aiRequest = await openRouter.chat.send({
      model: "tngtech/deepseek-r1t-chimera:free",
      messages: [
        systemPrompt && { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      reasoning: { effort: reasoning },
    });
  }

  const reply = aiRequest.choices[0].message.content;
  return hctx.json({ auth: true, reply: reply }, 200);
});

Deno.serve({ port: 443 }, app.fetch);
