import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../../index';
import '../../appointments/style/BookingApp.css';

const BookingApp = () => {
  const { shopSlug } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ employees: [], services: [] });
  const [slots, setSlots] = useState([]);
  
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
      const res = await api.get(`/public/businesses/details/${shopSlug}`);
      
      console.log("API Response:", res.data); // DEBUG

      // FIX: API returns res.data.business NOT res.data.data
      const businessData = res.data.business || res.data.data || res.data;
      
      console.log("Business Data:", businessData); // DEBUG
      console.log("Employees:", businessData.employees); // DEBUG
      console.log("Services:", businessData.services); // DEBUG

      setDetails(businessData);
      setSelectedBusiness(businessData.id);
    } catch (err) {
      console.error("Error:", err);
      alert("Biznesi nuk u gjet.");
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => { initApp(); }, [initApp]);

  // 2. Fetch Slots
  const fetchSlots = useCallback(async () => {
    if (!selectedBarber || !selectedService || !selectedBusiness) return;
    
    setLoading(true);
    try {
      const res = await api.post('/public/booking/available-slots', {
        // FIX: Use POST not GET (matches your routes)
        employee_id: selectedBarber,
        service_id: selectedService,
        date: selectedDate
      });
      setSlots(res.data);
    } catch (err) {
      console.error("Slot error:", err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, selectedBarber, selectedService, selectedDate]);

  useEffect(() => {
    if (step === 2) {
      fetchSlots();
    }
  }, [selectedDate, fetchSlots, step]);

  const handleFinalBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/public/booking/create-appointment', {
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
      console.error("Booking error:", err);
      alert(err.response?.data?.message || "Gabim gjatë rezervimit.");
    } finally {
      setLoading(false);
    }
  };

  // FIX: Use employees not barbers
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
              {/* FIX: service fields - use service_name not name */}
              <h3 style={{ margin: '10px 0 5px 0' }}>{currentService.service_name || currentService.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="service-duration">🕒 {currentService.service_duration || currentService.duration} min</span>
                <span style={{fontWeight: '700'}}>{currentService.service_price || currentService.price}€</span>
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
              
              {/* FIX: Use employees not barbers, use employee.user.name */}
              <div className="wide-grid">
                {details.employees?.length > 0 ? (
                  details.employees.map(emp => (
                    <div 
                      key={emp.id} 
                      className={`service-row ${selectedBarber === emp.id ? 'active' : ''}`} 
                      onClick={() => setSelectedBarber(emp.id)}
                    >
                      <strong>{emp.user?.name} {emp.user?.surname}</strong>
                    </div>
                  ))
                ) : (
                  <p style={{color: 'gray'}}>Nuk ka barberë të disponueshëm.</p>
                )}
              </div>

              {/* Services */}
              <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                {details.services?.length > 0 ? (
                  details.services.map(s => (
                    <div 
                      key={s.id} 
                      className={`service-row ${selectedService === s.id ? 'active' : ''}`} 
                      onClick={() => setSelectedService(s.id)}
                    >
                      <div className="service-info-main">
                        {/* FIX: Use service_name not name */}
                        <strong>{s.service_name || s.name}</strong>
                        <span className="service-duration">🕒 {s.service_duration || s.duration} min</span>
                      </div>
                      {/* FIX: Use service_price not price */}
                      <strong>{s.service_price || s.price}€</strong>
                    </div>
                  ))
                ) : (
                  <p style={{color: 'gray'}}>Nuk ka shërbime të disponueshme.</p>
                )}
              </div>

              <button 
                className="primary-button" 
                style={{marginTop: '30px'}} 
                disabled={!selectedBarber || !selectedService} 
                onClick={() => setStep(2)}
              >
                Vazhdo te Oraret
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Kohën</h2>
              <input 
                type="date" 
                className="booking-input" 
                value={selectedDate} 
                min={new Date().toISOString().split('T')[0]} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
              
              {loading ? <p>Duke kërkuar oraret...</p> : (
                <div className="slot-grid" style={{marginTop: '20px'}}>
                  {slots.length > 0 ? slots.map(t => (
                    <button 
                      key={t} 
                      className="select-btn" 
                      onClick={() => { setSelectedTime(t); setStep(3); }}
                    >
                      {t}
                    </button>
                  )) : (
                    <p style={{color: 'red'}}>Nuk ka orare të lira për këtë datë.</p>
                  )}
                </div>
              )}
              <button 
                onClick={() => setStep(1)} 
                style={{marginTop: '20px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer'}}
              >
                ← Mbrapa
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h2 className="section-title">Shënoni të dhënat</h2>
              <form onSubmit={handleFinalBooking}>
                <input className="booking-input" placeholder="Emri" required onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
                <input className="booking-input" type="email" placeholder="Email" required onChange={e => setUserInfo({...userInfo, email: e.target.value})} />
                <input className="booking-input" placeholder="Telefoni" required onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
                <button type="submit" className="primary-button" style={{marginTop: '20px'}}>
                  {loading ? 'Duke dërguar...' : 'Konfirmo Rezervimin'}
                </button>
              </form>
              <button 
                onClick={() => setStep(2)} 
                style={{marginTop: '15px', background: 'none', border: 'none', color: 'blue', cursor: 'pointer'}}
              >
                ← Mbrapa
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="fade-in" style={{textAlign: 'center', padding: '40px'}}>
              <div style={{fontSize: '60px'}}>✅</div>
              <h2>U krye!</h2>
              <p>Rezervimi u dërgua me sukses. Kontrolloni email-in tuaj!</p>
              <button className="primary-button" onClick={() => window.location.reload()}>Kthehu</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookingApp;