import { Groq } from "groq-sdk";

const keys = Deno.env.get("GROQ_KEY")?.split(",") ?? "";

const key = keys[Math.floor(Math.random() * keys.length)];
export const groq = new Groq({ apiKey: key });
