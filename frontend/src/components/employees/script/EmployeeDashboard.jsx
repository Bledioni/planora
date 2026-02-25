import { useEffect, useState } from 'react';
import { Calendar, Clock, User, Phone, Scissors, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { api } from '../../../index';
import EmployeeSidebar from '../script/EmployeeSidebar';
import Swal from 'sweetalert2';
import '../style/EmployeeDashboard.css';

const EmployeeDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchToday = async () => {
        try {
            setLoading(true);
            const res = await api.get('/employee/appointments/list?filter=today');
            if (res.data.appointments) {
                setAppointments(res.data.appointments);
            }
        } catch {
            Swal.fire('Gabim', 'Nuk mund të ngarkohen terminet e sotme.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchToday(); }, []);

    const updateStatus = async (appointmentId, status) => {
        setUpdatingId(appointmentId);
        try {
            await api.put(`/employee/appointments/update-status/${appointmentId}`, { status });
            Swal.fire('Sukses', 'Statusi u përditësua.', 'success');
            fetchToday();
        } catch {
            Swal.fire('Gabim', 'Përditësimi dështoi.', 'error');
        } finally {
            setUpdatingId(null);
        }
    };

    const handleComplete = async (appt) => {
        const result = await Swal.fire({
            title: 'Shëno si i kryer?',
            text: `Termini i ${appt.client_name}`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#22c55e',
            confirmButtonText: 'Po, u krye!',
            cancelButtonText: 'Anulo'
        });
        if (result.isConfirmed) updateStatus(appt.id, 'completed');
    };

    const handleNoShow = async (appt) => {
        const result = await Swal.fire({
            title: 'Klienti nuk erdhi?',
            text: `Shëno ${appt.client_name} si "nuk u paraqit"`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f59e0b',
            confirmButtonText: 'Po',
            cancelButtonText: 'Anulo'
        });
        if (result.isConfirmed) updateStatus(appt.id, 'no_show');
    };

    const getStatusClass = (status) => {
        const map = { completed: 'active', cancelled: 'inactive', no_show: 'pending', confirmed: 'confirmed' };
        return map[status] || 'pending';
    };

    const formatTime = (datetime) => {
        return new Date(datetime).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="owner-layout">
            <EmployeeSidebar />
            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    <header className="schedule-header-big">
                        <div className="header-top-tag">
                            <Calendar size={14} />
                            <span>Terminet e Sotme</span>
                        </div>
                        <h1>Kryefaqja</h1>
                        <p>Terminet tuaja për <strong>{new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' })}</strong></p>
                    </header>

                    {/* Stats row */}
                    <div className="stats-indicator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                        <div className="stat-pill-box total">
                            <Calendar size={18} />
                            <span><strong>{appointments.length}</strong> Sot</span>
                        </div>
                        <div className="stat-pill-box active">
                            <CheckCircle size={18} />
                            <span><strong>{appointments.filter(a => a.status === 'completed').length}</strong> Kryer</span>
                        </div>
                        <div className="stat-pill-box pending">
                            <Clock size={18} />
                            <span><strong>{appointments.filter(a => a.status === 'confirmed').length}</strong> Mbetur</span>
                        </div>
                    </div>

                    {/* Appointments */}
                    <div className="actions-card-grid">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : appointments.length > 0 ? (
                            appointments.map((appt) => (
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
                                            {appt.service?.name || 'Shërbim i panjohur'}
                                        </p>

                                        <div className="emp-details-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Clock size={14} /> {formatTime(appt.start_time)} — {formatTime(appt.finish_time)}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Phone size={14} /> {appt.client_phone || 'Pa numër'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Scissors size={14} /> {appt.service?.duration_minutes || '—'} min
                                            </div>
                                        </div>
                                    </div>

                                    {appt.status === 'confirmed' && (
                                        <div className="card-footer-actions" style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                            <button
                                                onClick={() => handleComplete(appt)}
                                                style={{ flex: '1', background: '#dcfce7', color: '#16a34a', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '600' }}
                                            >
                                                {updatingId === appt.id ? <RefreshCw className="spin" size={16} /> : <><CheckCircle size={16} /> U krye</>}
                                            </button>
                                            <button
                                                onClick={() => handleNoShow(appt)}
                                                style={{ background: '#fef9c3', color: '#ca8a04', border: 'none', padding: '10px', borderRadius: '10px', cursor: 'pointer' }}
                                            >
                                                <XCircle size={16} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card" style={{ gridColumn: '1/-1' }}>
                                <Calendar size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Nuk keni termine për sot.</p>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default EmployeeDashboard;