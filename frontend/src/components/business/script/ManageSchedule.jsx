import React, { useState, useEffect } from 'react';
import { Clock, Save, XCircle, CheckCircle } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import Swal from 'sweetalert2';
import '../style/ManageSchedule.css';

const DAYS = [
    { id: 0, name: 'E Diel' },
    { id: 1, name: 'E Hënë' },
    { id: 2, name: 'E Martë' },
    { id: 3, name: 'E Mërkurë' },
    { id: 4, name: 'E Enjte' },
    { id: 5, name: 'E Premte' },
    { id: 6, name: 'E Shtunë' }
];

const DEFAULT_SCHEDULE = {
    open_at: '09:00',
    close_at: '18:00',
    break_start: '',
    break_end: '',
    is_off: false
};

const ManageSchedule = () => {
    const [business, setBusiness]               = useState(null);
    const [employees, setEmployees]             = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [schedules, setSchedules]             = useState({});
    const [savedSchedules, setSavedSchedules]   = useState({});
    const [savedDays, setSavedDays]             = useState(new Set());
    const [loading, setLoading]                 = useState(true);

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (selectedEmployee && business) fetchSchedules();
    }, [selectedEmployee]);

    const parseSchedules = (data) => {
        const schedulesMap = {};
        const savedDaysSet = new Set();
        data.forEach(s => {
            schedulesMap[s.day_of_week] = {
                open_at:     s.open_at     || '09:00',
                close_at:    s.close_at    || '18:00',
                break_start: s.break_start || '',
                break_end:   s.break_end   || '',
                is_off:      s.is_off      || false
            };
            savedDaysSet.add(s.day_of_week);
        });
        setSchedules(schedulesMap);
        setSavedSchedules(schedulesMap);
        setSavedDays(savedDaysSet);
    };

    const fetchData = async () => {
        try {
            const businessRes = await api.get('/owner/business/my-business');
            const biz = businessRes.data.business || businessRes.data;
            setBusiness(biz);

            const employeesRes = await api.get('/owner/analytics/employees-schedules');
            const emps = employeesRes.data.employees || [];
            setEmployees(emps);

            if (emps.length > 0) {
                const firstEmp = emps[0].id;
                setSelectedEmployee(firstEmp);
                const bizId = biz.id || biz;
                const schedRes = await api.get(`/owner/schedules/employee/${bizId}/${firstEmp}`);
                parseSchedules(schedRes.data);
            }
        } catch (err) {
            Swal.fire('Gabim', 'Nuk u ngarkuan të dhënat.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchSchedules = async () => {
        if (!business || !selectedEmployee) return;
        try {
            const bizId = business.id || business;
            const res = await api.get(`/owner/schedules/employee/${bizId}/${selectedEmployee}`);
            parseSchedules(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleScheduleChange = (day, field, value) => {
        setSchedules(prev => ({
            ...prev,
            [day]: { ...(prev[day] || DEFAULT_SCHEDULE), [field]: value }
        }));
    };

    const toggleDayOff = (dayId) => {
        const current = schedules[dayId] || DEFAULT_SCHEDULE;
        handleScheduleChange(dayId, 'is_off', !current.is_off);
    };

    const handleSaveDay = async (dayId) => {
        if (!business || !selectedEmployee) {
            Swal.fire('Gabim', 'Të dhënat nuk janë ngarkuar ende.', 'error');
            return;
        }
        const schedule = schedules[dayId] || DEFAULT_SCHEDULE;
        const payload = {
            business_id:  business.id || business,
            employee_id:  selectedEmployee,
            day_of_week:  dayId,
            open_at:      schedule.open_at      || '',
            close_at:     schedule.close_at     || '',
            break_start:  schedule.break_start  || '',
            break_end:    schedule.break_end     || '',
            is_off:       schedule.is_off
        };
        try {
            await api.post('/owner/schedules/set', payload);
            setSavedDays(prev => new Set([...prev, dayId]));
            setSavedSchedules(prev => ({ ...prev, [dayId]: { ...schedule } }));
            Swal.fire({ icon: 'success', title: 'Sukses!', text: 'Orari u ruajt.', timer: 1500, showConfirmButton: false });
        } catch (err) {
            Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim.', 'error');
        }
    };

    if (loading) return (
        <div className="owner-layout">
            <OwnerSidebar />
            <div className="loading-state">
                <div className="planora-loader-big"></div>
                <p>Duke ngarkuar...</p>
            </div>
        </div>
    );

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">

                <div className="owner-page-header">
                    <div className="page-header-text">
                        <div className="header-top-tag">
                            <Clock size={13} />
                            <span>Orari</span>
                        </div>
                        <h1>Menaxho Orarin</h1>
                        <p>Vendos orarin e punës për punonjësit</p>
                    </div>
                    {employees.length > 0 && (
                        <select
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(Number(e.target.value))}
                            className="employee-select"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Summary */}
                <div className="schedule-summary">
                    <div className="summary-card green">
                        <CheckCircle size={18} />
                        <div>
                            <span className="summary-label">Ditë të Ruajtura</span>
                            <span className="summary-value">{savedDays.size} / 7</span>
                        </div>
                    </div>
                    <div className="summary-card red">
                        <XCircle size={18} />
                        <div>
                            <span className="summary-label">Ditë Pa Orare</span>
                            <span className="summary-value">{7 - savedDays.size}</span>
                        </div>
                    </div>
                </div>

                <div className="owner-content">
                    {employees.length === 0 ? (
                        <div className="empty-state">
                            <Clock size={40} style={{ opacity: 0.2, marginBottom: 10 }} />
                            <p>Nuk ka punonjës të regjistruar.</p>
                        </div>
                    ) : (
                        <div className="schedule-table">
                            {DAYS.map(day => {
                                const daySchedule  = schedules[day.id]      || DEFAULT_SCHEDULE;
                                const savedVersion = savedSchedules[day.id];
                                const isSaved      = savedDays.has(day.id);
                                const isOff        = daySchedule.is_off;

                                return (
                                    <div key={day.id} className={`schedule-row ${isSaved ? 'saved' : ''} ${isOff ? 'is-off' : ''}`}>

                                        {/* Day Header */}
                                        <div className="day-header">
                                            <div className="day-title">
                                                <span className="day-name">{day.name}</span>

                                                {/* Badge reflects ONLY saved DB state */}
                                                {isSaved ? (
                                                    <span className={`badge ${savedVersion?.is_off ? 'badge-off' : 'badge-work'}`}>
                                                        {savedVersion?.is_off
                                                            ? <><XCircle size={12} /> Ditë Pushimi</>
                                                            : <><CheckCircle size={12} /> Ditë Pune</>}
                                                    </span>
                                                ) : (
                                                    <span className="badge badge-unsaved">
                                                        <Clock size={12} /> Pa Ruajtur
                                                    </span>
                                                )}
                                            </div>

                                            {/* Working / Day Off toggle */}
                                            <div className="day-type-toggle">
                                                <button
                                                    className={`toggle-btn ${!isOff ? 'active-work' : ''}`}
                                                    onClick={() => isOff && toggleDayOff(day.id)}
                                                >
                                                    <CheckCircle size={14} /> Ditë Pune
                                                </button>
                                                <button
                                                    className={`toggle-btn ${isOff ? 'active-off' : ''}`}
                                                    onClick={() => !isOff && toggleDayOff(day.id)}
                                                >
                                                    <XCircle size={14} /> Ditë Pushimi
                                                </button>
                                            </div>
                                        </div>

                                        {/* Time Inputs */}
                                        {!isOff ? (
                                            <div className="schedule-inputs">
                                                <div className="time-group">
                                                    <label>Hapet</label>
                                                    <input type="time" value={daySchedule.open_at}
                                                        onChange={(e) => handleScheduleChange(day.id, 'open_at', e.target.value)} />
                                                </div>
                                                <div className="time-group">
                                                    <label>Mbyllet</label>
                                                    <input type="time" value={daySchedule.close_at}
                                                        onChange={(e) => handleScheduleChange(day.id, 'close_at', e.target.value)} />
                                                </div>
                                                <button onClick={() => handleSaveDay(day.id)} className="btn-save">
                                                    <Save size={15} /> Ruaj
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="day-off-banner">
                                                <span>🚫 Ditë pushimi — punonjësi nuk punon</span>
                                                <button onClick={() => handleSaveDay(day.id)} className="btn-save-off">
                                                    <Save size={15} /> Ruaj
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
};

export default ManageSchedule;