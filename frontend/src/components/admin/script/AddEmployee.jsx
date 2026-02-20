import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Mail, Phone, Lock, User, ShieldCheck } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AddEmployee.css'; // Përdorim stilin e unifikuar

const AddEmployee = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        business_id: businessId,
        name: '',
        surname: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        role: 'employee'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.password_confirmation) {
            Swal.fire('Gabim', 'Fjalëkalimet nuk përputhen!', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/admin/employees/create', formData);
            if (response.data.status === 'success') {
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Punonjësi u shtua me sukses!',
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                });
                navigate(`/admin/business/${businessId}`);
            }
        } catch (err) {
            Swal.fire('Gabim', err.response?.data?.message || "Dështoi regjistrimi", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="owner-layout">
            <AdminSidebar />
            
            <main className="owner-main-content">
                <div className="schedule-container-wide form-flex-center">
                    
                    <header className="schedule-header-big">
                        <button onClick={() => navigate(`/admin/business/${businessId}`)} className="header-top-tag" style={{border:'none', cursor:'pointer'}}>
                            <ArrowLeft size={14} />
                            <span>Paneli i Biznesit</span>
                        </button>
                        <h1>Shtimi i Stafit</h1>
                        <p>Biznesi: <span className="price-tag">#{businessId}</span></p>
                    </header>

                    <div className="premium-form-card">
                        <form onSubmit={handleSubmit} className="planora-form">
                            
                            <div className="form-grid-2">
                                <div className="premium-input-group">
                                    <label><User size={14}/> Emri</label>
                                    <input name="name" type="text" placeholder="Emri" value={formData.name} onChange={handleChange} required />
                                </div>
                                <div className="premium-input-group">
                                    <label><User size={14}/> Mbiemri</label>
                                    <input name="surname" type="text" placeholder="Mbiemri" value={formData.surname} onChange={handleChange} required />
                                </div>
                            </div>

                            <div className="premium-input-group">
                                <label><Mail size={14}/> Email Adresa</label>
                                <input name="email" type="email" placeholder="email@planora.com" value={formData.email} onChange={handleChange} required />
                            </div>

                            <div className="premium-input-group">
                                <label><Phone size={14}/> Numri i Telefonit</label>
                                <input name="phone_number" type="tel" placeholder="+383..." value={formData.phone_number} onChange={handleChange} required />
                            </div>

                            <div className="form-grid-2">
                                <div className="premium-input-group">
                                    <label><Lock size={14}/> Fjalëkalimi</label>
                                    <input name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required minLength={8} />
                                </div>
                                <div className="premium-input-group">
                                    <label><Lock size={14}/> Konfirmimi</label>
                                    <input name="password_confirmation" type="password" placeholder="••••••••" value={formData.password_confirmation} onChange={handleChange} required minLength={8} />
                                </div>
                            </div>

                            <div className="form-info-alert">
                                <ShieldCheck size={20} />
                                <p>Punonjësi do të krijohet me rol <strong>Employee</strong> dhe do të jetë aktiv menjëherë.</p>
                            </div>

                            <button type="submit" className="planora-submit-btn" disabled={loading}>
                                {loading ? <div className="loader-mini"></div> : <><UserPlus size={20}/> Regjistro Punonjësin</>}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddEmployee;