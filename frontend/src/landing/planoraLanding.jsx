import React, { useState } from "react";
import { api } from "../index"; 
import logo from "../landing/assets/IMG_5288.png"; 
import "../landing/PlanoraLanding.css"; 

function PlanoraLanding() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email_address: "",
    password: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

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
      {/* PJESA E MAJTË: PREZANTIMI */}
      <div className="presentation-side">
        <div className="brand-header">
          <img src={logo} alt="Planora Logo" className="app-logo" />
          <span className="brand-name">Planora</span>
        </div>

        <div className="hero-content">
          <h1>Sistemi që i duhet <br /><span>Sallonit tuaj.</span></h1>
          <p className="hero-text">
            Nga menaxhimi i takimeve deri te stafi dhe financat. 
            Gjithçka që ju duhet për të rritur biznesin tuaj në një platformë të vetme.
          </p>

          <div className="feature-grid">
            <div className="feature-item">
              <span className="icon">📅</span>
              <p>Kalendar Interaktiv</p>
            </div>
            <div className="feature-item">
              <span className="icon">📱</span>
              <p>Rezervime Online 24/7</p>
            </div>
            <div className="feature-item">
              <span className="icon">📊</span>
              <p>Statistika të Biznesit</p>
            </div>
          </div>
        </div>
        
        <div className="presentation-footer">
          <p>© 2026 Planora Software. Made for Barbers & Beauty Salons.</p>
        </div>
      </div>

      {/* PJESA E DJATHTË: FORMA E REGJISTRIMIT */}
      <div className="form-side">
        <div className="wishlist-card">
          {!isSuccess ? (
            <>
              <h2>Regjistrohuni tani</h2>
              <p className="card-subtitle">Bëhu ndër të parët që përdor Planora dhe përfito nga ofertat tona.</p>

              <form onSubmit={handleSubmit} className="planora-form">
                <div className="form-row">
                  <div className="form-group">
                    <input 
                      className={errors.name ? "error-input" : ""}
                      type="text" name="name" placeholder="Emri" 
                      onChange={handleChange} value={formData.name} 
                    />
                    {errors.name && <span className="error-msg">{errors.name[0]}</span>}
                  </div>
                  <div className="form-group">
                    <input 
                      className={errors.surname ? "error-input" : ""}
                      type="text" name="surname" placeholder="Mbiemri" 
                      onChange={handleChange} value={formData.surname} 
                    />
                    {errors.surname && <span className="error-msg">{errors.surname[0]}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <input 
                    className={errors.email_address ? "error-input" : ""}
                    type="email" name="email_address" placeholder="Email Adresa" 
                    onChange={handleChange} value={formData.email_address} 
                  />
                  {errors.email_address && <span className="error-msg">{errors.email_address[0]}</span>}
                </div>

                <div className="form-group">
                  <input 
                    className={errors.phone_number ? "error-input" : ""}
                    type="text" name="phone_number" placeholder="Numri i Telefonit" 
                    onChange={handleChange} value={formData.phone_number} 
                  />
                  {errors.phone_number && <span className="error-msg">{errors.phone_number[0]}</span>}
                </div>
                
                <div className="form-group">
                  <input 
                    className={errors.password ? "error-input" : ""}
                    type="password" name="password" placeholder="Krijoni një Fjalëkalim" 
                    onChange={handleChange} value={formData.password}
                  />
                  {errors.password && <span className="error-msg">{errors.password[0]}</span>}
                </div>

                <button type="submit" className="primary-btn" disabled={isLoading}>
                  {isLoading ? "Duke u procesuar..." : "Regjistro Sallonin"}
                </button>
              </form>
            </>
          ) : (
            <div className="success-state">
              <div className="check-icon">✓</div>
              <h2>Mirësevini në Planora!</h2>
              <p>Regjistrimi u krye me sukses. Ne do t'ju kontaktojmë së shpejti në emailin tuaj.</p>
              <button onClick={() => setIsSuccess(false)} className="secondary-btn">Kthehu</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlanoraLanding;