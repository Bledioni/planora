import React, { useState, useEffect } from 'react';
import { Clock, Save, XCircle , CheckCircle } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import Swal from 'sweetalert2';
import '../style/OwnerDashboard.css';
import '../style/ManageSchedule.css'

const DAYS = [
    { id: 0, name: 'E Diel' },
    { id: 1, name: 'E Hënë' },
    { id: 2, name: 'E Martë' },
    { id: 3, name: 'E Mërkurë' },
    { id: 4, name: 'E Enjte' },
    { id: 5, name: 'E Premte' },
    { id: 6, name: 'E Shtunë' }
];

const ManageSchedule = () => {
    const [business, setBusiness] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [schedules, setSchedules] = useState({});
    const [savedDays, setSavedDays] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedEmployee && business) {
            fetchSchedules();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedEmployee]);

    const fetchData = async () => {
        try {
            const businessRes = await api.get('/owner/business/my-business');
            setBusiness(businessRes.data.business || businessRes.data);

            const employeesRes = await api.get('/owner/analytics/employees-schedules');
            setEmployees(employeesRes.data.employees || []);
            
            if (employeesRes.data.employees?.length > 0) {
                const firstEmp = employeesRes.data.employees[0].id;
                setSelectedEmployee(firstEmp);
                
                const bizId = businessRes.data.business?.id || businessRes.data.id;
                if (bizId) {
                    const schedRes = await api.get(`/owner/schedules/employee/${bizId}/${firstEmp}`);
                    const schedulesMap = {};
                    const savedDaysSet = new Set();
                    
                    schedRes.data.forEach(schedule => {
                        schedulesMap[schedule.day_of_week] = {
                            open_at: schedule.open_at || '09:00',
                            close_at: schedule.close_at || '18:00',
                            break_start: schedule.break_start || '',
                            break_end: schedule.break_end || '',
                            is_off: schedule.is_off || false
                        };
                        savedDaysSet.add(schedule.day_of_week);
                    });
                    
                    setSchedules(schedulesMap);
                    setSavedDays(savedDaysSet);
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
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
            
            const schedulesMap = {};
            const savedDaysSet = new Set();
            
            res.data.forEach(schedule => {
                schedulesMap[schedule.day_of_week] = {
                    open_at: schedule.open_at || '09:00',
                    close_at: schedule.close_at || '18:00',
                    break_start: schedule.break_start || '',
                    break_end: schedule.break_end || '',
                    is_off: schedule.is_off || false
                };
                savedDaysSet.add(schedule.day_of_week);
            });
            
            setSchedules(schedulesMap);
            setSavedDays(savedDaysSet);
        } catch (err) {
            console.error('Error fetching schedules:', err);
        }
    };

    const handleScheduleChange = (day, field, value) => {
        setSchedules(prev => ({
            ...prev,
            [day]: {
                ...(prev[day] || { open_at: '09:00', close_at: '18:00', break_start: '', break_end: '', is_off: false }),
                [field]: value
            }
        }));
    };

    const handleSaveDay = async (dayId) => {
        if (!business || !selectedEmployee) {
            Swal.fire('Gabim', 'Të dhënat nuk janë ngarkuar ende.', 'error');
            return;
        }

        const schedule = schedules[dayId] || {
            open_at: '09:00',
            close_at: '18:00',
            break_start: '',
            break_end: '',
            is_off: false
        };

        const payload = {
            business_id: business.id || business,
            employee_id: selectedEmployee,
            day_of_week: dayId,
            open_at: schedule.open_at || '',
            close_at: schedule.close_at || '',
            break_start: schedule.break_start || '',
            break_end: schedule.break_end || '',
            is_off: schedule.is_off
        };

        try {
            await api.post('/owner/schedules/set', payload);

            // Add to saved days
            setSavedDays(prev => new Set([...prev, dayId]));

            Swal.fire({
                icon: 'success',
                title: 'Sukses!',
                text: 'Orari u ruajt.',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (err) {
            console.error('Save error:', err.response);
            Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim.', 'error');
        }
    };

    const selectedEmp = employees.find(e => e.id === selectedEmployee);

    if (loading) {
        return (
            <div className="owner-layout">
                <OwnerSidebar />
                <div className="loading-state">Duke ngarkuar...</div>
            </div>
        );
    }

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">
                <div className="owner-page-header">
                    <div>
                        <h1><Clock size={28} /> Menaxho Orarin</h1>
                        <p>Vendos orarin e punës për punonjësit</p>
                    </div>
                    {selectedEmp && employees.length > 0 && (
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

                {/* Summary Stats */}
                <div className="schedule-summary">
                    <div className="summary-card">
                        <CheckCircle size={20} className="icon-success" />
                        <div>
                            <span className="summary-label">Ditë të Ruajtura</span>
                            <span className="summary-value">{savedDays.size} / 7</span>
                        </div>
                    </div>
                    <div className="summary-card">
                        <XCircle size={20} className="icon-warning" />
                        <div>
                            <span className="summary-label">Ditë Pa Orare</span>
                            <span className="summary-value">{7 - savedDays.size}</span>
                        </div>
                    </div>
                </div>

                <div className="owner-content">
                    {employees.length === 0 ? (
                        <div className="empty-state">
                            <p>Nuk ka punonjës të regjistruar.</p>
                        </div>
                    ) : (
                        <div className="schedule-table">
                            {DAYS.map(day => {
                                const daySchedule = schedules[day.id] || {
                                    open_at: '09:00',
                                    close_at: '18:00',
                                    break_start: '',
                                    break_end: '',
                                    is_off: false
                                };

                                const isSaved = savedDays.has(day.id);

                                return (
                                    <div key={day.id} className={`schedule-row ${isSaved ? 'saved' : 'unsaved'}`}>
                                        <div className="day-header">
                                            <div className="day-title">
                                                <span className="day-name">{day.name}</span>
                                                {isSaved && (
                                                    <span className="saved-badge">
                                                        <CheckCircle size={14} />
                                                        Ruajtur
                                                    </span>
                                                )}
                                                {!isSaved && (
                                                    <span className="saved-badge">
                                                        <span className="pulse-dot"></span>
                                                        Aktiv
                                                    </span>
                                                )}
                                            </div>
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={!daySchedule.is_off}
                                                    onChange={(e) => handleScheduleChange(day.id, 'is_off', !e.target.checked)}
                                                />
                                                <span className="slider"></span>
                                            </label>
                                        </div>

                                        {!daySchedule.is_off ? (
                                            <div className="schedule-inputs">
                                                <div className="time-group">
                                                    <label>Hapet</label>
                                                    <input
                                                        type="time"
                                                        value={daySchedule.open_at}
                                                        onChange={(e) => handleScheduleChange(day.id, 'open_at', e.target.value)}
                                                    />
                                                </div>

                                                <div className="time-group">
                                                    <label>Mbyllet</label>
                                                    <input
                                                        type="time"
                                                        value={daySchedule.close_at}
                                                        onChange={(e) => handleScheduleChange(day.id, 'close_at', e.target.value)}
                                                    />
                                                </div>

                                                <div className="time-group">
                                                    <label>Pushim nga (opsionale)</label>
                                                    <input
                                                        type="time"
                                                        value={daySchedule.break_start}
                                                        onChange={(e) => handleScheduleChange(day.id, 'break_start', e.target.value)}
                                                    />
                                                </div>

                                                <div className="time-group">
                                                    <label>Pushim deri (opsionale)</label>
                                                    <input
                                                        type="time"
                                                        value={daySchedule.break_end}
                                                        onChange={(e) => handleScheduleChange(day.id, 'break_end', e.target.value)}
                                                    />
                                                </div>

                                                <button onClick={() => handleSaveDay(day.id)} className="btn-save">
                                                    <Save size={16} />
                                                    Ruaj
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="day-off-label">
                                                <span>🚫 Dita pushimi</span>
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