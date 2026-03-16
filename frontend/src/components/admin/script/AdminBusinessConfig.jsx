import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, MapPin, Tag, FileText, ToggleLeft, Link, Mail, Phone } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminBusinessConfig.css';

const AdminBusinessConfig = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        shop_name:     '',
        address:       '',
        location_link: '',
        category_id:   '',
        description:   '',
        is_active:     false,
        email:         '',
        phone_number:  '',
    });

    useEffect(() => {
        api.get('/public/categories/all')
            .then(res => setCategories(res.data.data || res.data))
            .catch(() => {});

        api.get(`/admin/businesses/details/${businessId}`)
            .then(res => {
                const b = res.data;
                setForm({
                    shop_name:     b.shop_name          || '',
                    address:       b.address            || '',
                    location_link: b.location_link      || '',
                    category_id:   b.category_id        || '',
                    description:   b.description        || '',
                    is_active:     b.is_active          || false,
                    email:         b.user?.email        || '',
                    phone_number:  b.user?.phone_number || '',
                });
            })
            .catch(() => {
                Swal.fire('Gabim', 'Nuk u ngarkuan të dhënat e biznesit.', 'error');
            })
            .finally(() => setLoading(false));
    }, [businessId]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put(`/admin/businesses/update/${businessId}`, form);
            Swal.fire({
                title: 'Sukses!',
                text: res.data.message || 'Biznesi u përditësua!',
                icon: 'success',
                confirmButtonColor: '#1d7af2',
            });
        } catch (err) {
            Swal.fire({
                title: 'Gabim',
                text: err.response?.data?.message || 'Ndodhi një gabim.',
                icon: 'error',
                confirmButtonColor: '#1d7af2',
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="owner-layout">
            <AdminSidebar />

            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    <header className="schedule-header-big">
                        <button
                            onClick={() => navigate(`/admin/business/${businessId}`)}
                            className="header-top-tag"
                            style={{ cursor: 'pointer', border: 'none' }}
                        >
                            <ArrowLeft size={14} />
                            <span>Kthehu</span>
                        </button>
                        <h1>Konfigurime Biznesi</h1>
                        <p>ID: <span className="price-tag">#{businessId}</span></p>
                    </header>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
                            <div className="planora-loader-small" />
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="config-form-card">

                            {/* Business Details Section */}
                            <div className="config-section-title">
                                <Building2 size={16} />
                                <span>Të dhënat e biznesit</span>
                            </div>

                            <div className="config-fields-grid">

                                <div className="config-field-group">
                                    <label className="config-label">
                                        <Building2 size={15} /> Emri i Biznesit
                                    </label>
                                    <input
                                        type="text"
                                        name="shop_name"
                                        value={form.shop_name}
                                        onChange={handleChange}
                                        className="config-input"
                                        placeholder="p.sh. Royal Cuts"
                                    />
                                </div>

                                <div className="config-field-group">
                                    <label className="config-label">
                                        <Tag size={15} /> Kategoria
                                    </label>
                                    <select
                                        name="category_id"
                                        value={form.category_id}
                                        onChange={handleChange}
                                        className="config-input"
                                    >
                                        <option value="">Zgjidhni një kategori</option>
                                        {categories.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.name || c.category_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="config-field-group">
                                    <label className="config-label">
                                        <MapPin size={15} /> Adresa
                                    </label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        className="config-input"
                                        placeholder="p.sh. Rr. Fehmi Agani, Prishtinë"
                                    />
                                </div>

                                <div className="config-field-group">
                                    <label className="config-label">
                                        <Link size={15} /> Google Maps Link
                                    </label>
                                    <input
                                        type="url"
                                        name="location_link"
                                        value={form.location_link}
                                        onChange={handleChange}
                                        className="config-input"
                                        placeholder="https://maps.google.com/..."
                                    />
                                </div>

                            </div>

                            <div className="config-field-group" style={{ marginTop: '16px' }}>
                                <label className="config-label">
                                    <FileText size={15} /> Përshkrimi
                                </label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    className="config-input config-textarea"
                                    placeholder="Shkruaj një përshkrim të shkurtër për biznesin..."
                                    rows={4}
                                />
                            </div>

                            <div className="config-divider" />

                            {/* Owner Details Section */}
                            <div className="config-section-title">
                                <Mail size={16} />
                                <span>Të dhënat e pronarit</span>
                            </div>

                            <div className="config-fields-grid">

                                <div className="config-field-group">
                                    <label className="config-label">
                                        <Mail size={15} /> Email
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="config-input"
                                        placeholder="email@example.com"
                                    />
                                </div>

                                <div className="config-field-group">
                                    <label className="config-label">
                                        <Phone size={15} /> Telefoni
                                    </label>
                                    <input
                                        type="text"
                                        name="phone_number"
                                        value={form.phone_number}
                                        onChange={handleChange}
                                        className="config-input"
                                        placeholder="+383 44 000 000"
                                    />
                                </div>

                            </div>

                            <div className="config-divider" />

                

                            <button type="submit" className="config-save-btn" disabled={saving}>
                                {saving ? (
                                    <div className="planora-loader-small" style={{ width: 18, height: 18, borderWidth: 2 }} />
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Ruaj Ndryshimet
                                    </>
                                )}
                            </button>

                        </form>
                    )}

                </div>
            </main>
        </div>
    );
};

export default AdminBusinessConfig;