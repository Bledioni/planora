import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../index';
import '../../appointments/style/BarberDiscovery.css'; 

const BarberDiscovery = () => {
  const [businesses, setBusinesses] = useState([]); // Default është array boshe []
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    api.get('/businesses')
      .then(res => {
        // Laraveli yt kthen array direkt te res.data
        // Ky kontroll i mbulon të gjitha rastet (nëse vijnë si array ose si objekt me .data)
        const dataFromApi = Array.isArray(res.data) ? res.data : (res.data.data || []);
        
        setBusinesses(dataFromApi);
        setLoading(false);
      })
      .catch(err => {
        console.error("Planora API Error:", err);
        setBusinesses([]); // Sigurohemi që mbetet array boshe edhe në gabim
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
        {/* Përdorim ?.map për siguri maksimale */}
        {businesses?.length > 0 ? (
          businesses.map((shop) => (
            <article 
              key={shop.id} 
              className="shop-card" 
              onClick={() => navigate(`/${shop.slug}`)}
            >
              <div className="image-wrapper">
                {shop.shop_name ? shop.shop_name.charAt(0) : '?'}
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
          ))
        ) : (
          <div className="no-data">Nuk u gjet asnjë salon për momentin.</div>
        )}
      </div>
    </div>
  );
};

export default BarberDiscovery;