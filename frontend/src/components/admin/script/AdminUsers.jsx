import React, { useEffect, useState } from 'react';
import { api } from '../../../index'; 
import '../../../components/admin/style/AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const response = await api.get('/admin/users-no-business');
                if (response.data && response.data.status === 'success') {
                    setUsers(response.data.data);
                }
            } catch (err) {
                console.error("API Error:", err);
                setError(err.response?.data?.message || "Dështoi lidhja me serverin.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) return (
        <div className="admin-loading-container">
            <div className="spinner"></div>
            <p>Duke ngarkuar kërkesat...</p>
        </div>
    );

    return (
        <div className="admin-container">
            <header className="admin-header">
                <div className="header-text">
                    <h1>Kërkesat për Biznes</h1>
                    <p>Pronarët që presin miratimin e dyqanit në <strong>Planora</strong></p>
                </div>
                <div className="stats-pill">
                    <span className="count">{users.length}</span>
                    <span className="label">Kërkesa Anuluese</span>
                </div>
            </header>

            {error && <div className="error-banner">{error}</div>}

            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>Përdoruesi</th>
                            <th>Kontaktet</th>
                            <th>Data Regjistrimit</th>
                            <th className="text-center">Veprimi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? users.map(user => (
                            <tr key={user.id}>
                                <td data-label="Përdoruesi">
                                    <div className="user-profile">
                                        <div className="avatar">
                                            {user.name[0]}{user.surname[0]}
                                        </div>
                                        <div className="user-info">
                                            <span className="name">{user.name} {user.surname}</span>
                                            <span className="id">ID: #{user.id}</span>
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Kontaktet">
                                    <div className="contact-info">
                                        <div className="item">
                                            <i className="email-icon">📧</i> {user.email}
                                        </div>
                                        <div className="item">
                                            <i className="phone-icon">📞</i> {user.phone_number}
                                        </div>
                                    </div>
                                </td>
                                <td data-label="Regjistruar">
                                    <span className="date-badge">
                                        {new Date(user.created_at).toLocaleDateString('sq-AL', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                </td>
                                <td className="text-center" data-label="Veprimi">
                                    <button 
                                        className="action-button primary"
                                        onClick={() => window.location.href = `/admin/create-business/${user.id}`}
                                    >
                                        Hap Biznesin
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="4" className="empty-state">
                                    Nuk ka asnjë kërkesë të re në këtë moment.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;