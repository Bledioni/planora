import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import '../components/Register.css';
import { api } from '..';

const BusinessRegister = ({ isAdminCreator = false }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        role: isAdminCreator ? '' : 'business_owner'
    });

    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);
        setLoading(true);

        const token = localStorage.getItem('auth_token');
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

        try {
            const response = await api.post('/register', formData, config);
            
            if (response.data.status === 'success') {
                setSuccessMsg(response.data.message);
                if (!isAdminCreator) {
                    // Nëse regjistrohet vetë, e njoftojmë dhe e lëmë aty ose e dërgojmë te një faqe njoftimi
                    setTimeout(() => navigate('/login'), 5000);
                } else {
                    alert("Përdoruesi u shtua me sukses!");
                    window.location.reload();
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || "Ndodhi një gabim gjatë regjistrimit.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={isAdminCreator ? "register-embedded" : "register-page"}>
            <div className="register-card">
                {!isAdminCreator && (
                    <div className="register-header">
                        <h2>Regjistrimi i Biznesit</h2>
                        <p>Plotësoni të dhënat për të filluar kontratën</p>
                    </div>
                )}

                {error && <div className="error-alert">{error}</div>}
                {successMsg && <div className="success-alert" style={{color: 'green', marginBottom: '15px'}}>{successMsg}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-row">
                        <div className="input-field">
                            <label><User size={16} /> Emri</label>
                            <input type="text" name="name" onChange={handleChange} required />
                        </div>
                        <div className="input-field">
                            <label>Mbiemri</label>
                            <input type="text" name="surname" onChange={handleChange} required />
                        </div>
                    </div>

                    <div className="input-field">
                        <label><Mail size={16} /> Email</label>
                        <input type="email" name="email" onChange={handleChange} required />
                    </div>

                    <div className="input-field">
                        <label><Phone size={16} /> Telefon</label>
                        <input type="text" name="phone_number" onChange={handleChange} required />
                    </div>

                    {isAdminCreator && (
                        <div className="input-field">
                            <label><ShieldCheck size={16} /> Roli</label>
                            <select name="role" onChange={handleChange} required>
                                <option value="">Zgjidh Rolin</option>
                                <option value="business_owner">Business Owner</option>
                                <option value="employee">Employee</option>
                            </select>
                        </div>
                    )}

                    <div className="input-field">
                        <label><Lock size={16} /> Fjalëkalimi</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>

                    <div className="input-field">
                        <label><Lock size={16} /> Konfirmo</label>
                        <input type="password" name="password_confirmation" onChange={handleChange} required />
                    </div>

                    <button type="submit" className="btn-register" disabled={loading}>
                        {loading ? "Duke u procesuar..." : isAdminCreator ? "Shto Përdorues" : "Dërgo Kërkesën"}
                        <ArrowRight size={18} />
                    </button>
                </form>

                {!isAdminCreator && (
                    <div className="register-footer">
                        Keni llogari? <Link to="/login">Identifikohu</Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BusinessRegister;