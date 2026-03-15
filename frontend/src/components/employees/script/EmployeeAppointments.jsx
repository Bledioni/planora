import { useEffect, useState, useCallback } from 'react';
import { Clock, Phone, Scissors, Calendar, RefreshCw, Search } from 'lucide-react';
import { api } from '../../../index';
import EmployeeSidebar from '../script/EmployeeSidebar';
import Swal from 'sweetalert2';
import '../style/EmployeeAppointments.css';

const TABS = [
    { key: 'upcoming', label: 'Të ardhshme' },
    { key: 'past',     label: 'Të kaluara'  },
    { key: 'all',      label: 'Të gjitha'   },
];

const EmployeeAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [activeTab, setActiveTab]       = useState('upcoming');
    const [searchTerm, setSearchTerm]     = useState('');
    const [updatingId, setUpdatingId]     = useState(null);

    const fetchAppointments = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/employee/appointments/list?filter=${activeTab}`);
            setAppointments(res.data.appointments || []);
        } catch {
            Swal.fire('Gabim', 'Nuk mund të ngarkohen terminet.', 'error');
        } finally {
            setLoading(false);
        }
    }, [activeTab]);

    useEffect(() => { fetchAppointments(); }, [fetchAppointments]);

    const updateStatus = async (id, status) => {
        setUpdatingId(id);
        try {
            await api.put(`/employee/appointments/update-status/${id}`, { status });
            Swal.fire('Sukses', 'Statusi u përditësua.', 'success');
            fetchAppointments();
        } catch {
            Swal.fire('Gabim', 'Përditësimi dështoi.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const filtered = appointments.filter(a =>
        a.client_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.client_phone?.includes(searchTerm) ||
        a.service?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDateTime = (dt) => new Date(dt).toLocaleString('sq-AL', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const getStatusClass = (status) => {
        const map = { completed: 'active', cancelled: 'inactive', no_show: 'pending', confirmed: 'confirmed' };
        return map[status] || 'pending';
    };

    return (
        <div className="owner-layout">
            <EmployeeSidebar />
            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    <header className="schedule-header-big">
                        <div className="header-top-tag">
                            <Clock size={14} />
                            <span>Terminet</span>
                        </div>
                        <h1>Terminet e Mia</h1>
                        <p>Shiko dhe menaxho të gjitha terminet tuaja</p>
                    </header>

                    {/* Tabs */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`status-pill ${activeTab === tab.key ? 'confirmed' : ''}`}
                                style={{ border: 'none', cursor: 'pointer', padding: '10px 20px', borderRadius: '12px', fontWeight: activeTab === tab.key ? '700' : '500' }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="planora-calendar-big" style={{ padding: '15px', marginBottom: '2rem' }}>
                        <div style={{ background: 'white', padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', flex: '1' }}>
                            <Search size={18} color="#2563eb" />
                            <input
                                type="text"
                                placeholder="Kërko klient, shërbim..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%' }}
                            />
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="actions-card-grid">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : filtered.length > 0 ? (
                            filtered.map((appt) => (
                                <div key={appt.id} className="premium-action-card employee-card">
                                    <div className="card-top-flex" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px' }}>
                                        <div className="avatar-circle" style={{ width: '50px', height: '50px', fontSize: '1.1rem' }}>
                                            {appt.client_name?.[0]}
                                        </div>
                                        <div className={`status-pill ${getStatusClass(appt.status)}`}>
                                            {appt.status}
                                        </div>
                                    </div>

                                    <div className="card-info" style={{ width: '100%' }}>
                                        <h3 style={{ margin: '0' }}>{appt.client_name}</h3>
                                        <p style={{ fontSize: '0.75rem', marginBottom: '12px', color: '#94a3b8' }}>
                                            {appt.service?.name}
                                        </p>
                                        <div className="emp-details-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Calendar size={14} /> {formatDateTime(appt.start_time)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Phone size={14} /> {appt.client_phone || 'Pa numër'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Scissors size={14} /> {appt.service?.duration_minutes || '—'} min
                                            </div>
                                        </div>
                                    </div>

                                    {appt.status === 'confirmed' && activeTab !== 'past' && (
                                        <div className="card-footer-actions" style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                            <button
                                                onClick={() => updateStatus(appt.id, 'completed')}
                                                style={{ flex: '1', background: '#dcfce7', color: '#16a34a', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}
                                            >
                                                {updatingId === appt.id ? <RefreshCw className="spin" size={16} /> : '✓ U krye'}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card" style={{ gridColumn: '1/-1' }}>
                                <Clock size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Nuk u gjetën termine.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default EmployeeAppointments;