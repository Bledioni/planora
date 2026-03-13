import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Building2, MapPin, Phone, Tag, FileText, ToggleLeft } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminBusinessConfig.css';

const AdminBusinessConfig = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        shop_name:     '',
        address:       '',
        phone:         '',
        business_type: '',
        description:   '',
    });

    useEffect(() => {
        api.get(`/admin/businesses/details/${businessId}`)
            .then(res => {
                const b = res.data;
                setForm({
                    shop_name:     b.shop_name     || '',
                    address:       b.address       || '',
                    phone:         b.phone         || '',
                    business_type: b.business_type || '',
                    description:   b.description   || '',
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

    const fields = [
        { name: 'shop_name',     label: 'Emri i Biznesit', icon: <Building2 size={15} />, type: 'text',  placeholder: 'p.sh. Royal Cuts' },
        { name: 'address',       label: 'Adresa',          icon: <MapPin    size={15} />, type: 'text',  placeholder: 'p.sh. Rr. Fehmi Agani, Prishtinë' },
        { name: 'phone',         label: 'Telefoni',        icon: <Phone     size={15} />, type: 'text',  placeholder: 'p.sh. +383 44 000 000' },
        { name: 'business_type', label: 'Lloji Biznesit',  icon: <Tag       size={15} />, type: 'text',  placeholder: 'p.sh. Barber, Salon, Spa' },
    ];

    return (
        <div className="owner-layout">
            <AdminSidebar />

            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    {/* Header */}
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

                            {/* Section title */}
                            <div className="config-section-title">
                                <Building2 size={16} />
                                <span>Të dhënat e biznesit</span>
                            </div>

                            {/* Fields grid */}
                            <div className="config-fields-grid">
                                {fields.map(field => (
                                    <div className="config-field-group" key={field.name}>
                                        <label className="config-label">
                                            {field.icon}
                                            {field.label}
                                        </label>
                                        <input
                                            type={field.type}
                                            name={field.name}
                                            value={form[field.name]}
                                            onChange={handleChange}
                                            className="config-input"
                                            placeholder={field.placeholder}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Description */}
                            <div className="config-field-group" style={{ marginTop: '16px' }}>
                                <label className="config-label">
                                    <FileText size={15} />
                                    Përshkrimi
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

                            {/* Divider */}
                            <div className="config-divider" />

                            {/* Active toggle */}
                            <div className="config-section-title" style={{ marginBottom: '12px' }}>
                                <ToggleLeft size={16} />
                                <span>Statusi</span>
                            </div>

                            <div className="config-toggle-row">
                                <div>
                                    <p className="config-toggle-title">
                                        {form.is_active ? '✅ Biznesi Aktiv' : '🔴 Biznesi Joaktiv'}
                                    </p>
                                    <p className="config-toggle-sub">
                                        {form.is_active
                                            ? 'Biznesi është i dukshëm dhe pranon rezervime.'
                                            : 'Biznesi është i fshehur dhe nuk pranon rezervime.'}
                                    </p>
                                </div>
                                <label className="toggle-switch">
                                    <input
                                        type="checkbox"
                                        name="is_active"
                                        checked={form.is_active}
                                        onChange={handleChange}
                                    />
                                    <span className="toggle-slider" />
                                </label>
                            </div>

                            {/* Save button */}
                            <button
                                type="submit"
                                className="config-save-btn"
                                disabled={saving}
                            >
                                {saving ? (
                                    <div
                                        className="planora-loader-small"
                                        style={{ width: 18, height: 18, borderWidth: 2 }}
                                    />
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