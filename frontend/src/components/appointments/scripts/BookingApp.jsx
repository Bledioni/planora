import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { api } from '../../../index';
import '../../appointments/style/BookingApp.css';
import '../../appointments/style/CustomCalendar.css';

const parseDurationToMinutes = (duration) => {
  if (!duration) return 0;
  if (typeof duration === 'number') return duration;
  if (String(duration).includes(':')) {
    const [hours, minutes] = String(duration).split(':');
    return (parseInt(hours) * 60) + parseInt(minutes);
  }
  return parseInt(duration) || 0;
};

const getLocalDateString = (date) => {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const BookingApp = () => {
  const { shopSlug } = useParams();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState({ employees: [], services: [] });
  const [slots, setSlots] = useState([]);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });

  // ─── 1. Load business details ────────────────────────────────────────────────
  // Endpoint: GET /public/businesses/details/{slug}
  const initApp = useCallback(async () => {
    if (!shopSlug) return;
    setLoading(true);
    try {
      const res = await api.get(`/public/businesses/details/${shopSlug}`);
      const businessData = res.data.business || res.data.data || res.data;
      setDetails(businessData);
      setSelectedBusiness(businessData.id);
    } catch (err) {
      console.error('Error:', err);
      alert('Biznesi nuk u gjet.');
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => { initApp(); }, [initApp]);

  // ─── 2. Fetch available slots ─────────────────────────────────────────────────
  // Endpoint: GET /public/business/{businessId}/{employeeId}/available-slots
  // NOTE: The /owner/schedules/ route has been removed — it is not a public endpoint.
  //       Available days are now determined solely by the slots API response:
  //       if a day returns an empty array the calendar shows "no slots available".
  const fetchSlots = useCallback(async () => {
    if (!selectedBarber || !selectedServices.length || !selectedBusiness || !selectedDate) return;
    setLoading(true);
    try {
      const dateStr = getLocalDateString(selectedDate);

      const res = await api.get(
        `/public/business/${selectedBusiness}/${selectedBarber}/available-slots`,
        {
          params: {
            service_ids: selectedServices,
            date: dateStr,
            employee_id: selectedBarber,
          },
          paramsSerializer: (params) => {
            const searchParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
              if (Array.isArray(value)) {
                value.forEach((v) => searchParams.append(`${key}[]`, v));
              } else {
                searchParams.append(key, value);
              }
            });
            return searchParams.toString();
          },
        }
      );
      setSlots(res.data);
    } catch (err) {
      console.error('Slot error:', err);
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, selectedBarber, selectedServices, selectedDate]);

  useEffect(() => {
    if (selectedDate && step === 2) fetchSlots();
  }, [selectedDate, fetchSlots, step]);

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  // ─── 3. Create appointment ────────────────────────────────────────────────────
  // Endpoint: POST /public/appointments/create
  const handleFinalBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dateStr = getLocalDateString(selectedDate);

      await api.post('/public/appointments/create', {
        business_id: selectedBusiness,
        employee_id: selectedBarber,
        service_ids: selectedServices,
        start_time: `${dateStr} ${selectedTime}:00`,
        client_name: userInfo.name,
        client_email: userInfo.email,
        client_phone: userInfo.phone,
      });
      setStep(4);
    } catch (err) {
      console.error('Booking error:', err);
      alert(err.response?.data?.message || 'Gabim gjatë rezervimit.');
    } finally {
      setLoading(false);
    }
  };

  // Past dates are disabled; all future dates are selectable.
  // Whether a day actually has slots is revealed after selection via the slots API.
  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const selectedServiceObjects =
    details.services?.filter((s) => selectedServices.includes(s.id)) || [];
  const totalDuration = selectedServiceObjects.reduce(
    (sum, s) => sum + parseDurationToMinutes(s.service_duration || s.duration),
    0
  );
  const totalPrice = selectedServiceObjects.reduce(
    (sum, s) => sum + parseFloat(s.service_price || s.price || 0),
    0
  );

  return (
    <div className="booking-page-wrapper">
      <div className="booking-layout">

        {/* ── Sidebar ── */}
        <aside className="shop-sidebar">
          <h1>{details.shop_name || 'Planora'}</h1>
          <div className="sidebar-info-item">📍 {details.address || 'Kosovë'}</div>

          {selectedServiceObjects.length > 0 && (
            <div style={{ marginTop: '40px', borderTop: '2px solid #e2e8f0', paddingTop: '20px' }}>
              <p style={{ fontSize: '11px', fontWeight: '800', color: 'var(--p-blue)', letterSpacing: '1px' }}>
                SHËRBIMET E ZGJEDHURA
              </p>
              {selectedServiceObjects.map((s) => (
                <div key={s.id} style={{ marginTop: '10px' }}>
                  <h3 style={{ margin: '0 0 3px 0', fontSize: '0.95rem' }}>{s.service_name || s.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="service-duration">
                      🕒 {parseDurationToMinutes(s.service_duration || s.duration)} min
                    </span>
                    <span style={{ fontWeight: '700' }}>{s.service_price || s.price}€</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: '12px', borderTop: '1px solid #ddd', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: '800' }}>
                <span>🕒 {totalDuration} min</span>
                <span>{totalPrice.toFixed(2)}€</span>
              </div>
              {selectedDate && (
                <div style={{ marginTop: '15px', padding: '10px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem' }}>📅 {selectedDate.toLocaleDateString('sq-AL')}</p>
                  {selectedTime && (
                    <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--p-blue)', fontWeight: '700' }}>
                      ⏰ {selectedTime}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ── Main ── */}
        <main className="booking-main">
          {step < 4 && (
            <div className="step-indicator">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
              ))}
            </div>
          )}

          {/* Step 1 — Barber & Services */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Barberin & Shërbimet</h2>

              <div className="wide-grid">
                {details.employees?.length > 0 ? (
                  details.employees.map((emp) => (
                    <div
                      key={emp.id}
                      className={`service-row ${selectedBarber === emp.id ? 'active' : ''}`}
                      onClick={() => setSelectedBarber(emp.id)}
                    >
                      <strong>{emp.user?.name} {emp.user?.surname}</strong>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'gray' }}>Nuk ka barberë të disponueshëm.</p>
                )}
              </div>

              <div style={{ display: 'grid', gap: '12px', marginTop: '20px' }}>
                {details.services?.length > 0 ? (
                  details.services.map((s) => (
                    <div
                      key={s.id}
                      className={`service-row ${selectedServices.includes(s.id) ? 'active' : ''}`}
                      onClick={() => toggleService(s.id)}
                    >
                      <div className="service-info-main">
                        <strong>{s.service_name || s.name}</strong>
                        <span className="service-duration">
                          🕒 {parseDurationToMinutes(s.service_duration || s.duration)} min
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <strong>{s.service_price || s.price}€</strong>
                        <span style={{ fontSize: '18px' }}>
                          {selectedServices.includes(s.id) ? '✅' : '⬜'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{ color: 'gray' }}>Nuk ka shërbime të disponueshme.</p>
                )}
              </div>

              <button
                className="primary-button"
                style={{ marginTop: '30px' }}
                disabled={!selectedBarber || !selectedServices.length}
                onClick={() => setStep(2)}
              >
                Vazhdo te Oraret
              </button>
            </div>
          )}

          {/* Step 2 — Date & Time */}
          {step === 2 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Datën</h2>
              <Calendar
                onChange={(date) => {
                  setSelectedDate(date);
                  setSelectedTime(null);
                  setSlots([]);
                }}
                value={selectedDate}
                minDate={new Date()}
                tileDisabled={({ date }) => isDateDisabled(date)}
                tileClassName={({ date }) => {
                  if (isDateDisabled(date)) return 'unavailable-date';
                  if (selectedDate && date.toDateString() === selectedDate.toDateString()) return 'selected-date';
                  return null;
                }}
                locale="sq-AL"
              />

              {selectedDate && (
                <>
                  <h3 style={{ marginTop: '30px', marginBottom: '15px' }}>Oraret e disponueshme</h3>
                  {loading ? (
                    <p>Duke kërkuar oraret...</p>
                  ) : (
                    <div className="slot-grid">
                      {slots.length > 0 ? (
                        slots.map((t) => (
                          <button
                            key={t}
                            className={`slot-btn ${selectedTime === t ? 'selected' : ''}`}
                            onClick={() => { setSelectedTime(t); setStep(3); }}
                          >
                            {t}
                          </button>
                        ))
                      ) : (
                        <p style={{ color: 'red' }}>Nuk ka orare të lira për këtë datë.</p>
                      )}
                    </div>
                  )}
                </>
              )}

              <button onClick={() => setStep(1)} className="back-link">← Mbrapa</button>
            </div>
          )}

          {/* Step 3 — Client Info */}
          {step === 3 && (
            <div className="fade-in">
              <h2 className="section-title">Shënoni të dhënat</h2>
              <form onSubmit={handleFinalBooking}>
                <input
                  className="booking-input"
                  placeholder="Emri"
                  required
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                />
                <input
                  className="booking-input"
                  type="email"
                  placeholder="Email"
                  required
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                />
                <input
                  className="booking-input"
                  placeholder="Telefoni"
                  required
                  onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                />
                <button type="submit" className="primary-button" style={{ marginTop: '20px' }}>
                  {loading ? 'Duke dërguar...' : 'Konfirmo Rezervimin'}
                </button>
              </form>
              <button onClick={() => setStep(2)} className="back-link">← Mbrapa</button>
            </div>
          )}

          {/* Step 4 — Success */}
          {step === 4 && (
            <div className="fade-in success-screen">
              <div className="success-icon">✅</div>
              <h2>U krye!</h2>
              <p>Rezervimi u dërgua me sukses. Kontrolloni email-in tuaj!</p>
              <button className="primary-button" onClick={() => window.location.reload()}>
                Kthehu
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookingApp;