import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, LayoutGrid, Info } from 'lucide-react';
import OwnerSidebar from './OwnerSidebar';
import { api } from '../../../index';
import Swal from 'sweetalert2';
import '../style/ManageServices.css';

const ManageServices = () => {
    const [services, setServices] = useState([]);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [formData, setFormData] = useState({
        service_name: '',
        service_description: '',
        service_price: '',
        service_duration: ''
    });

    useEffect(() => {
        fetchBusinessAndServices();
    }, []);

    const fetchBusinessAndServices = async () => {
        try {
            const res = await api.get('/owner/business/my-business');
            const bizData = res.data.business || res.data;
            setBusiness(bizData);
            setServices(bizData.services || []);
        } catch (err) {
            Swal.fire('Gabim', 'Nuk u ngarkua biznesi.', 'error');
        } finally {
            setLoading(false);
        }
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
            service_name: service.service_name,
            service_description: service.service_description || service.description || '',
            service_price: service.service_price,
            service_duration: service.service_duration
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
            } catch (err) {
                Swal.fire('Gabim', 'Fshirja dështoi.', 'error');
            }
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingService(null);
        setFormData({ service_name: '', service_description: '', service_price: '', service_duration: '' });
    };

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
                        <button onClick={() => setShowModal(true)} className="btn-add-pro">
                            <Plus size={20} />
                            <span>Shto Shërbim</span>
                        </button>
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
                                            {service.service_description || service.description || "Nuk ka përshkrim për këtë shërbim."}
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
                                <p>Filloni duke shtuar shërbimin tuaj të parë për klientët.</p>
                                <button onClick={() => setShowModal(true)} className="btn-add-pro">Shto Shërbim</button>
                            </div>
                        )}
                    </div>
                </div>

                {/* MODAL */}
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
                                        type="text" 
                                        required 
                                        name="service_name"
                                        value={formData.service_name}
                                        onChange={(e) => setFormData({...formData, service_name: e.target.value})}
                                        placeholder="p.sh. Qethje Klasike"
                                    />
                                </div>
                                <div className="input-group-pro">
                                    <label>Përshkrimi</label>
                                    <textarea 
                                        rows="3"
                                        name="service_description"
                                        value={formData.service_description}
                                        onChange={(e) => setFormData({...formData, service_description: e.target.value})}
                                        placeholder="Shërbim profesional për..."
                                    />
                                </div>
                                <div className="form-row-pro">
                                    <div className="input-group-pro">
                                        <label>Çmimi (€)</label>
                                        <input 
                                            type="number" 
                                            step="0.01" 
                                            required 
                                            value={formData.service_price}
                                            onChange={(e) => setFormData({...formData, service_price: e.target.value})}
                                        />
                                    </div>
                                    <div className="input-group-pro">
                                        <label>Kohëzgjatja (min)</label>
                                        <input 
                                            type="number" 
                                            required 
                                            value={formData.service_duration}
                                            onChange={(e) => setFormData({...formData, service_duration: e.target.value})}
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
            </main>
        </div>
    );
};

export default ManageServices;