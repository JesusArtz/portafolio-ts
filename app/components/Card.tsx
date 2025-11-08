import React from "react";

export default function Card({ title, image, children }: { title?: string; image?: string | null; children: React.ReactNode }) {
  return (
    <div className="neon-card card-rect">
      {image && (
        <div className="card-media">
          <img src={image} alt={title || ""} />
        </div>
      )}
      <div className="card-body">
        {title && <h3 className="card-title">{title}</h3>}
        {children}
      </div>
    </div>
  );
}
