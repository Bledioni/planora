import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { api } from '../../../index';
import '../../appointments/style/BookingApp.css';
import '../../appointments/style/CustomCalendar.css';

const BookingApp = () => {
  const { shopSlug } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ employees: [], services: [] });
  const [slots, setSlots] = useState([]);
  const [availableDates, setAvailableDates] = useState([]);
  
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });

  const initApp = useCallback(async () => {
    if (!shopSlug) return;
    setLoading(true);
    try {
      const res = await api.get(`/public/businesses/details/${shopSlug}`);
      const businessData = res.data.business || res.data.data || res.data;
      
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

  // Fetch available dates for the selected employee
  const fetchAvailableDates = useCallback(async () => {
    if (!selectedBarber || !selectedBusiness) return;
    
    try {
      // Get employee schedule
      const res = await api.get(`/owner/schedules/employee/${selectedBusiness}/${selectedBarber}`);
      const schedules = res.data;
      
      // Get day numbers where employee works
      const workingDays = schedules
        .filter(s => !s.is_off)
        .map(s => s.day_of_week);
      
      setAvailableDates(workingDays);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  }, [selectedBusiness, selectedBarber]);

  useEffect(() => {
    if (selectedBarber) {
      fetchAvailableDates();
    }
  }, [selectedBarber, fetchAvailableDates]);

  // Fetch slots when date is selected
  const fetchSlots = useCallback(async () => {
    if (!selectedBarber || !selectedService || !selectedBusiness || !selectedDate) return;
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await api.get(`/public/business/${selectedBusiness}/${selectedBarber}/available-slots`, {
        params: {
          service_id: selectedService,
          date: dateStr,
          employee_id: selectedBarber,
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

  useEffect(() => {
    if (selectedDate && step === 2) {
      fetchSlots();
    }
  }, [selectedDate, fetchSlots, step]);

  const handleFinalBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      await api.post('/public/appointments/create', {
        business_id: selectedBusiness,
        employee_id: selectedBarber,
        service_id: selectedService,
        start_time: `${dateStr} ${selectedTime}:00`,
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

  // Check if a date is available
  const isDateAvailable = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Disable past dates
    if (date < today) return false;
    
    // Disable dates where employee doesn't work
    const dayOfWeek = date.getDay();
    return availableDates.includes(dayOfWeek);
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
              <h3 style={{ margin: '10px 0 5px 0' }}>{currentService.service_name || currentService.name}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="service-duration">🕒 {currentService.service_duration || currentService.duration} min</span>
                <span style={{fontWeight: '700'}}>{currentService.service_price || currentService.price}€</span>
              </div>
              {selectedDate && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <p style={{margin:0, fontSize: '0.9rem'}}>📅 {selectedDate.toLocaleDateString('sq-AL')}</p>
                  {selectedTime && (
                    <p style={{margin:0, fontSize: '0.9rem', color: 'var(--p-blue)', fontWeight: '700'}}>⏰ {selectedTime}</p>
                  )}
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

              <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                {details.services?.length > 0 ? (
                  details.services.map(s => (
                    <div 
                      key={s.id} 
                      className={`service-row ${selectedService === s.id ? 'active' : ''}`} 
                      onClick={() => setSelectedService(s.id)}
                    >
                      <div className="service-info-main">
                        <strong>{s.service_name || s.name}</strong>
                        <span className="service-duration">🕒 {s.service_duration || s.duration} min</span>
                      </div>
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
              <h2 className="section-title">Zgjidhni Datën</h2>
              
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                minDate={new Date()}
                tileDisabled={({ date }) => !isDateAvailable(date)}
                tileClassName={({ date }) => {
                  if (!isDateAvailable(date)) return 'unavailable-date';
                  if (selectedDate && date.toDateString() === selectedDate.toDateString()) return 'selected-date';
                  return null;
                }}
                locale="sq-AL"
              />

              {selectedDate && (
                <>
                  <h3 style={{marginTop: '30px', marginBottom: '15px'}}>Oraret e disponueshme</h3>
                  {loading ? <p>Duke kërkuar oraret...</p> : (
                    <div className="slot-grid">
                      {slots.length > 0 ? slots.map(t => (
                        <button 
                          key={t} 
                          className={`slot-btn ${selectedTime === t ? 'selected' : ''}`}
                          onClick={() => { setSelectedTime(t); setStep(3); }}
                        >
                          {t}
                        </button>
                      )) : (
                        <p style={{color: 'red'}}>Nuk ka orare të lira për këtë datë.</p>
                      )}
                    </div>
                  )}
                </>
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