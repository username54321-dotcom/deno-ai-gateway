import { gemini } from "./clients/gemini.ts";
import { groq } from "./clients/groq.ts";
import { app } from "./clients/hono.ts";
import { nvidiaClient } from "./clients/nvidia.ts";
import { openRouter } from "./clients/openRouter.ts";
import { respTemp as responseTemplate } from "./data/respTemplate.ts";
import { getProvidor } from "./utils/getProvidor.ts";
import {
  bodyValidation,
  headerValidation,
} from "./validations/requestValidations.ts";

const authKey = Deno.env.get("AUTH_KEY");
const respTemp = structuredClone(responseTemplate);
app.post(
  "/",
  // Validation Middleware
  headerValidation,
  bodyValidation,
  // Logic
  async (hctx) => {
    // Verify Auth Header
    const authHeader = hctx.req.valid("header").Authorization;
    if (authHeader !== authKey) {
      return hctx.json({ auth: false }, 404);
    }

    // Get request arguments
    const reqBody = hctx.req.valid("json");
    const reqPrompt = reqBody.prompt;
    const reqSystemPrompt = reqBody.systemPrompt;
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
              { role: "system", content: reqSystemPrompt },
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
                { role: "system", content: reqSystemPrompt },
                { role: "user", content: reqPrompt },
              ],
              ...(reqReasoning && { reasoning: { effort: reqReasoning } }),
            })
            .then((x) => x.choices[0].message.content, null);
        }
        break;

      // deno-lint-ignore no-fallthrough
      case "gemini": {
        aiResponse = await gemini.models
          .generateContent({
            model: "gemini-2.5-flash",
            config: { systemInstruction: reqSystemPrompt },
            contents: reqPrompt,
          })
          .then((x) => x.text, null);
      }
      case "nvidia": {
        await nvidiaClient.chat.completions
          .create({
            model: "deepseek-ai/deepseek-v3.2",

            messages: [
              {
                role: "system",
                content:
                  "always respond in either arabic or english " +
                  reqSystemPrompt,
              },

              { role: "user", content: reqPrompt },
            ],
            stream: false,
          })
          .then((x) => {
            aiResponse = x.choices[0].message.content;
          });
      }
    }

    respTemp.message = (aiResponse ?? null) as string | null;
    !respTemp.message && (respTemp.error = "Error Generating Response.");
    return hctx.json(respTemp, 200);
  },
);

Deno.serve(app.fetch);
