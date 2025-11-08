import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { verifyToken, parseCookieHeader } from "../../../lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    // require auth cookie
    const cookieHeader = req.headers.get('cookie') || null;
    const cookies = parseCookieHeader(cookieHeader);
    const info = verifyToken(cookies['auth']);
    if (!info) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // handle optional image data (data:<mime>;base64,...)
    let imageUrl: string | undefined;
    if (body.imageData && typeof body.imageData === 'string') {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
        if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

        const matches = body.imageData.match(/^data:(.+);base64,(.+)$/);
        if (matches) {
          const mime = matches[1];
          const b64 = matches[2];
          const ext = mime.split('/')[1] || 'png';
          const name = `${Date.now()}-${(body.imageName || 'img').replace(/[^a-zA-Z0-9.-]/g, '_')}.${ext}`;
          const filePath = path.join(uploadsDir, name);
          fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
          imageUrl = `/uploads/${name}`;
        }
      } catch (e) {
        console.error('Failed to save uploaded image', e);
      }
    }

    if (body.type === "project") {
      const id = await db.insertProject(body.title || "Untitled", body.description || "", body.link || "", imageUrl);
      return NextResponse.json({ ok: true, id });
    }

    if (body.type === "education") {
      const id = await db.insertEducation(body.school || "", body.degree || "", body.year || "", body.description || "", imageUrl);
      return NextResponse.json({ ok: true, id });
    }

    return NextResponse.json({ ok: false, error: "Unknown type" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
