import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { word } = await req.json();

    if (!word || typeof word !== "string") {
      return Response.json({ error: "Word is required" }, { status: 400 });
    }

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a concise English dictionary for Spanish speakers. Respond ONLY with valid JSON, no extra text. Format:
{
  "word": "the word",
  "phonetic": "IPA pronunciation",
  "partOfSpeech": "noun/verb/adjective/adverb/etc",
  "definition": "clear English definition in 1-2 sentences",
  "spanish": "Spanish translation",
  "example": "one example sentence using the word",
  "emoji": "one single emoji that best represents this word visually",
  "conjugation": null
}

IMPORTANT: If the word is a VERB (partOfSpeech is "verb"), also include conjugation data:
{
  "conjugation": {
    "verb": "base form of the verb",
    "tenses": [
      {"tense": "Present Simple", "conjugations": {"I": "...", "you": "...", "he/she/it": "...", "we": "...", "they": "..."}},
      {"tense": "Past Simple", "conjugations": {"I": "...", "you": "...", "he/she/it": "...", "we": "...", "they": "..."}},
      {"tense": "Present Perfect", "conjugations": {"I": "...", "you": "...", "he/she/it": "...", "we": "...", "they": "..."}},
      {"tense": "Future Simple", "conjugations": {"I": "...", "you": "...", "he/she/it": "...", "we": "...", "they": "..."}},
      {"tense": "Present Continuous", "conjugations": {"I": "...", "you": "...", "he/she/it": "...", "we": "...", "they": "..."}}
    ]
  }
}
If it's NOT a verb, set conjugation to null.`,
        },
        {
          role: "user",
          content: `Define: "${word}"`,
        },
      ],
      temperature: 0.3,
      max_tokens: 600,
    });

    const content = completion.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return Response.json({ error: "Failed to parse definition" }, { status: 500 });
    }

    const definition = JSON.parse(jsonMatch[0]);
    return Response.json(definition);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
