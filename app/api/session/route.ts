import { NextResponse } from "next/server";
import { verifyToken, parseCookieHeader } from "../../../lib/auth";

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || null;
    const cookies = parseCookieHeader(cookieHeader);
    const auth = cookies['auth'];
    const info = verifyToken(auth);
    if (info) return NextResponse.json({ ok: true, user: info.user });
    return NextResponse.json({ ok: false }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
