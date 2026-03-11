import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../landing/assets/IMG_5288.png";
import "../landing/PlanoraLanding.css";

const faqs = [
  { q: "Sa shpejt mund të filloj?", a: "Salloni juaj është live brenda 10 minutave. Shtoni shërbime, staf dhe oraret e punës — klientët mund të rezervojnë menjëherë." },
  { q: "A funksionon në telefon?", a: "Planora është plotësisht cloud-based dhe responsive. Menaxhoni biznesin tuaj nga çdo pajisje, kudo në botë." },
  { q: "A janë të dhënat e mia të sigurta?", a: "Enkriptim enterprise-grade në çdo shtresë. Të dhënat tuaja dhe të klientëve tuaj mbrohen nga standardet ndërkombëtare të sigurisë." },
  { q: "A mund të menaxhoj shumë punonjës?", a: "Po. Shtoni punonjës të pakufizuar, caktoni shërbime, vendosni orare individuale dhe gjurmoni performancën për person." },
];

const features = [
  { icon: "◎", label: "Planifikim Inteligjent", desc: "Sistemi plotëson automatikisht hapësirat e lira dhe parandalon rezervimet e dyfishta gjatë gjithë ekipit tuaj." },
  { icon: "↺", label: "Rikuperim i Të Dhënave", desc: "Asgjë nuk humbet përgjithmonë. Rikuperoni terminet e anulluara, klientët ose shërbimet me një klik të vetëm." },
  { icon: "⬡", label: "Analitikë e Avancuar", desc: "Tendencat e të ardhurave, orët më të zëna, shërbimet kryesore — të dhëna në kohë reale të vizualizuara me precizion." },
];

