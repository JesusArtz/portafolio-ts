import { NextResponse } from "next/server";
import { createToken } from "../../../lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = process.env.ADMIN_USER || "admin";
    const pass = process.env.ADMIN_PASS || "password";

    if (body.username === user && body.password === pass) {
      const token = createToken({ user });
      const res = NextResponse.json({ ok: true });
      // set HttpOnly cookie
      res.cookies.set({ name: 'auth', value: token, httpOnly: true, path: '/', maxAge: 60 * 60 * 24 });
      return res;
    }

    return NextResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
