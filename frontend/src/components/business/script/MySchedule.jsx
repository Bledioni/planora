
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, AlertCircle, Clock, Banknote } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import '../style/MySchedule.css';

const MySchedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [employeeId, setEmployeeId] = useState(null);
    const [cache, setCache] = useState({});

    const calendarDays = useMemo(() => {
    const days = [];
    const start = new Date(selectedDate + 'T00:00:00');
    start.setDate(start.getDate() - 3);
    for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push({
            full: d.toISOString().split('T')[0],
            dayNum: d.getDate(),
            dayName: d.toLocaleDateString('sq-AL', { weekday: 'short' })
        });
    }
    return days;
}, [selectedDate]);

    const sortedAppointments = useMemo(() => {
        const active = appointments
            .filter(a => a.status !== 'canceled')
            .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
        const canceled = appointments
            .filter(a => a.status === 'canceled')
            .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
        return [...active, ...canceled];
    }, [appointments]);

    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/owner/analytics/owner-schedule');
                if (res.data.is_employee) {
                    setEmployeeId(res.data.employee_id);
                } else {
                    setLoading(false);
                }
            } catch {
                setLoading(false);
            }
        };
        init();
    }, []);

    useEffect(() => {
        const fetchApts = async () => {
            if (!employeeId) return;
            if (cache[selectedDate]) {
                setAppointments(cache[selectedDate]);
                return;
            }
            setLoading(true);
            try {
                const res = await api.get('/owner/appointments/list', {
                    params: { date: selectedDate, employee_id: employeeId }
                });
                const data = res.data.appointments || [];
                setCache(prev => ({ ...prev, [selectedDate]: data }));
                setAppointments(data);
            } catch (err) {
                console.error("Error fetching appointments:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchApts();
    }, [selectedDate, employeeId]);

    const handleCancel = async (apt) => {
        if (!window.confirm('A jeni i sigurt që dëshironi të anuloni këtë termin?')) return;
        try {
            await Promise.all(
                apt.ids.map(id =>
                    api.put(`/owner/appointments/update-status/${id}`, { status: 'canceled' })
                )
            );
            const updated = appointments.map(a =>
                JSON.stringify(a.ids) === JSON.stringify(apt.ids)
                    ? { ...a, status: 'canceled' }
                    : a
            );
            setAppointments(updated);
            setCache(prev => ({ ...prev, [selectedDate]: updated }));
        } catch {
            alert('Gabim gjatë anulimit të terminit.');
        }
    };

    const navigate = (dir) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + dir);
        setSelectedDate(d.toISOString().split('T')[0]);
    };

    const activeApts = sortedAppointments.filter(a => a.status !== 'canceled');
    const canceledApts = sortedAppointments.filter(a => a.status === 'canceled');
    const today = new Date().toISOString().split('T')[0];

    const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('sq-AL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">

                {/* Header */}
                <div className="schedule-header-big">
                    <div className="header-top-tag">
                        <CalendarDays size={13} />
                        <span>Orari Im</span>
                    </div>
                    <h1>Terminet e Mia</h1>
                    <p>{formattedDate}</p>
                </div>

                <div className="schedule-container-wide">

                    {/* Calendar Strip */}
                    <div className="planora-calendar-big">
                        <button className="nav-btn-big" onClick={() => navigate(-1)} aria-label="Dita e mëparshme">
                            <ChevronLeft size={18} />
                        </button>

                        <div className="days-grid">
                            {calendarDays.map((day) => (
                                <div
                                    key={day.full}
                                    className={`day-box ${day.full === selectedDate ? 'active' : ''}`}
                                    onClick={() => setSelectedDate(day.full)}
                                >
                                    <span className="day-name-txt">{day.dayName}</span>
                                    <span className="day-num-txt">{day.dayNum}</span>
                                    {day.full === today && <div className="today-indicator" />}
                                </div>
                            ))}
                        </div>

                        <button className="nav-btn-big" onClick={() => navigate(1)} aria-label="Dita tjetër">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Appointments */}
                    <div className="appointments-list-wrapper">
                        {loading ? (
                            <div className="planora-loader-big" />
                        ) : (
                            <div className="timeline-container">

                                {appointments.length === 0 && (
                                    <div className="empty-schedule-card">
                                        <CalendarDays size={40} />
                                        Nuk ka terminë për këtë ditë.
                                    </div>
                                )}

                                {activeApts.map((apt, i) => (
                                    <div
                                        key={apt.ids.join('-')}
                                        className="timeline-row"
                                        style={{ animationDelay: `${i * 0.04}s` }}
                                    >
                                        <div className="appointment-card-large">
                                            <div className="client-section">
                                                <div className="avatar-circle">
                                                    {apt.client_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="client-details">
                                                    <h3>{apt.client_name}</h3>
                                                    <span className="service-txt">
                                                        {apt.services.map(s => s?.name).filter(Boolean).join(' · ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-right-info">
                                                <span className="apt-time-tag">
                                                    <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                    {apt.appointment_time?.slice(0, 5)}
                                                </span>
                                                <span className="price-tag">
                                                    {Number(apt.total_price).toFixed(2)}€
                                                </span>
                                                <span className={`status-pill ${apt.status}`}>
                                                    {apt.status}
                                                </span>
                                                {apt.status !== 'completed' && (
                                                    <button onClick={() => handleCancel(apt)} className="cancel-btn">
                                                        Anulo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {canceledApts.length > 0 && (
                                    <>
                                        <div className="canceled-section-label">
                                            <AlertCircle size={13} />
                                            Terminet e Anuluara
                                        </div>
                                        {canceledApts.map((apt) => (
                                            <div key={apt.ids.join('-')} className="timeline-row">
                                                <div className="appointment-card-large is-cancelled">
                                                    <div className="client-section">
                                                        <div className="avatar-circle">
                                                            <AlertCircle size={18} />
                                                        </div>
                                                        <div className="client-details">
                                                            <h3>{apt.client_name}</h3>
                                                            <span className="service-txt">
                                                                {apt.services.map(s => s?.name).filter(Boolean).join(' · ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="card-right-info">
                                                        <span className="apt-time-tag">
                                                            <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                            {apt.appointment_time?.slice(0, 5)}
                                                        </span>
                                                        <span className="price-tag">
                                                            {Number(apt.total_price).toFixed(2)}€
                                                        </span>
                                                        <span className="status-pill canceled">
                                                            anuluar
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MySchedule;
