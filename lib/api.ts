const BASE_URL =  "https://portal.dev.karmayogibharat.net/profanity-check-api";

export async function checkProfanity(word: string) {
  // console.log(
  //   "Base URL:",
  //   BASE_URL,
  //   process.env.NEXT_PUBLIC_PROFANITY_API_BASEURL
  // );
  const res = await fetch(`${BASE_URL}/api/v1/profanity/fasttext`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ text: word }),
  });
  if (!res.ok) throw new Error("API error");
  const data = await res.json();
  if (data.status !== "success" || !data.responseData)
    throw new Error(data.message || "API error");
  return data.responseData;
}

export async function verifyWithLLM(word: string) {
  // console.log(
  //   "Base URL:",
  //   BASE_URL,
  //   process.env.NEXT_PUBLIC_PROFANITY_API_BASEURL
  // );

  const res = await fetch(`${BASE_URL}/api/v1/profanity/llm`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ text: word }),
  });
  if (!res.ok) throw new Error("LLM API error");
  const data = await res.json();
  if (data.status !== "success" || !data.responseData)
    throw new Error(data.message || "LLM API error");
  return data.responseData;
}
