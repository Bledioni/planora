import React, { useState } from "react";
import { api } from "../index"; 
import logo from "../landing/assets/IMG_5288.png"; 
import "../landing/PlanoraLanding.css"; 

function PlanoraLanding() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email_address: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);


  const faqs = [
    {
      q: "Pse duhet të zgjidhni Planora?",
      a: "Planora nuk është thjesht një kalendar. Është një asistent inteligjent që menaxhon oraret, njofton klientët automatikisht dhe ju jep raporte të qarta për fitimet tuaja, duke ju kursyer deri në 10 orë pune administrative në javë."
    },
    {
      q: "Kush është pas Planora?",
      a: "Ne jemi një ekip i dedikuar për teknologjinë e bizneseve të shërbimit, me synimin për të modernizuar sallonet në rajon përmes mjeteve të thjeshta dhe efikase."
    },
    {
      q: "A funksionon në telefon dhe kompjuter?",
      a: "Po! Planora është e bazuar në 'cloud'. Kjo do të thotë që mund të hyni në biznesin tuaj nga telefoni, tableti ose laptopi, kudo që të ndodheni, mjafton një lidhje interneti."
    },
    {
      q: "A janë të dhënat e mia të sigurta?",
      a: "Siguria është prioriteti ynë. Të dhënat tuaja dhe ato të klientëve janë të enkriptuara dhe të ruajtura në servera të sigurt me standarde ndërkombëtare."
    },
    {
      q: "Sa kushton pas periudhës së provës?",
      a: "Përdoruesit që regjistrohen tani në Waitlist do të kenë qasje të hershme dhe do të përfitojnë oferta ekskluzive me çmime preferenciale 'Founder's Edition' që nuk do të ndryshojnë kurrë."
    }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await api.post("/wishlistRegister", formData);
      setIsSuccess(true);
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        alert("Pati një problem me serverin. Ju lutem provoni përsëri.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* PJESA E MAJTË: PREZANTIMI & FAQ */}
      <div className="presentation-side">
        <div className="brand-header">
          <img src={logo} alt="Planora Logo" className="app-logo" />
          <span className="brand-name">Planora</span>
        </div>

        <div className="hero-content">
          <h1>Sistemi që i duhet <br /><span>Sallonit tuaj.</span></h1>
          <p className="hero-text">
            Nga menaxhimi i takimeve deri te stafi dhe financat. 
            Gjithçka që ju duhet për të rritur biznesin tuaj.
          </p>

          <div className="feature-grid">
            <div className="feature-item"><span className="icon">📅</span> <p>Kalendar</p></div>
            <div className="feature-item"><span className="icon">📱</span> <p>Online 24/7</p></div>
            <div className="feature-item"><span className="icon">📊</span> <p>Statistika</p></div>
          </div>
        </div>

        {/* SECTION: FAQ */}
        <div className="faq-container">
          <h2 className="faq-title">Pyetjet e shpeshta</h2>
          {faqs.map((faq, index) => (
            <div className={`faq-item ${openFaq === index ? "active" : ""}`} key={index}>
              <button className="faq-question" onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                {faq.q}
                <span className="faq-icon">{openFaq === index ? "−" : "+"}</span>
              </button>
              <div className={`faq-answer ${openFaq === index ? "show" : ""}`}>
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
        
        
      </div>

      {/* PJESA E DJATHTË: FORMA E REGJISTRIMIT */}
      <div className="form-side">
        <div className="wishlist-card">
          {!isSuccess ? (
            <>
              <h2>Regjistrohuni tani</h2>
              <p className="card-subtitle">Siguroni vendin tuaj për qasje të hershme dhe oferta speciale.</p>

              <form onSubmit={handleSubmit} className="planora-form">
                <div className="form-row">
                  <div className="form-group">
                    <input className={errors.name ? "error-input" : ""} type="text" name="name" placeholder="Emri" onChange={handleChange} value={formData.name} />
                    {errors.name && <span className="error-msg">{errors.name[0]}</span>}
                  </div>
                  <div className="form-group">
                    <input className={errors.surname ? "error-input" : ""} type="text" name="surname" placeholder="Mbiemri" onChange={handleChange} value={formData.surname} />
                    {errors.surname && <span className="error-msg">{errors.surname[0]}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <input className={errors.email_address ? "error-input" : ""} type="email" name="email_address" placeholder="Email Adresa" onChange={handleChange} value={formData.email_address} />
                  {errors.email_address && <span className="error-msg">{errors.email_address[0]}</span>}
                </div>

                <div className="form-group">
                  <input className={errors.phone_number ? "error-input" : ""} type="text" name="phone_number" placeholder="Numri i Telefonit" onChange={handleChange} value={formData.phone_number} />
                  {errors.phone_number && <span className="error-msg">{errors.phone_number[0]}</span>}
                </div>
                
  

                <button type="submit" className="primary-btn" disabled={isLoading}>
                  {isLoading ? "Duke u procesuar..." : "Regjistro Sallonin"}
                </button>
              </form>
            </>
          ) : (
            <div className="success-state">
              <div className="check-icon">✓</div>
              <h2>Mirësevini!</h2>
              <p>Ju u regjistruat me sukses. Do t'ju njoftojmë së shpejti!</p>
              <button onClick={() => setIsSuccess(false)} className="secondary-btn">Kthehu</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanoraLanding;