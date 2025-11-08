import { NextResponse } from "next/server";
import db from "../../../lib/db";

export async function GET() {
  try {
    const projects = await db.getProjects();
    const education = await db.getEducation();
    return NextResponse.json({ projects, education });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
