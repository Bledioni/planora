import { useEffect, useState, useCallback } from 'react';
import { Scissors, Plus, Trash2, RefreshCw, Search, Clock, Tag } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminDashboard.css';

const AdminGlobalServices = () => {
    const [services, setServices]       = useState([]);
    const [categories, setCategories]   = useState([]);
    const [loading, setLoading]         = useState(true);
    const [deleting, setDeleting]       = useState(null);
    const [showModal, setShowModal]     = useState(false);
    const [saving, setSaving]           = useState(false);
    const [searchTerm, setSearchTerm]   = useState('');
    const [filterCat, setFilterCat]     = useState('all');
    const [formData, setFormData]       = useState({
        name: '', description: '', price: '', duration: '', category_id: ''
    });

    const fetchServices = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/global-services/list');
            setServices(res.data.services || []);
            setCategories(res.data.categories || []);
        } catch {
            Swal.fire('Gabim', 'Nuk u ngarkuan shërbimet.', 'error');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchServices(); }, [fetchServices]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/admin/global-services/create', formData);
            Swal.fire({ icon: 'success', title: 'Shërbimi u shtua!', timer: 1500, showConfirmButton: false });
            setShowModal(false);
            setFormData({ name: '', description: '', price: '', duration: '', category_id: '' });
            fetchServices();
        } catch (err) {
            Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (service) => {
        const result = await Swal.fire({
            title: 'Fshi Shërbimin?',
            text: `A jeni të sigurt për fshirjen e "${service.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Po, fshije!',
            cancelButtonText: 'Anulo'
        });
        if (result.isConfirmed) {
            setDeleting(service.id);
            try {
                await api.delete(`/admin/global-services/delete/${service.id}`);
                setServices(services.filter(s => s.id !== service.id));
                Swal.fire({ icon: 'success', title: 'U fshi!', timer: 1200, showConfirmButton: false });
            } catch {
                Swal.fire('Gabim', 'Fshirja dështoi.', 'error');
            } finally {
                setDeleting(null);
            }
        }
    };

    const filtered = services.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchCat    = filterCat === 'all' || String(s.category_id) === String(filterCat);
        return matchSearch && matchCat;
    });

    return (
        <div className="owner-layout">
            <AdminSidebar />
            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    <header className="schedule-header-big">
                        <div className="header-top-tag">
                            <Scissors size={14} />
                            <span>Menaxhimi</span>
                        </div>
                        <h1>Shërbimet Globale</h1>
                        <p>Shërbimet që shfaqen si sugjerime tek pronarët sipas kategorisë</p>
                    </header>

                    {/* Stats */}
                    <div className="stats-indicator-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                        <div className="stat-pill-box total">
                            <Scissors size={18} />
                            <span><strong>{services.length}</strong> Gjithsej</span>
                        </div>
                        {categories.map(cat => (
                            <div key={cat.id} className="stat-pill-box active">
                                <Tag size={18} />
                                <span><strong>{services.filter(s => s.category_id === cat.id).length}</strong> {cat.name}</span>
                            </div>
                        ))}
                    </div>

                    {/* Search, Filter & Add */}
                    <div className="planora-calendar-big" style={{ padding: '15px', marginBottom: '2rem', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ background: 'white', padding: '10px 15px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '200px' }}>
                            <Search size={18} color="#2563eb" />
                            <input
                                type="text"
                                placeholder="Kërko shërbim..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ border: 'none', outline: 'none', width: '100%' }}
                            />
                        </div>
                        <select
                            value={filterCat}
                            onChange={(e) => setFilterCat(e.target.value)}
                            style={{ padding: '10px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', cursor: 'pointer' }}
                        >
                            <option value="all">Të gjitha kategoritë</option>
                            {categories.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setShowModal(true)}
                            className="planora-submit-btn"
                            style={{ marginTop: '0', padding: '12px 20px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                            <Plus size={18} /> Shto Shërbim
                        </button>
                    </div>

                    {/* Cards */}
                    <div className="actions-card-grid">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : filtered.length > 0 ? (
                            filtered.map((service) => (
                                <div key={service.id} className="premium-action-card employee-card">
                                    <div className="card-top-flex" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px' }}>
                                        <div className="avatar-circle" style={{ width: '50px', height: '50px', background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                                            <Scissors size={20} color="white" />
                                        </div>
                                        <div className="status-pill confirmed">
                                            {service.category?.name || 'Pa kategori'}
                                        </div>
                                    </div>

                                    <div className="card-info" style={{ width: '100%' }}>
                                        <h3 style={{ margin: '0' }}>{service.name}</h3>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', marginTop: '4px' }}>
                                            {service.description || 'Pa përshkrim'}
                                        </p>
                                        <div className="emp-details-list" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Tag size={14} /> €{service.price || '—'}
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#64748b' }}>
                                                <Clock size={14} /> {service.duration || '—'} min
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer-actions" style={{ display: 'flex', gap: '10px', width: '100%', marginTop: '20px', borderTop: '1px solid #f1f5f9', paddingTop: '15px' }}>
                                        <button
                                            onClick={() => handleDelete(service)}
                                            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 16px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}
                                        >
                                            {deleting === service.id
                                                ? <RefreshCw className="spin" size={16} />
                                                : <><Trash2 size={16} /> Fshi</>
                                            }
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card" style={{ gridColumn: '1/-1' }}>
                                <Scissors size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                                <p>Nuk u gjetën shërbime.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ADD MODAL */}
            {showModal && (
                <div
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}
                    onClick={() => setShowModal(false)}
                >
                    <div
                        style={{ background: 'white', borderRadius: '20px', padding: '30px', width: '100%', maxWidth: '480px', margin: '0 16px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#1e293b' }}>Shto Shërbim Global</h2>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8' }}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Emri i Shërbimit *</label>
                                <input
                                    type="text" required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="p.sh. Qethje Klasike"
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kategoria *</label>
                                <select
                                    required
                                    value={formData.category_id}
                                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                >
                                    <option value="">Zgjidhni kategorinë...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Përshkrimi</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Përshkrimi i shërbimit..."
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Çmimi (€)</label>
                                    <input
                                        type="number" step="0.01" min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="0.00"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.85rem', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Kohëzgjatja (min)</label>
                                    <input
                                        type="number" min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        placeholder="30"
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid #e2e8f0', background: 'white', cursor: 'pointer', fontWeight: '600', color: '#64748b' }}
                                >
                                    Anulo
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="planora-submit-btn"
                                    style={{ flex: 2, marginTop: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                >
                                    {saving ? <RefreshCw className="spin" size={16} /> : <><Plus size={16} /> Shto Shërbimin</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminGlobalServices;