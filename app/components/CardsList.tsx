"use client";
import React, { useEffect, useState } from "react";
import Card from "./Card";

type Project = { id: number; title: string; description: string; link?: string; image?: string };
type Education = { id: number; school: string; degree: string; year?: string; description?: string; image?: string };

export default function CardsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [education, setEducation] = useState<Education[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/data');
      const json = await res.json();
      setProjects(json.projects || []);
      setEducation(json.education || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const checkSession = async () => {
    try {
      const r = await fetch('/api/session', { credentials: 'include' });
      const j = await r.json();
      setIsAuth(!!j.ok);
    } catch (e) { setIsAuth(false); }
  };

  useEffect(() => {
    load();
    checkSession();
    const handler = () => load();
    window.addEventListener('refresh-data', handler);
    return () => window.removeEventListener('refresh-data', handler);
  }, []);

  return (
    <section className="cards-container">
      <div className="cards-grid">
        <h2 className="section-title">Projects</h2>
        <div className="grid-cards">
          {loading ? <p>Loading...</p> : projects.length === 0 ? <p>No projects yet</p> : (
            projects.map(p => (
              <Card key={p.id} title={p.title} image={p.image}>
                <p>{p.description}</p>
                {p.link && <a href={p.link} target="_blank" rel="noreferrer">View</a>}
                {isAuth && (
                  <div className="card-actions">
                    <button onClick={()=>{
                      // navigate to admin form for editing
                      window.location.href = `/admin?edit=project&id=${p.id}`;
                    }} className="btn">Edit</button>
                    <button onClick={async ()=>{
                      if (!confirm('Delete this project?')) return;
                      await fetch('/api/delete', { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ type: 'project', id: p.id }) });
                      window.dispatchEvent(new Event('refresh-data'));
                    }} className="btn">Delete</button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>

        <h2 className="section-title">Education</h2>
        <div className="grid-cards">
          {loading ? <p>Loading...</p> : education.length === 0 ? <p>No education yet</p> : (
            education.map(e => (
              <Card key={e.id} title={`${e.school} — ${e.degree}`} image={e.image}>
                <p className="muted">{e.year}</p>
                <p>{e.description}</p>
                {isAuth && (
                  <div className="card-actions">
                    <button onClick={()=>{
                      window.location.href = `/admin?edit=education&id=${e.id}`;
                    }} className="btn">Edit</button>
                    <button onClick={async ()=>{
                      if (!confirm('Delete this education entry?')) return;
                      await fetch('/api/delete', { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ type: 'education', id: e.id }) });
                      window.dispatchEvent(new Event('refresh-data'));
                    }} className="btn">Delete</button>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
