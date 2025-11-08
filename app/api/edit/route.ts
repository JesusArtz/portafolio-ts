import { NextResponse } from "next/server";
import db from "../../../lib/db";
import { verifyToken, parseCookieHeader } from "../../../lib/auth";
import fs from "fs";
import path from "path";
import supabase from "../../../lib/supabase";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || null;
    const cookies = parseCookieHeader(cookieHeader);
    const info = verifyToken(cookies['auth']);
    if (!info) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    // image handling (optional)
    let imageUrl: string | undefined | null;
    if (body.imageData === null) {
      // explicit removal requested
      imageUrl = null;
    } else if (body.imageData && typeof body.imageData === 'string') {
      const matches = body.imageData.match(/^data:(.+);base64,(.+)$/);
      if (matches) {
        const mime = matches[1];
        const b64 = matches[2];
        const ext = mime.split('/')[1] || 'png';
        const safeName = (body.imageName || 'img').replace(/[^a-zA-Z0-9.-]/g, '_');
        const name = `${Date.now()}-${safeName}.${ext}`;

        // try Supabase first
        if (supabase) {
          try {
            const buffer = Buffer.from(b64, 'base64');
            const keyPath = `${name}`;
            const { error: uploadErr } = await supabase.storage.from('uploads').upload(keyPath, buffer, { contentType: mime });
            if (uploadErr) throw uploadErr;
            const { data: publicData } = supabase.storage.from('uploads').getPublicUrl(keyPath);
            imageUrl = publicData.publicUrl;
          } catch (e) {
            console.error('Supabase edit upload failed, falling back to local FS', e);
          }
        }

        // fallback to local FS
        if (!imageUrl) {
          try {
            const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
            if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
            const filePath = path.join(uploadsDir, name);
            fs.writeFileSync(filePath, Buffer.from(b64, 'base64'));
            imageUrl = `/uploads/${name}`;
          } catch (e) {
            console.error('Failed to save edit image', e);
          }
        }
      }
    }

    if (body.type === 'project') {
      await db.updateProject(body.id, body.title || '', body.description || '', body.link || '', imageUrl === undefined ? undefined : (imageUrl));
      return NextResponse.json({ ok: true });
    }

    if (body.type === 'education') {
      await db.updateEducation(body.id, body.school || '', body.degree || '', body.year || '', body.description || '', imageUrl === undefined ? undefined : (imageUrl));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, error: 'Unknown type' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
