import React, { useState, useEffect } from 'react';
import { 
    TrendingUp, TrendingDown, Users, Calendar, 
    Building2, Clock, AlertCircle, BarChart3, RefreshCw,
    CheckCircle2, Timer, Download, UserCog
} from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from './AdminSidebar';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import '../style/AdminAnalyticsDashboard.css';

const AdminAnalyticsDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

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

    const exportToExcel = () => {
        if (!stats) return;
        setExporting(true);

        try {
            const wb = XLSX.utils.book_new();

            // ── Sheet 1: Përmbledhja e Përgjithshme ──────────────────────
            const overviewData = [
                ['ANALYTICS DASHBOARD - PLANORA', '', ''],
                ['Eksportuar më:', new Date().toLocaleString('sq-AL'), ''],
                ['', '', ''],
                ['TREGUES', 'VLERA', 'DETAJE'],
                ['Totali i Bizneseve', stats.total_businesses, ''],
                ['Biznese Aktive', stats.active_businesses, ''],
                ['Biznese në Pritje', stats.pending_businesses, ''],
                ['Totali i Punonjësve', stats.total_employees, ''],
                ['Rritja Javore', `${stats.growth_rate >= 0 ? '+' : ''}${stats.growth_rate}%`, `Javën e kaluar: ${stats.businesses_last_week}`],
                ['Termimet Sot', stats.appointments_today, ''],
                ['Skadojnë Shpejt', stats.expiring_soon, 'Në 7 ditët e ardhshme'],
                ['Pronarë në Total', stats.active_businesses + stats.pending_businesses, ''],
            ];

            const wsOverview = XLSX.utils.aoa_to_sheet(overviewData);
            wsOverview['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 30 }];
            wsOverview['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
            XLSX.utils.book_append_sheet(wb, wsOverview, 'Përmbledhja');

            // ── Sheet 2: Kategoritë Popullore ────────────────────────────
            const totalBusinesses = stats.popular_categories.reduce((sum, c) => sum + c.total, 0);
            const categoriesRows = stats.popular_categories.map((cat) => [
                cat.name,
                cat.total,
                `${((cat.total / totalBusinesses) * 100).toFixed(1)}%`,
            ]);

            const wsCategories = XLSX.utils.aoa_to_sheet([
                ['KATEGORITË MË POPULLORE', '', ''],
                ['Eksportuar më:', new Date().toLocaleString('sq-AL'), ''],
                ['', '', ''],
                ['Emri i Kategorisë', 'Numri i Bizneseve', 'Përqindja'],
                ...categoriesRows,
                ['', '', ''],
                ['TOTALI', totalBusinesses, '100%'],
            ]);
            wsCategories['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
            wsCategories['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
            XLSX.utils.book_append_sheet(wb, wsCategories, 'Kategoritë');

            // ── Sheet 3: Statistikat e Rritjes ───────────────────────────
            const wsGrowth = XLSX.utils.aoa_to_sheet([
                ['STATISTIKAT E RRITJES & PUNONJËSIT', '', ''],
                ['Eksportuar më:', new Date().toLocaleString('sq-AL'), ''],
                ['', '', ''],
                ['TREGUES', 'VLERA', ''],
                ['Biznese këtë javë', stats.businesses_this_week, ''],
                ['Biznese javën e kaluar', stats.businesses_last_week, ''],
                ['Ndryshimi', stats.businesses_this_week - stats.businesses_last_week, ''],
                ['Rritja %', `${stats.growth_rate >= 0 ? '+' : ''}${stats.growth_rate}%`, ''],
                ['', '', ''],
                ['Totali i Punonjësve', stats.total_employees, ''],
            ]);
            wsGrowth['!cols'] = [{ wch: 30 }, { wch: 20 }, { wch: 15 }];
            wsGrowth['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }];
            XLSX.utils.book_append_sheet(wb, wsGrowth, 'Rritja');

            // ── Generate & Download ───────────────────────────────────────
            const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const blob = new Blob([excelBuffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });

            const date = new Date().toISOString().split('T')[0];
            saveAs(blob, `planora-analytics-${date}.xlsx`);

            Swal.fire({
                icon: 'success',
                title: 'Eksportuar!',
                text: 'Analytics u eksportuan me sukses në Excel.',
                timer: 2000,
                showConfirmButton: false,
            });

        } catch (err) {
            Swal.fire('Gabim', 'Nuk u eksportua skedari.', 'error');
        } finally {
            setExporting(false);
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
                    
                    {/* Header */}
                    <header className="analytics-premium-header">
                        <div className="header-info">
                            <div className="header-tag">PASQYRA LIVE</div>
                            <h1>Analytics <span>Dashboard</span></h1>
                            <p>Performanca e platformës për periudhën aktuale</p>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={fetchStats} className="refresh-glass-btn" disabled={loading}>
                                <RefreshCw size={18} className={loading ? 'spin' : ''} />
                                Rifresko
                            </button>
                            <button
                                onClick={exportToExcel}
                                className="refresh-glass-btn"
                                disabled={exporting}
                                style={{ background: 'rgba(34,197,94,0.15)', borderColor: 'rgba(34,197,94,0.3)' }}
                            >
                                <Download size={18} />
                                {exporting ? 'Duke eksportuar...' : 'Eksporto Excel'}
                            </button>
                        </div>
                    </header>

                    {/* 5 Kartat Kryesore */}
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

                        {/* 👈 New Employees Card */}
                        <div className="glass-card stat-card-purple">
                            <div className="card-inner">
                                <div className="icon-box"><UserCog size={24} /></div>
                                <div className="stat-data">
                                    <span className="label">Totali Punonjësve</span>
                                    <h2 className="value">{stats.total_employees}</h2>
                                    <div className="footer-info">
                                        <span>Në të gjitha bizneset</span>
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
                            <div className="summary-pill">
                                <UserCog size={18} />
                                <div className="info">
                                    <label>Totali Punonjësve</label>
                                    <strong>{stats.total_employees}</strong>
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