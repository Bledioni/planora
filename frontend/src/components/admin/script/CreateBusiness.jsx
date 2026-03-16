import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../index'; 
import Swal from 'sweetalert2';
import AdminSidebar from './AdminSidebar';
import { Building2, MapPin, Tag, AlignLeft, Send, Link } from 'lucide-react';
import '../style/CreateBusiness.css';

const CreateBusiness = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        user_id: userId || '',
        category_id: '',
        shop_name: '',
        address: '',
        location_link: '', // ✅ replaced business_type
        description: ''
    });

    useEffect(() => {
        if (userId) {
            setFormData(prev => ({ ...prev, user_id: userId }));
        }
    }, [userId]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/public/categories/all');
                setCategories(res.data.data || res.data);
            } catch (err) { console.error("Gabim me kategoritë", err); }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await api.post('/admin/businesses/create', formData);
            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Biznesi u Aktivizua!',
                    text: 'Pronari dhe stafi tani janë AKTIVË.',
                    confirmButtonColor: '#4f46e5'
                });
                navigate('/admin/users');
            }
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Diçka shkoi gabim gjatë procesit.';
            Swal.fire('Gabim', errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-layout">
            <AdminSidebar />
            
            <main className="admin-main">
                <div className="content-wrapper">
                    <div className="form-card-container">
                        <div className="form-header-section">
                            <h1>Konfiguro Biznesin e Ri</h1>
                            <p>Plotësoni të dhënat për të aktivizuar profilin për User ID: <span>#{userId}</span></p>
                        </div>

                        <form className="modern-form" onSubmit={handleSubmit}>
                            <div className="form-grid-layout">

                                {/* Emri i Biznesit */}
                                <div className="input-field-wrapper">
                                    <label><Building2 size={16} /> Emri i Biznesit</label>
                                    <input 
                                        name="shop_name" 
                                        placeholder="Psh. Estetika 'Era'" 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                {/* Kategoria */}
                                <div className="input-field-wrapper">
                                    <label><Tag size={16} /> Kategoria</label>
                                    <select name="category_id" onChange={handleChange} required>
                                        <option value="">Zgjidhni një kategori</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>{c.name || c.category_name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Adresa */}
                                <div className="input-field-wrapper">
                                    <label><MapPin size={16} /> Adresa</label>
                                    <input 
                                        name="address" 
                                        placeholder="Rruga, Qyteti" 
                                        onChange={handleChange} 
                                        required 
                                    />
                                </div>

                                {/* Location Link */}
                                <div className="input-field-wrapper">
                                    <label><Link size={16} /> Google Maps Link</label>
                                    <input 
                                        name="location_link" 
                                        placeholder="https://maps.google.com/..." 
                                        onChange={handleChange}
                                        type="url"
                                    />
                                </div>

                            </div>

                            {/* Përshkrimi */}
                            <div className="input-field-wrapper full-row">
                                <label><AlignLeft size={16} /> Përshkrimi i Shkurtër</label>
                                <textarea 
                                    name="description" 
                                    placeholder="Tregoni diçka rreth këtij biznesi..." 
                                    rows="4" 
                                    onChange={handleChange} 
                                />
                            </div>

                            <div className="form-footer-actions">
                                <button type="submit" className="primary-submit-btn" disabled={loading}>
                                    {loading ? (
                                        <div className="spinner"></div>
                                    ) : (
                                        <>
                                            <Send size={18} />
                                            <span>Krijo & Aktivizo Biznesin</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CreateBusiness;