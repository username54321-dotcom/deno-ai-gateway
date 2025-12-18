import { kv } from "../clients/kv.ts";

type Providors = "groq" | "openrouter" | "gemini";
const providors = ["groq", "openrouter", "gemini"] as const;

export async function getProvidor(): Promise<Providors> {
  const currentProvidorIndex = await kv
    .get<number>(["currentProvidor"])
    .then((res) => res.value ?? 0);

  const newProvidorIndex =
    currentProvidorIndex + 1 < providors.length ? currentProvidorIndex + 1 : 0;

  await kv.set(["currentProvidor"], newProvidorIndex);

  return providors[currentProvidorIndex];
}
