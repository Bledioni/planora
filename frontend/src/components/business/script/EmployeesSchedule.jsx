import React, { useState, useEffect, useMemo } from 'react';
import { Users, ChevronLeft, ChevronRight, LayoutDashboard, AlertCircle } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import '../style/EmployeesSchedule.css';

const EmployeesSchedule = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [cache, setCache] = useState({});

    const calendarDays = useMemo(() => {
        const days = [];
        const start = new Date(selectedDate);
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
        fetchEmployees();
    }, []);

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
                    api.put(`/owner/appointments/update-status/${id}`, { status: 'canceled' })
                )
            );
            const updated = appointments.map(a =>
                JSON.stringify(a.ids) === JSON.stringify(apt.ids)
                    ? { ...a, status: 'canceled' }
                    : a
            );
            setAppointments(updated);
            const cacheKey = `${selectedEmployee}_${selectedDate}`;
            setCache(prev => ({ ...prev, [cacheKey]: updated }));
        } catch (err) {
            alert('Gabim gjatë anulimit të terminit.');
        }
    };

    const activeApts = sortedAppointments.filter(a => a.status !== 'canceled');
    const canceledApts = sortedAppointments.filter(a => a.status === 'canceled');
    const selectedEmp = employees.find(e => e.id === selectedEmployee);

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
                        <button className="nav-btn-big" onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() - 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
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
                                    {day.full === new Date().toISOString().split('T')[0] && (
                                        <div className="today-indicator"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className="nav-btn-big" onClick={() => {
                            const d = new Date(selectedDate);
                            d.setDate(d.getDate() + 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}>
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

                                {canceledApts.length > 0 && (
                                    <>
                                        <div style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            color: '#ef4444',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.08em',
                                            padding: '16px 0 8px',
                                            borderTop: '1px dashed #fecaca',
                                            marginTop: '8px'
                                        }}>
                                            Terminet e Anuluara
                                        </div>
                                        {canceledApts.map(apt => (
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
                                                            canceled
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