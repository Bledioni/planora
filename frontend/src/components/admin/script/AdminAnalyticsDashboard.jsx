import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, TrendingDown, Users, Calendar, 
    Building2, Clock, AlertCircle, BarChart3, RefreshCw,
    CheckCircle2, Timer
} from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from './AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminAnalyticsDashboard.css';

const AdminAnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchStats(); }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/dashboard/stats');
            setStats(res.data.stats);
        } catch (err) {
            Swal.fire('Gabim', 'Nuk u ngarkuan statistikat.', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (loading || !stats) {
        return (
            <div className="analytics-page">
                <AdminSidebar />
                <div className="analytics-loading-screen">
                    <div className="planora-loader-premium" />
                    <p>Duke analizuar të dhënat...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="analytics-page">
            <AdminSidebar />
            <main className="analytics-main-content">
                <div className="analytics-wrapper">
                    
                    {/* Header me Stil Premium */}
                    <header className="analytics-premium-header">
                        <div className="header-info">
                            <div className="header-tag">PASQYRA LIVE</div>
                            <h1>Analytics <span>Dashboard</span></h1>
                            <p>Performanca e platformës për periudhën aktuale</p>
                        </div>
                        <button onClick={fetchStats} className="refresh-glass-btn" disabled={loading}>
                            <RefreshCw size={18} className={loading ? 'spin' : ''} />
                            Rifresko
                        </button>
                    </header>

                    {/* Katër Kartat Kryesore */}
                    <div className="analytics-stats-grid">
                        
                        <div className="glass-card stat-card-purple">
                            <div className="card-inner">
                                <div className="icon-box"><Building2 size={24} /></div>
                                <div className="stat-data">
                                    <span className="label">Totali Bizneseve</span>
                                    <h2 className="value">{stats.total_businesses}</h2>
                                    <div className="footer-info">
                                        <span className="sub-item active"><CheckCircle2 size={12}/> {stats.active_businesses}</span>
                                        <span className="sub-item pending"><Timer size={12}/> {stats.pending_businesses}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={`glass-card stat-card-green ${stats.growth_rate < 0 ? 'negative' : ''}`}>
                            <div className="card-inner">
                                <div className="icon-box">
                                    {stats.growth_rate >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                </div>
                                <div className="stat-data">
                                    <span className="label">Rritja Javore</span>
                                    <h2 className="value">{stats.growth_rate >= 0 ? '+' : ''}{stats.growth_rate}%</h2>
                                    <div className="footer-info">
                                        <span>Javën e kaluar: {stats.businesses_last_week}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card stat-card-blue">
                            <div className="card-inner">
                                <div className="icon-box"><Calendar size={24} /></div>
                                <div className="stat-data">
                                    <span className="label">Terminë Sot</span>
                                    <h2 className="value">{stats.appointments_today}</h2>
                                    <div className="footer-info">
                                        <span>Statusi i ditës së sotme</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass-card stat-card-orange">
                            <div className="card-inner">
                                <div className="icon-box"><AlertCircle size={24} /></div>
                                <div className="stat-data">
                                    <span className="label">Skadojnë Shpejt</span>
                                    <h2 className="value">{stats.expiring_soon}</h2>
                                    <div className="footer-info">
                                        <span>Në 7 ditët e ardhshme</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Chart dhe Summary Section */}
                    <div className="analytics-lower-grid">
                        
                        <div className="glass-card chart-container">
                            <div className="chart-head">
                                <BarChart3 size={20} />
                                <h3>Kategoritë më Popullore</h3>
                            </div>
                            <div className="chart-body">
                                {stats.popular_categories.map((cat, index) => {
                                    const maxValue = Math.max(...stats.popular_categories.map(c => c.total));
                                    const percentage = (cat.total / maxValue) * 100;
                                    return (
                                        <div key={index} className="bar-row">
                                            <div className="bar-label">
                                                <span>{cat.name}</span>
                                                <span className="count">{cat.total} biznese</span>
                                            </div>
                                            <div className="bar-track">
                                                <div className="bar-fill" style={{ width: `${percentage}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="quick-summary-column">
                            <div className="summary-pill">
                                <Users size={18} />
                                <div className="info">
                                    <label>Pronarë në total</label>
                                    <strong>{stats.active_businesses + stats.pending_businesses}</strong>
                                </div>
                            </div>
                            <div className="summary-pill">
                                <Clock size={18} />
                                <div className="info">
                                    <label>Mesatarja javore</label>
                                    <strong>{stats.growth_rate}%</strong>
                                </div>
                            </div>
                            <div className="summary-pill active-status">
                                <CheckCircle2 size={18} />
                                <div className="info">
                                    <label>Biznese Aktive</label>
                                    <strong>{stats.active_businesses}</strong>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminAnalyticsDashboard;