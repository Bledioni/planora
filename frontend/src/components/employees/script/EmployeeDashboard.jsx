import { useEffect, useState } from 'react';
import { Calendar, Clock, Phone, Scissors, RefreshCw, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
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

    const handleCancel = async (appt) => {
        const result = await Swal.fire({
            title: 'Anulo Terminin?',
            text: `Termini i ${appt.client_name} do të anulohet.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Po, Anulo',
            cancelButtonText: 'Mbyll'
        });
        if (result.isConfirmed) updateStatus(appt.id, 'cancelled');
    };

    const getStatusClass = (status) => {
        const map = { completed: 'completed', cancelled: 'cancelled', no_show: 'pending', confirmed: 'confirmed' };
        return map[status] || 'pending';
    };

    const formatTime = (datetime) => {
        return new Date(datetime).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' });
    };

    const today = new Date().toLocaleDateString('sq-AL', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <div className="owner-layout">
            <EmployeeSidebar />
            <main className="owner-main-content">

                <div className="schedule-header-big">
                    <div className="header-top-tag">
                        <Calendar size={13} />
                        <span>Terminet e Sotme</span>
                    </div>
                    <h1>Kryefaqja</h1>
                    <p>Terminet tuaja për <strong>{today}</strong></p>
                </div>

                <div className="schedule-container-wide">

                    <div className="ed-stats-row">
                        <div className="ed-stat-card blue">
                            <Calendar size={16} />
                            <div>
                                <span className="ed-stat-num">{appointments.length}</span>
                                <span className="ed-stat-label">Sot</span>
                            </div>
                        </div>
                        <div className="ed-stat-card green">
                            <CheckCircle size={16} />
                            <div>
                                <span className="ed-stat-num">{appointments.filter(a => a.status === 'completed').length}</span>
                                <span className="ed-stat-label">Kryer</span>
                            </div>
                        </div>
                        <div className="ed-stat-card amber">
                            <Clock size={16} />
                            <div>
                                <span className="ed-stat-num">{appointments.filter(a => a.status === 'confirmed').length}</span>
                                <span className="ed-stat-label">Mbetur</span>
                            </div>
                        </div>
                    </div>

                    <div className="timeline-container">
                        {loading ? (
                            <div className="planora-loader-big" />
                        ) : appointments.length > 0 ? (
                            appointments.map((appt, i) => (
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
                                                <Clock size={11} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} />
                                                {formatTime(appt.start_time)} — {formatTime(appt.finish_time)}
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

                                            {appt.status === 'confirmed' && (
                                                <div className="ed-actions">
                                                    <button
                                                        onClick={() => handleComplete(appt)}
                                                        className="ed-btn-complete"
                                                    >
                                                        {updatingId === appt.id
                                                            ? <RefreshCw size={14} className="spin" />
                                                            : <><CheckCircle size={14} /> U krye</>
                                                        }
                                                    </button>
                                                    <button
                                                        onClick={() => handleNoShow(appt)}
                                                        className="ed-btn-noshow"
                                                    >
                                                        Pa paraqitje
                                                    </button>
                                                    <button
                                                        onClick={() => handleCancel(appt)}
                                                        className="ed-btn-cancel"
                                                    >
                                                        {updatingId === appt.id
                                                            ? <RefreshCw size={14} className="spin" />
                                                            : <><XCircle size={14} /> Anulo</>
                                                        }
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card">
                                <Calendar size={40} />
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