import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { verifyToken, parseCookieHeader } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || null;
    const cookies = parseCookieHeader(cookieHeader);
    const info = verifyToken(cookies['auth']);
    if (!info) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    if (body.type === 'project') {
      await db.deleteProject(body.id);
      return NextResponse.json({ ok: true });
    }
    if (body.type === 'education') {
      await db.deleteEducation(body.id);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Unknown type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