export default function PlanoraLanding() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="pl-root">

      {/* NAV */}
      <nav className={`pl-nav ${scrolled ? "pl-nav--scrolled" : ""}`}>
        <div className="pl-nav-brand">
          <div className="pl-nav-logo-wrap">
            <img src={logo} alt="Planora" className="pl-nav-logo" />
          </div>
          <span className="pl-nav-name">Planora<em>Book</em></span>
        </div>
        <div className="pl-nav-links">
          <a href="#features">Veçoritë</a>
          <a href="#how">Si funksionon</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="pl-nav-cta">
          <button className="pl-ghost-btn" onClick={() => navigate("/login")}>Hyr</button>
          <button className="pl-primary-btn" onClick={() => navigate("/register")}>
            Fillo Falas <span className="pl-arrow">↗</span>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="pl-hero">
        <div className="pl-hero-bg">
          <div className="pl-grid" />
          <div className="pl-orb pl-orb-1" />
          <div className="pl-orb pl-orb-2" />
          <div className="pl-orb pl-orb-3" />
        </div>

        <div className="pl-hero-inner">
          <div className="pl-hero-copy">
            <div className="pl-eyebrow">
              <span className="pl-eyebrow-dot" />
              E Ardhmja e Menaxhimit të Biznesit
            </div>
            <h1 className="pl-hero-h1">
              Plani i Suksesit<br />
              <span className="pl-hero-gradient">për Biznesin</span><br />
              Tuaj.
            </h1>
            <p className="pl-hero-sub">
              Planora bashkon rezervimet e termineve, menaxhimin e stafit
              dhe analitikën në kohë reale në një platformë elegante
              të ndërtuar për sallone dhe berberí moderne.
            </p>
            <div className="pl-hero-actions">
              <button className="pl-cta-primary" onClick={() => navigate("/register")}>
                Fillo Falas <span>→</span>
              </button>
              <button className="pl-cta-ghost" onClick={() => navigate("/login")}>
                Hyr në panel
              </button>
            </div>
            <div className="pl-social-proof">
              <div className="pl-avatars">
                {["E","K","A","B","D"].map((l,i) => (
                  <div className="pl-av" key={i} style={{zIndex:5-i, background:`hsl(${195+i*22},70%,48%)`}}>{l}</div>
                ))}
              </div>
              <div className="pl-proof-text">
                <strong>500+</strong> sallone tashmë duke rritur biznesin me Planora
              </div>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="pl-hero-visual">
            <div className="pl-dashboard">
              <div className="pl-dash-glow" />
              <div className="pl-dash-card">
                <div className="pl-dash-header">
                  <div className="pl-dash-dots">
                    <span className="dot-r"/><span className="dot-y"/><span className="dot-g"/>
                  </div>
                  <span className="pl-dash-title">Paneli i Planora</span>
                  <div className="pl-dash-live"><span className="pl-live-dot"/>Live</div>
                </div>
                <div className="pl-dash-stats">
                  {[
                    { val: "€2,840", label: "Të ardhura sot", badge: "+12%" },
                    { val: "24", label: "Termine", badge: "+5" },
                    { val: "6", label: "Staf aktiv", badge: "↑" },
                  ].map((s,i) => (
                    <div className="pl-dash-stat" key={i}>
                      <div className="pl-stat-val">{s.val}</div>
                      <div className="pl-stat-row">
                        <span className="pl-stat-lbl">{s.label}</span>
                        <span className="pl-stat-badge">{s.badge}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="pl-dash-chart">
                  <span className="pl-chart-lbl">Të ardhurat javore</span>
                  <div className="pl-bars">
                    {[40,65,50,80,60,95,72].map((h,i) => (
                      <div className="pl-bar-col" key={i}>
                        <div className="pl-bar" style={{"--h":`${h}%`,"--d":`${i*0.07}s`}} />
                        <span>{["H","M","M","E","P","S","D"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pl-dash-apts">
                  {[
                    { name:"Arben K.", svc:"Prerje + Mjekër", time:"10:00", status:"confirmed" },
                    { name:"Blerim M.", svc:"Ngjyrosje", time:"11:30", status:"active" },
                    { name:"Driton S.", svc:"Prerje Premium", time:"13:00", status:"confirmed" },
                  ].map((a,i) => (
                    <div className="pl-apt-row" key={i}>
                      <div className="pl-apt-av">{a.name[0]}</div>
                      <div className="pl-apt-info">
                        <span className="pl-apt-name">{a.name}</span>
                        <span className="pl-apt-svc">{a.svc}</span>
                      </div>
                      <div className="pl-apt-r">
                        <span className="pl-apt-time">{a.time}</span>
                        <span className={`pl-pill pl-pill--${a.status}`}>
                          {a.status === "active" ? "Në progres" : "Konfirmuar"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pl-float-card pl-float-1">
                <span className="pl-float-icon">📈</span>
                <div><div className="pl-float-val">+34%</div><div className="pl-float-lbl">Këtë muaj</div></div>
              </div>
              <div className="pl-float-card pl-float-2">
                <span className="pl-float-icon">⭐</span>
                <div><div className="pl-float-val">4.9</div><div className="pl-float-lbl">Vlerësim mesatar</div></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="pl-features" id="features">
        <div className="pl-section-tag">Veçoritë Kryesore</div>
        <h2 className="pl-section-h2">Gjithçka që i duhet sallonit tuaj.<br /><span>Asgjë që nuk i duhet.</span></h2>
        <div className="pl-feat-grid">
          {features.map((f,i) => (
            <div className="pl-feat-card" key={i} style={{"--i":i}}>
              <div className="pl-feat-icon-wrap"><span>{f.icon}</span></div>
              <h3>{f.label}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PHOTO */}
      <section className="pl-photo">
        <div className="pl-photo-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1800&q=85&auto=format&fit=crop"
            alt="Brendësia e një berberi luksoz"
          />
          <div className="pl-photo-veil" />
        </div>
        <div className="pl-photo-content">
          <div className="pl-section-tag pl-section-tag--light">Ndërtuar për profesionistët</div>
          <h2>Ku luksi takohet me<br />menaxhimin preciz.</h2>
          <p>Dizajnuar bashkë me pronarët më të mirë të salloneve — sepse bizneset elitare meritojnë mjete elitare.</p>
          <button className="pl-cta-primary" onClick={() => navigate("/register")}>
            Ngrite sallonin tënd <span>→</span>
          </button>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="pl-how" id="how">
        <div className="pl-section-tag">Procesi</div>
        <h2 className="pl-section-h2">Live në më pak se<br /><span>10 minuta.</span></h2>
        <div className="pl-steps">
          {[
            { n:"01", title:"Krijo llogarinë tënde", desc:"Regjistrohu falas — pa kartë krediti. Konfiguro profilin e sallonit tënd brenda minutave." },
            { n:"02", title:"Shto shërbimet & stafin", desc:"Listo çdo shërbim me çmime dhe kohëzgjatje. Vendos oraret individuale për secilin punonjës." },
            { n:"03", title:"Prano rezervime & rrit biznesin", desc:"Klientët rezervojnë online 24/7. Ti menaxhon gjithçka nga një panel elegant." },
          ].map((s,i) => (
            <div className="pl-step" key={i}>
              <div className="pl-step-num">{s.n}</div>
              <div className="pl-step-body">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="pl-faq" id="faq">
        <div className="pl-faq-inner">
          <div className="pl-faq-left">
            <div className="pl-section-tag">FAQ</div>
            <h2 className="pl-section-h2">Pyetjet<br /><span>e shpeshta.</span></h2>
            <p>Nuk gjeni përgjigjen?<br />Na kontaktoni në çdo kohë.</p>
          </div>
          <div className="pl-faq-list">
            {faqs.map((f,i) => (
              <div className={`pl-faq-item ${openFaq===i?"open":""}`} key={i}>
                <button className="pl-faq-q" onClick={() => setOpenFaq(openFaq===i?null:i)}>
                  {f.q}
                  <span className="pl-faq-icon">{openFaq===i?"−":"+"}</span>
                </button>
                <div className="pl-faq-a"><p>{f.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="pl-cta-band">
        <div className="pl-cta-band-bg">
          <div className="pl-orb pl-orb-cta1" />
          <div className="pl-orb pl-orb-cta2" />
          <div className="pl-grid pl-grid--subtle" />
        </div>
        <div className="pl-cta-band-content">
          <h2>Gati të transformoni<br />biznesin tuaj?</h2>
          <p>Bashkohuni me qindra sallone që tashmë punojnë me Planora. Falas për të filluar.</p>
          <div className="pl-cta-band-btns">
            <button className="pl-cta-primary pl-cta-primary--cyan" onClick={() => navigate("/register")}>
              Krijo llogari falas <span>→</span>
            </button>
            <button className="pl-cta-dark-ghost" onClick={() => navigate("/login")}>Hyr</button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="pl-footer">
        <div className="pl-footer-inner">
          <div className="pl-footer-brand">
            <div className="pl-footer-logo"><img src={logo} alt="Planora" /></div>
            <span className="pl-footer-name">Planora<em>Book</em></span>
            <p>E ardhmja e menaxhimit të salloneve.</p>
          </div>
          <div className="pl-footer-nav">
            <div className="pl-footer-col">
              <span>Produkt</span>
              <a href="#features">Veçoritë</a>
              <a href="#how">Si funksionon</a>
              <a href="#faq">FAQ</a>
            </div>
            <div className="pl-footer-col">
              <span>Llogaria</span>
              <a style={{cursor:"pointer"}} onClick={() => navigate("/login")}>Hyr</a>
              <a style={{cursor:"pointer"}} onClick={() => navigate("/register")}>Regjistrohu</a>
            </div>
          </div>
        </div>
        <div className="pl-footer-bottom">
          <p>© {new Date().getFullYear()} PlanoraBook. Të gjitha të drejtat e rezervuara.</p>
          <p>Ndërtuar me precizion për sallone moderne.</p>
        </div>
      </footer>
    </div>
  );
}