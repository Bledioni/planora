import React, { useState, useEffect, useMemo } from 'react';
import { Users, Calendar, User as ChevronLeft, ChevronRight, LayoutDashboard } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import '../style/EmployeesSchedule.css';

const EmployeesSchedule = () => {
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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

    useEffect(() => {
        fetchEmployees();
    }, []);

    useEffect(() => {
        if (selectedEmployee) {
            fetchEmployeeAppointments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const fetchEmployeeAppointments = async () => {
        try {
            const res = await api.get('/owner/appointments/list', {
                params: {
                    date: selectedDate,
                    employee_id: selectedEmployee
                }
            });
            setAppointments(res.data.appointments || []);
        } catch (err) {
            console.error('Error fetching appointments:', err);
        }
    };

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
                    {/* Employee Selector */}
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

                    {/* Calendar */}
                    <div className="planora-calendar-big">
                        <button 
                            className="nav-btn-big" 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                        >
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

                        <button 
                            className="nav-btn-big" 
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 1);
                                setSelectedDate(d.toISOString().split('T')[0]);
                            }}
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* Appointments List */}
                    <div className="appointments-list-wrapper">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : appointments.length > 0 ? (
                            <div className="timeline-container">
                                {appointments.map((apt) => (
                                    <div key={apt.id} className="timeline-row">
                                        <div className="time-column">
                                            <span className="time-text">
                                                {apt.appointment_time.slice(0, 5)}
                                            </span>
                                            <div className={`vertical-line ${apt.status}`}></div>
                                        </div>
                                        <div className="appointment-card-large">
                                            <div className="client-section">
                                                <div className="avatar-circle">
                                                    {apt.client_name.charAt(0)}
                                                </div>
                                                <div className="client-details">
                                                    <h3>{apt.client_name}</h3>
                                                    <span className="service-txt">
                                                        {apt.service.name} • {apt.service.duration} min
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="card-right-info">
                                                <span className="price-tag">{apt.service.price}€</span>
                                                <span className={`status-pill ${apt.status}`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-schedule-card">
                                <Calendar size={64} />
                                <p>Nuk ka termine për {selectedEmp?.name} në këtë datë.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default EmployeesSchedule;