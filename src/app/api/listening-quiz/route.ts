import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { difficulty } = await req.json();

    const guides: Record<string, string> = {
      easy: "basic everyday words (cat, apple, house, happy, blue, milk, dog, sun). A1-A2 level, 1-2 syllables max.",
      medium: "intermediate words (kitchen, beautiful, important, yesterday, furniture). B1-B2 level, 2-3 syllables.",
      hard: "advanced words (sophisticated, circumstance, extraordinary, deteriorate). C1-C2 level, 3+ syllables.",
    };
    const difficultyGuide = guides[difficulty || "easy"] || guides.easy;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `Generate a listening vocabulary quiz for a Spanish speaker learning English. Difficulty: ${difficultyGuide}

Return ONLY a JSON array of exactly 10 objects. Each object:
{"word":"apple","emoji":"🍎","spanish":"manzana","example":"I eat an apple every day"}

Rules:
- Each word must be different
- Choose concrete, visualizable words that have clear emojis
- The example should be a simple sentence using the word
- NEVER repeat words across quizzes

Return ONLY the JSON array, no extra text.`,
        },
        {
          role: "user",
          content: `Generate 10 listening quiz words (${difficulty || "easy"}). Random seed: ${Date.now()}-${Math.random().toString(36).slice(2)}`,
        },
      ],
      temperature: 1.0,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content || "";
    const match = content.match(/\[[\s\S]*\]/);

    if (!match) {
      return Response.json({ error: "Failed to generate quiz" }, { status: 500 });
    }

    const words = JSON.parse(match[0]);
    return Response.json({ words });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
