import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { api } from "../../../index";
import "../../appointments/style/BookingApp.css";
import "../../appointments/style/CustomCalendar.css";
import PhoneInputField from "../../phoneInputs/script/PhoneInputField";
import { useFingerprint } from "../../../hooks/useFingerprint";

const STORAGE_KEY = "planora_user_info";

const MUAJT = [
  'Janar', 'Shkurt', 'Mars', 'Prill', 'Maj', 'Qershor',
  'Korrik', 'Gusht', 'Shtator', 'Tetor', 'Nëntor', 'Dhjetor'
];

const DITET = ['Die', 'Hën', 'Mar', 'Mër', 'Enj', 'Pre', 'Sht'];

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

const getSavedUserInfo = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : { name: "", email: "", phone: "" };
  } catch {
    return { name: "", email: "", phone: "" };
  }
};

const saveUserInfo = (info) => {
  try {
    if (info.name || info.email || info.phone) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(info));
    }
  } catch {}
};

const scrollTo = (ref) => {
  if (ref?.current) {
    setTimeout(() => {
      ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }
};

const BookingApp = () => {
  const { shopSlug, employeeSlug } = useParams();
  const navigate = useNavigate();
  const fingerprint = useFingerprint();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [details, setDetails] = useState({ employees: [], services: [] });
  const [slots, setSlots] = useState([]);
  const [blockedDates, setBlockedDates] = useState([]);

  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [userInfo, setUserInfo] = useState(getSavedUserInfo);
  const [isAutofilled, setIsAutofilled] = useState(false);
  const [autoSelectedEmployee, setAutoSelectedEmployee] = useState(null);

  const servicesRef = useRef(null);
  const nextBtnRef = useRef(null);
  const slotsRef = useRef(null);

  useEffect(() => {
    const saved = getSavedUserInfo();
    if (saved.name || saved.email || saved.phone) {
      setIsAutofilled(true);
    }
  }, []);

  const initApp = useCallback(async () => {
    if (!shopSlug) return;
    setLoading(true);
    try {
      const res = await api.get(`/public/businesses/details/${shopSlug}`);
      const businessData = res.data.business || res.data.data || res.data;
      setDetails(businessData);
      setSelectedBusiness(businessData.id);

      // Auto-select employee if employeeSlug is in URL
      if (employeeSlug && businessData.employees?.length > 0) {
        const empId = parseInt(employeeSlug.split('-').pop());
        const found = businessData.employees.find(e => e.id === empId);
        if (found) {
          setSelectedBarber(found.id);
          setAutoSelectedEmployee(found);
        }
      }
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [shopSlug, employeeSlug]);

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

  const fetchBlockedDates = useCallback(async (year, month) => {
    if (!selectedBarber || !selectedServices.length || !selectedBusiness) return;
    try {
      const res = await api.get(`/public/business/${selectedBarber}/blocked-dates`, {
        params: {
          employee_id: selectedBarber,
          service_ids: selectedServices,
          year,
          month,
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
      });
      setBlockedDates(res.data);
    } catch {
      setBlockedDates([]);
    }
  }, [selectedBarber, selectedServices, selectedBusiness]);

  useEffect(() => {
    if (selectedDate && step === 2) fetchSlots();
  }, [selectedDate, fetchSlots, step]);

  useEffect(() => {
    if (step === 2) {
      const now = new Date();
      fetchBlockedDates(now.getFullYear(), now.getMonth() + 1);
    }
  }, [step, fetchBlockedDates]);

  const handleBarberSelect = (empId) => {
    setSelectedBarber(empId);
    scrollTo(servicesRef);
  };

  const toggleService = (serviceId) => {
    setSelectedServices((prev) => {
      const isSelected = prev.includes(serviceId);
      const updated = isSelected
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId];
      if (!isSelected) {
        scrollTo(nextBtnRef);
      }
      return updated;
    });
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    setSlots([]);
    setTimeout(() => {
      if (slotsRef?.current) {
        slotsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 300);
  };

  const handleUserInfoChange = (field, value) => {
    const updated = { ...userInfo, [field]: value };
    setUserInfo(updated);
    saveUserInfo(updated);
  };

  const handleFinalBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    saveUserInfo(userInfo);
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
        fingerprint: fingerprint,
      });

      if (response.data.status === "success") {
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
    if (date < today) return true;
    const dateStr = getLocalDateString(date);
    return blockedDates.includes(dateStr);
  };

  const selectedServiceObjects =
    details.services?.filter((s) => selectedServices.includes(s.id)) || [];
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
        <aside className="shop-sidebar">
          <h1>{details.shop_name || "Planora"}</h1>
          <div className="sidebar-info-item">
            📍 {details.address || "Kosovë"}
          </div>

          {/* Show auto-selected employee badge */}
          {autoSelectedEmployee && (
            <div style={{
              marginTop: '16px',
              background: 'rgba(37, 99, 235, 0.08)',
              border: '1px solid rgba(37, 99, 235, 0.2)',
              borderRadius: '12px',
              padding: '10px 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: '#2563eb', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '0.9rem', flexShrink: 0
              }}>
                {autoSelectedEmployee.user?.name?.charAt(0)}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#2563eb', fontWeight: '600' }}>
                  Punonjësi juaj
                </p>
                <p style={{ margin: 0, fontSize: '0.88rem', fontWeight: '700', color: '#1e293b' }}>
                  {autoSelectedEmployee.user?.name} {autoSelectedEmployee.user?.surname}
                </p>
              </div>
            </div>
          )}

          {step >= 3 && selectedServiceObjects.length > 0 && (
            <div className="fade-in summary-container" style={{ marginTop: "40px", borderTop: "2px solid #e2e8f0", paddingTop: "20px" }}>
              <p className="summary-label">PËRMBLEDHJA</p>
              {selectedServiceObjects.map((s) => (
                <div key={s.id} style={{ marginTop: "10px" }}>
                  <h3 style={{ margin: "0 0 3px 0", fontSize: "0.95rem" }}>
                    {s.service_name || s.name}
                  </h3>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span className="service-duration">
                      🕒 {parseDurationToMinutes(s.service_duration || s.duration)} min
                    </span>
                    <span style={{ fontWeight: "700" }}>
                      {s.service_price || s.price}€
                    </span>
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

        <main className="booking-main">
          {step < 4 && (
            <div className="step-indicator">
              {[1, 2, 3].map((i) => (
                <div key={i} className={`step-dot ${step >= i ? "active" : ""}`} />
              ))}
            </div>
          )}

          {step === 1 && (
            <div className="fade-in">
              <h2 className="section-title">
                {autoSelectedEmployee
                  ? `Zgjidhni shërbimet`
                  : `Zgjidhni punonjësin dhe shërbimet`
                }
              </h2>

              {/* Hide employee selection if auto-selected */}
              {!autoSelectedEmployee && (
                <div className="wide-grid">
                  {details.employees?.map((emp) => (
                    <div
                      key={emp.id}
                      className={`service-row ${selectedBarber === emp.id ? "active" : ""}`}
                      onClick={() => handleBarberSelect(emp.id)}
                    >
                      <strong>
                        {emp.user?.name} {emp.user?.surname}
                      </strong>
                    </div>
                  ))}
                </div>
              )}

              {/* Show selected employee info if auto-selected */}
              {autoSelectedEmployee && (
                <div style={{
                  background: '#f8fafc',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '20px'
                }}>
                  <div style={{
                    width: '42px', height: '42px', borderRadius: '50%',
                    background: '#2563eb', color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '1rem', flexShrink: 0
                  }}>
                    {autoSelectedEmployee.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: '600' }}>
                      Punonjësi i zgjedhur
                    </p>
                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: '700', color: '#1e293b' }}>
                      {autoSelectedEmployee.user?.name} {autoSelectedEmployee.user?.surname}
                    </p>
                  </div>
                </div>
              )}

              <div ref={servicesRef} style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
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
                      <span style={{ fontSize: "18px" }}>
                        {selectedServices.includes(s.id) ? "✅" : "⬜"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div ref={nextBtnRef}>
                <button
                  className="primary-button"
                  style={{ marginTop: "30px" }}
                  disabled={!selectedBarber || !selectedServices.length}
                  onClick={() => setStep(2)}
                >
                  Vazhdo te Oraret
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="fade-in">
              <h2 className="section-title">Zgjidhni Datën & Orën</h2>
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                minDate={new Date()}
                tileDisabled={({ date }) => isDateDisabled(date)}
                tileClassName={({ date }) => {
                  const dateStr = getLocalDateString(date);
                  return blockedDates.includes(dateStr) ? "date-blocked" : null;
                }}
                onActiveStartDateChange={({ activeStartDate }) => {
                  fetchBlockedDates(
                    activeStartDate.getFullYear(),
                    activeStartDate.getMonth() + 1
                  );
                }}
                formatMonthYear={(locale, date) =>
                  `${MUAJT[date.getMonth()]} ${date.getFullYear()}`
                }
                formatMonth={(locale, date) => MUAJT[date.getMonth()]}
                formatShortWeekday={(locale, date) => DITET[date.getDay()]}
                maxDetail="month"
                prev2Label={null}
                next2Label={null}
              />

              {selectedDate && (
                <div ref={slotsRef} style={{ marginTop: "40px" }}>
                  <h3 className="section-title" style={{ fontSize: "1.1rem" }}>
                    Oraret e lira
                  </h3>
                  {loading ? (
                    <div className="planora-loader-small"></div>
                  ) : (
                    <div className="slot-grid">
                      {slots.length > 0 ? (
                        slots.map((t) => (
                          <button
                            key={t}
                            className={`slot-btn ${selectedTime === t ? "selected" : ""}`}
                            onClick={() => {
                              setSelectedTime(t);
                              setStep(3);
                            }}
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
              <button onClick={() => setStep(1)} className="secondary-button-back">
                ← Mbrapa
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="fade-in">
              <h2 className="section-title">Të dhënat tuaja</h2>
              {isAutofilled && (
                <div className="autofill-notice">
                  <span>✓ Të dhënat u plotësuan automatikisht</span>
                  <button
                    type="button"
                    className="autofill-clear"
                    onClick={() => {
                      const empty = { name: "", email: "", phone: "" };
                      setUserInfo(empty);
                      localStorage.removeItem(STORAGE_KEY);
                      setIsAutofilled(false);
                    }}
                  >
                    Pastro
                  </button>
                </div>
              )}
              <form onSubmit={handleFinalBooking}>
                <input
                  className="booking-input"
                  placeholder="Emri i plotë"
                  required
                  value={userInfo.name}
                  onChange={(e) => handleUserInfoChange("name", e.target.value)}
                />
                <input
                  className="booking-input"
                  type="email"
                  placeholder="Email adresa"
                  required
                  value={userInfo.email}
                  onChange={(e) => handleUserInfoChange("email", e.target.value)}
                />
                <PhoneInputField
                  value={userInfo.phone}
                  onChange={(val) => handleUserInfoChange("phone", val)}
                />
                <button
                  type="submit"
                  className="primary-button"
                  style={{ marginTop: "20px" }}
                  disabled={loading}
                >
                  {loading ? "Duke u rezervuar..." : "Konfirmo Termin"}
                </button>
              </form>
              <button onClick={() => setStep(2)} className="secondary-button-back">
                ← Mbrapa
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BookingApp;