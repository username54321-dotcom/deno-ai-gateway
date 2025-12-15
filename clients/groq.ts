import { Groq } from "groq-sdk";

const key = Deno.env.get("GROQ_KEY") ?? "";
export const groq = new Groq({ apiKey: key });
