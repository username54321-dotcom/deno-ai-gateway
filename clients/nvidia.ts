import OpenAi from "@openai/openai";

const nvidiaKey = Deno.env.get("NVIDIA_KEY") ?? "";
export const nvidiaClient = new OpenAi({
  apiKey: nvidiaKey,
  baseURL: "https://integrate.api.nvidia.com/v1",
});
