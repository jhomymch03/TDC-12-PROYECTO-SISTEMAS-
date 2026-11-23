import { useEffect, useState } from 'react';

const fallbackProjects = [
  { id: 1, title: 'Sistema de reservas', description: 'Aplicación web para administrar citas y disponibilidad.', technologies: ['React', 'Node.js', 'PostgreSQL'], url: '#' },
  { id: 2, title: 'Panel de analítica', description: 'Visualización clara de métricas para tomar mejores decisiones.', technologies: ['JavaScript', 'Express', 'SQL'], url: '#' },
  { id: 3, title: 'Automatización CI/CD', description: 'Pipeline de pruebas, contenedores e infraestructura como código.', technologies: ['GitHub Actions', 'Docker', 'Terraform'], url: '#' },
];

export default function App() {
  const [projects, setProjects] = useState(fallbackProjects);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetch('/api/projects').then((r) => r.ok ? r.json() : Promise.reject()).then(setProjects).catch(() => {}); }, []);

  async function submitContact(event) {
    event.preventDefault();
    setBusy(true);
    setStatus('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(form)) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar el mensaje.');
      setStatus('¡Gracias! Tu mensaje fue enviado.');
      event.currentTarget.reset();
    } catch (error) {
      setStatus(error.message || 'No se pudo conectar con el servidor.');
    } finally { setBusy(false); }
  }

  return <>
    <header className="topbar"><a className="brand" href="#inicio">JP<span>.</span></a><nav aria-label="Navegación principal"><a href="#sobre-mi">Sobre mí</a><a href="#proyectos">Proyectos</a><a href="#contacto">Contacto</a></nav></header>
    <main>
      <section className="hero" id="inicio">
        <div className="hero-copy"><p className="eyebrow">PORTAFOLIO PERSONAL · 2026</p><h1>Hola, soy <span>Tu Nombre</span>.<br />Desarrollo soluciones web.</h1><p className="intro">Estudiante y desarrollador de software. Me gusta transformar ideas en productos digitales útiles, accesibles y bien construidos.</p><div className="actions"><a className="button primary" href="#proyectos">Ver proyectos <span aria-hidden="true">↘</span></a><a className="button secondary" href="#contacto">Hablemos</a></div><div className="hero-meta"><span>📍 Bolivia</span><span>● Disponible para proyectos</span></div></div>
        <div className="hero-card" aria-label="Resumen profesional"><div className="orbit orbit-one"></div><div className="orbit orbit-two"></div><div className="avatar">JP</div><p>Full stack<br /><strong>Developer</strong></p><div className="stack-tags"><span>React</span><span>Node</span><span>SQL</span></div></div>
      </section>
      <section className="section about" id="sobre-mi"><div className="section-heading"><p className="eyebrow">01 / SOBRE MÍ</p><h2>Construyo con propósito.</h2></div><div><p className="body-copy">Soy un desarrollador en formación con interés en aplicaciones web de punta a punta. Disfruto aprender tecnologías nuevas, colaborar en equipo y cuidar tanto la experiencia de usuario como la calidad del código.</p><div className="skills"><span>JavaScript</span><span>React</span><span>Node.js</span><span>Express</span><span>PostgreSQL</span><span>Docker</span><span>Git</span><span>Terraform</span></div></div></section>
      <section className="section projects" id="proyectos"><div className="section-heading"><p className="eyebrow">02 / TRABAJO SELECCIONADO</p><h2>Proyectos recientes</h2></div><div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.id}><div className={`project-art art-${index % 3}`}><span>0{index + 1}</span><span className="art-mark">✳</span></div><div className="project-content"><h3>{project.title}</h3><p>{project.description}</p><div className="project-tags">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div><a href={project.url || '#contacto'} aria-label={`Conocer más sobre ${project.title}`}>Conocer proyecto ↗</a></div></article>)}</div></section>
      <section className="section contact" id="contacto"><div className="contact-copy"><p className="eyebrow">03 / CONTACTO</p><h2>¿Tienes una idea?<br /><span>Hagámosla realidad.</span></h2><p>Escríbeme para conversar sobre proyectos, colaboraciones o nuevas oportunidades.</p><a href="mailto:hola@tudominio.com">hola@tudominio.com ↗</a></div><form className="contact-form" onSubmit={submitContact}><label>Tu nombre<input name="name" placeholder="¿Cómo te llamas?" required minLength="2" /></label><label>Correo electrónico<input name="email" type="email" placeholder="nombre@correo.com" required /></label><label>Mensaje<textarea name="message" rows="4" placeholder="Cuéntame un poco sobre tu idea..." required minLength="10" /></label><button className="button primary" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar mensaje ↗'}</button><p className="form-status" role="status">{status}</p></form></section>
    </main><footer><a className="brand" href="#inicio">JP<span>.</span></a><p>Diseñado y desarrollado con curiosidad · 2026</p><a href="#inicio">Volver arriba ↑</a></footer>
  </>;
}