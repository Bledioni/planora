import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Ndryshuar nga useSearchParams
import { api } from "../../../index";
import "../style/AppointmentConfirmed.css";

const AppointmentConfirmed = () => {
  const { id } = useParams(); // Tani e merr ID-në direkt nga URL: /appointment/:id
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        // Sigurohu që ky endpoint në Laravel është: Route::get('/public/appointments/details/{id}', ...)
        const res = await api.get(`/public/appointments/details/${id}`);
        setAppointment(res.data.appointment);
      } catch (err) {
        console.error(err);
        setError("Termini nuk u gjet ose ka ndodhur një gabim.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAppointment();
  }, [id]);

  if (loading)
    return (
      <div className="confirmed-wrapper">
        <div className="confirmed-card">
          <div className="planora-loader-big" />
          <p style={{ marginTop: '20px', color: '#64748b' }}>Duke ngarkuar detajet...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="confirmed-wrapper">
        <div className="confirmed-card">
          <div className="confirmed-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>❌</div>
          <h2 className="confirmed-title">Gabim</h2>
          <p className="confirmed-subtitle">{error}</p>
          <button className="confirmed-btn-primary" onClick={() => navigate("/")}>
            Kthehu në Ballinë
          </button>
        </div>
      </div>
    );

  return (
    <div className="confirmed-wrapper">
      <div className="confirmed-card fade-in">
        <div className="confirmed-icon">✅</div>
        <h2 className="confirmed-title">Termini u Konfirmua!</h2>
        <p className="confirmed-subtitle">
          Rezervimi juaj në <strong>{appointment.business}</strong> u krye me sukses.
        </p>

        <div className="confirmed-details-box">
          <div className="confirmed-row">
            <span className="confirmed-label">👤 Klienti</span>
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
            <span className="confirmed-label">📅 Data & Ora</span>
            <span className="confirmed-value">{appointment.start_time}</span>
          </div>
          <div className="confirmed-row" style={{ borderBottom: "none" }}>
            <span className="confirmed-label">📊 Statusi</span>
            <span className={`status-pill ${appointment.status}`}>
              {appointment.status === 'confirmed' ? 'I konfirmuar' : appointment.status}
            </span>
          </div>
        </div>

        <div className="confirmed-actions">
            <button
            className="confirmed-btn-primary"
            onClick={() => navigate("/")}
            >
            Kthehu në Faqen Kryesore
            </button>

            {appointment.status !== "canceled" && appointment.cancel_url && (
            <a
                href={appointment.cancel_url}
                className="confirmed-btn-cancel"
                onClick={(e) => {
                if (!window.confirm("A jeni i sigurt që dëshironi të anuloni terminin?")) {
                    e.preventDefault();
                }
                }}
            >
                Anulo Terminin
            </a>
            )}
        </div>

        <p className="confirmed-footer">
          © {new Date().getFullYear()} Planora. Rezervime të shpejta dhe të sigurta.
        </p>
      </div>
    </div>
  );
};

export default AppointmentConfirmed;