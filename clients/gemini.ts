import { GoogleGenAI } from "@google/genai";

import { kv } from "./kv.ts";

// Get api keys array and length
const keys = Deno.env.get("GEMINI_KEY")?.split(",") ?? "";
const keysLength = keys.length;

// Calculate current key index
const keyIndex = (await kv
  .get(["gemini", "key"])
  .then((x) => x.value ?? 0)) as number;

// Get current api key string
const key = keys[keyIndex];

// Calculate and set next api key index
const newKeyIndex = keyIndex + 1 < keysLength ? keyIndex + 1 : 0;
await kv.set(["gemini", "key"], newKeyIndex);

export const gemini = new GoogleGenAI({ apiKey: key });
