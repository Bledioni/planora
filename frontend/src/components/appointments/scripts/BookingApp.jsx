import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom'; // Added for slug support
import { api } from '../../../index'; // Your Axios instance

const BookingApp = () => {
  const { shopSlug } = useParams(); 
  
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // API Data
  const [businesses, setBusinesses] = useState([]);
  const [details, setDetails] = useState({ barbers: [], services: [] });
  const [slots, setSlots] = useState([]);

  // Selections
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [userInfo, setUserInfo] = useState({ name: '', email: '', phone: '' });

  // --- LOGIC FOR SLUG VS LIST ---

  // Load shop data based on the URL slug or fetch all shops
  const initApp = useCallback(async () => {
    setLoading(true);
    try {
      if (shopSlug) {
        // Direct link: planora.com/tevisi
        const res = await api.get(`/businesses/slug/${shopSlug}`);
        setDetails(res.data.data);
        setSelectedBusiness(res.data.data.id);
        setStep(2); // Skip shop list, go to Barber/Service selection
      } else {
        // General link: planora.com
        const res = await api.get('/businesses');
        setBusinesses(res.data.data);
        setStep(1);
      }
    } catch (err) {
      console.error("Error initializing app:", err);
      if (shopSlug) alert("Ky biznes nuk u gjet.");
    } finally {
      setLoading(false);
    }
  }, [shopSlug]);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Handle manual business selection from list
  const handleBusinessSelect = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/businesses/${id}/details`);
      setDetails(res.data.data); 
      setSelectedBusiness(id);
      setStep(2);
    } catch (err) {
      alert("Gabim në marrjen e të dhënave të dyqanit.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Available Slots
  const fetchSlots = async () => {
    if (!selectedBarber || !selectedService) {
        alert("Ju lutem zgjidhni barberin dhe shërbimin.");
        return;
    }
    setLoading(true);
    try {
      const res = await api.get('/available-slots', {
        params: {
          business_id: selectedBusiness,
          employee_id: selectedBarber,
          service_id: selectedService,
          date: selectedDate
        }
      });
      setSlots(res.data);
      setStep(3);
    } catch (err) {
      if(err.response) console.log(err.response.data);
      alert("Nuk u gjetën orare të lira ose gabim në validim.");
    } finally {
      setLoading(false);
    }
  };

  // Final Booking
  const handleFinalBooking = async (e) => {
    e.preventDefault();
    const fullDateTime = `${selectedDate} ${selectedTime}:00`;

    try {
      await api.post('/makeAppointment', {
        business_id: selectedBusiness,
        employee_id: selectedBarber,
        service_id: selectedService,
        start_time: fullDateTime,
        client_name: userInfo.name,
        client_email: userInfo.email,
        client_phone: userInfo.phone
      });
      alert("Rezervimi u dërgua me sukses!");
      window.location.reload(); 
    } catch (err) {
      if(err.response) console.log(err.response.data);
      alert("Gabim gjatë rezervimit.");
    }
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ textAlign: 'center' }}>{details.shop_name || "Planora"}</h1>
      {loading && <p style={{ color: 'blue', textAlign: 'center' }}>Duke u ngarkuar...</p>}

      {/* STEP 1: BUSINESS LIST (Only shows if no slug in URL) */}
      {step === 1 && !shopSlug && (
        <div>
          <h3>Zgjidhni një dyqan:</h3>
          {businesses.map(b => (
            <div key={b.id} onClick={() => handleBusinessSelect(b.id)} style={cardStyle}>
              <strong>{b.shop_name}</strong>
              <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{b.address}</p>
            </div>
          ))}
        </div>
      )}

      {/* STEP 2: BARBER & SERVICE */}
      {step === 2 && (
        <div>
          {!shopSlug && <button onClick={() => setStep(1)} style={backBtn}>← Ndrysho Dyqanin</button>}
          
          <h3>1. Zgjidhni Barberin:</h3>
          <div style={selectionGrid}>
            {details.barbers?.map(barber => (
              <button 
                key={barber.id} 
                onClick={() => setSelectedBarber(barber.id)}
                style={selectedBarber === barber.id ? activeBtn : btnStyle}
              >
                {barber.name}
              </button>
            ))}
          </div>

          <h3>2. Zgjidhni Shërbimin:</h3>
          <div style={selectionGrid}>
            {details.services?.map(s => (
              <button 
                key={s.id} 
                onClick={() => setSelectedService(s.id)}
                style={selectedService === s.id ? activeBtn : btnStyle}
              >
                {s.name} ({s.price}€)
              </button>
            ))}
          </div>

          <button 
            disabled={!selectedBarber || !selectedService} 
            onClick={fetchSlots} 
            style={selectedBarber && selectedService ? primaryBtn : disabledBtn}
          >
            Shiko Oraret e Lira
          </button>
        </div>
      )}

      {/* STEP 3: SLOTS */}
      {step === 3 && (
        <div>
          <button onClick={() => setStep(2)} style={backBtn}>← Mbrapa</button>
          <h3>Zgjidhni kohën:</h3>
          <input 
            type="date" 
            value={selectedDate} 
            style={inputStyle}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setSelectedDate(e.target.value)} 
          />
          <button onClick={fetchSlots} style={{ marginBottom: '15px', width: '100%' }}>Përditëso Datën</button>

          <div style={slotGrid}>
            {slots.length > 0 ? slots.map(t => (
              <button key={t} onClick={() => { setSelectedTime(t); setStep(4); }} style={btnStyle}>
                {t}
              </button>
            )) : <p>Nuk ka orare të lira.</p>}
          </div>
        </div>
      )}

      {/* STEP 4: CONFIRM */}
      {step === 4 && (
        <form onSubmit={handleFinalBooking}>
          <button type="button" onClick={() => setStep(3)} style={backBtn}>← Mbrapa</button>
          <h3>Konfirmimi Final</h3>
          <p>Termini: <strong>{selectedDate} @ {selectedTime}</strong></p>
          
          <input 
            placeholder="Emri juaj" 
            style={inputStyle} 
            required 
            value={userInfo.name}
            onChange={e => setUserInfo({...userInfo, name: e.target.value})}
          />
          <input 
            type="email" 
            placeholder="Email adresa" 
            style={inputStyle} 
            required 
            value={userInfo.email}
            onChange={e => setUserInfo({...userInfo, email: e.target.value})}
          />
          <input 
            placeholder="Numri i telefonit" 
            style={inputStyle} 
            required 
            value={userInfo.phone}
            onChange={e => setUserInfo({...userInfo, phone: e.target.value})}
          />
          
          <button type="submit" style={primaryBtn}>Dërgo Kërkesën</button>
        </form>
      )}
    </div>
  );
};

// --- STYLING ---
const containerStyle = { maxWidth: '500px', margin: '40px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', fontFamily: 'sans-serif' };
const cardStyle = { padding: '15px', border: '1px solid #eee', marginBottom: '10px', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#fafafa' };
const selectionGrid = { display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' };
const slotGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' };
const btnStyle = { padding: '10px 15px', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'white' };
const activeBtn = { ...btnStyle, backgroundColor: '#007bff', color: 'white', borderColor: '#0056b3' };
const primaryBtn = { width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' };
const disabledBtn = { ...primaryBtn, backgroundColor: '#ccc', cursor: 'not-allowed' };
const backBtn = { background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0, marginBottom: '10px', textDecoration: 'underline' };
const inputStyle = { display: 'block', width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ccc', boxSizing: 'border-box' };

export default BookingApp;