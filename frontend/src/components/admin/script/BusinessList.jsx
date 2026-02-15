import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import '../style/BusinessList.css';

const BusinessList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/businesses/list');
                setBusinesses(response.data.businesses || response.data);
            } catch (err) {
                console.error("Gabim në marrjen e bizneseve", err);
                setError(err.response?.data?.message || "Dështoi lidhja me serverin.");
            } finally {
                setLoading(false);
            }
        };
        fetchBusinesses();
    }, []);

    if (loading) {
        return (
            <div className="page-wrapper">
                <AdminSidebar />
                <div className="main-content">
                    <div className="loader-container">
                        <div className="loader"></div>
                        <p>Duke ngarkuar bizneset...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <AdminSidebar />
            
            <div className="main-content">
                <div className="content-inner">
                    {/* Header */}
                    <header className="page-header">
                        <div className="header-text">
                            <h1>Menaxhimi i Bizneseve</h1>
                            <p className="subtitle">Lista e të gjitha bizneseve në platformë</p>
                        </div>
                        <div className="stats-badge">
                            <span className="count">{businesses.length}</span>
                            <span className="label">Biznese</span>
                        </div>
                    </header>

                    {/* Error Banner */}
                    {error && <div className="error-banner">{error}</div>}

                    {/* Business Grid */}
                    {businesses.length > 0 ? (
                        <div className="business-grid">
                            {businesses.map((biz) => (
                                <div 
                                    key={biz.id} 
                                    className="business-card" 
                                    onClick={() => navigate(`/admin/business/${biz.id}`)}
                                >
                                    <div className="card-header">
                                        <div className="business-avatar">
                                            {biz.name?.[0]?.toUpperCase() || biz.shop_name?.[0]?.toUpperCase() || 'B'}
                                        </div>
                                        <div className="business-info">
                                            <h3>{biz.name || biz.shop_name}</h3>
                                            <span className={`badge ${(biz.business_type || biz.category?.name || 'default').toLowerCase().replace(/\s+/g, '-')}`}>
                                                {biz.business_type || biz.category?.name || 'Biznes'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="card-body">
                                        {biz.address && (
                                            <p className="address">
                                                <span className="icon">📍</span>
                                                <span>{biz.address}</span>
                                            </p>
                                        )}
                                        {biz.email && (
                                            <p className="email">
                                                <span className="icon">📧</span>
                                                <span>{biz.email}</span>
                                            </p>
                                        )}
                                        {biz.phone && (
                                            <p className="phone">
                                                <span className="icon">📞</span>
                                                <span>{biz.phone}</span>
                                            </p>
                                        )}
                                    </div>

                                    <div className="card-footer">
                                        <button className="manage-btn">
                                            <span>Menaxho</span>
                                            <span className="arrow">→</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <span className="empty-icon">🏪</span>
                            <h3>Nuk ka biznese</h3>
                            <p>Nuk ka asnjë biznes të regjistruar akoma.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessList;