import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, AlertCircle, Clock } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import '../style/MySchedule.css';

const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MySchedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
    const [employeeId, setEmployeeId] = useState(null);
    const [cache, setCache] = useState({});
    const [businessStatus, setBusinessStatus] = useState(null);
    const [dayCounts, setDayCounts] = useState({});

    const calendarDays = useMemo(() => {
        const days = [];
        const [year, month, day] = selectedDate.split('-').map(Number);
        for (let i = -3; i <= 3; i++) {
            const d = new Date(year, month - 1, day + i);
            days.push({
                full: getLocalDateString(d),
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
        fetchBusinessStatus();
    }, []);

    useEffect(() => {
        if (!employeeId) return;

        const fetchCounts = async () => {
            const counts = {};
            await Promise.all(calendarDays.map(async (day) => {
                const cacheKey = `count_${employeeId}_${day.full}`;
                if (cache[cacheKey] !== undefined) {
                    counts[day.full] = cache[cacheKey];
                    return;
                }
                try {
                    const res = await api.get('/owner/appointments/list', {
                        params: { date: day.full, employee_id: employeeId }
                    });
                    const data = res.data.appointments || [];
                    const count = data.filter(a => a.status !== 'canceled').length;
                    counts[day.full] = count;
                    setCache(prev => ({ ...prev, [cacheKey]: count }));
                } catch {
                    counts[day.full] = 0;
                }
            }));
            setDayCounts(counts);
        };

        fetchCounts();
    }, [calendarDays, employeeId]);

    const fetchBusinessStatus = async () => {
        try {
            const res = await api.get('/owner/business/my-business');
            setBusinessStatus(res.data.business?.user?.status);
        } catch (err) {
            console.error('Error fetching business status:', err);
        }
    };

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
        const [year, month, day] = selectedDate.split('-').map(Number);
        const d = new Date(year, month - 1, day + dir);
        setSelectedDate(getLocalDateString(d));
    };

    const activeApts = sortedAppointments.filter(a => a.status !== 'canceled');
    const canceledApts = sortedAppointments.filter(a => a.status === 'canceled');
    const today = getLocalDateString(new Date());

    const formattedDate = new Date(
        ...selectedDate.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v))
    ).toLocaleDateString('sq-AL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">

                {businessStatus && businessStatus !== 'active' && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '20px',
                        color: '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontWeight: '500',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={18} />
                        <span>⚠️ Biznesi juaj është i çaktivizuar. Klientët nuk mund të bëjnë rezervime. Kontaktoni administratorin.</span>
                    </div>
                )}

                <div className="schedule-header-big">
                    <div className="header-top-tag">
                        <CalendarDays size={13} />
                        <span>Orari Im</span>
                    </div>
                    <h1>Terminet e Mia</h1>
                    <p>{formattedDate}</p>
                </div>

                <div className="schedule-container-wide">

                    <div className="planora-calendar-big">
                        <button className="nav-btn-big" onClick={() => navigate(-1)}>
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
                                    {dayCounts[day.full] > 0 && (
                                        <span className="day-count-badge">
                                            {dayCounts[day.full]}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className="nav-btn-big" onClick={() => navigate(1)}>
                            <ChevronRight size={18} />
                        </button>
                    </div>

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