import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../../index";
import "../style/AppointmentConfirmed.css";

const AppointmentConfirmed = () => {
  const [searchParams] = useSearchParams();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const id = searchParams.get("id");

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const res = await api.get(`/public/appointments/details/${id}`);
        setAppointment(res.data.appointment);
      } catch (err) {
        setError("Termini nuk u gjet.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAppointment();
    else {
      setError("ID e terminit mungon.");
      setLoading(false);
    }
  }, [id]);

  if (loading)
    return (
      <div className="confirmed-wrapper">
        <div className="confirmed-card">
          <div className="planora-loader-big" />
        </div>
      </div>
    );

  if (error)
    return (
      <div className="confirmed-wrapper">
        <div className="confirmed-card">
          <div className="confirmed-icon">❌</div>
          <h2 className="confirmed-title">Gabim</h2>
          <p className="confirmed-subtitle">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="confirmed-wrapper">
      <div className="confirmed-card">
        <div className="confirmed-icon">✅</div>
        <h2 className="confirmed-title">Termini u Konfirmua!</h2>
        <p className="confirmed-subtitle">
          Faleminderit! Termini juaj është konfirmuar me sukses.
        </p>

        <div className="confirmed-details-box">
          <div className="confirmed-row">
            <span className="confirmed-label">👤 Emri</span>
            <span className="confirmed-value">{appointment.client_name}</span>
          </div>
          <div className="confirmed-row">
            <span className="confirmed-label">✂️ Shërbimi</span>
            <span className="confirmed-value">{appointment.service}</span>
          </div>
          <div className="confirmed-row">
            <span className="confirmed-label">👨‍💼 Punonjësi</span>
            <span className="confirmed-value">{appointment.employee}</span>
          </div>
          <div className="confirmed-row">
            <span className="confirmed-label">🏪 Biznesi</span>
            <span className="confirmed-value">{appointment.business}</span>
          </div>
          <div className="confirmed-row">
            <span className="confirmed-label">📅 Data & Ora</span>
            <span className="confirmed-value">{appointment.start_time}</span>
          </div>
          <div className="confirmed-row">
            <span className="confirmed-label">⏰ Përfundon</span>
            <span className="confirmed-value">{appointment.finish_time}</span>
          </div>
          <div className="confirmed-row" style={{ borderBottom: "none" }}>
            <span className="confirmed-label">📊 Statusi</span>
            <span className={`status-pill ${appointment.status}`}>
              {appointment.status}
            </span>
          </div>
        </div>

        <button
          className="confirmed-btn-primary"
          onClick={() => (window.location.href = "/")}
        >
          Kthehu në Faqen Kryesore
        </button>

        {appointment.status !== "canceled" && appointment.cancel_url && (
          <a
            href={appointment.cancel_url}
            className="confirmed-btn-cancel"
            onClick={(e) => {
              if (!window.confirm("A jeni i sigurt?")) e.preventDefault();
            }}
          >
            Anulo Terminin
          </a>
        )}

        <p className="confirmed-footer">
          © 2026 Planora. Të gjitha të drejtat e rezervuara.
        </p>
      </div>
    </div>
  );
};

export default AppointmentConfirmed;
