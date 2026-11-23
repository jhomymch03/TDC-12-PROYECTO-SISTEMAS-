import { useState } from 'react';

const projects = [
  { id: 'titulaciones', number: '01', category: 'Proyecto universitario', title: 'Sistema de Titulaciones', description: 'Proyecto desarrollado para la universidad, enfocado en apoyar la gestión del proceso de titulación.', technologies: ['Sistema universitario', 'Gestión de información'], symbol: 'ST' },
  { id: 'vet-care', number: '02', category: 'Aplicación web', title: 'Vet Care', description: 'Aplicación web para gestionar citas y pacientes de una veterinaria.', technologies: ['React', 'Node.js', 'SQL Server'], symbol: 'VC' },
  { id: 'sudoku', number: '03', category: 'Aplicación de escritorio', title: 'Sudoku', description: 'Juego de Sudoku de escritorio creado como proyecto de programación.', technologies: ['C#', 'WPF', 'MVVM'], symbol: '数' },
  { id: 'viajes', number: '04', category: 'Diseño web', title: 'Página de viajes', description: 'Diseño de una interfaz web responsiva para explorar destinos y viajes.', technologies: ['HTML', 'CSS', 'JavaScript'], symbol: '↗' },
];
const skills = ['JavaScript', 'React', 'Node.js', 'HTML & CSS', 'SQL', 'C#', 'Git'];

export default function App() {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function submitContact(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setBusy(true);
    setStatus('');
    const form = new FormData(formElement);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'No se pudo enviar el mensaje.');
      setStatus('¡Gracias! Tu mensaje fue enviado.');
      formElement.reset();
    } catch (error) {
      setStatus(error.message || 'No se pudo conectar con el servidor.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Jhomayra, inicio">j<span>.</span></a>
        <nav aria-label="Navegación principal">
          <a href="#perfil">Perfil</a><a href="#proyectos">Proyectos</a><a href="#formacion">Formación</a>
          <a className="nav-contact" href="#contacto">Contacto <span aria-hidden="true">↗</span></a>
        </nav>
      </header>
      <main>
        <section className="hero" id="inicio">
          <div className="hero-copy">
            <p className="eyebrow"><span className="status-dot" /> PORTAFOLIO · 2026</p>
            <h1>Hola, soy<br /><span className="name">Jhomayra</span><span className="period">.</span></h1>
            <p className="hero-lede">Estudiante de Ingeniería de Sistemas, curiosa por la tecnología y en camino a convertir ideas en soluciones digitales.</p>
            <div className="hero-actions">
              <a className="button primary" href="#proyectos">Explorar proyectos <span aria-hidden="true">↓</span></a>
              <a className="text-link" href="#perfil">Conóceme un poco <span aria-hidden="true">↘</span></a>
            </div>
            <div className="hero-caption"><span>Estudiante</span><i /><span>6.º semestre</span><i /><span>Bolivia</span></div>
          </div>
          <aside className="hero-visual" aria-label="Perfil de estudiante de Ingeniería de Sistemas">
            <div className="visual-top"><span>PERFIL / 01</span><span>2026</span></div>
            <div className="visual-grid" aria-hidden="true"><span className="grid-letter">J</span><span className="grid-star">✳</span><span className="grid-orbit orbit-a" /><span className="grid-orbit orbit-b" /></div>
            <div className="visual-bottom"><span>INGENIERÍA<br />DE SISTEMAS</span><span className="visual-arrow">↗</span></div>
          </aside>
        </section>
        <div className="ticker" aria-label="Áreas de interés"><div className="ticker-track"><span>DESARROLLO WEB</span><b>✳</b><span>REDES</span><b>✳</b><span>BASES DE DATOS</span><b>✳</b><span>APRENDIZAJE CONTINUO</span><b>✳</b><span>DESARROLLO WEB</span><b>✳</b><span>REDES</span><b>✳</b></div></div>

        <section className="section profile" id="perfil">
          <div className="section-label"><span>01</span><span>UN POCO SOBRE MÍ</span></div>
          <div className="profile-content">
            <h2>Aprender, crear<br />y seguir creciendo.</h2>
            <div className="profile-copy">
              <p>Soy estudiante de Ingeniería de Sistemas en la Universidad Privada del Valle y actualmente curso el sexto semestre. Me interesa el desarrollo de software y aprender cómo se conectan las distintas partes de un sistema.</p>
              <p>En mis proyectos he explorado aplicaciones web, interfaces y soluciones académicas. Cada experiencia me ayuda a fortalecer mis habilidades y descubrir nuevos retos.</p>
              <div className="skill-list">{skills.map((skill) => <span key={skill}>{skill}</span>)}</div>
            </div>
          </div>
        </section>

        <section className="section projects" id="proyectos">
          <div className="section-heading">
            <div className="section-label"><span>02</span><span>SELECCIÓN DE TRABAJOS</span></div>
            <h2>Ideas que tomaron forma<span className="period">.</span></h2>
            <p>Una selección de proyectos académicos y personales en los que he aprendido construyendo.</p>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => (
              <article className={'project-card project-' + (index + 1)} key={project.id}>
                <div className="project-art"><span className="project-number">{project.number} / 04</span><span className="project-symbol" aria-hidden="true">{project.symbol}</span><span className="project-category">{project.category}</span></div>
                <div className="project-content"><h3>{project.title}</h3><p>{project.description}</p><div className="project-tags">{project.technologies.map((item) => <span key={item}>{item}</span>)}</div></div>
              </article>
            ))}
          </div>
        </section>

        <section className="section learning" id="formacion">
          <div className="section-label"><span>03</span><span>FORMACIÓN Y APRENDIZAJE</span></div>
          <div className="learning-card">
            <div className="learning-icon" aria-hidden="true">⌘</div>
            <div className="learning-copy"><p className="eyebrow">CISCO NETWORKING ACADEMY</p><h2>Redes y conectividad</h2><p>Formación en redes con contenidos de CCNA 1 y CCNA 2. Una base para comprender cómo se comunican los dispositivos y cómo se construyen las redes.</p></div>
            <div className="learning-index">01 <span>—</span> FORMACIÓN</div>
          </div>
        </section>

        <section className="section contact" id="contacto">
          <div className="contact-copy"><div className="section-label"><span>04</span><span>HABLEMOS</span></div><h2>¿Tienes una idea<br />en mente<span className="period">?</span></h2><p>Estoy abierta a conversar sobre proyectos, aprendizaje y oportunidades para colaborar.</p></div>
          <form className="contact-form" onSubmit={submitContact}>
            <label>Tu nombre<input name="name" placeholder="¿Cómo te llamas?" required minLength="2" /></label>
            <label>Correo electrónico<input name="email" type="email" placeholder="nombre@correo.com" required /></label>
            <label>Mensaje<textarea name="message" rows="4" placeholder="Escribe tu mensaje..." required minLength="10" /></label>
            <button className="button primary" type="submit" disabled={busy}>{busy ? 'Enviando…' : 'Enviar mensaje'} <span aria-hidden="true">↗</span></button>
            <p className="form-status" role="status">{status}</p>
          </form>
        </section>
      </main>
      <footer><a className="brand" href="#inicio" aria-label="Volver al inicio">j<span>.</span></a><p>Jhomayra · Portafolio personal · 2026</p><a className="back-top" href="#inicio">Volver arriba ↑</a></footer>
    </>
  );
}
