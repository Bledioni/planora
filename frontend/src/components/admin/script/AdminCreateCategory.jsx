import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Tag, Save, X } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminDashboard.css';
import '../style/AdminCreateCategory.css';

const AdminCreateCategory = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading]       = useState(true);
    const [saving, setSaving]         = useState(false);
    const [name, setName]             = useState('');
    const [error, setError]           = useState('');

    const fetchCategories = () => {
    setLoading(true);
    api.get('/admin/categories/all')
        .then(res => setCategories(Array.isArray(res.data) ? res.data : []))
        .catch(() => setCategories([]))
        .finally(() => setLoading(false));
};

    useEffect(() => { fetchCategories(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!name.trim()) {
            setError('Emri i kategorisë është i detyrueshëm.');
            return;
        }
        setSaving(true);
        try {
            await api.post('/admin/categories/create', { name: name.trim() });
            Swal.fire({
                title: 'Sukses!',
                text: 'Kategoria u krijua me sukses.',
                icon: 'success',
                confirmButtonColor: '#1d7af2',
            });
            setName('');
            fetchCategories();
        } catch (err) {
            const msg = err.response?.data?.messages?.name?.[0]
                || err.response?.data?.message
                || 'Ndodhi një gabim.';
            setError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Fshi kategorinë?',
            text: 'Ky veprim nuk mund të kthehet.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Po, fshi!',
            cancelButtonText: 'Anulo',
        });
        if (!result.isConfirmed) return;
        try {
            await api.delete('/admin/categories/' + id);
            fetchCategories();
        } catch {
            Swal.fire('Gabim', 'Nuk u fshi.', 'error');
        }
    };

    return (
        <div className="owner-layout">
            <AdminSidebar />

            <main className="owner-main-content">
                <div className="schedule-container-wide">

                    {/* Header */}
                    <header className="schedule-header-big">
                        <button
                            onClick={() => navigate('/admin/adminDashboard')}
                            className="header-top-tag"
                            style={{ cursor: 'pointer', border: 'none' }}
                        >
                            <ArrowLeft size={14} />
                            <span>Kthehu</span>
                        </button>
                        <h1>Kategoritë</h1>
                        <p>Menaxho kategoritë e bizneseve në platformë.</p>
                    </header>

                    <div className="cat-layout">

                        {/* ── CREATE FORM ── */}
                        <div className="cat-form-card">
                            <div className="cat-form-title">
                                <Tag size={16} />
                                <span>Krijo Kategori të Re</span>
                            </div>

                            <form onSubmit={handleSubmit} className="cat-form">
                                <div className="cat-field-group">
                                    <label className="cat-label">Emri i Kategorisë *</label>
                                    <input
                                        type="text"
                                        className={'cat-input' + (error ? ' error' : '')}
                                        placeholder="p.sh. Barber, Salon, Spa..."
                                        value={name}
                                        onChange={e => { setName(e.target.value); setError(''); }}
                                        maxLength={50}
                                    />
                                    {error && (
                                        <span className="cat-error">
                                            <X size={12} /> {error}
                                        </span>
                                    )}
                                    <span className="cat-char-count">{name.length}/50</span>
                                </div>

                                <button type="submit" className="cat-save-btn" disabled={saving}>
                                    {saving ? (
                                        <div className="planora-loader-small" style={{ width: 16, height: 16, borderWidth: 2 }} />
                                    ) : (
                                        <><Plus size={16} /> Krijo Kategorinë</>
                                    )}
                                </button>
                            </form>
                        </div>

                        {/* ── CATEGORIES LIST ── */}
                        <div className="cat-list-card">
                            <div className="cat-list-header">
                                <div className="cat-form-title">
                                    <Tag size={16} />
                                    <span>Kategoritë Ekzistuese</span>
                                </div>
                                <span className="cat-count-badge">{categories.length}</span>
                            </div>

                            {loading ? (
                                <div className="cat-loader-wrap">
                                    <div className="planora-loader-small" />
                                </div>
                            ) : categories.length === 0 ? (
                                <div className="cat-empty">
                                    <Tag size={28} strokeWidth={1.5} />
                                    <p>Nuk ka kategori akoma.</p>
                                </div>
                            ) : (
                                <div className="cat-items">
                                    {categories.map(cat => (
                                        <div key={cat.id} className="cat-item">
                                            <div className="cat-item-left">
                                                <div className="cat-item-icon">
                                                    <Tag size={14} />
                                                </div>
                                                <span className="cat-item-name">{cat.name}</span>
                                            </div>
                                            <button
                                                className="cat-delete-btn"
                                                onClick={() => handleDelete(cat.id)}
                                                title="Fshi"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminCreateCategory;