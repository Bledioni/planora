import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../index';
import '../../appointments/style/BookingApp.css';

const BookingApp = () => {
  const { shopSlug } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ barbers: [], services: [] });
  const [slots, setSlots] = useState([]);
  
  // Selections
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });

  // 1. Load Initial Data
  const initApp = useCallback(async () => {
    if (!shopSlug) return;
    setLoading(true);
    try {
      const res = await api.get(`/businesses/slug/${shopSlug}`);
      setDetails(res.data.data);
      setSelectedBusiness(res.data.data.id);
    } catch (err) {
      console.error("Error:", err);
      alert("Biznesi nuk u gjet.");
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => { initApp(); }, [initApp]);

  // 2. Fetch Slots Function
  const fetchSlots = useCallback(async () => {
    if (!selectedBarber || !selectedService || !selectedBusiness) return;
    
    setLoading(true);
    try {
      const res = await api.get('/available-slots', {
        params: {
          business_id: selectedBusiness,
          employee_id: selectedBarber,
          service_id: selectedService,
          date: selectedDate
        }
      });
      setSlots(res.data);
    } catch (err) {
      console.error("Slot error:", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, selectedBarber, selectedService, selectedDate]);

  // 3. AUTO-REFRESH SLOTS: Kjo siguron që kur ndryshon data (psh Day 4), oraret vijnë menjëherë
  useEffect(() => {
    if (step === 2) { // Vetëm nëse jemi te faqja e orareve
      fetchSlots();
    }
  }, [selectedDate, fetchSlots, step]);

  const handleFinalBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/makeAppointment', {
        business_id: selectedBusiness,
        employee_id: selectedBarber,
        service_id: selectedService,
        start_time: `${selectedDate} ${selectedTime}:00`,
        client_name: userInfo.name,
        client_email: userInfo.email,
        client_phone: userInfo.phone
      });
      setStep(4);
    } catch (err) {
      alert("Gabim gjatë rezervimit.");
    } finally {
      setLoading(false);
    }
  };

  const currentService = details.services?.find(s => s.id === selectedService);

  return (
    <div className="booking-page-wrapper">
      <div className="booking-layout">
        
        {/* SIDEBAR */}
        <aside className="shop-sidebar">
          <h1>{details.shop_name || "Planora"}</h1>
          <div className="sidebar-info-item">📍 {details.address || "Kosovë"}</div>
          
          {currentService && (
            <div style={{ marginTop: '40px', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--p-blue)', letterSpacing: '1px' }}>DETAJET</p>
              <h3 style={{ margin: '10px 0 5px 0' }}>{currentService.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="service-duration">🕒 {currentService.duration} min</span>
                <span style={{fontWeight: '700'}}>{currentService.price}€</span>
              </div>
              {selectedTime && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <p style={{margin:0, fontSize: '0.9rem'}}>📅 {selectedDate}</p>
                  <p style={{margin:0, fontSize: '0.9rem', color: 'var(--p-blue)', fontWeight: '700'}}>⏰ {selectedTime}</p>
                </div>
              )}
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="booking-main">
          {step < 4 && (
            <div className="step-indicator">
              {[1, 2, 3].map(i => <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`}></div>)}
            </div>
          )}

          {step === 1 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Barberin & Shërbimin</h2>
              <div className="wide-grid">
                {details.barbers?.map(b => (
                  <div key={b.id} className={`service-row ${selectedBarber === b.id ? 'active' : ''}`} onClick={() => setSelectedBarber(b.id)}>
                    <strong>{b.name}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                {details.services?.map(s => (
                  <div key={s.id} className={`service-row ${selectedService === s.id ? 'active' : ''}`} onClick={() => setSelectedService(s.id)}>
                    <div className="service-info-main">
                      <strong>{s.name}</strong>
                      <span className="service-duration">🕒 {s.duration} min</span>
                    </div>
                    <strong>{s.price}€</strong>
                  </div>
                ))}
              </div>
              <button className="primary-button" style={{marginTop: '30px'}} disabled={!selectedBarber || !selectedService} onClick={() => setStep(2)}>
                Vazhdo te Oraret
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Kohën</h2>
              <input type="date" className="booking-input" value={selectedDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setSelectedDate(e.target.value)} />
              
              {loading ? <p>Duke kërkuar oraret...</p> : (
                <div className="slot-grid" style={{marginTop: '20px'}}>
                  {slots.length > 0 ? slots.map(t => (
                    <button key={t} className="select-btn" onClick={() => { setSelectedTime(t); setStep(3); }}>{t}</button>
                  )) : <p style={{color: 'red'}}>Nuk ka orare të lira për këtë datë (Day 4).</p>}
                </div>
              )}
              <button className="back-link" onClick={() => setStep(1)} style={{marginTop: '20px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer'}}>← Mbrapa</button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h2 className="section-title">Shënoni të dhënat</h2>
              <form onSubmit={handleFinalBooking}>
                <input className="booking-input" placeholder="Emri" required onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                <input className="booking-input" type="email" placeholder="Email" required onChange={e => setUserInfo({...userInfo, email: e.target.value})} />
                <input className="booking-input" placeholder="Telefoni" required onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
                <button type="submit" className="primary-button" style={{marginTop: '20px'}}>Konfirmo Rezervimin</button>
              </form>
              <button className="back-link" onClick={() => setStep(2)} style={{marginTop: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer'}}>← Mbrapa</button>
            </div>
          )}

          {step === 4 && (
            <div className="fade-in" style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '60px'}}>✅</div>
              <h2>U krye!</h2>
              <p>Rezervimi u dërgua me sukses.</p>
              <button className="primary-button" onClick={() => window.location.reload()}>Kthehu</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookingApp;