"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from 'next/navigation';

export default function UploadPanel() {
  const [type, setType] = useState<'project'|'education'>('project');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('');
  const [school, setSchool] = useState('');
  const [degree, setDegree] = useState('');
  const [year, setYear] = useState('');
  const [status, setStatus] = useState<string|null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Sending...');
    try {
      const payload: any = { type };
      if (type === 'project') {
        payload.title = title;
        payload.description = description;
        payload.link = link;
      } else {
        payload.school = school;
        payload.degree = degree;
        payload.year = year;
        payload.description = description;
      }

      let res;
      if (editMode && editId) {
        // edit flow
        if (removeImage) {
          // explicitly request removal
          payload.imageData = null;
          payload.imageName = null;
        } else if (imageFile) {
          const reader = new FileReader();
          const base64: string = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(imageFile);
          });
          payload.imageData = base64;
          payload.imageName = imageFile.name;
        }
        payload.id = editId;
        res = await fetch('/api/edit', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // create flow
        if (imageFile) {
          const reader = new FileReader();
          const base64: string = await new Promise((resolve, reject) => {
            reader.onload = () => resolve(String(reader.result));
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(imageFile);
          });
          payload.imageData = base64; // data:<mime>;base64,...
          payload.imageName = imageFile.name;
        }
        res = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }
      const j = await res.json();
      if (j.ok) {
        setStatus(editMode ? 'Updated' : 'Saved');
        // notify lists to refresh
        window.dispatchEvent(new Event('refresh-data'));
          if (!editMode) {
          // clear fields after create
          setTitle(''); setDescription(''); setLink(''); setSchool(''); setDegree(''); setYear('');
          setImageFile(null);
        } else {
          // if edited, clear edit state and remove query params
          setTimeout(()=>setStatus(null), 900);
          router.replace('/admin');
          setEditMode(false);
          setEditId(null);
          setExistingImage(null);
          setImageFile(null);
        }
        setTimeout(() => setStatus(null), 1500);
      } else {
        setStatus('Error: ' + (j.error || 'unknown'));
      }
    } catch (err: any) {
      setStatus('Error: ' + String(err));
    }
  };

  const checkSession = async () => {
    try {
      const res = await fetch('/api/session', { credentials: 'include' });
      const j = await res.json();
      setIsAuth(!!j.ok);
    } catch (e) { setIsAuth(false); }
  };

  useEffect(() => { checkSession(); }, []);

  // when session established, check for edit query params and prefill
  useEffect(() => {
    const edit = searchParams.get('edit');
    const idStr = searchParams.get('id');
    if (!edit || !idStr) return;
    const id = Number(idStr);
    if (Number.isNaN(id)) return;
    // wait until isAuth true
    if (!isAuth) return;

    (async () => {
      try {
        const res = await fetch('/api/data');
        const j = await res.json();
        const list = edit === 'project' ? (j.projects || []) : (j.education || []);
        const item = list.find((it: any) => Number(it.id) === id);
        if (!item) return;
        setEditMode(true);
        setEditId(id);
        setType(edit === 'project' ? 'project' : 'education');
        if (edit === 'project') {
          setTitle(item.title || '');
          setDescription(item.description || '');
          setLink(item.link || '');
        } else {
          setSchool(item.school || '');
          setDegree(item.degree || '');
          setYear(item.year || '');
          setDescription(item.description || '');
        }
        setExistingImage(item.image || null);
      } catch (e) {
        console.error('Failed to load item for edit', e);
      }
    })();
  }, [isAuth, searchParams]);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Logging in...');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const j = await res.json();
      if (j.ok) {
        setStatus('Logged');
        setIsAuth(true);
        setUsername(''); setPassword('');
        setTimeout(()=>setStatus(null), 1000);
      } else {
        setStatus('Login failed');
      }
    } catch (err: any) {
      setStatus('Error: ' + String(err));
    }
  };

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    setIsAuth(false);
  };

  return (
    <aside className="upload-panel">
      {!isAuth ? (
        <form onSubmit={login} className="upload-form">
          <div className="form-row"><label>Admin login</label><input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" required/></div>
          <div className="form-row"><label>Password</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" required/></div>
          <div className="form-actions"><button className="btn" type="submit">Login</button>{status && <span className="status">{status}</span>}</div>
        </form>
      ) : (
  <form onSubmit={submit} className="upload-form">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
            <div style={{color:'rgba(234,230,255,0.8)'}}>Logged as admin</div>
            <div><button type="button" className="btn" onClick={logout}>Logout</button></div>
          </div>
          <div className="form-row">
            <label>Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)}>
              <option value="project">Project</option>
              <option value="education">Education</option>
            </select>
          </div>

          {type === 'project' ? (
            <>
              <div className="form-row"><label>Title</label><input value={title} onChange={e=>setTitle(e.target.value)} required/></div>
              <div className="form-row"><label>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} required/></div>
              <div className="form-row"><label>Image (optional)</label>
                {existingImage && !imageFile && (
                  <div style={{marginBottom:8}}>
                    <img src={existingImage} alt="existing" className="image-preview" />
                    <div style={{display:'flex',gap:8,marginTop:6}}>
                      <label style={{fontSize:13,color:'rgba(234,230,255,0.8)'}}><input type="checkbox" checked={removeImage} onChange={e=>setRemoveImage(e.target.checked)} /> Remove image</label>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files ? e.target.files[0] : null)} />
              </div>
              <div className="form-row"><label>Link</label><input value={link} onChange={e=>setLink(e.target.value)}/></div>
            </>
          ) : (
            <>
              <div className="form-row"><label>School</label><input value={school} onChange={e=>setSchool(e.target.value)} required/></div>
              <div className="form-row"><label>Degree</label><input value={degree} onChange={e=>setDegree(e.target.value)} required/></div>
              <div className="form-row"><label>Image (optional)</label>
                {existingImage && !imageFile && (
                  <div style={{marginBottom:8}}>
                    <img src={existingImage} alt="existing" className="image-preview" />
                    <div style={{display:'flex',gap:8,marginTop:6}}>
                      <label style={{fontSize:13,color:'rgba(234,230,255,0.8)'}}><input type="checkbox" checked={removeImage} onChange={e=>setRemoveImage(e.target.checked)} /> Remove image</label>
                    </div>
                  </div>
                )}
                <input type="file" accept="image/*" onChange={e=>setImageFile(e.target.files ? e.target.files[0] : null)} />
              </div>
              <div className="form-row"><label>Year</label><input value={year} onChange={e=>setYear(e.target.value)}/></div>
              <div className="form-row"><label>Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)}/></div>
            </>
          )}

          <div className="form-actions">
            <button className="btn" type="submit">Save</button>
            {status && <span className="status">{status}</span>}
          </div>
        </form>
      )}
    </aside>
  );
}
