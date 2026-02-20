import React, { useEffect, useState } from 'react';
import { api } from '../../../index'; 
import AdminSidebar from '../script/AdminSidebar';
import { Users, Mail, Phone, ArrowUpRight, Search } from 'lucide-react';
import '../style/AdminDashboard.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => { fetchUsers(); }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users/without-business');
            if (response.data?.status === 'success') setUsers(response.data.data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const filteredUsers = users.filter(u => 
        `${u.name} ${u.surname}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="owner-layout">
            <AdminSidebar />
            
            <main className="owner-main-content">
                <div className="schedule-container-wide">
                    
                    <header className="schedule-header-big">
                        <div className="header-top-tag">
                            <Users size={14} />
                            <span>Paneli Admin</span>
                        </div>
                        <h1>Kërkesat e reja</h1>
                        <p>Menaxho pronarët e rinj në platformën <strong>Planora</strong></p>
                    </header>

                    <div className="planora-calendar-big" style={{marginBottom: '2rem'}}>
                        <div className="modern-search-wrapper" style={{width: '100%', display: 'flex', alignItems: 'center', gap: '10px', background: 'white', padding: '10px 20px', borderRadius: '15px'}}>
                            <Search size={20} color="#2563eb" />
                            <input 
                                type="text" 
                                placeholder="Kërko përdoruesin..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{border: 'none', outline: 'none', width: '100%', fontSize: '16px'}}
                            />
                        </div>
                    </div>

                    <div className="timeline-container">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : filteredUsers.length > 0 ? (
                            filteredUsers.map(user => (
                                <div key={user.id} className="timeline-row">
                                    {/* Kolona e Kohës - E përdorim për Datën */}
                                    <div className="time-column">
                                        <div className="time-text" style={{fontSize: '0.9rem'}}>
                                            {new Date(user.created_at).toLocaleDateString('sq-AL')}
                                        </div>
                                        <div className="vertical-line confirmed"></div>
                                    </div>

                                    {/* Kartela e Përdoruesit */}
                                    <div className="appointment-card-large">
                                        <div className="client-section">
                                            <div className="avatar-circle">
                                                {user.name?.[0]}
                                            </div>
                                            <div className="client-details">
                                                <h3>{user.name} {user.surname}</h3>
                                                <div className="service-txt" style={{display: 'flex', flexDirection: 'column', gap: '4px'}}>
                                                    <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}><Mail size={14}/> {user.email}</span>
                                                    <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}><Phone size={14}/> {user.phone_number}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="card-right-info">
                                            <div className="price-tag">ID: #{user.id}</div>
                                            <button 
                                                className="status-pill confirmed" 
                                                style={{cursor: 'pointer', border: 'none', display: 'flex', alignItems: 'center', gap: '5px'}}
                                                onClick={() => window.location.href = `/admin/create-business/${user.id}`}
                                            >
                                                Hap Biznes <ArrowUpRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card">
                                <p>Nuk u gjet asnjë kërkesë e re.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;