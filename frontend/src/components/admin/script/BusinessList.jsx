import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import { Search, MapPin, Mail, ArrowUpRight, Building2 } from 'lucide-react';
import '../style/AdminDashboard.css'; // Përdorim skedarin kryesor për konsistencë

const BusinessList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(""); 
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/businesses/list');
                setBusinesses(response.data.businesses || response.data);
            } catch (err) {
                setError("Dështoi lidhja me serverin.");
            } finally {
                setLoading(false);
            }
        };
        fetchBusinesses();
    }, []);

    const filteredBusinesses = businesses.filter((biz) => {
        const name = (biz.name || biz.shop_name || "").toLowerCase();
        const email = (biz.email || "").toLowerCase();
        const address = (biz.address || "").toLowerCase();
        return name.includes(searchTerm.toLowerCase()) || 
               email.includes(searchTerm.toLowerCase()) || 
               address.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="owner-layout">
            <AdminSidebar />
            
            <main className="owner-main-content">
                <div className="schedule-container-wide">
                    
                    {/* Header Ultra Premium */}
                    <header className="schedule-header-big">
                        <div className="header-top-tag">
                            <Building2 size={14} />
                            <span>Platforma Planora</span>
                        </div>
                        <h1>Menaxhimi i Bizneseve</h1>
                        <p>Shiko dhe menaxho të gjithë partnerët aktivë</p>
                    </header>

                    {/* Search Bar - Glass Morphism Style */}
                    <div className="planora-calendar-big" style={{marginBottom: '2.5rem'}}>
                        <div className="modern-search-wrapper" style={{width: '100%', display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 20px', borderRadius: '18px', boxShadow: 'var(--shadow-soft)'}}>
                            <Search size={20} color="#2563eb" />
                            <input 
                                type="text" 
                                placeholder="Kërko me emër, email ose adresë..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{border: 'none', outline: 'none', width: '100%', fontSize: '16px', fontWeight: '500'}}
                            />
                            <div className="stats-badge-mini" style={{background: '#eff6ff', color: '#2563eb', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '800'}}>
                                {filteredBusinesses.length}
                            </div>
                        </div>
                    </div>

                    {error && <div className="error-banner">{error}</div>}

                    <div className="timeline-container">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : filteredBusinesses.length > 0 ? (
                            filteredBusinesses.map((biz) => (
                                <div key={biz.id} className="timeline-row" onClick={() => navigate(`/admin/business/${biz.id}`)} style={{cursor: 'pointer'}}>
                                    
                                    <div className="time-column">
                                        <div className="time-text" style={{fontSize: '0.8rem', minWidth: '80px', textAlign: 'center'}}>
                                            #{biz.id}
                                        </div>
                                        <div className="vertical-line confirmed"></div>
                                    </div>

                                    <div className="appointment-card-large">
                                        <div className="client-section">
                                            <div className="avatar-circle">
                                                {biz.name?.[0]?.toUpperCase() || 'B'}
                                            </div>
                                            <div className="client-details">
                                                <h3>{biz.name || biz.shop_name}</h3>
                                                <div className="service-txt">
                                                    <span style={{display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px'}}>
                                                        <MapPin size={14} /> {biz.address || "Pa adresë"}
                                                    </span>
                                                    <span style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
                                                        <Mail size={14} /> {biz.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-right-info">
                                            <div className="status-pill confirmed" style={{fontSize: '0.65rem'}}>
                                                {biz.business_type || biz.category?.name || 'Partner'}
                                            </div>
                                            <div className="price-tag" style={{marginTop: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '1rem'}}>
                                                Menaxho <ArrowUpRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card">
                                <Search size={40} style={{opacity: 0.3, marginBottom: '1rem'}} />
                                <p>Nuk u gjet asnjë biznes me këtë kërkim.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessList;