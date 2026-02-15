import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Mail, Phone, Lock, User } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AddEmployee.css';

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
        
        // Validation
        if (formData.password !== formData.password_confirmation) {
            Swal.fire('Gabim', 'Fjalëkalimet nuk përputhen!', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/auth/register', formData);
            if (response.status === 201) {
                Swal.fire({
                    title: 'Sukses!',
                    text: 'Punonjësi u shtua dhe është AKTIV!',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
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
        <div className="page-wrapper">
            <AdminSidebar />
            
            <div className="main-content">
                <div className="content-inner form-page-content">
                    {/* Header */}
                    <header className="form-header">
                        <button 
                            onClick={() => navigate(`/admin/business/${businessId}`)} 
                            className="back-link"
                        >
                            <ArrowLeft size={18} />
                            <span>Kthehu tek Paneli</span>
                        </button>
                        
                        <div className="header-title">
                            <div className="icon-wrapper">
                                <UserPlus size={32} />
                            </div>
                            <div>
                                <h1>Shto Punonjës të Ri</h1>
                                <p className="subtitle">Regjistro staf për biznesin #{businessId}</p>
                            </div>
                        </div>
                    </header>

                    {/* Form Card */}
                    <div className="form-card">
                        <form onSubmit={handleSubmit} className="employee-form">
                            {/* Name & Surname Row */}
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="name">
                                        <User size={16} />
                                        <span>Emri</span>
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        placeholder="Shkruaj emrin"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="surname">
                                        <User size={16} />
                                        <span>Mbiemri</span>
                                    </label>
                                    <input
                                        id="surname"
                                        name="surname"
                                        type="text"
                                        placeholder="Shkruaj mbiemrin"
                                        value={formData.surname}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Email */}
                            <div className="input-group">
                                <label htmlFor="email">
                                    <Mail size={16} />
                                    <span>Email</span>
                                </label>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="example@email.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Phone */}
                            <div className="input-group">
                                <label htmlFor="phone_number">
                                    <Phone size={16} />
                                    <span>Numri i Telefonit</span>
                                </label>
                                <input
                                    id="phone_number"
                                    name="phone_number"
                                    type="tel"
                                    placeholder="+383 XX XXX XXX"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* Password Row */}
                            <div className="form-row">
                                <div className="input-group">
                                    <label htmlFor="password">
                                        <Lock size={16} />
                                        <span>Fjalëkalimi</span>
                                    </label>
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="Minimum 8 karaktere"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        minLength={8}
                                    />
                                </div>

                                <div className="input-group">
                                    <label htmlFor="password_confirmation">
                                        <Lock size={16} />
                                        <span>Konfirmo Fjalëkalimin</span>
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        type="password"
                                        placeholder="Rishkruaj fjalëkalimin"
                                        value={formData.password_confirmation}
                                        onChange={handleChange}
                                        required
                                        disabled={loading}
                                        minLength={8}
                                    />
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="info-box">
                                <span className="info-icon">ℹ️</span>
                                <p>Punonjësi do të ketë akses të plotë në sistem menjëherë pas regjistrimit.</p>
                            </div>

                            {/* Submit Button */}
                            <button 
                                type="submit" 
                                className="submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner"></span>
                                        <span>Duke u ruajtur...</span>
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={20} />
                                        <span>Regjistro Punonjësin</span>
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddEmployee;