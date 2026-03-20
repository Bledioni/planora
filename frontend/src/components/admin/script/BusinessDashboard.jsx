import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Users, Settings, ArrowLeft, ArrowUpRight, MapPin, Phone } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminDashboard.css';
import '../style/BusinessDashboard.css';

const BusinessDashboard = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [, setLoading] = useState(false);
    const [locationLink, setLocationLink] = useState(null);
    const [ownerPhone, setOwnerPhone] = useState(null);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                const res = await api.get(`/admin/businesses/details/${businessId}`);
                setLocationLink(res.data?.location_link || null);
                setOwnerPhone(res.data?.user?.phone_number || null);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBusiness();
    }, [businessId]);

    const handleWhatsApp = () => {
        if (!ownerPhone) return;
        const cleaned = ownerPhone.replace(/\D/g, '');
        window.open(`https://wa.me/${cleaned}`, '_blank');
    };

    const handleRegisterOwner = async () => {
        const result = await Swal.fire({
            title: 'Regjistro Pronarin?',
            text: 'A jeni i sigurt që dëshironi të regjistroni pronarin si punonjës?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#2563eb',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Po, regjistro!',
            cancelButtonText: 'Anulo',
            background: '#ffffff',
            borderRadius: '20px'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await api.post('/admin/employees/register-owner-as-employee', {
                    business_id: businessId
                });
                Swal.fire('Sukses!', response.data.message || 'Pronari u regjistrua me sukses!', 'success');
            } catch (err) {
                Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim.', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const actions = [
        {
            title: "Shto Punonjës",
            desc: "Regjistro staf të ri manualisht",
            icon: <UserPlus size={24} />,
            onClick: () => navigate(`/admin/business/${businessId}/add-employee`),
            active: true,
            color: "blue"
        },
        {
            title: "Regjistro Pronarin",
            desc: "Shto pronarin si punonjës",
            icon: <UserCheck size={24} />,
            onClick: handleRegisterOwner,
            active: true,
            color: "gradient"
        },
        {
            title: "Shih Punonjësit",
            desc: "Lista e plotë e stafit",
            icon: <Users size={24} />,
            onClick: () => navigate(`/admin/employees/${businessId}/employees`),
            active: true,
            color: "dark"
        },
        {
            title: "Konfigurime",
            desc: "Modifiko të dhënat e biznesit",
            icon: <Settings size={24} />,
            onClick: () => navigate(`/admin/business/${businessId}/config`),
            active: true,
            color: "dark"
        },
        ...(locationLink ? [{
            title: "Vendndodhja",
            desc: "Shiko biznesin në Google Maps",
            icon: <MapPin size={24} />,
            onClick: () => window.open(locationLink, '_blank'),
            active: true,
            color: "blue"
        }] : []),
        ...(ownerPhone ? [{
            title: "Kontakto Pronarin",
            desc: `WhatsApp: ${ownerPhone}`,
            icon: <Phone size={24} />,
            onClick: handleWhatsApp,
            active: true,
            color: "gradient"
        }] : [])
    ];

    return (
        <div className="owner-layout">
            <AdminSidebar />
            
            <main className="owner-main-content">
                <div className="schedule-container-wide">
                    
                    <header className="schedule-header-big">
                        <button onClick={() => navigate('/admin/businesses')} className="header-top-tag" style={{cursor: 'pointer', border: 'none'}}>
                            <ArrowLeft size={14} />
                            <span>Kthehu te Lista</span>
                        </button>
                        <h1>Paneli i Biznesit</h1>
                        <p>ID e Biznesit: <span className="price-tag">#{businessId}</span></p>
                    </header>

                    <div className="actions-card-grid">
                        {actions.map((action, index) => (
                            <div 
                                key={index} 
                                className={`premium-action-card ${action.color} ${!action.active ? 'locked' : ''}`}
                                onClick={action.active ? action.onClick : undefined}
                            >
                                <div className="card-icon-wrapper">
                                    {action.icon}
                                </div>
                                <div className="card-info">
                                    <h3>{action.title}</h3>
                                    <p>{action.desc}</p>
                                </div>
                                {action.active && <ArrowUpRight className="arrow-float" size={18} />}
                                {!action.active && <div className="lock-tag">Së Shpejti</div>}
                            </div>
                        ))}
                    </div>

                </div>
            </main>
        </div>
    );
};

export default BusinessDashboard;