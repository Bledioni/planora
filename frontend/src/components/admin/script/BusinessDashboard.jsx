import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, UserCheck, Package, Settings, ArrowLeft } from 'lucide-react';
import { api } from '../../../index'; // Sigurohu që path-i është i saktë
import '../style/BusinessDashboard.css'
const BusinessDashboard = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();

    const handleRegisterOwner = async () => {
        if (!window.confirm("A jeni i sigurt që dëshironi të regjistroni pronarin si punonjës?")) return;
        try {
            const response = await api.post('/admin/register-owner-as-employee', {
                business_id: businessId
            });
            alert(response.data.message || "Pronari u regjistrua me sukses!");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Ndodhi një gabim gjatë regjistrimit.");
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
            title: "Shto Produkte",
            desc: "Moduli i inventarit (Së shpejti)",
            icon: <Package size={28} />,
            onClick: () => {},
            active: false,
            variant: "disabled"
        },
        {
            title: "Konfigurime",
            desc: "Modifiko të dhënat e biznesit",
            icon: <Settings size={28} />,
            onClick: () => {},
            active: false,
            variant: "disabled"
        }
    ];

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-container">
                <header className="dashboard-header">
                    <button onClick={() => navigate('/admin/businesses')} className="back-link">
                        <ArrowLeft size={16} /> <span>Lista e Bizneseve</span>
                    </button>
                    <div className="header-content">
                        <h2>Paneli i Biznesit</h2>
                        <span className="id-pill">ID: #{businessId}</span>
                    </div>
                </header>

                <div className="actions-grid">
                    {actions.map((action, index) => (
                        <div 
                            key={index} 
                            className={`action-card ${action.variant} ${!action.active ? 'is-disabled' : ''}`}
                            onClick={action.onClick}
                        >
                            <div className="icon-wrapper">{action.icon}</div>
                            <div className="text-wrapper">
                                <h3>{action.title}</h3>
                                <p>{action.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BusinessDashboard;