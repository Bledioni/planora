import React, { useState, useEffect } from 'react';
import { Clock, Save, XCircle, CheckCircle, CalendarX, Trash2 } from 'lucide-react';
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

    // Block date state
    const [blockDate, setBlockDate] = useState('');
    const [blockReason, setBlockReason] = useState('');
    const [blocking, setBlocking] = useState(false);
    const [blockedDates, setBlockedDates] = useState([]);

    useEffect(() => { fetchData(); }, []);

    useEffect(() => {
        if (selectedEmployee && business) {
            fetchSchedules();
            fetchBlockedDates();
        }
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

                // Fetch blocked dates for first employee
                const blockedRes = await api.get(`/owner/schedule-exceptions/${bizId}/${firstEmp}`);
                setBlockedDates(blockedRes.data.data || []);
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

    const fetchBlockedDates = async () => {
        if (!business || !selectedEmployee) return;
        try {
            const bizId = business.id || business;
            const res = await api.get(`/owner/schedule-exceptions/${bizId}/${selectedEmployee}`);
            setBlockedDates(res.data.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleBlockDate = async () => {
        if (!blockDate) {
            Swal.fire('Gabim', 'Zgjidhni një datë.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: 'Blloko këtë datë?',
            html: `Të gjithë terminet e <strong>${blockDate}</strong> do të anulohen dhe klientët do të njoftohen me email.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Po, blloko!',
            cancelButtonText: 'Anulo',
        });

        if (!result.isConfirmed) return;

        setBlocking(true);
        try {
            const bizId = business.id || business;
            const res = await api.post('/owner/schedule-exceptions/block', {
                business_id: bizId,
                employee_id: selectedEmployee,
                date:        blockDate,
                reason:      blockReason || null,
            });

            Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: res.data.message,
                timer: 3000,
                showConfirmButton: false,
            });

            setBlockDate('');
            setBlockReason('');
            fetchBlockedDates();
        } catch (err) {
            Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim.', 'error');
        } finally {
            setBlocking(false);
        }
    };

    const handleUnblock = async (id, date) => {
        const result = await Swal.fire({
            title: 'Çblloko datën?',
            text: `Data ${date} do të jetë e lirë përsëri.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Po, çblloko!',
            cancelButtonText: 'Anulo',
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(`/owner/schedule-exceptions/unblock/${id}`);
            Swal.fire({ icon: 'success', title: 'U çbllokua!', timer: 1500, showConfirmButton: false });
            fetchBlockedDates();
        } catch (err) {
            Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim.', 'error');
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

                        {/* ✅ Block a Date Section */}
                        <div className="ms-detail-panel" style={{ marginTop: '24px' }}>
                            <div className="ms-detail-header">
                                <div className="ms-detail-title">
                                    <h2>Blloko një Datë</h2>
                                    <span className="ms-badge ms-badge-off">Anulim Termini</span>
                                </div>
                            </div>

                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>
                                Zgjidhni një datë specifike që punonjësi nuk do të punojë. Të gjithë terminet e asaj dite do të anulohen dhe klientët do të njoftohen me email.
                            </p>

                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                                <div>
                                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>📅 Data</label>
                                    <input
                                        type="date"
                                        value={blockDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setBlockDate(e.target.value)}
                                        style={{
                                            padding: '9px 14px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e5e7eb',
                                            fontSize: '14px',
                                            outline: 'none',
                                            cursor: 'pointer'
                                        }}
                                    />
                                </div>
                                <div style={{ flex: 1, minWidth: '160px' }}>
                                    <label style={{ fontSize: '12px', color: '#6b7280', display: 'block', marginBottom: '6px' }}>📝 Arsyeja (opsionale)</label>
                                    <input
                                        type="text"
                                        value={blockReason}
                                        onChange={(e) => setBlockReason(e.target.value)}
                                        placeholder="p.sh. Pushim personal"
                                        style={{
                                            width: '100%',
                                            padding: '9px 14px',
                                            borderRadius: '10px',
                                            border: '1.5px solid #e5e7eb',
                                            fontSize: '14px',
                                            outline: 'none'
                                        }}
                                    />
                                </div>
                                <button
                                    onClick={handleBlockDate}
                                    disabled={blocking}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        padding: '9px 20px',
                                        background: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '10px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        cursor: blocking ? 'not-allowed' : 'pointer',
                                        opacity: blocking ? 0.7 : 1,
                                    }}
                                >
                                    <CalendarX size={15} />
                                    {blocking ? 'Duke bllokuar...' : 'Blloko Datën'}
                                </button>
                            </div>

                            {/* Blocked dates list */}
                            {blockedDates.length > 0 && (
                                <div style={{ marginTop: '24px' }}>
                                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>
                                        📋 Datat e Bllokuara
                                    </p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {blockedDates.map(item => (
                                            <div key={item.id} style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                background: '#fef2f2',
                                                border: '1px solid #fecaca',
                                                borderRadius: '10px',
                                                padding: '10px 14px',
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                    <CalendarX size={15} color="#ef4444" />
                                                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#111827' }}>
                                                        {new Date(item.date).toLocaleDateString('sq-AL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                                    </span>
                                                    {item.reason && (
                                                        <span style={{ fontSize: '12px', color: '#6b7280' }}>— {item.reason}</span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleUnblock(item.id, item.date)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '4px',
                                                        padding: '5px 12px',
                                                        background: 'white',
                                                        color: '#ef4444',
                                                        border: '1px solid #fca5a5',
                                                        borderRadius: '8px',
                                                        fontSize: '12px',
                                                        fontWeight: '500',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    <Trash2 size={12} /> Çblloko
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
};

export default ManageSchedule;