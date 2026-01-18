import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const token = process.env.AIRTABLE_ACCESS_TOKEN;
  const baseId = process.env.AIRTABLE_BASE_ID;
  const eventsTable = process.env.AIRTABLE_TABLE_EVENTS || "Events";

  if (!token || !baseId) return NextResponse.json({ ok: true });

  const body = await req.json().catch(() => ({}));
  const status = String(body.status || "");
  const page = String(body.page || "/start");

  const headers = {
    Authorization: ,
    "Content-Type": "application/json",
  };

  const fields: Record<string, any> = {
    Type: "click",
    Status: status,
    Email: "",
    Page: page,
    "User Agent": req.headers.get("user-agent") || "",
    "Created At": new Date().toISOString(),
  };

  const url = ;
  try {
    await fetch(url, { headers, method: "POST", body: JSON.stringify({ fields }) });
  } catch {
    // do not block UX
  }

  return NextResponse.json({ ok: true });
}
