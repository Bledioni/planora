import React, { useEffect, useState } from 'react';
import { api } from '../../../index'; 
import AdminSidebar from '../script/AdminSidebar';
import { 
    Users, 
    Mail, 
    Phone, 
    Calendar, 
    ArrowUpRight, 
    Search, 
    Loader2, 
    UserCheck,
    AlertCircle
} from 'lucide-react';
import '../style/AdminDashboard.css'; // Sigurohu që path-i është i saktë

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/users/without-business');
            if (response.data && response.data.status === 'success') {
                setUsers(response.data.data);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Lidhja me serverin dështoi.");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(u => 
        `${u.name} ${u.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="page-wrapper">
                <AdminSidebar />
                <div className="main-content">
                    <div className="admin-loading-state">
                        <Loader2 className="spinner-icon" size={40} />
                        <p>Duke sinkronizuar të dhënat...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <AdminSidebar />
            
            <main className="main-content">
                <div className="content-inner">
                    {/* Upper Dashboard Header */}
                    <header className="modern-header">
                        <div className="header-left">
                            <h1>Kërkesat për Biznes</h1>
                            <p>Menaxho pronarët e rinj në platformën <span>Planora</span></p>
                        </div>
                        
                        <div className="header-right">
                            <div className="search-pill">
                                <Search size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Kërko me emër ose email..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="stats-indicator">
                                <div className="icon-bg"><Users size={18} /></div>
                                <div className="stat-info">
                                    <span className="val">{users.length}</span>
                                    <span className="lbl">Kërkesa</span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {error && (
                        <div className="modern-error-banner">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Table Container */}
                    <div className="premium-card">
                        <div className="table-responsive">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Përdoruesi</th>
                                        <th>Informacioni i Kontaktit</th>
                                        <th>Data e Regjistrimit</th>
                                        <th className="text-right">Veprimi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                                        // Brenda users.map(user => (...))
<tr key={user.id} className="row-animate">
    <td data-label="Përdoruesi">
        <div className="user-cell">
            <div className="user-avatar-modern">
                {user.name?.[0]}{user.surname?.[0]}
            </div>
            <div className="user-meta">
                <span className="u-name">{user.name} {user.surname}</span>
                <span className="u-id">ID: #{user.id}</span>
            </div>
        </div>
    </td>
    <td data-label="Kontaktet">
        <div className="contact-meta">
            <div className="c-item"><Mail size={14} /> {user.email}</div>
            <div className="c-item"><Phone size={14} /> {user.phone_number}</div>
        </div>
    </td>
    <td data-label="Data">
        <div className="date-pill-modern">
            <Calendar size={14} />
            {new Date(user.created_at).toLocaleDateString('sq-AL')}
        </div>
    </td>
    <td className="text-right" data-label="Veprimi">
        <button 
            className="btn-premium-action"
            onClick={() => window.location.href = `/admin/create-business/${user.id}`}
        >
            <span>Hap Biznesin</span>
            <ArrowUpRight size={16} />
        </button>
    </td>
</tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="4">
                                                <div className="empty-dashboard-state">
                                                    <div className="empty-icon-wrap"><UserCheck size={40} /></div>
                                                    <h3>Nuk u gjet asnjë kërkesë</h3>
                                                    <p>Pritni për pronarë të rinj ose rregulloni filtrat e kërkimit.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminUsers;