import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="owner-layout" style={{ justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '20px' }}>
      <div className="schedule-container-wide" style={{ maxWidth: '600px' }}>
        
        {/* Animated 404 Header */}
        <div className="header-top-tag" style={{ marginBottom: '8px' }}>
          Error 404
        </div>
        
        <h1 style={{ 
          fontSize: 'clamp(5rem, 15vw, 8rem)', 
          fontWeight: '800', 
          color: 'var(--p-blue)', 
          margin: '0',
          lineHeight: '1',
          letterSpacing: '-0.05em'
        }}>
          404
        </h1>
        
        <div className="schedule-header-big" style={{ marginTop: '20px' }}>
          <h1>Oops! Faqja nuk u gjet.</h1>
          <p style={{ fontSize: '1rem', marginTop: '12px', lineHeight: '1.6' }}>
            Duket se jeni larguar pak si shumë nga rruga kryesore.<br /> 
            Mos u shqetësoni, ndodh edhe me më të mirët!
          </p>
        </div>

        {/* Action Buttons using your theme colors */}
        <div style={{ 
          marginTop: '40px', 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'center',
          flexWrap: 'wrap' 
        }}>
          <Link
            to="/"
            style={{
              textDecoration: 'none',
              backgroundColor: 'var(--p-blue)',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '12px',
              fontWeight: '700',
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(29, 122, 242, 0.25)',
              transition: 'transform 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            Kthehu në Ballinë
          </Link>
          
          <button 
            onClick={() => navigate(-1)}
            className="nav-btn-big"
            style={{ 
                width: 'auto', 
                padding: '0 28px', 
                fontSize: '0.95rem', 
                fontWeight: '600',
                height: '48px' 
            }}
          >
            Shko Mbrapa
          </button>
        </div>

        {/* Minimalist Graphic using your brand colors */}
        <div style={{ marginTop: '60px', opacity: 0.1, maxWidth: '200px', margin: '60px auto 0' }}>
           <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: 'var(--p-dark)' }}>
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
           </svg>
        </div>
      </div>
    </div>
  );
};

export default NotFound;