import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { difficulty } = await req.json();

    const guides: Record<string, string> = {
      easy: "basic everyday words (cat, house, water, happy, run). Use common A1-A2 vocabulary.",
      medium: "intermediate words (achieve, environment, schedule, opportunity). Use B1-B2 vocabulary.",
      hard: "advanced words (meticulous, ubiquitous, paradigm, eloquent). Use C1-C2 vocabulary.",
    };
    const difficultyGuide = guides[difficulty || "easy"] || guides.easy;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Generate a vocabulary quiz for a Spanish speaker learning English. Difficulty: ${difficultyGuide}

Return ONLY a JSON array of exactly 10 questions. Mix 7 vocabulary and 3 conjugation questions.

For vocabulary questions:
{"type":"vocab","emoji":"🏠","hint":"A place where you live","answer":"house","spanish":"casa"}

For conjugation questions:
{"type":"conjugation","verb":"go","tense":"Past Simple","pronoun":"he/she/it","answer":"went","hint":"Complete: He ___ to school yesterday"}

Return ONLY the JSON array, no extra text.`,
        },
        {
          role: "user",
          content: `Generate 10 NEW and UNIQUE quiz questions (${difficulty || "easy"} difficulty). Random seed: ${Date.now()}-${Math.random().toString(36).slice(2)}. Do NOT repeat common words like cat, dog, house. Be creative and varied:`,
        },
      ],
      temperature: 1.0,
      max_tokens: 1200,
    });

    const content = completion.choices[0]?.message?.content || "";
    const match = content.match(/\[[\s\S]*\]/);

    if (!match) {
      return Response.json({ error: "Failed to generate quiz" }, { status: 500 });
    }

    const questions = JSON.parse(match[0]);
    return Response.json({ questions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
