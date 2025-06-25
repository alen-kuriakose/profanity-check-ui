
const BASE_URL = process.env.NEXT_PUBLIC_PROFANITY_API_BASEURL ;

export async function checkProfanity(word: string) {
  const res = await fetch(`${BASE_URL}/api/v1/profanity/fasttext`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ text: word }),
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  if (data.status !== "success" || !data.responseData) throw new Error(data.message || "API error");
  return data.responseData;
}

export async function verifyWithLLM(word: string) {
  const res = await fetch(`${BASE_URL}/api/v1/profanity/llm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ text: word }),
  });
  if (!res.ok) throw new Error("LLM API error");
  const data = await res.json();
  if (data.status !== "success" || !data.responseData) throw new Error(data.message || "LLM API error");
  return data.responseData;
}
