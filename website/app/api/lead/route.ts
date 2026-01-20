import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    // Minimal lead capture endpoint (no external services yet).
    // Safe for deploy: we just acknowledge receipt.
    return NextResponse.json(
      { ok: true, received: body ?? {} },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "Invalid request" },
      { status: 400 }
    );
  }
}

// Optional: allow a quick sanity check in browser
export async function GET() {
  return NextResponse.json({ ok: true }, { status: 200 });
}
