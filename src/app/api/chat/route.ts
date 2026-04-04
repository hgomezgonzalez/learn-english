import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a friendly and patient English tutor helping a Spanish speaker learn English.

Rules:
- Always respond in English, but you may include brief Spanish translations in parentheses for difficult words.
- Correct grammar mistakes gently and explain why.
- Keep responses concise and conversational.
- Encourage the user to practice speaking and forming sentences.
- Adapt difficulty to the user's level based on their messages.
- At the END of every response, include a score tag evaluating the user's last message grammar/usage. Format exactly:
  <!--SCORE:{"points":1,"reason":"Good sentence structure!"}-->
  Use points: +1 for correct grammar, +2 for complex correct sentences, -1 for grammar mistakes, 0 for greetings or non-scorable messages.
  Keep the reason short (under 10 words). Be honest - don't give positive scores for incorrect grammar.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...messages.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      stream: true,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          const message = err instanceof Error ? err.message : "Stream error";
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
}
