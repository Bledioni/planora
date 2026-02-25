import { useEffect, useState } from 'react';
import { BarChart2, CheckCircle, XCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../../index';
import EmployeeSidebar from '../script/EmployeeSidebar';
import '../style/EmployeeStats.css';

const PERIODS = [
    { key: 'week',  label: 'Kjo Javë'  },
    { key: 'month', label: 'Ky Muaj'   },
    { key: 'year',  label: 'Ky Vit'    },
];

const EmployeeStats = () => {
    const [stats, setStats]   = useState(null);
    const [chart, setChart]   = useState({});
    const [period, setPeriod] = useState('week');
    const [loading, setLoading] = useState(true);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/employee/stats?period=${period}`);
            setStats(res.data.stats);
            setChart(res.data.chart || {});
        } catch {
            // silently fail
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchStats(); }, [period]);

    const maxVal = Math.max(...Object.values(chart), 1);

    return (
        <div className="owner-layout">
            <EmployeeSidebar />
            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    <header className="schedule-header-big">
                        <div className="header-top-tag">
                            <BarChart2 size={14} />
                            <span>Analitika</span>
                        </div>
                        <h1>Statistikat e Mia</h1>
                        <p>Shiko performancën tënde sipas periudhës</p>
                    </header>

                    {/* Period Toggle */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                        {PERIODS.map(p => (
                            <button
                                key={p.key}
                                onClick={() => setPeriod(p.key)}
                                className={`status-pill ${period === p.key ? 'confirmed' : ''}`}
                                style={{ border: 'none', cursor: 'pointer', padding: '10px 24px', borderRadius: '12px', fontWeight: period === p.key ? '700' : '500' }}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="planora-loader-big"></div>
                    ) : stats ? (
                        <>
                            {/* Stats Cards */}
                            <div className="stats-indicator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                                <div className="stat-pill-box total">
                                    <BarChart2 size={18} />
                                    <span><strong>{stats.total}</strong> Total</span>
                                </div>
                                <div className="stat-pill-box active">
                                    <CheckCircle size={18} />
                                    <span><strong>{stats.completed}</strong> Kryer</span>
                                </div>
                                <div className="stat-pill-box pending">
                                    <Clock size={18} />
                                    <span><strong>{stats.upcoming}</strong> Pritje</span>
                                </div>
                                <div className="stat-pill-box inactive" style={{ background: '#fef9c3' }}>
                                    <AlertCircle size={18} color="#ca8a04" />
                                    <span><strong>{stats.no_show}</strong> Mungoi</span>
                                </div>
                                <div className="stat-pill-box inactive">
                                    <XCircle size={18} />
                                    <span><strong>{stats.cancelled}</strong> Anuluar</span>
                                </div>
                            </div>

                            {/* Bar Chart */}
                            {Object.keys(chart).length > 0 && (
                                <div className="planora-calendar-big" style={{ padding: '25px' }}>
                                    <h3 style={{ marginBottom: '20px', color: '#1e293b' }}>Terminet sipas ditës</h3>
                                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '160px', overflowX: 'auto', paddingBottom: '10px' }}>
                                        {Object.entries(chart).map(([date, count]) => (
                                            <div key={date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '40px' }}>
                                                <span style={{ fontSize: '0.7rem', fontWeight: '700', color: '#2563eb' }}>{count}</span>
                                                <div
                                                    style={{
                                                        width: '32px',
                                                        height: `${(count / maxVal) * 120}px`,
                                                        background: 'linear-gradient(180deg, #2563eb, #60a5fa)',
                                                        borderRadius: '6px 6px 0 0',
                                                        minHeight: '4px',
                                                        transition: 'height 0.4s ease'
                                                    }}
                                                />
                                                <span style={{ fontSize: '0.65rem', color: '#94a3b8', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                                    {new Date(date).toLocaleDateString('sq-AL', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
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