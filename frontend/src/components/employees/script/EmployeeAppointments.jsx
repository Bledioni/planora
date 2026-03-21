import { useEffect, useState, useCallback, useMemo } from 'react';
import { Clock, Phone, Scissors, Calendar, RefreshCw, AlertCircle, ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { api } from '../../../index';
import EmployeeSidebar from '../script/EmployeeSidebar';
import Swal from 'sweetalert2';
import '../style/EmployeeAppointments.css';

const getLocalDateString = (date) => {
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day   = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const EmployeeAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
    const [dayCounts, setDayCounts]       = useState({});
    const [cache, setCache]               = useState({});
    const [updatingId, setUpdatingId]     = useState(null);

    const calendarDays = useMemo(() => {
        const days = [];
        const [year, month, day] = selectedDate.split('-').map(Number);
        for (let i = -3; i <= 3; i++) {
            const d = new Date(year, month - 1, day + i);
            days.push({
                full:    getLocalDateString(d),
                dayNum:  d.getDate(),
                dayName: d.toLocaleDateString('sq-AL', { weekday: 'short' })
            });
        }
        return days;
    }, [selectedDate]);

    const fetchAppointments = useCallback(async (date) => {
        if (cache[date]) {
            setAppointments(cache[date]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const res = await api.get(`/employee/appointments/list`, { params: { date } });
            const data = res.data.appointments || [];
            setCache(prev => ({ ...prev, [date]: data }));
            setAppointments(data);
        } catch {
            Swal.fire('Gabim', 'Nuk mund të ngarkohen terminet.', 'error');
        } finally {
            setLoading(false);
        }
    }, [cache]);

    useEffect(() => {
        fetchAppointments(selectedDate);
    }, [selectedDate]);

    useEffect(() => {
        const controller = new AbortController();

        const fetchCounts = async () => {
            const counts = {};
            await Promise.all(calendarDays.map(async (day) => {
                const cacheKey = `count_${day.full}`;
                if (cache[cacheKey] !== undefined) {
                    counts[day.full] = cache[cacheKey];
                    return;
                }
                try {
                    const res = await api.get(`/employee/appointments/list`, {
                        params: { date: day.full },
                        signal: controller.signal
                    });
                    const data = res.data.appointments || [];
                    const count = data.filter(a => a.status !== 'canceled' && a.status !== 'cancelled').length;
                    counts[day.full] = count;
                    setCache(prev => ({ ...prev, [cacheKey]: count }));
                } catch (err) {
                    if (err.name !== 'CanceledError') counts[day.full] = 0;
                }
            }));
            if (!controller.signal.aborted) {
                setDayCounts(prev => ({ ...prev, ...counts }));
            }
        };

        const timer = setTimeout(fetchCounts, 300);
        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [selectedDate]);

    const updateStatus = async (ids, status) => {
        const firstId = Array.isArray(ids) ? ids[0] : ids;
        setUpdatingId(firstId);
        try {
            await Promise.all(
                (Array.isArray(ids) ? ids : [ids]).map(id =>
                    api.put(`/employee/appointments/update-status/${id}`, { status })
                )
            );
            Swal.fire({ icon: 'success', title: 'Sukses', text: 'Statusi u përditësua.', timer: 1500, showConfirmButton: false });
            setCache(prev => {
                const updated = { ...prev };
                delete updated[selectedDate];
                return updated;
            });
            fetchAppointments(selectedDate);
        } catch {
            Swal.fire('Gabim', 'Përditësimi dështoi.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const navigate = (dir) => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const d = new Date(year, month - 1, day + dir);
        setSelectedDate(getLocalDateString(d));
    };

    const activeApts   = appointments.filter(a => a.status !== 'canceled' && a.status !== 'cancelled');
    const canceledApts = appointments.filter(a => a.status === 'canceled' || a.status === 'cancelled');
    const today        = getLocalDateString(new Date());

    const formattedDate = new Date(
        ...selectedDate.split('-').map((v, i) => i === 1 ? Number(v) - 1 : Number(v))
    ).toLocaleDateString('sq-AL', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const getStatusClass = (status) => {
        const map = { completed: 'completed', cancelled: 'cancelled', canceled: 'canceled', no_show: 'pending', confirmed: 'confirmed' };
        return map[status] || 'pending';
    };

    return (
        <div className="owner-layout">
            <EmployeeSidebar />
            <main className="owner-main-content">

                <div className="schedule-header-big">
                    <div className="header-top-tag">
                        <CalendarDays size={13} />
                        <span>Terminet</span>
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

                    <div className="timeline-container">
                        {loading ? (
                            <div className="planora-loader-big" />
                        ) : appointments.length === 0 ? (
                            <div className="empty-schedule-card">
                                <CalendarDays size={40} />
                                <p>Nuk ka termine për këtë ditë.</p>
                            </div>
                        ) : (
                            <>
                                {activeApts.map((appt, i) => (
                                    <div
                                        key={appt.booking_id || appt.ids?.[0]}
                                        className="timeline-row"
                                        style={{ animationDelay: `${i * 0.04}s` }}
                                    >
                                        <div className="appointment-card-large">
                                            <div className="client-section">
                                                <div className="avatar-circle">
                                                    {appt.client_name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="client-details">
                                                    <h3>{appt.client_name}</h3>
                                                    <span className="service-txt">
                                                        {appt.services?.map(s => s.name).join(' + ') || 'Shërbim i panjohur'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="card-right-info">
                                                <span className="apt-time-tag">
                                                    <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                    {appt.appointment_time} — {appt.finish_time}
                                                </span>
                                                <span className="apt-time-tag">
                                                    <Phone size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                    {appt.client_phone || 'Pa numër'}
                                                </span>
                                                <span className="apt-time-tag">
                                                    <Scissors size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                    {appt.services?.reduce((acc, s) => {
                                                        if (!s.duration) return acc;
                                                        if (String(s.duration).includes(':')) {
                                                            const [h, m] = String(s.duration).split(':');
                                                            return acc + (parseInt(h) * 60) + parseInt(m);
                                                        }
                                                        return acc + parseInt(s.duration);
                                                    }, 0) || '—'} min
                                                </span>
                                                
                                                {appt.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateStatus(appt.ids, 'completed')}
                                                        className="ed-btn-complete"
                                                    >
                                                        {updatingId === appt.ids?.[0]
                                                            ? <RefreshCw size={14} className="spin" />
                                                            : '✓ U Konfirmua'
                                                        }
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
                                        {canceledApts.map((appt) => (
                                            <div key={appt.booking_id || appt.ids?.[0]} className="timeline-row">
                                                <div className="appointment-card-large is-cancelled">
                                                    <div className="client-section">
                                                        <div className="avatar-circle">
                                                            <AlertCircle size={18} />
                                                        </div>
                                                        <div className="client-details">
                                                            <h3>{appt.client_name}</h3>
                                                            <span className="service-txt">
                                                                {appt.services?.map(s => s.name).join(' + ') || 'Shërbim i panjohur'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="card-right-info">
                                                        <span className="apt-time-tag">
                                                            <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                            {appt.appointment_time}
                                                        </span>
                                                        <span className="status-pill cancelled">
                                                            anuluar
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeeAppointments;