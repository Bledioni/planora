import { useEffect, useState } from 'react';
import { BarChart2, BarChart3, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw, TrendingUp, Calendar, X } from 'lucide-react';
import { api } from '../../../index';
import EmployeeSidebar from '../script/EmployeeSidebar';
import '../style/EmployeeStats.css';

const EmployeeStats = () => {
    const [stats, setStats]     = useState(null);
    const [chart, setChart]     = useState({});
    const [filter, setFilter]   = useState('month');
    const [date, setDate]       = useState(new Date().toISOString().slice(0, 7));
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/employee/stats', { params: { filter, date } });
            setStats(res.data.stats);
            setChart(res.data.chart || {});
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, [filter, date]);

    const maxVal = Math.max(...Object.values(chart), 1);

    return (
        <div className="owner-layout">
            <EmployeeSidebar />
            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    {/* Header */}
                    <header className="analytics-premium-header">
                        <div className="header-title">
                            <div className="header-top-tag">
                                <BarChart2 size={11} /> Analitika
                            </div>
                            <h1>Statistikat <span>e Mia</span></h1>
                            <p>Shiko performancën tënde sipas periudhës</p>
                        </div>
                        <div className="header-actions">
                            <div className="control-group">
                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="modern-select"
                                >
                                    <option value="week">Kjo Javë</option>
                                    <option value="month">Muaji</option>
                                    <option value="year">Viti</option>
                                </select>
                                {filter === 'month' && (
                                    <input
                                        type="month"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="modern-date-input"
                                    />
                                )}
                                {filter === 'year' && (
                                    <input
                                        type="number"
                                        value={date.slice(0, 4)}
                                        onChange={(e) => setDate(e.target.value)}
                                        className="modern-date-input"
                                        min="2020"
                                        max="2100"
                                    />
                                )}
                            </div>
                            <button onClick={fetchStats} className="refresh-circular-btn" title="Rifresko">
                                <RefreshCw size={18} />
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="planora-loader-big" />
                    ) : stats ? (
                        <div className="analytics-scroll-container">

                            {/* KPI Cards */}
                            <div className="kpi-grid">
                                <div className="kpi-card blue">
                                    <div className="kpi-icon"><Calendar /></div>
                                    <div className="kpi-info">
                                        <span className="kpi-label">Totale</span>
                                        <h2 className="kpi-value">{stats.total}</h2>
                                    </div>
                                </div>
                                <div className="kpi-card green">
                                    <div className="kpi-icon"><CheckCircle /></div>
                                    <div className="kpi-info">
                                        <span className="kpi-label">Kryer</span>
                                        <h2 className="kpi-value">{stats.completed}</h2>
                                    </div>
                                </div>
                                <div className="kpi-card orange">
                                    <div className="kpi-icon"><Clock /></div>
                                    <div className="kpi-info">
                                        <span className="kpi-label">Në Pritje</span>
                                        <h2 className="kpi-value">{stats.upcoming}</h2>
                                    </div>
                                </div>
                                <div className="kpi-card red">
                                    <div className="kpi-icon"><X /></div>
                                    <div className="kpi-info">
                                        <span className="kpi-label">Anuluar</span>
                                        <h2 className="kpi-value">{stats.cancelled}</h2>
                                    </div>
                                </div>
                            </div>

                            <div className="analytics-secondary-grid">
                                {/* Top Services */}
                                {stats.top_services?.length > 0 && (
                                    <section className="analytics-card-main">
                                        <div className="card-header">
                                            <h3><BarChart3 size={20} /> Shërbimet më Popullore</h3>
                                        </div>
                                        <div className="bar-chart-container">
                                            {stats.top_services.map((service, idx) => (
                                                <div key={idx} className="custom-bar-row">
                                                    <div className="bar-label">
                                                        <span>{service.service_name}</span>
                                                        <span className="bar-percentage">{service.total} herë</span>
                                                    </div>
                                                    <div className="bar-track">
                                                        <div
                                                            className="bar-progress"
                                                            style={{ width: `${(service.total / stats.top_services[0].total) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* No Show */}
                                <section className="analytics-card-main">
                                    <div className="card-header">
                                        <h3><AlertCircle size={20} /> Të tjera</h3>
                                    </div>
                                    <div className="emp-stats-row">
                                        <div className="mini-box">
                                            <span className="label">Mungoi</span>
                                            <span className="val">{stats.no_show}</span>
                                        </div>
                                        <div className="mini-box red">
                                            <span className="label">Anuluar</span>
                                            <span className="val">{stats.cancelled}</span>
                                        </div>
                                        <div className="mini-box green">
                                            <span className="label">Kryer</span>
                                            <span className="val">{stats.completed}</span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Bar Chart by Day */}
                            {Object.keys(chart).length > 0 && (
                                <section className="analytics-card-main">
                                    <div className="card-header">
                                        <h3><TrendingUp size={20} /> Terminet sipas ditës</h3>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', overflowX: 'auto', paddingBottom: '10px' }}>
                                        {Object.entries(chart).map(([date, count]) => (
                                            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '40px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb' }}>{count}</span>
                                                <div style={{
                                                    width: '32px',
                                                    height: `${(count / maxVal) * 120}px`,
                                                    background: 'linear-gradient(180deg, #2563eb, #60a5fa)',
                                                    borderRadius: '6px 6px 0 0',
                                                    minHeight: '4px',
                                                    transition: 'height 0.4s ease'
                                                }} />
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                    {new Date(date).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </div>
                    ) : (
                        <div className="empty-schedule-card">
                            <BarChart2 size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                            <p>Nuk ka të dhëna për këtë periudhë.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default EmployeeStats;