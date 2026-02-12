import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../index';
import { Clock, Phone,MessageCircle } from 'lucide-react';
import './OwnerBookings.css';

const OwnerBookings = () => {
    const { businessId } = useParams();
    const [employees, setEmployees] = useState([]);
    const [selectedEmpId, setSelectedEmpId] = useState(null);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await api.get(`/owner/business/${businessId}/employees`);
                setEmployees(res.data);
                if (res.data.length > 0) setSelectedEmpId(res.data[0].id);
            } catch (err) {
                console.error("Gabim në marrjen e punonjësve", err);
            }
        };
        fetchEmployees();
    }, [businessId]);

    useEffect(() => {
        if (selectedEmpId) {
            fetchBookings(selectedEmpId);
        }
    }, [selectedEmpId]);

    const fetchBookings = async (empId) => {
        setLoading(true);
        try {
            const res = await api.get(`/owner/employee/${empId}/appointments`);
            setBookings(res.data);
        } catch (err) {
            console.error("Gabim në marrjen e rezervimeve", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bookings-view">
            <header className="view-header">
                <h2>Rezervimet e Biznesit</h2>
                <p>Rrëshqitni dhe zgjidhni punonjësin</p>
            </header>

            {/* Zgjedhja e punonjësit - Mobile Scrollable */}
            <div className="emp-selection-scroll">
                {employees.map((emp) => (
                    <div 
                        key={emp.id} 
                        className={`emp-card-mini ${selectedEmpId === emp.id ? 'active' : ''}`}
                        onClick={() => setSelectedEmpId(emp.id)}
                    >
                        <div className="emp-img">{emp.name[0]}</div>
                        <span>{emp.name}</span>
                    </div>
                ))}
            </div>

            <div className="results-section">
                {loading ? (
                    <div className="loading-state">Duke ngarkuar takimet...</div>
                ) : bookings.length > 0 ? (
                    <div className="booking-cards-list">
                        {bookings.map((b) => (
                            <div key={b.id} className="booking-mobile-card">
                                <div className="b-header">
                                    <span className="b-time"><Clock size={14}/> {b.start_time}</span>
                                    <span className={`b-status ${b.status}`}>{b.status}</span>
                                </div>
                                <div className="b-body">
                                    <h4>{b.client_name}</h4>
                                    <p className="b-service">{b.service_name}</p>
                                </div>
                                <div className="b-footer">
                                    <a href={`tel:${b.client_phone}`} className="action-btn call">
                                        <Phone size={16} /> Telefono
                                    </a>
                                    <button className="action-btn chat">
                                        <MessageCircle size={16} /> WhatsApp
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">Nuk ka rezervime për këtë punonjës.</div>
                )}
            </div>
        </div>
    );
};

export default OwnerBookings;