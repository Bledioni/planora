import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LayoutGrid, Info, Sparkles } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import Swal from 'sweetalert2';
import '../style/ManageServices.css';

const ManageServices = () => {
    const [services, setServices]             = useState([]);
    const [business, setBusiness]             = useState(null);
    const [loading, setLoading]               = useState(true);
    const [showModal, setShowModal]           = useState(false);
    const [showSuggest, setShowSuggest]       = useState(false);
    const [globalServices, setGlobalServices] = useState([]);
    const [suggestSearch, setSuggestSearch]   = useState('');
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        service_name: '',
        service_description: '',
        service_price: '',
        service_duration: ''
    });

    useEffect(() => { fetchBusinessAndServices(); }, []);

    const fetchBusinessAndServices = async () => {
        try {
            const res = await api.get('/owner/business/my-business');
            const bizData = res.data.business || res.data;
            setBusiness(bizData);
            setServices(bizData.services || []);
        } catch {
            Swal.fire('Gabim', 'Nuk u ngarkua biznesi.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const openSuggestModal = async () => {
        try {
            const res = await api.get('/owner/global-services');
            setGlobalServices(res.data.services || []);
            setShowSuggest(true);
        } catch {
            Swal.fire('Gabim', 'Nuk u ngarkuan sugjerimet.', 'error');
        }
    };

    const pickGlobalService = (gs) => {
        setFormData({
            service_name:        gs.name,
            service_description: gs.description || '',
            service_price:       gs.price || '',
            service_duration:    gs.duration || ''
        });
        setShowSuggest(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!business) return;
        try {
            const payload = { business_id: business.id, ...formData };
            if (editingService) {
                const res = await api.put(`/owner/services/update/${editingService.id}`, payload);
                setServices(services.map(s => s.id === editingService.id ? res.data.service : s));
                Swal.fire({ icon: 'success', title: 'Përditësuar!', timer: 1500, showConfirmButton: false });
            } else {
                const res = await api.post('/owner/services/create', payload);
                setServices([...services, res.data.service]);
                Swal.fire({ icon: 'success', title: 'Shtuar!', timer: 1500, showConfirmButton: false });
            }
            closeModal();
        } catch (err) {
            Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim.', 'error');
        }
    };

    const handleEdit = (service) => {
        setEditingService(service);
        setFormData({
            service_name:        service.service_name,
            service_description: service.service_description || service.description || '',
            service_price:       service.service_price,
            service_duration:    service.service_duration
        });
        setShowModal(true);
    };

    const handleDelete = async (serviceId) => {
        const result = await Swal.fire({
            title: 'A jeni të sigurt?',
            text: "Ky veprim nuk mund të kthehet!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Po, fshije!',
            cancelButtonText: 'Anulo'
        });
        if (result.isConfirmed) {
            try {
                await api.delete(`/owner/services/delete/${serviceId}`);
                setServices(services.filter(s => s.id !== serviceId));
                Swal.fire('Fshirë!', 'Shërbimi u hoq.', 'success');
            } catch {
                Swal.fire('Gabim', 'Fshirja dështoi.', 'error');
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingService(null);
        setFormData({ service_name: '', service_description: '', service_price: '', service_duration: '' });
    };

    const filteredGlobal = globalServices.filter(gs =>
        gs.name.toLowerCase().includes(suggestSearch.toLowerCase())
    );

    if (loading) return (
        <div className="loading-screen">
            <div className="spinner"></div>
            <p>Duke ngarkuar shërbimet...</p>
        </div>
    );

    return (
        <div className="owner-layout">
            <OwnerSidebar />
            <main className="owner-main-content">
                <div className="content-container">
                    <header className="page-header-pro">
                        <div className="header-text">
                            <h1><LayoutGrid className="header-icon" /> Shërbimet</h1>
                            <p>Konfiguroni listën dhe çmimore e shërbimeve tuaja</p>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button onClick={openSuggestModal} className="btn-add-pro" style={{ background: '#7c3aed' }}>
                                <Sparkles size={18} /> Sugjerimet
                            </button>
                            <button onClick={() => setShowModal(true)} className="btn-add-pro">
                                <Plus size={20} /> Shto Shërbim
                            </button>
                        </div>
                    </header>

                    <div className="services-wrapper">
                        {services.length > 0 ? (
                            <div className="services-grid-pro">
                                {services.map((service) => (
                                    <div key={service.id} className="service-card-pro">
                                        <div className="card-top">
                                            <div className="service-info-main">
                                                <h3>{service.service_name}</h3>
                                                <div className="badge-duration">{service.service_duration} min</div>
                                            </div>
                                            <div className="card-actions-pro">
                                                <button onClick={() => handleEdit(service)} className="action-btn-pro edit"><Edit2 size={16} /></button>
                                                <button onClick={() => handleDelete(service.id)} className="action-btn-pro delete"><Trash2 size={16} /></button>
                                            </div>
                                        </div>
                                        <p className="card-desc">
                                            {service.service_description || service.description || "Nuk ka përshkrim."}
                                        </p>
                                        <div className="card-bottom-pro">
                                            <div className="price-tag-pro">
                                                <span className="currency">€</span>
                                                <span className="amount">{service.service_price}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state-pro">
                                <div className="empty-icon-box"><Info size={40} /></div>
                                <h2>Asnjë shërbim i gjetur</h2>
                                <p>Filloni duke shtuar shërbimin tuaj të parë.</p>
                                <button onClick={() => setShowModal(true)} className="btn-add-pro">Shto Shërbim</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* ADD/EDIT MODAL */}
                {showModal && (
                    <div className="modal-overlay-pro" onClick={closeModal}>
                        <div className="modal-content-pro" onClick={e => e.stopPropagation()}>
                            <div className="modal-header-pro">
                                <h2>{editingService ? 'Modifiko Shërbimin' : 'Shto Shërbim të Ri'}</h2>
                                <button className="modal-close-pro" onClick={closeModal}>&times;</button>
                            </div>
                            <form onSubmit={handleSubmit} className="modal-form-pro">
                                <div className="input-group-pro">
                                    <label>Emri i Shërbimit</label>
                                    <input
                                        type="text" required
                                        value={formData.service_name}
                                        onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
                                        placeholder="p.sh. Qethje Klasike"
                                    />
                                </div>
                                <div className="input-group-pro">
                                    <label>Përshkrimi</label>
                                    <textarea
                                        rows="3"
                                        value={formData.service_description}
                                        onChange={(e) => setFormData({ ...formData, service_description: e.target.value })}
                                        placeholder="Shërbim profesional për..."
                                    />
                                </div>
                                <div className="form-row-pro">
                                    <div className="input-group-pro">
                                        <label>Çmimi (€)</label>
                                        <input
                                            type="number" step="0.01" required
                                            value={formData.service_price}
                                            onChange={(e) => setFormData({ ...formData, service_price: e.target.value })}
                                        />
                                    </div>
                                    <div className="input-group-pro">
                                        <label>Kohëzgjatja (min)</label>
                                        <input
                                            type="number" required
                                            value={formData.service_duration}
                                            onChange={(e) => setFormData({ ...formData, service_duration: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions-pro">
                                    <button type="button" className="btn-cancel-pro" onClick={closeModal}>Anulo</button>
                                    <button type="submit" className="btn-save-pro">Ruaj Ndryshimet</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* SUGGESTIONS MODAL */}
                {showSuggest && (
                    <div className="modal-overlay-pro" onClick={() => setShowSuggest(false)}>
                        <div className="modal-content-pro" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                            <div className="modal-header-pro">
                                <h2><Sparkles size={18} style={{ marginRight: '8px', color: '#7c3aed' }} />Zgjidhni një Shërbim</h2>
                                <button className="modal-close-pro" onClick={() => setShowSuggest(false)}>&times;</button>
                            </div>

                            {/* Search */}
                            <div style={{ padding: '0 0 16px 0' }}>
                                <input
                                    type="text"
                                    placeholder="Kërko shërbim..."
                                    value={suggestSearch}
                                    onChange={(e) => setSuggestSearch(e.target.value)}
                                    style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', outline: 'none', fontSize: '0.9rem' }}
                                />
                            </div>

                            {/* List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '400px', overflowY: 'auto' }}>
                                {filteredGlobal.length > 0 ? filteredGlobal.map(gs => (
                                    <div
                                        key={gs.id}
                                        onClick={() => pickGlobalService(gs)}
                                        style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'white'}
                                    >
                                        <div>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#1e293b' }}>{gs.name}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{gs.description || 'Pa përshkrim'}</p>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: '16px' }}>
                                            <p style={{ margin: 0, fontWeight: '700', color: '#7c3aed' }}>€{gs.price || '—'}</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>{gs.duration || '—'} min</p>
                                        </div>
                                    </div>
                                )) : (
                                    <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
                                        <Sparkles size={32} style={{ opacity: 0.3, marginBottom: '10px' }} />
                                        <p>Nuk u gjetën shërbime.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default ManageServices;