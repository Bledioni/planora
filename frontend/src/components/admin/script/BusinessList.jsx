import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../index';
import '../style/BusinessList.css'; // Make sure to import the CSS

const BusinessList = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBusinesses = async () => {
            try {
                const response = await api.get('/admin/businesses');
                setBusinesses(response.data);
            } catch (err) {
                console.error("Gabim në marrjen e bizneseve", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBusinesses();
    }, []);

    if (loading) return <div className="loader-container"><div className="loader"></div></div>;

    return (
        <div className="admin-page">
            <header className="admin-header">
                <h1>Menaxhimi i Bizneseve</h1>
                <p className="subtitle">{businesses.length} biznese aktive</p>
            </header>

            <div className="business-grid">
                {businesses.map((biz) => (
                    <div key={biz.id} className="business-card" onClick={() => navigate(`/admin/business/${biz.id}`)}>
                        <div className="card-content">
                            <div className="card-header">
                                <h3>{biz.shop_name}</h3>
                                <span className={`badge ${biz.business_type.toLowerCase()}`}>
                                    {biz.business_type}
                                </span>
                            </div>
                            <p className="address">
                                <span className="icon">📍</span> {biz.address}
                            </p>
                        </div>
                        <div className="card-footer">
                            <button className="manage-btn">
                                Menaxho <span>→</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BusinessList;