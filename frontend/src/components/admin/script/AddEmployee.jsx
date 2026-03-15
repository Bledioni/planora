import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Mail, Phone, Lock, User, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AddEmployee.css';

const AddEmployee = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [isReadd, setIsReadd] = useState(false);

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

        if (!isReadd && formData.password !== formData.password_confirmation) {
            Swal.fire('Gabim', 'Fjalëkalimet nuk përputhen!', 'error');
            return;
        }

        setLoading(true);
        try {
            const payload = isReadd
                ? { business_id: businessId, email: formData.email, is_readd: true }
                : formData;

            const response = await api.post('/admin/employees/create', payload);
            if (response.data.status === 'success') {
                Swal.fire({
                    title: 'Sukses!',
                    text: isReadd ? 'Punonjësi u riaktivizua me sukses!' : 'Punonjësi u shtua me sukses!',
                    icon: 'success',
                    confirmButtonColor: '#2563eb'
                });
                navigate(`/admin/business/${businessId}`);
            }
        } catch (err) {
            const errors = err.response?.data?.errors;
            const errorMessage = errors
                ? Object.values(errors).flat().join('\n')
                : err.response?.data?.message || "Dështoi regjistrimi";
            Swal.fire('Gabim', errorMessage, 'error');
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
                        <h1>{isReadd ? 'Riaktivizo Punonjësin' : 'Shtimi i Stafit'}</h1>
                        <p>Biznesi: <span className="price-tag">#{businessId}</span></p>
                    </header>

                    {/* Toggle */}
                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button
                            type="button"
                            onClick={() => setIsReadd(false)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
                                background: !isReadd ? '#2563eb' : '#f1f5f9',
                                color: !isReadd ? '#fff' : '#64748b',
                                border: 'none'
                            }}
                        >
                            <UserPlus size={16} style={{ marginRight: '6px' }} />
                            Punonjës i Ri
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsReadd(true)}
                            style={{
                                flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600',
                                background: isReadd ? '#2563eb' : '#f1f5f9',
                                color: isReadd ? '#fff' : '#64748b',
                                border: 'none'
                            }}
                        >
                            <RefreshCw size={16} style={{ marginRight: '6px' }} />
                            Riaktivizo Ekzistues
                        </button>
                    </div>

                    <div className="premium-form-card">
                        <form onSubmit={handleSubmit} className="planora-form">

                            {isReadd ? (
                                // Readd mode — only email needed
                                <div className="premium-input-group">
                                    <label><Mail size={14}/> Email i Punonjësit Ekzistues</label>
                                    <input name="email" type="email" placeholder="email@planora.com" value={formData.email} onChange={handleChange} required />
                                </div>
                            ) : (
                                // New employee mode — full form
                                <>
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
                                </>
                            )}

                            <div className="form-info-alert">
                                <ShieldCheck size={20} />
                                <p>
                                    {isReadd
                                        ? 'Punonjësi ekzistues do të riaktivizohet dhe do të ketë akses përsëri.'
                                        : 'Punonjësi do të krijohet me rol Employee dhe do të jetë aktiv menjëherë.'
                                    }
                                </p>
                            </div>

                            <button type="submit" className="planora-submit-btn" disabled={loading}>
                                {loading ? <div className="loader-mini"></div> : isReadd
                                    ? <><RefreshCw size={20}/> Riaktivizo Punonjësin</>
                                    : <><UserPlus size={20}/> Regjistro Punonjësin</>
                                }
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AddEmployee; 