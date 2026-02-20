import React, { useState, useEffect } from 'react';
import { api } from '../../../index';
import OwnerSidebar from './OwnerSidebar';
import '../style/OwnerDashboard.css';

const OwnerDashboard = () => {
    const [data, setData] = useState({ stats: null, appointments: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchZenData = async () => {
            try {
                const [s, o] = await Promise.all([
                    api.get('/owner/analytics/business-stats'),
                    api.get('/owner/analytics/owner-schedule')
                ]);
                const apts = o.data.is_employee 
                    ? await api.get(`/owner/schedules/employee/${o.data.employee_id}`, { params: { date: new Date().toISOString().split('T')[0] } })
                    : { data: { appointments: [] } };
                
                setData({ stats: s.data.stats, appointments: apts.data.appointments || [] });
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        fetchZenData();
    }, []);

    if (loading) return <div className="zen-loader">Duke u sinkronizuar...</div>;

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">
                <div className="zen-container">
                    
                    {/* Header - Very Light */}
                    <header className="zen-header">
                        <span className="zen-tag">Sot, {new Date().toLocaleDateString('sq-AL', { day: 'numeric', month: 'long' })}</span>
                        <h1>Përmbledhja</h1>
                    </header>

                    {/* Quick Data Grid */}
                    <section className="zen-stats">
                        <div className="zen-stat-item">
                            <label>Termine (Muaji)</label>
                            <p>{data.stats?.total_appointments || 0}</p>
                        </div>
                        <div className="zen-stat-item">
                            <label>Të ardhura</label>
                            <p>{data.stats?.total_earnings || 0}€</p>
                        </div>
                        <div className="zen-stat-item">
                            <label>Klientë</label>
                            <p>{data.stats?.total_clients || 0}</p>
                        </div>
                    </section>

                    <div className="zen-grid">
                        {/* Left: Schedule */}
                        <div className="zen-main">
                            <h3 className="zen-subhead">Axhenda</h3>
                            <div className="zen-list">
                                {data.appointments.length > 0 ? data.appointments.map((apt, i) => (
                                    <div key={i} className="zen-list-item">
                                        <span className="zen-time">{apt.appointment_time.slice(0, 5)}</span>
                                        <div className="zen-details">
                                            <strong>{apt.client_name}</strong>
                                            <span>{apt.service_name}</span>
                                        </div>
                                    </div>
                                )) : <p className="zen-empty">Nuk ka plane për sot.</p>}
                            </div>
                        </div>

                        {/* Right: Top Services */}
                        <div className="zen-side">
                            <h3 className="zen-subhead">Top Shërbimet</h3>
                            <div className="zen-simple-list">
                                {data.stats?.top_services?.slice(0, 3).map((s, i) => (
                                    <div key={i} className="zen-service-row">
                                        <span>{s.service_name}</span>
                                        <small>{s.total} herë</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OwnerDashboard;