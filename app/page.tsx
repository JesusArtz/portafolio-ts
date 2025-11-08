import CardsList from "./components/CardsList";

const skills = [
  "Flask",
  "SQLAlchemy",
  "Payment gateways",
  "Python",
  "JWT",
];

export default function Home() {
  return (
    <div className="page-root">
      <header className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Hola — soy Ivan de Jesus</h1>
          <p className="hero-sub">Estudiante de Ingenieria en Sistemas Computacionales</p>
          <p className="hero-sub">entusiasta de las nuevas tecnologias y amante de python</p>
          <div className="skills">
            {skills.map(s => (
              <span key={s} className="skill-pill">{s}</span>
            ))}
          </div>
        </div>
      </header>

      <main className="container">
        <div className="main-grid">
            <div className="left-col">
              <CardsList />
            </div>
            <div className="right-col">
              <div className="neon-card">
                <h3 className="card-title">Get in touch</h3>
                <p style={{color:'rgba(234,230,255,0.8)'}}>If you'd like to collaborate or hire me, send an email.</p>
                <div style={{marginTop:10}}><a className="btn" href="mailto:hello@example.com">Email me</a></div>
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
