import { Groq } from "groq-sdk";
import { kv } from "./kv.ts";

// Get api keys array and length
const keys = Deno.env.get("GROQ_KEY")?.split(",") ?? "";
const keysLength = keys.length;

// Calculate current key index
const keyIndex = (await kv
  .get(["groq", "key"])
  .then((x) => x.value ?? 0)) as number;

// Get current api key string
const key = keys[keyIndex];

// Calculate and set next api key index
const newKeyIndex = keyIndex + 1 < keysLength ? keyIndex + 1 : 0;
await kv.set(["groq", "key"], newKeyIndex);

export const groq = new Groq({ apiKey: key });
