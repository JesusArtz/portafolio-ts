"use client";
import UploadPanel from "../components/UploadPanel";
import Link from "next/link";
import React from "react";

export default function AdminPage() {
  return (
    <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
      <h1 style={{ color: '#9b5cff', marginBottom: 8 }}>Admin panel</h1>
      <p style={{ color: 'rgba(234,230,255,0.8)', marginBottom: 12 }}>Use this page to login and manage projects / education.</p>
      <div style={{ display: 'flex', gap: 20 }}>
        <div style={{ flex: 1 }}>
          <UploadPanel />
        </div>
        <div style={{ width: 220 }}>
          <div className="neon-card">
            <h3 className="card-title">Quick links</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link href="/">Go to site</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
