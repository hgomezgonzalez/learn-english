import { cookies } from "next/headers";

const AUTH_USER = process.env.AUTH_USER || "admin";
const AUTH_PASSWORD = process.env.AUTH_PASSWORD || "admin";
const AUTH_SECRET = process.env.AUTH_SECRET || "rohu-learn-english-secret-2026";

function createToken(user: string): string {
  // Simple token: base64(user:timestamp:hash)
  const timestamp = Date.now().toString();
  const data = `${user}:${timestamp}:${AUTH_SECRET}`;
  const hash = Buffer.from(data).toString("base64");
  return Buffer.from(`${user}:${timestamp}:${hash}`).toString("base64");
}

function verifyToken(token: string): boolean {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const [user, timestamp, hash] = decoded.split(":");
    const expected = Buffer.from(`${user}:${timestamp}:${AUTH_SECRET}`).toString("base64");
    if (hash !== expected) return false;
    // Token valid for 7 days
    const age = Date.now() - parseInt(timestamp);
    return age < 7 * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const { username, password } = await req.json();

  if (username === AUTH_USER && password === AUTH_PASSWORD) {
    const token = createToken(username);
    const cookieStore = await cookies();
    cookieStore.set("rohu-session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid credentials" }, { status: 401 });
}

export async function DELETE() {
  const cookieStore = await cookies();
  cookieStore.delete("rohu-session");
  return Response.json({ success: true });
}

export { verifyToken };
