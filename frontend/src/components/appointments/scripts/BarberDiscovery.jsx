import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../index';
import '../../appointments/style/BarberDiscovery.css'; 
const BarberDiscovery = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Sigurohemi që faqja hapet nga fillimi
    window.scrollTo(0, 0);
    
    api.get('/businesses')
      .then(res => {
        setBusinesses(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Planora Error:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="loading-wrapper">
        <p>Duke ngarkuar Planora Book...</p>
      </div>
    );
  }

  return (
    <div className="discovery-container">
      <header className="discovery-header">
        <h1>Zbuloni <span>Salonet</span></h1>
        <p>Rezervoni shërbimin tuaj të radhës me lehtësi.</p>
      </header>

      <div className="discovery-grid">
        {businesses.map((shop) => (
          <article 
            key={shop.id} 
            className="shop-card" 
            onClick={() => navigate(`/${shop.slug}`)}
          >
            <div className="image-wrapper">
              {shop.shop_name.charAt(0)}
            </div>
            
            <div className="shop-info">
              <h3 className="shop-name">{shop.shop_name}</h3>
              <p className="shop-address">
                <span style={{ marginRight: '8px' }}>📍</span>
                {shop.address || 'Kosovë'}
              </p>
              
              <div className="badge-container">
                <span className="category-badge">
                  {shop.business_type || 'Barber'}
                </span>
                <div className="rating-box">
                  <span>★</span> 5.0
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BarberDiscovery;