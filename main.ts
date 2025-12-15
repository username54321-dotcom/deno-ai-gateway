import { app } from "./clients/hono.ts";
import { openRouter } from "./clients/openRouter.ts";

const authKey = Deno.env.get("AUTH_KEY");

app.post("/", async (hctx) => {
  const suthHeader = hctx.req.header("Authorization");

  if (suthHeader != authKey) {
    return hctx.json({ auth: false }, 404);
  }

  const body = await hctx.req.json();
  const prompt = body.prompt;
  const systemPrompt = body.systemPrompt ?? "You Are A Helpful Ai Assistant";
  const model = body.model ?? "mistralai/devstral-2512:free";
  const reasoning = body.reasoning ?? "medium";

  if (!prompt)
    return hctx.json({ auth: true, error: "no provided prompt" }, 400);

  const aiRequest = await openRouter.chat.send({
    model: model,
    messages: [
      systemPrompt && { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
    reasoning: { effort: reasoning },
  });
  console.log(
    aiRequest.object,
    "------------------------------------------------------------------------------"
  );
  const reply = aiRequest.choices[0].message.content;
  return hctx.json({ auth: true, reply: reply }, 200);
});

Deno.serve(app.fetch);
