import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { context } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You suggest short English practice phrases for a Spanish speaker learning English. Based on the conversation context, suggest 5 short phrases (max 8 words each) the student could say next to continue practicing. Make them relevant to the conversation topic and progressively more challenging. Respond ONLY with a JSON array of strings, no extra text. Example: ["How do you spell that?","I went to the store yesterday","Can you explain the difference?","What would happen if I...?","I have been studying for two hours"]`,
        },
        {
          role: "user",
          content: `Recent conversation:\n${context}\n\nSuggest 5 practice phrases:`,
        },
      ],
      temperature: 0.8,
      max_tokens: 200,
    });

    const content = completion.choices[0]?.message?.content || "";
    const match = content.match(/\[[\s\S]*\]/);

    if (!match) {
      return Response.json({ phrases: [] });
    }

    const phrases = JSON.parse(match[0]);
    return Response.json({ phrases });
  } catch {
    return Response.json({ phrases: [] });
  }
}
