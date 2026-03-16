import React, { useState, useEffect } from 'react';
import { Clock, Save, XCircle, CheckCircle } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import Swal from 'sweetalert2';
import '../style/ManageSchedule.css';

const DAYS = [
    { id: 1, name: 'E Hënë',    short: 'Hën' },
    { id: 2, name: 'E Martë',   short: 'Mar' },
    { id: 3, name: 'E Mërkurë', short: 'Mër' },
    { id: 4, name: 'E Enjte',   short: 'Enj' },
    { id: 5, name: 'E Premte',  short: 'Pre' },
    { id: 6, name: 'E Shtunë',  short: 'Sht' },
    { id: 0, name: 'E Diel',    short: 'Die' },
];

const DEFAULT_SCHEDULE = {
    open_at: '06:00',
    close_at: '00:00',
    break_start: '',
    break_end: '',
    is_off: false
};

// Generate time slots from 06:00 to 23:00
const TIME_SLOTS = [];
for (let h = 6; h <= 23; h++) {
    TIME_SLOTS.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 23) TIME_SLOTS.push(`${String(h).padStart(2, '0')}:30`);
}

const TimePicker = ({ label, value, onChange, minTime }) => {
    return (
        <div className="ms-timepicker">
            <p className="ms-timepicker-label">{label}</p>
            <div className="ms-timepicker-grid">
                {TIME_SLOTS.map(slot => {
                    const isSelected = value === slot;
                    const isDisabled = minTime && slot <= minTime;
                    return (
                        <button
                            key={slot}
                            type="button"
                            disabled={isDisabled}
                            className={`ms-slot ${isSelected ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}`}
                            onClick={() => onChange(slot)}
                        >
                            {slot}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const ManageSchedule = () => {
    const [business, setBusiness] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [schedules, setSchedules] = useState({});
    const [savedSchedules, setSavedSchedules] = useState({});
    const [savedDays, setSavedDays] = useState(new Set());
    const [activeDay, setActiveDay] = useState(null);
    const [loading, setLoading] = useState(true);

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
            business_id: business.id || business,
            employee_id: selectedEmployee,
            day_of_week: dayId,
            open_at:     schedule.open_at     || '',
            close_at:    schedule.close_at    || '',
            break_start: schedule.break_start || '',
            break_end:   schedule.break_end   || '',
            is_off:      schedule.is_off
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

    const getDayStatus = (dayId) => {
        if (!savedDays.has(dayId)) return 'unconfigured';
        return savedSchedules[dayId]?.is_off ? 'off' : 'work';
    };

    if (loading) return (
        <div className="owner-layout">
            <OwnerSidebar />
            <div className="ms-loading">
                <div className="ms-spinner"></div>
                <p>Duke ngarkuar...</p>
            </div>
        </div>
    );

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="ms-main">

                {/* Header */}
                <div className="ms-header">
                    <div>
                        <div className="ms-tag">
                            <Clock size={11} />
                            <span>Orari i Punës</span>
                        </div>
                        <h1>Menaxho Orarin</h1>
                        <p>Vendos orarin e punës për çdo punonjës</p>
                    </div>
                    {employees.length > 0 && (
                        <select
                            value={selectedEmployee || ''}
                            onChange={(e) => {
                                setSelectedEmployee(Number(e.target.value));
                                setActiveDay(null);
                            }}
                            className="ms-select"
                        >
                            {employees.map(emp => (
                                <option key={emp.id} value={emp.id}>{emp.name}</option>
                            ))}
                        </select>
                    )}
                </div>

                {employees.length === 0 ? (
                    <div className="ms-empty">
                        <Clock size={36} />
                        <p>Nuk ka punonjës të regjistruar.</p>
                    </div>
                ) : (
                    <>
                        {/* Week overview grid */}
                        <div className="ms-week-grid">
                            {DAYS.map(day => {
                                const status = getDayStatus(day.id);
                                const isActive = activeDay === day.id;
                                return (
                                    <button
                                        key={day.id}
                                        className={`ms-day-pill ${status} ${isActive ? 'active' : ''}`}
                                        onClick={() => setActiveDay(isActive ? null : day.id)}
                                    >
                                        <span className="ms-day-short">{day.short}</span>
                                        <span className="ms-day-indicator">
                                            {status === 'work' && <CheckCircle size={14} />}
                                            {status === 'off' && <XCircle size={14} />}
                                            {status === 'unconfigured' && <Clock size={14} />}
                                        </span>
                                        <span className="ms-day-status-txt">
                                            {status === 'work' && savedSchedules[day.id]?.open_at?.slice(0, 5)}
                                            {status === 'off' && 'Pushim'}
                                            {status === 'unconfigured' && '—'}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Detail panel */}
                        {activeDay !== null && (() => {
                            const day = DAYS.find(d => d.id === activeDay);
                            const daySchedule = schedules[activeDay] || DEFAULT_SCHEDULE;
                            const isSaved = savedDays.has(activeDay);
                            const isOff = daySchedule.is_off;
                            const savedVersion = savedSchedules[activeDay];

                            return (
                                <div className="ms-detail-panel">
                                    <div className="ms-detail-header">
                                        <div className="ms-detail-title">
                                            <h2>{day.name}</h2>
                                            {isSaved ? (
                                                <span className={`ms-badge ${savedVersion?.is_off ? 'ms-badge-off' : 'ms-badge-work'}`}>
                                                    {savedVersion?.is_off ? 'Ditë Pushimi' : 'Ditë Pune'}
                                                </span>
                                            ) : (
                                                <span className="ms-badge ms-badge-pending">Pa Ruajtur</span>
                                            )}
                                        </div>

                                        <div className="ms-toggle">
                                            <button
                                                className={`ms-toggle-btn ${!isOff ? 'active-work' : ''}`}
                                                onClick={() => isOff && toggleDayOff(activeDay)}
                                            >
                                                <CheckCircle size={13} /> Ditë Pune
                                            </button>
                                            <button
                                                className={`ms-toggle-btn ${isOff ? 'active-off' : ''}`}
                                                onClick={() => !isOff && toggleDayOff(activeDay)}
                                            >
                                                <XCircle size={13} /> Ditë Pushimi
                                            </button>
                                        </div>
                                    </div>

                                    {!isOff ? (
                                        <>
                                            {/* Selected time summary */}
                                            <div className="ms-time-summary">
                                                <div className="ms-time-summary-item open">
                                                    <span className="ms-time-summary-label">Hapet</span>
                                                    <span className="ms-time-summary-value">{daySchedule.open_at}</span>
                                                </div>
                                                <div className="ms-time-summary-arrow">→</div>
                                                <div className="ms-time-summary-item close">
                                                    <span className="ms-time-summary-label">Mbyllet</span>
                                                    <span className="ms-time-summary-value">{daySchedule.close_at}</span>
                                                </div>
                                                <button onClick={() => handleSaveDay(activeDay)} className="ms-btn-save">
                                                    <Save size={14} /> Ruaj
                                                </button>
                                            </div>

                                            {/* Time pickers */}
                                            <div className="ms-pickers-row">
                                                <TimePicker
                                                    label="🟢 Koha e hapjes"
                                                    value={daySchedule.open_at}
                                                    onChange={(val) => handleScheduleChange(activeDay, 'open_at', val)}
                                                />
                                                <TimePicker
                                                    label="🔴 Koha e mbylljes"
                                                    value={daySchedule.close_at}
                                                    onChange={(val) => handleScheduleChange(activeDay, 'close_at', val)}
                                                    minTime={daySchedule.open_at}
                                                />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="ms-off-row">
                                            <span>🚫 Punonjësi nuk punon këtë ditë</span>
                                            <button onClick={() => handleSaveDay(activeDay)} className="ms-btn-save-off">
                                                <Save size={14} /> Ruaj Pushimin
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}
                    </>
                )}
            </main>
        </div>
    );
};

export default ManageSchedule;