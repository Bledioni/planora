import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, AlertCircle } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import '../style/MySchedule.css';

const MySchedule = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [employeeId, setEmployeeId] = useState(null);

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

    // Hook 1: Vetëm për inicializimin e employeeId
    useEffect(() => {
        const init = async () => {
            try {
                const res = await api.get('/owner/analytics/owner-schedule');
                if (res.data.is_employee) {
                    setEmployeeId(res.data.employee_id);
                } else {
                    setLoading(false);
                }
            } catch (err) { 
                setLoading(false); 
            }
        };
        init();
    }, []);

    // Hook 2: Merr takimet kur ndryshon data ose ID-ja
    useEffect(() => {
        const fetchApts = async () => {
            if (!employeeId) return;
            setLoading(true);
            try {
                const res = await api.get('/owner/appointments/list', { 
                    params: { date: selectedDate, employee_id: employeeId } 
                });
                setAppointments(res.data.appointments || []);
            } catch (err) {
                console.error("Error fetching appointments:", err);
            } finally { 
                setLoading(false); 
            }
        };

        fetchApts();
    }, [selectedDate, employeeId]); // Tani është 100% OK dhe pa warning

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">
                <div className="schedule-header-big">
                    <div className="header-top-tag">
                        <LayoutDashboard size={20} />
                        <span>MENAXHIMI I ORARIT</span>
                    </div>
                    <h1>Mirësevini në orarin tuaj</h1>
                    <p>Shikoni dhe menaxhoni të gjitha takimet tuaja në një vend.</p>
                </div>

                <div className="schedule-container-wide">
                    <div className="planora-calendar-big">
                        <button className="nav-btn-big" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() - 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}><ChevronLeft size={24} /></button>

                        <div className="days-grid">
                            {calendarDays.map((day) => (
                                <div 
                                    key={day.full} 
                                    className={`day-box ${day.full === selectedDate ? 'active' : ''}`} 
                                    onClick={() => setSelectedDate(day.full)}
                                >
                                    <span className="day-name-txt">{day.dayName}</span>
                                    <span className="day-num-txt">{day.dayNum}</span>
                                    {day.full === new Date().toISOString().split('T')[0] && <div className="today-indicator"></div>}
                                </div>
                            ))}
                        </div>

                        <button className="nav-btn-big" onClick={() => {
                            const d = new Date(selectedDate); d.setDate(d.getDate() + 1);
                            setSelectedDate(d.toISOString().split('T')[0]);
                        }}><ChevronRight size={24} /></button>
                    </div>

                    <div className="appointments-list-wrapper">
                        {loading ? <div className="planora-loader-big"></div> : (
                            <div className="timeline-container">
                                {appointments.length > 0 ? appointments.map(apt => (
                                    <div key={apt.id} className="timeline-row">
                                        <div className="time-column">
                                            <span className="time-text">{apt.appointment_time.slice(0,5)}</span>
                                            <div className={`vertical-line ${apt.status}`}></div>
                                        </div>
                                        <div className={`appointment-card-large ${apt.status === 'cancelled' ? 'is-cancelled' : ''}`}>
                                            <div className="client-section">
                                                <div className="avatar-circle">
                                                    {apt.status === 'cancelled' ? <AlertCircle size={24} /> : apt.client_name?.charAt(0)}
                                                </div>
                                                <div className="client-details">
                                                    <h3>{apt.client_name}</h3>
                                                    <span className="service-txt">{apt.service?.name}</span>
                                                </div>
                                            </div>
                                            <div className="card-right-info">
                                                <span className="price-tag">{apt.service?.price}€</span>
                                                <span className={`status-pill ${apt.status}`}>{apt.status}</span>
                                            </div>
                                        </div>
                                    </div>
                                )) : <div className="empty-schedule-card">Nuk ka terminë për këtë ditë.</div>}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MySchedule;