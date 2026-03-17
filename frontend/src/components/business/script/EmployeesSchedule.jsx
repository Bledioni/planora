import React, { useState, useEffect, useMemo } from 'react';
import { Users, ChevronLeft, ChevronRight, LayoutDashboard, AlertCircle } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import '../style/EmployeesSchedule.css';

const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const EmployeesSchedule = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(() => getLocalDateString(new Date()));
    const [cache, setCache] = useState({});
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
            .filter(a => a.status !== 'cancelled')
            .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
        const cancelled = appointments
            .filter(a => a.status === 'cancelled')
            .sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
        return [...active, ...cancelled];
    }, [appointments]);

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (!selectedEmployee) return;

        const fetchCounts = async () => {
            const counts = {};
            await Promise.all(calendarDays.map(async (day) => {
                const cacheKey = `${selectedEmployee}_${day.full}`;
                if (cache[cacheKey]) {
                    counts[day.full] = cache[cacheKey].filter(a => a.status !== 'cancelled').length;
                    return;
                }
                try {
                    const res = await api.get('/owner/appointments/list', {
                        params: { date: day.full, employee_id: selectedEmployee }
                    });
                    const data = res.data.appointments || [];
                    counts[day.full] = data.filter(a => a.status !== 'cancelled').length;
                } catch {
                    counts[day.full] = 0;
                }
            }));
            setDayCounts(counts);
        };

        fetchCounts();
    }, [calendarDays, selectedEmployee]);

    useEffect(() => {
        if (!selectedEmployee) return;

        const cacheKey = `${selectedEmployee}_${selectedDate}`;

        if (cache[cacheKey]) {
            setAppointments(cache[cacheKey]);
            return;
        }

        const fetchApts = async () => {
            setLoading(true);
            try {
                const res = await api.get('/owner/appointments/list', {
                    params: { date: selectedDate, employee_id: selectedEmployee }
                });
                const data = res.data.appointments || [];
                setCache(prev => ({ ...prev, [cacheKey]: data }));
                setAppointments(data);
            } catch (err) {
                console.error('Error fetching appointments:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchApts();
    }, [selectedEmployee, selectedDate]);

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/owner/analytics/employees-schedules');
            setEmployees(res.data.employees || []);
            if (res.data.employees?.length > 0) {
                setSelectedEmployee(res.data.employees[0].id);
            }
        } catch (err) {
            console.error('Error fetching employees:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (apt) => {
        if (!window.confirm('A jeni i sigurt që dëshironi të anuloni këtë termin?')) return;
        try {
            await Promise.all(
                apt.ids.map(id =>
                    api.put(`/owner/appointments/update-status/${id}`, { status: 'cancelled' })
                )
            );
            const updated = appointments.map(a =>
                JSON.stringify(a.ids) === JSON.stringify(apt.ids)
                    ? { ...a, status: 'cancelled' }
                    : a
            );
            setAppointments(updated);
            const cacheKey = `${selectedEmployee}_${selectedDate}`;
            setCache(prev => ({ ...prev, [cacheKey]: updated }));
        } catch (err) {
            alert('Gabim gjatë anulimit të terminit.');
        }
    };

    const navigate = (dir) => {
        const [year, month, day] = selectedDate.split('-').map(Number);
        const d = new Date(year, month - 1, day + dir);
        setSelectedDate(getLocalDateString(d));
    };

    const activeApts = sortedAppointments.filter(a => a.status !== 'cancelled');
    const cancelledApts = sortedAppointments.filter(a => a.status === 'cancelled');
    const selectedEmp = employees.find(e => e.id === selectedEmployee);
    const today = getLocalDateString(new Date());

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">
                <div className="schedule-header-big">
                    <div className="header-top-tag">
                        <LayoutDashboard size={20} />
                        <span>MENAXHIMI I ORARIT TË PUNONJËSVE</span>
                    </div>
                    <h1>Orari i {selectedEmp?.name || 'Punonjësve'}</h1>
                    <p>Menaxhoni terminët dhe disponueshmërinë e stafit tuaj</p>
                </div>

                <div className="schedule-container-wide">
                    <div className="emp-selector-card">
                        <Users size={20} />
                        <select
                            value={selectedEmployee || ''}
                            onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="planora-calendar-big">
                        <button className="nav-btn-big" onClick={() => navigate(-1)}>
                            <ChevronLeft size={24} />
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
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="appointments-list-wrapper">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : (
                            <div className="timeline-container">
                                {appointments.length === 0 && (
                                    <div className="empty-schedule-card">
                                        Nuk ka terminë për këtë ditë.
                                    </div>
                                )}

                                {activeApts.length > 0 && activeApts.map(apt => (
                                    <div key={apt.ids.join('-')} className="timeline-row">
                                        <div className="appointment-card-large">
                                            <div className="client-section">
                                                <div className="avatar-circle">
                                                    {apt.client_name?.charAt(0)}
                                                </div>
                                                <div className="client-details">
                                                    <h3>{apt.client_name}</h3>
                                                    <span className="service-txt">
                                                        {apt.services.map(s => s?.name).filter(Boolean).join(' + ')}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-right-info">
                                                <span className="apt-time-tag">
                                                    {apt.appointment_time?.slice(0, 5)}
                                                </span>
                                                <span className="price-tag">
                                                    {Number(apt.total_price).toFixed(2)}€
                                                </span>
                                                <span className={`status-pill ${apt.status}`}>
                                                    {apt.status}
                                                </span>
                                                {apt.status !== 'completed' && (
                                                    <button
                                                        onClick={() => handleCancel(apt)}
                                                        className="cancel-btn"
                                                    >
                                                        Anulo
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {cancelledApts.length > 0 && (
                                    <>
                                        <div className="cancelled-section-label">
                                            <AlertCircle size={13} />
                                            Terminet e Anuluara
                                        </div>
                                        {cancelledApts.map(apt => (
                                            <div key={apt.ids.join('-')} className="timeline-row">
                                                <div className="appointment-card-large is-cancelled">
                                                    <div className="client-section">
                                                        <div className="avatar-circle">
                                                            <AlertCircle size={24} />
                                                        </div>
                                                        <div className="client-details">
                                                            <h3>{apt.client_name}</h3>
                                                            <span className="service-txt">
                                                                {apt.services.map(s => s?.name).filter(Boolean).join(' + ')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="card-right-info">
                                                        <span className="apt-time-tag">
                                                            {apt.appointment_time?.slice(0, 5)}
                                                        </span>
                                                        <span className="price-tag">
                                                            {Number(apt.total_price).toFixed(2)}€
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
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeesSchedule;