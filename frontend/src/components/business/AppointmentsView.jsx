import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../index';
import { Calendar, Clock, User, Phone } from 'lucide-react';
import '../business/style/AppointmentsView.css';

const AppointmentsView = () => {
    const { businessId } = useParams();
    const [employees, setEmployees] = useState([]);
    const [selectedEmp, setSelectedEmp] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Ngarko punonjësit e biznesit
    useEffect(() => {
        api.get(`/owner/business/${businessId}/employees`)
            .then(res => {
                setEmployees(res.data);
                if (res.data.length > 0) setSelectedEmp(res.data[0]); // Zgjidh të parin automatikisht
            })
            .catch(err => console.error("Gabim te punonjësit:", err));
    }, [businessId]);

    // 2. Ngarko takimet kur ndryshon punonjësi
    useEffect(() => {
        if (selectedEmp) {
            fetchAppointments(selectedEmp.id);
        }
    }, [selectedEmp]);

    const fetchAppointments = async (empId) => {
        setLoading(true);
        try {
            const res = await api.get(`/owner/employee/${empId}/appointments`);
            setAppointments(res.data);
        } catch (err) {
            console.error("Gabim te takimet:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="appointments-container">
            <header className="view-header">
                <h2><Calendar size={24} /> Menaxhimi i Takimeve</h2>
                <p>Zgjidh punonjësin për të parë agjendën</p>
            </header>

            {/* Lista horizontale e punonjësve */}
            <div className="employee-tabs">
                {employees.map(emp => (
                    <button 
                        key={emp.id} 
                        className={`emp-tab ${selectedEmp?.id === emp.id ? 'active' : ''}`}
                        onClick={() => setSelectedEmp(emp)}
                    >
                        <div className="emp-avatar">{emp.name[0]}</div>
                        <span>{emp.name}</span>
                    </button>
                ))}
            </div>

            {/* Lista e Takimeve */}
            <div className="appointments-list">
                <h3>Takimet për: {selectedEmp?.name}</h3>
                {loading ? (
                    <div className="loader">Duke kërkuar takimet...</div>
                ) : appointments.length > 0 ? (
                    <div className="appointments-grid">
                        {appointments.map(app => (
                            <div key={app.id} className="appointment-card">
                                <div className="app-time">
                                    <Clock size={16} /> {app.start_time} - {app.end_time}
                                </div>
                                <div className="app-info">
                                    <h4><User size={16} /> {app.client_name}</h4>
                                    <p><Phone size={14} /> {app.client_phone}</p>
                                    <span className="service-badge">{app.service_name}</span>
                                </div>
                                <div className={`status-dot ${app.status}`}></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">Nuk ka takime për sot.</div>
                )}
            </div>
        </div>
    );
};

export default AppointmentsView;