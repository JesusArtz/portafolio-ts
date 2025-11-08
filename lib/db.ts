import fs from "fs";
import path from "path";

// Clean JSON-backed DB implementation (single source of truth)
const DB_DIR = path.join(process.cwd(), "data");
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const DB_PATH = path.join(DB_DIR, "db.json");

function readDB() {
  try {
    if (!fs.existsSync(DB_PATH)) {
      const init = { projects: [], education: [] };
      fs.writeFileSync(DB_PATH, JSON.stringify(init, null, 2));
      return init;
    }
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read DB", e);
    return { projects: [], education: [] };
  }
}

function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Failed to write DB", e);
  }
}

function nextId(list: any[]) {
  let max = 0;
  for (const it of list) if (typeof it.id === "number" && it.id > max) max = it.id;
  return max + 1;
}

export async function getProjects() {
  const db = readDB();
  return db.projects.slice().sort((a: any, b: any) => b.id - a.id);
}

export async function getEducation() {
  const db = readDB();
  return db.education.slice().sort((a: any, b: any) => b.id - a.id);
}

export async function insertProject(title: string, description: string, link: string, imageUrl?: string) {
  const db = readDB();
  const id = nextId(db.projects);
  const entry: any = { id, title, description, link, created_at: new Date().toISOString() };
  if (imageUrl) entry.image = imageUrl;
  db.projects.push(entry);
  writeDB(db);
  return id;
}

export async function insertEducation(school: string, degree: string, year: string, description: string, imageUrl?: string) {
  const db = readDB();
  const id = nextId(db.education);
  const entry: any = { id, school, degree, year, description, created_at: new Date().toISOString() };
  if (imageUrl) entry.image = imageUrl;
  db.education.push(entry);
  writeDB(db);
  return id;
}

export async function updateProject(id: number, title: string, description: string, link: string, imageUrl?: string | null) {
  const db = readDB();
  const idx = db.projects.findIndex((p: any) => p.id === id);
  if (idx === -1) return;
  const updated = { ...db.projects[idx], title, description, link } as any;
  if (imageUrl !== undefined) {
    // if null passed explicitly, remove image; if string, set new image
    if (imageUrl === null) delete updated.image; else updated.image = imageUrl;
  }
  db.projects[idx] = updated;
  writeDB(db);
}

export async function updateEducation(id: number, school: string, degree: string, year: string, description: string, imageUrl?: string | null) {
  const db = readDB();
  const idx = db.education.findIndex((e: any) => e.id === id);
  if (idx === -1) return;
  const updated = { ...db.education[idx], school, degree, year, description } as any;
  if (imageUrl !== undefined) {
    if (imageUrl === null) delete updated.image; else updated.image = imageUrl;
  }
  db.education[idx] = updated;
  writeDB(db);
}

export async function deleteProject(id: number) {
  const db = readDB();
  db.projects = db.projects.filter((p: any) => p.id !== id);
  writeDB(db);
}

export async function deleteEducation(id: number) {
  const db = readDB();
  db.education = db.education.filter((e: any) => e.id !== id);
  writeDB(db);
}

const defaultExport = {
  getProjects,
  getEducation,
  insertProject,
  insertEducation,
  updateProject,
  updateEducation,
  deleteProject,
  deleteEducation,
};

export default defaultExport;
