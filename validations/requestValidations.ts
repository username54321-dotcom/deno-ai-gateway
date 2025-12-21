import { string, z } from "zod";
import { zValidator } from "@hono/zod-validator";
import { error } from "node:console";
import { providors } from "../data/providors.ts";
import { reasoningModes } from "../data/reasoningEnums.ts";

// Header Validation
const headerSchema = z.object({
  Authorization: z
    .string({ error: "No Provided Auth Key " })
    .length(32, { error: "Invalid Auth Key Format" }),
});

export const headerValidation = zValidator(
  "header",
  headerSchema,
  async (res, ctx) => {
    if (!res.success) {
      ctx.json(res.error.message);
    }
  }
);

// Body Validation

const bodySchema = z.object({
  prompt: z.string({ error: "No Provided Prompt" }),
  systemPrompt: z.string().optional().default("You Are A Helpful Ai Assistant"),
  providor: z.enum(providors).optional(),
  reasoning: z.enum(reasoningModes).optional(),
});

export const bodyValidation = zValidator("json", bodySchema, (res, ctx) => {
  if (!res.success) {
    return ctx.json(res.error.message);
  }
});
