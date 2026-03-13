import React, { useState, useEffect, useCallback } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom"; // Shto useNavigate
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { api } from "../../../index";
import "../../appointments/style/BookingApp.css";
import "../../appointments/style/CustomCalendar.css";
import PhoneInputField from '../../phoneInputs/script/PhoneInputField';

const parseDurationToMinutes = (duration) => {
  if (!duration) return 0;
  if (typeof duration === "number") return duration;
  if (String(duration).includes(":")) {
    const [hours, minutes] = String(duration).split(":");
    return parseInt(hours) * 60 + parseInt(minutes);
  }
  return parseInt(duration) || 0;
};

const getLocalDateString = (date) => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const BookingApp = () => {
  const { shopSlug } = useParams();
  const navigate = useNavigate(); // Hook-u për navigim
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [details, setDetails] = useState({ employees: [], services: [] });
  const [slots, setSlots] = useState([]);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userInfo, setUserInfo] = useState({ name: "", email: "", phone: "" });

  const initApp = useCallback(async () => {
    if (!shopSlug) return;
    setLoading(true);
    try {
      const res = await api.get(`/public/businesses/details/${shopSlug}`);
      const businessData = res.data.business || res.data.data || res.data;
      setDetails(businessData);
      setSelectedBusiness(businessData.id);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => {
    initApp();
  }, [initApp]);

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
      setSlots([]);
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, selectedBarber, selectedServices, selectedDate]);

  useEffect(() => {
    if (selectedDate && step === 2) fetchSlots();
  }, [selectedDate, fetchSlots, step]);

  const toggleService = (serviceId) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSlots([]);
    setTimeout(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "smooth" });
    }, 250);
  };

  // LOGJIKA E RE E KONFIRMIMIT
  const handleFinalBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dateStr = getLocalDateString(selectedDate);
      const response = await api.post("/public/appointments/create", {
        business_id: selectedBusiness,
        employee_id: selectedBarber,
        service_ids: selectedServices,
        start_time: `${dateStr} ${selectedTime}:00`,
        client_name: userInfo.name,
        client_email: userInfo.email,
        client_phone: userInfo.phone,
      });

      // Sapo konfirmohet, marrim ID e parë dhe ikim te faqja e detajeve
      if (response.data.status === 'success') {
        const appointmentId = response.data.appointment_ids[0];
        navigate(`/appointment/${appointmentId}`); 
      }
    } catch (err) {
      alert(err.response?.data?.message || "Gabim gjatë rezervimit.");
    } finally {
      setLoading(false);
    }
  };

  const isDateDisabled = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const selectedServiceObjects = details.services?.filter((s) => selectedServices.includes(s.id)) || [];
  const totalDuration = selectedServiceObjects.reduce(
    (sum, s) => sum + parseDurationToMinutes(s.service_duration || s.duration), 0
  );
  const totalPrice = selectedServiceObjects.reduce(
    (sum, s) => sum + parseFloat(s.service_price || s.price || 0), 0
  );

  if (notFound) return <Navigate to="/404" replace />;

  return (
    <div className="booking-page-wrapper">
      <div className="booking-layout">

        {/* SIDEBAR */}
        <aside className="shop-sidebar">
          <h1>{details.shop_name || "Planora"}</h1>
          <div className="sidebar-info-item">📍 {details.address || "Kosovë"}</div>

          {step >= 1 && selectedServiceObjects.length > 0 && (
            <div className="fade-in summary-container" style={{ marginTop: "40px", borderTop: "2px solid #e2e8f0", paddingTop: "20px" }}>
              <p className="summary-label">PËRMBLEDHJA</p>
              {selectedServiceObjects.map((s) => (
                <div key={s.id} style={{ marginTop: "10px" }}>
                  <h3 style={{ margin: "0 0 3px 0", fontSize: "0.95rem" }}>{s.service_name || s.name}</h3>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="service-duration">
                      🕒 {parseDurationToMinutes(s.service_duration || s.duration)} min
                    </span>
                    <span style={{ fontWeight: "700" }}>{s.service_price || s.price}€</span>
                  </div>
                </div>
              ))}
              <div style={{ marginTop: "12px", borderTop: "1px solid #ddd", paddingTop: "10px", display: "flex", justifyContent: "space-between", fontWeight: "800" }}>
                <span>🕒 {totalDuration} min</span>
                <span>{totalPrice.toFixed(2)}€</span>
              </div>
              {selectedDate && (
                <div className="date-summary-box">
                  <p>📅 {selectedDate.toLocaleDateString("sq-AL")}</p>
                  {selectedTime && <p className="time-text">⏰ {selectedTime}</p>}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* MAIN */}
        <main className="booking-main">
          {step < 4 && (
            <div className="step-indicator">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`step-dot ${step >= i ? "active" : ""}`} />
              ))}
            </div>
          )}

          {/* STEP 1: SERVICES */}
          {step === 1 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Barberin & Shërbimet</h2>
              <div className="wide-grid">
                {details.employees?.map((emp) => (
                  <div
                    key={emp.id}
                    className={`service-row ${selectedBarber === emp.id ? "active" : ""}`}
                    onClick={() => setSelectedBarber(emp.id)}
                  >
                    <strong>{emp.user?.name} {emp.user?.surname}</strong>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
                {details.services?.map((s) => (
                  <div
                    key={s.id}
                    className={`service-row ${selectedServices.includes(s.id) ? "active" : ""}`}
                    onClick={() => toggleService(s.id)}
                  >
                    <div className="service-info-main">
                      <strong>{s.service_name || s.name}</strong>
                      <span className="service-duration">
                        🕒 {parseDurationToMinutes(s.service_duration || s.duration)} min
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <strong>{s.service_price || s.price}€</strong>
                      <span style={{ fontSize: "18px" }}>{selectedServices.includes(s.id) ? "✅" : "⬜"}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button
                className="primary-button"
                style={{ marginTop: "30px" }}
                disabled={!selectedBarber || !selectedServices.length}
                onClick={() => setStep(2)}
              >
                Vazhdo te Oraret
              </button>
            </div>
          )}

          {/* STEP 2: SLOTS */}
          {step === 2 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Datën & Orën</h2>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                tileDisabled={({ date }) => isDateDisabled(date)}
                locale="sq-AL"
                maxDetail="month"
                prev2Label={null}
                next2Label={null}
              />
              {selectedDate && (
                <div style={{ marginTop: "40px" }}>
                  <h3 className="section-title" style={{ fontSize: "1.1rem" }}>Oraret e lira</h3>
                  {loading ? (
                    <div className="planora-loader-small"></div>
                  ) : (
                    <div className="slot-grid">
                      {slots.length > 0 ? (
                        slots.map((t) => (
                          <button
                            key={t}
                            className={`slot-btn ${selectedTime === t ? "selected" : ""}`}
                            onClick={() => { setSelectedTime(t); setStep(3); }}
                          >
                            {t}
                          </button>
                        ))
                      ) : (
                        <p>Nuk ka orare të lira për këtë ditë.</p>
                      )}
                    </div>
                  )}
                </div>
              )}
              <button onClick={() => setStep(1)} className="secondary-button-back">← Mbrapa</button>
            </div>
          )}

          {/* STEP 3: USER INFO */}
          {step === 3 && (
            <div className="fade-in">
              <h2 className="section-title">Të dhënat tuaja</h2>
              <form onSubmit={handleFinalBooking}>
                <input
                  className="booking-input"
                  placeholder="Emri i plotë"
                  required
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({ ...userInfo, name: e.target.value })}
                />
                <input
                  className="booking-input"
                  type="email"
                  placeholder="Email adresa"
                  required
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                />
                <PhoneInputField
                  value={userInfo.phone}
                  onChange={(val) => setUserInfo({ ...userInfo, phone: val })}
                />
                <button type="submit" className="primary-button" style={{ marginTop: "20px" }} disabled={loading}>
                  {loading ? "Duke u rezervuar..." : "Konfirmo Termin"}
                </button>
              </form>
              <button onClick={() => setStep(2)} className="secondary-button-back">← Mbrapa</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookingApp;