import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../index';

const BarberDiscovery = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/businesses')
      .then(res => {
        setBusinesses(res.data.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Duke kërkuar barberët...</div>;

  return (
    <div style={discoveryContainer}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>Zbuloni Barberët</h1>
      <div style={gridStyle}>
        {businesses.map((shop) => (
          <div 
            key={shop.id} 
            style={shopCard} 
            onClick={() => navigate(`/${shop.slug}`)}
          >
            <div style={imagePlaceholder}>
              {shop.shop_name.charAt(0)}
            </div>
            <div style={{ padding: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{shop.shop_name}</h3>
              <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>{shop.address}</p>
              <span style={badgeStyle}>{shop.business_type || 'Barber'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- STYLES ---
const discoveryContainer = { maxWidth: '1000px', margin: '0 auto', padding: '40px 20px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' };
const shopCard = { backgroundColor: '#fff', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'transform 0.2s' };
const imagePlaceholder = { height: '150px', backgroundColor: '#333', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px', fontWeight: 'bold' };
const badgeStyle = { backgroundColor: '#e9ecef', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' };

export default BarberDiscovery;