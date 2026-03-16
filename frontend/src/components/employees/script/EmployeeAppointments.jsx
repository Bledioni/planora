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
        a.service?.service_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const formatDateTime = (dt) => new Date(dt).toLocaleString('sq-AL', {
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });

    const getStatusClass = (status) => {
        const map = { completed: 'completed', cancelled: 'cancelled', no_show: 'pending', confirmed: 'confirmed' };
        return map[status] || 'pending';
    };

    return (
        <div className="owner-layout">
            <EmployeeSidebar />
            <main className="owner-main-content">

                <div className="schedule-header-big">
                    <div className="header-top-tag">
                        <Clock size={13} />
                        <span>Terminet</span>
                    </div>
                    <h1>Terminet e Mia</h1>
                    <p>Shiko dhe menaxho të gjitha terminet tuaja</p>
                </div>

                <div className="schedule-container-wide">

                    {/* Tabs */}
                    <div className="ea-tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`ea-tab ${activeTab === tab.key ? 'active' : ''}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="ea-search">
                        <Search size={16} />
                        <input
                            type="text"
                            placeholder="Kërko klient, shërbim..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* List */}
                    <div className="timeline-container">
                        {loading ? (
                            <div className="planora-loader-big" />
                        ) : filtered.length > 0 ? (
                            filtered.map((appt, i) => (
                                <div
                                    key={appt.id}
                                    className="timeline-row"
                                    style={{ animationDelay: `${i * 0.04}s` }}
                                >
                                    <div className="appointment-card-large">
                                        <div className="client-section">
                                            <div className="avatar-circle">
                                                {appt.client_name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="client-details">
                                                <h3>{appt.client_name}</h3>
                                                <span className="service-txt">
                                                    {appt.service?.service_name || 'Shërbim i panjohur'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="card-right-info">
                                            <span className="apt-time-tag">
                                                <Calendar size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                {formatDateTime(appt.start_time)}
                                            </span>
                                            <span className="apt-time-tag">
                                                <Phone size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                {appt.client_phone || 'Pa numër'}
                                            </span>
                                            <span className="apt-time-tag">
                                                <Scissors size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                {appt.service?.service_duration || '—'} min
                                            </span>
                                            <span className={`status-pill ${getStatusClass(appt.status)}`}>
                                                {appt.status}
                                            </span>

                                            {appt.status === 'confirmed' && activeTab !== 'past' && (
                                                <button
                                                    onClick={() => updateStatus(appt.id, 'completed')}
                                                    className="ed-btn-complete"
                                                >
                                                    {updatingId === appt.id
                                                        ? <RefreshCw size={14} className="spin" />
                                                        : '✓ U krye'
                                                    }
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card">
                                <Clock size={40} />
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