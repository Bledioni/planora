import React, { useEffect, useState } from 'react';
import { Calendar, Search, RefreshCw, Users, Mail, Phone, ShieldAlert, ShieldCheck } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminBusinessList.css';

const AdminOwnerList = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // State i ri për kërkimin

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users/business-owners');
            setOwners(res.data.business_owners || res.data);
        } catch (err) {
            console.error("Gabim gjatë marrjes së pronarëve:", err);
            Swal.fire('Gabim', 'Nuk u ngarkua lista e pronarëve.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    // Logjika e filtrimit
    const filteredOwners = owners.filter(owner => {
        const fullName = `${owner.name} ${owner.surname}`.toLowerCase();
        const businessName = (owner.business?.name || owner.business?.shop_name || "").toLowerCase();
        const email = owner.email.toLowerCase();
        const search = searchTerm.toLowerCase();

        return fullName.includes(search) || businessName.includes(search) || email.includes(search);
    });

    const handleToggleStatus = async (owner) => {
        const isActive = owner.status === 'active';
        const businessId = owner.business?.id;

        if (!businessId) {
            Swal.fire('Gabim', 'Pronari nuk ka biznes të lidhur.', 'error');
            return;
        }

        const result = await Swal.fire({
            title: isActive ? 'Blloko Pronarin?' : 'Aktivizo Pronarin?',
            text: isActive 
                ? `Kjo do të bllokojë ${owner.name} dhe të gjithë punonjësit e tij!` 
                : `Kjo do t'i rikthejë aksesin ${owner.name} dhe biznesit të tij.`,
            icon: isActive ? 'warning' : 'info',
            showCancelButton: true,
            confirmButtonColor: isActive ? '#ef4444' : '#10b981',
            confirmButtonText: isActive ? 'Po, bllokoje!' : 'Po, aktivizoje!',
            cancelButtonText: 'Anulo'
        });

        if (result.isConfirmed) {
            try {
                const url = isActive 
                    ? `/admin/businesses/deactivate/${businessId}` 
                    : `/admin/businesses/activate/${businessId}`;
                
                await api.post(url);
                Swal.fire('Sukses!', `Statusi u ndryshua me sukses.`, 'success');
                fetchOwners();
            } catch (err) {
                Swal.fire('Gabim', err.response?.data?.message || 'Serveri nuk u përgjigj.', 'error');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('sq-AL', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };

    return (
        <div className="page-wrapper">
            <AdminSidebar />
            
            <div className="main-content">
                <div className="content-inner">
                    <header className="modern-header">
                        <div className="header-left">
                            <h1>Menaxhimi i Pronarëve</h1>
                            <p>Kontrollo dhe menaxho statusin e bizneseve në <span>Planora</span></p>
                        </div>
                        
                        <div className="header-right">
                            {/* Search Bar i ri */}
                            <div className="search-pill">
                                <Search size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Kërko pronar, email ose biznes..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            <div className="stats-indicator">
                                <div className="icon-bg"><Users size={18} /></div>
                                <div className="stat-info">
                                    <span className="val">{owners.length}</span>
                                    <span className="lbl">Totale</span>
                                </div>
                            </div>

                            <button onClick={fetchOwners} className="btn-refresh" title="Rifresko">
                                <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                            </button>
                        </div>
                    </header>

                    <div className="premium-card">
                        <div className="table-responsive">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Pronari</th>
                                        <th>Kontakte</th>
                                        <th>Biznesi</th>
                                        <th>Regjistrimi</th>
                                        <th className="text-center">Statusi</th>
                                        <th className="text-center">Veprime</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredOwners.length > 0 ? (
                                        filteredOwners.map((owner) => (
                                            <tr key={owner.id} className="row-animate">
                                                <td data-label="Pronari">
                                                    <div className="user-cell">
                                                        <div className="user-avatar-modern">
                                                            {owner.name?.[0]}{owner.surname?.[0]}
                                                        </div>
                                                        <div className="user-meta">
                                                            <span className="u-name">{owner.name} {owner.surname}</span>
                                                            <span className="u-id">ID: #{owner.id}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td data-label="Kontakte">
                                                    <div className="contact-meta">
                                                        <div className="c-item"><Mail size={14} /> {owner.email}</div>
                                                        {owner.phone_number && <div className="c-item"><Phone size={14} /> {owner.phone_number}</div>}
                                                    </div>
                                                </td>
                                                <td data-label="Biznesi">
                                                    <div className="business-meta">
                                                        <span className="b-name">{owner.business?.name || 'Pa Biznes'}</span>
                                                        <span className="b-id">BID: {owner.business?.id || 'N/A'}</span>
                                                    </div>
                                                </td>
                                                <td data-label="Data">
                                                    <div className="date-pill-modern">
                                                        <Calendar size={14} />
                                                        {formatDate(owner.created_at)}
                                                    </div>
                                                </td>
                                                <td className="text-center" data-label="Statusi">
                                                    <span className={`status-badge-modern ${owner.status}`}>
                                                        {owner.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="text-center" data-label="Veprime">
                                                    <button 
                                                        onClick={() => handleToggleStatus(owner)}
                                                        disabled={!owner.business?.id}
                                                        className={`btn-premium-action ${owner.status === 'active' ? 'danger' : 'success'}`}
                                                    >
                                                        {owner.status === 'active' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                                                        <span>{owner.status === 'active' ? 'Blloko' : 'Aktivizo'}</span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="empty-state">
                                                <div className="empty-info">
                                                    <Search size={40} />
                                                    <p>Nuk u gjet asnjë rezultat për kërkimin tuaj.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOwnerList;