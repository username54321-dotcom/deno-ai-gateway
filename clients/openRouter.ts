import { OpenRouter } from "@openrouter/sdk";

const keys = Deno.env.get("OPENROUTER_KEY")?.split(",") ?? "";
const key = keys[Math.floor(Math.random() * keys.length)];

export const openRouter = new OpenRouter({ apiKey: key });
