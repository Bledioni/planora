import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../index';
import '../../appointments/style/BarberDiscovery.css';

const CATEGORIES = [
  { label: 'Të gjitha',  value: 'all',        emoji: '✦' },
  { label: 'Berber',     value: 'Berber',      emoji: '✂️' },
  { label: 'Salon',      value: 'Salon',       emoji: '💇' },
  { label: 'Kozmetikë',  value: 'Kozmetikë',   emoji: '💅' },
];

const BarberDiscovery = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
    api.get('/public/businesses/all')
      .then(res => {
        const data = Array.isArray(res.data)
          ? res.data
          : (res.data.businesses || res.data.data || []);
        setBusinesses(data);
        console.log(data);
        
      })
      .catch(() => setBusinesses([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return businesses.filter(shop => {
      const matchesCategory =
        activeCategory === 'all' ||
        (shop.business_type || '').toLowerCase() === activeCategory.toLowerCase();

      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        (shop.shop_name || '').toLowerCase().includes(q) ||
        (shop.address   || '').toLowerCase().includes(q) ||
        (shop.business_type || '').toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [businesses, activeCategory, search]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  if (loading) {
    return (
      <div className="loading-wrapper">
        <div className="loading-spinner" />
        <p>Duke ngarkuar salonet...</p>
      </div>
    );
  }

  return (
    <div className="discovery-container">

      {/* ── HERO HEADER ── */}
      <header className="discovery-header">
        <div className="header-eyebrow">
          <span className="header-eyebrow-dot" />
          Planora Book
        </div>
        <h1>Zbuloni <span>Salonet</span></h1>
        <p>Rezervoni shërbimin tuaj të radhës me lehtësi dhe shpejtësi.</p>

        {/* Search bar floats at bottom of header */}
        <div className="search-bar-wrapper">
          <form className="search-bar" onSubmit={handleSearch}>
            <svg className="search-icon" width="18" height="18" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Kërko salon, adresë, lloj shërbimi..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            <button type="submit" className="search-btn">
              <span>Kërko</span>
            </button>
          </form>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className="discovery-body">

        {/* Category pills */}
        <div className="category-section">
          <p className="category-label">Kategoritë</p>
          <div className="category-pills">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                className={`pill ${activeCategory === cat.value ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.value)}
              >
                <span className="pill-emoji">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results meta */}
        <div className="results-meta">
          <p className="results-count">
            <strong>{filtered.length}</strong> salon{filtered.length !== 1 ? 'e' : ''} gjetur
            {search && <> për "<strong>{search}</strong>"</>}
          </p>
          {(search || activeCategory !== 'all') && (
            <button
              className="pill"
              style={{ fontSize: '0.75rem', padding: '5px 14px' }}
              onClick={() => { setSearch(''); setSearchInput(''); setActiveCategory('all'); }}
            >
              ✕ Pastro filtrat
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="discovery-grid">
          {filtered.length > 0 ? (
            filtered.map(shop => (
              <article
                key={shop.id}
                className="shop-card"
                onClick={() => navigate(`/${shop.slug}`)}
              >
                <div className="image-wrapper">
                  <span className="image-initial">
                    {shop.shop_name ? shop.shop_name.charAt(0).toUpperCase() : '?'}
                  </span>
                  <span className="card-type-badge">
                    {shop.business_type || 'Berber'}
                  </span>
                </div>

                <div className="shop-info">
                  <h3 className="shop-name">{shop.shop_name}</h3>
                  <p className="shop-address">
                    📍 {shop.address || 'Kosovë'}
                  </p>
                  <div className="badge-container">
                    <span className="category-badge">
                      {shop.business_type || 'Berber'}
                    </span>
                    <div className="rating-box">
                      <span>★</span> 5.0
                    </div>
                  </div>
                </div>

                <div className="card-cta">
                  Rezervo tani
                  <span className="card-cta-arrow">→</span>
                </div>
              </article>
            ))
          ) : (
            <div className="no-data">
              <div className="no-data-icon">🔍</div>
              <h3>Nuk u gjet asnjë salon</h3>
              <p>Provo të ndryshosh fjalën kyçe ose kategorinë.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BarberDiscovery;