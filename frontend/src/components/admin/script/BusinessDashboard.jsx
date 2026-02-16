import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Users, Settings, ArrowLeft } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/BusinessDashboard.css';

const BusinessDashboard = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        fetchBusinessData();
    }, [businessId]);

    const fetchBusinessData = async () => {
        try {
            // Optional: Fetch business details if you have an endpoint
            // const response = await api.get(`/admin/businesses/${businessId}`);
            // setBusinessData(response.data);
        } catch (err) {
            console.error("Error fetching business:", err);
        }
    };

    const handleRegisterOwner = async () => {
        const result = await Swal.fire({
            title: 'Regjistro Pronarin?',
            text: 'A jeni i sigurt që dëshironi të regjistroni pronarin si punonjës?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#7c3aed',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Po, regjistro!',
            cancelButtonText: 'Anulo'
        });

        if (result.isConfirmed) {
            setLoading(true);
            try {
                const response = await api.post('/admin/employees/register-owner-as-employee', {
                    business_id: businessId
                });
                Swal.fire('Sukses!', response.data.message || 'Pronari u regjistrua me sukses!', 'success');
            } catch (err) {
                console.error(err);
                Swal.fire('Gabim', err.response?.data?.message || 'Ndodhi një gabim gjatë regjistrimit.', 'error');
            } finally {
                setLoading(false);
            }
        }
    };

    const actions = [
        {
            title: "Shto Punonjës",
            desc: "Regjistro staf të ri manualisht",
            icon: <UserPlus size={28} />,
            onClick: () => navigate(`/admin/business/${businessId}/add-employee`),
            active: true,
            variant: "default"
        },
        {
            title: "Regjistro Pronarin",
            desc: "Shto pronarin automatikisht si punonjës",
            icon: <UserCheck size={28} />,
            onClick: handleRegisterOwner,
            active: true,
            variant: "special" 
        },
        {
            title: "Shih Punonjësit",
            desc: "Lista e të gjithë punonjësve të biznesit",
            icon: <Users size={28} />,
            onClick: () => navigate(`/admin/employees/${businessId}/employees`),
            active: true,
            variant: "info"
        },
        {
            title: "Konfigurime",
            desc: "Modifiko të dhënat e biznesit",
            icon: <Settings size={28} />,
            onClick: () => Swal.fire('Së Shpejti', 'Ky modul është në zhvillim.', 'info'),
            active: false,
            variant: "disabled"
        }
    ];

    return (
        <div className="page-wrapper">
            <AdminSidebar />
            
            <div className="main-content">
                <div className="content-inner dashboard-content">
                    {/* Header */}
                    <header className="dashboard-header">
                        <button 
                            onClick={() => navigate('/admin/businesses')} 
                            className="back-link"
                        >
                            <ArrowLeft size={18} />
                            <span>Lista e Bizneseve</span>
                        </button>
                        
                        <div className="header-content">
                            <div className="header-text">
                                <h1>Paneli i Biznesit</h1>
                                <p className="subtitle">Menaxho të gjitha aspektet e biznesit</p>
                            </div>
                            <div className="id-badge">
                                <span className="label">Business ID:</span>
                                <span className="id">#{businessId}</span>
                            </div>
                        </div>
                    </header>

                    {/* Actions Grid */}
                    <div className="actions-grid">
                        {actions.map((action, index) => (
                            <div 
                                key={index} 
                                className={`action-card ${action.variant} ${!action.active ? 'is-disabled' : ''}`}
                                onClick={action.active ? action.onClick : undefined}
                            >
                                <div className="card-icon">{action.icon}</div>
                                <div className="card-content">
                                    <h3 className="card-title">{action.title}</h3>
                                    <p className="card-desc">{action.desc}</p>
                                </div>
                                {!action.active && (
                                    <div className="disabled-overlay">
                                        <span className="lock-icon">🔒</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDashboard;