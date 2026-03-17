import React, { useState, useEffect, useCallback } from 'react';
import { 
    TrendingUp, Users, Calendar, Clock, 
    BarChart3, ChevronDown, User, RefreshCw, X, Mail
} from 'lucide-react';
import { api } from '../../../index';
import Swal from 'sweetalert2';
import OwnerSidebar from '../script/OwnerSidebar';
import '../style/OwnerAnalyticsDashboard.css';

const OwnerAnalyticsDashboard = () => {
    const [businessStats, setBusinessStats] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeStats, setEmployeeStats] = useState(null);
    const [ownerSchedule, setOwnerSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 7));

    const fetchAllData = useCallback(async () => {
        setLoading(true);
        try {
            const [bRes, eRes, oRes] = await Promise.all([
                api.get('/owner/analytics/business-stats', { params: { filter, date: selectedDate } }),
                api.get('/owner/analytics/employees-schedules'),
                api.get('/owner/analytics/owner-schedule')
            ]);
            setBusinessStats(bRes.data.stats);
            setEmployees(eRes.data.employees);
            setOwnerSchedule(oRes.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status !== 429) {
                Swal.fire('Gabim', 'Nuk u ngarkuan të dhënat.', 'error');
            }
        } finally {
            setLoading(false);
        }
    }, [filter, selectedDate]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const fetchEmployeeStats = async (employeeId) => {
        if (selectedEmployee === employeeId) {
            setSelectedEmployee(null);
            return;
        }
        try {
            const res = await api.get(`/owner/analytics/employee-stats/${employeeId}`, {
                params: { filter, date: selectedDate }
            });
            setEmployeeStats(res.data);
            setSelectedEmployee(employeeId);
        } catch (err) {
            Swal.fire('Gabim', 'Statistikat dështuan.', 'error');
        }
    };

    if (loading) return (
        <div className="analytics-loading-screen">
            <RefreshCw className="spinner-icon" size={48} />
            <p>Duke analizuar të dhënat...</p>
        </div>
    );

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">
                <header className="analytics-premium-header">
                    <div className="header-title">
                        <h1>Analytics <span>Dashboard</span></h1>
                    </div>
                    
                    <div className="header-actions">
                        <div className="control-group">
                            <select value={filter} onChange={(e) => setFilter(e.target.value)} className="modern-select">
                                <option value="month">Muaji</option>
                                <option value="year">Viti</option>
                                <option value="all">Gjithë kohësh</option>
                            </select>
                            {filter !== 'all' && (
                                <input 
                                    type={filter === 'month' ? 'month' : 'number'}
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="modern-date-input"
                                />
                            )}
                        </div>
                        <button onClick={fetchAllData} className="refresh-circular-btn" title="Rifresko">
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </header>

                <div className="analytics-scroll-container">
                    {businessStats && (
                        <div className="kpi-grid">
                            <div className="kpi-card blue">
                                <div className="kpi-icon"><Calendar /></div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Termine Totale</span>
                                    <h2 className="kpi-value">{businessStats.total_appointments}</h2>
                                </div>
                            </div>
                            <div className="kpi-card green">
                                <div className="kpi-icon"><TrendingUp /></div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Përfunduara</span>
                                    <h2 className="kpi-value">{businessStats.completed}</h2>
                                </div>
                            </div>
                            <div className="kpi-card orange">
                                <div className="kpi-icon"><Clock /></div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Në Pritje</span>
                                    <h2 className="kpi-value">{businessStats.pending}</h2>
                                </div>
                            </div>
                            <div className="kpi-card red">
                                <div className="kpi-icon"><X /></div>
                                <div className="kpi-info">
                                    <span className="kpi-label">Anuluara</span>
                                    <h2 className="kpi-value">{businessStats.cancelled}</h2>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="analytics-secondary-grid">
                        <section className="analytics-card-main">
                            <div className="card-header">
                                <h3><BarChart3 size={20} /> Shërbimet më Popullore</h3>
                            </div>
                            <div className="bar-chart-container">
                                {businessStats?.top_services?.length > 0 ? (
                                    businessStats.top_services.map((service, idx) => (
                                        <div key={idx} className="custom-bar-row">
                                            <div className="bar-label">
                                                <span>{service.service_name}</span>
                                                <span className="bar-percentage">{service.total} herë</span>
                                            </div>
                                            <div className="bar-track">
                                                <div 
                                                    className="bar-progress" 
                                                    style={{ width: `${(service.total / businessStats.top_services[0].total) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-data-txt">Nuk ka të dhëna për shërbimet.</p>
                                )}
                            </div>
                        </section>

                        {ownerSchedule?.is_employee && (
                            <section className="analytics-card-main">
                                <div className="card-header">
                                    <h3><User size={20} /> Orari Im Sot</h3>
                                </div>
                                <div className="mini-schedule-list">
                                    {ownerSchedule.schedules?.map((s, i) => (
                                        <div key={i} className="mini-schedule-item">
                                            <span className="day-tag">{s.day_of_week}</span>
                                            <span className="time-tag">{s.start_time} - {s.end_time}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <section className="employees-analytics-section">
                        <div className="section-title-area">
                            <h2><Users size={22} /> Performanca e Punonjësve</h2>
                        </div>
                        <div className="employee-performance-grid">
                            {employees.map((employee) => (
                                <div key={employee.id} className={`employee-pro-card ${selectedEmployee === employee.id ? 'expanded' : ''}`}>
                                    <div className="employee-pro-top">
                                        <div className="avatar-circle">{employee.name[0]}</div>
                                        <div className="emp-meta">
                                            <h4>{employee.name}</h4>
                                            <div className="emp-email"><Mail size={12}/> {employee.email}</div>
                                        </div>
                                        <button 
                                            onClick={() => fetchEmployeeStats(employee.id)}
                                            className="expand-trigger"
                                        >
                                            <ChevronDown size={20} />
                                        </button>
                                    </div>

                                    {selectedEmployee === employee.id && employeeStats && (
                                        <div className="employee-details-animate">
                                            <div className="emp-stats-row">
                                                <div className="mini-box">
                                                    <span className="label">Totali</span>
                                                    <span className="val">{employeeStats.stats.total_appointments}</span>
                                                </div>
                                                <div className="mini-box green">
                                                    <span className="label">Përfunduar</span>
                                                    <span className="val">{employeeStats.stats.completed}</span>
                                                </div>
                                                <div className="mini-box red">
                                                    <span className="label">Anuluar</span>
                                                    <span className="val">{employeeStats.stats.cancelled}</span>
                                                </div>
                                            </div>
                                            <div className="emp-top-services">
                                                <h6>Shërbimet kryesore</h6>
                                                {employeeStats.stats.top_services?.map((s, i) => (
                                                    <div key={i} className="mini-service-tag">
                                                        {s.service_name} <span>{s.total}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default OwnerAnalyticsDashboard;