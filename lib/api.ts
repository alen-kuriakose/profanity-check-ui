
const BASE_URL =  "https://portal.dev.karmayogibharat.net/profanity-check-api";
// Profanity Check (Transformer, English/Indic)
export async function checkProfanityTransformer(word: string, language?: 'english' | 'indic') {
  const body: { text: string; language?: 'english' | 'indic' } = { text: word };
  if (language) body.language = language;
  const res = await fetch(`${BASE_URL}/api/v1/profanity/transformer`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Transformer API error");
  const data = await res.json();
  if (data.status !== "success" || !data.responseData)
    throw new Error(data.message || "Transformer API error");
  return data.responseData;
}

// Language Detection (English/Indic only)
export async function detectLanguage(word: string) {
  const res = await fetch(`${BASE_URL}/api/v1/profanity/detect_language`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({ text: word }),
  });
  if (!res.ok) throw new Error("Language detection API error");
  const data = await res.json();
  if (data.status !== "success" || !data.detected_language)
    throw new Error(data.message || "Language detection API error");
  return data;
}

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

  const res = await fetch(`${BASE_URL}/api/v1/profanity/profanity_validator`, {
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
