import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, UserPlus, Users, Mail, Phone, Calendar, Shield, RefreshCw, Trash2 } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/BusinessEmployees.css';

const BusinessEmployees = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        active: 0,
        pending: 0,
        inactive: 0
    });

    useEffect(() => {
        fetchEmployees();
    }, [businessId]);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/employees/${businessId}/employees`);
            
            if (response.data.status === 'success') {
                const employeesData = response.data.employees;
                setEmployees(employeesData);
                setBusiness(response.data.business);
                
                // Calculate stats
                setStats({
                    total: employeesData.length,
                    active: employeesData.filter(e => e.status === 'active').length,
                    pending: employeesData.filter(e => e.status === 'pending').length,
                    inactive: employeesData.filter(e => e.status === 'inactive' || e.status === 'suspended').length
                });
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError(err.response?.data?.message || "Dështoi lidhja me serverin.");
            Swal.fire('Gabim', err.response?.data?.message || 'Nuk mund të ngarkohen punonjësit.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteEmployee = async (employee) => {
        const result = await Swal.fire({
            title: 'Fshi Punonjësin?',
            html: `
                <div style="text-align: left; padding: 10px;">
                    <p style="margin-bottom: 16px;">Je i sigurt që dëshiron të fshish këtë punonjës?</p>
                    <div style="background: #fee2e2; padding: 12px; border-radius: 8px; border-left: 4px solid #ef4444;">
                        <strong style="color: #991b1b;">${employee.name} ${employee.surname}</strong><br/>
                        <small style="color: #991b1b;">Email: ${employee.email}</small>
                    </div>
                    <p style="margin-top: 16px; color: #6b7280; font-size: 0.875rem;">
                        ⚠️ Kjo veprim nuk mund të zhbëhet!
                    </p>
                </div>
            `,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Po, Fshije!',
            cancelButtonText: 'Anulo',
            customClass: {
                popup: 'delete-confirmation-popup'
            }
        });

        if (result.isConfirmed) {
            setDeletingId(employee.id);
            try {
                const response = await api.delete(`/admin/employees/delete/${employee.id}`);
                
                if (response.data.status === 'success') {
                    Swal.fire({
                        title: 'Fshirë me Sukses!',
                        text: `${employee.name} ${employee.surname} u fshi nga lista e punonjësve.`,
                        icon: 'success',
                        confirmButtonColor: '#10b981',
                        timer: 3000
                    });
                    
                    // Refresh the list
                    fetchEmployees();
                }
            } catch (err) {
                console.error("Error deleting employee:", err);
                Swal.fire({
                    title: 'Gabim!',
                    text: err.response?.data?.message || 'Nuk mund të fshihet punonjësi.',
                    icon: 'error',
                    confirmButtonColor: '#ef4444'
                });
            } finally {
                setDeletingId(null);
            }
        }
    };

    if (loading) {
        return (
            <div className="page-wrapper">
                <AdminSidebar />
                <div className="main-content">
                    <div className="loader-container">
                        <div className="spinner-large"></div>
                        <p>Duke ngarkuar punonjësit...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <AdminSidebar />
            
            <div className="main-content">
                <div className="content-inner employees-content">
                    {/* Breadcrumb */}
                    <button 
                        onClick={() => navigate(`/admin/business/${businessId}`)} 
                        className="back-link"
                    >
                        <ArrowLeft size={18} />
                        <span>Kthehu tek Paneli i Biznesit</span>
                    </button>

                    {/* Hero Header */}
                    <div className="employees-hero">
                        <div className="hero-left">
                            <div className="business-badge">
                                <Users size={24} />
                                <span>{business?.name || business?.shop_name || 'Biznesi'}</span>
                            </div>
                            <h1 className="hero-title">Menaxhimi i Stafit</h1>
                            <p className="hero-subtitle">
                                Shiko, menaxho dhe kontrollo të gjithë punonjësit e biznesit
                            </p>
                        </div>
                        
                        <div className="hero-actions">
                            <button 
                                onClick={fetchEmployees}
                                className="refresh-btn"
                                disabled={loading}
                            >
                                <RefreshCw size={18} />
                                <span>Rifresko</span>
                            </button>
                            <button 
                                onClick={() => navigate(`/admin/business/${businessId}/add-employee`)}
                                className="add-employee-btn"
                            >
                                <UserPlus size={20} />
                                <span>Shto Punonjës të Ri</span>
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="stats-grid">
                        <div className="stat-card total">
                            <div className="stat-icon">
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Total Punonjës</span>
                                <span className="stat-value">{stats.total}</span>
                            </div>
                        </div>

                        <div className="stat-card active">
                            <div className="stat-icon">
                                <Shield size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Aktivë</span>
                                <span className="stat-value">{stats.active}</span>
                            </div>
                        </div>

                        <div className="stat-card pending">
                            <div className="stat-icon">
                                <Calendar size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Pending</span>
                                <span className="stat-value">{stats.pending}</span>
                            </div>
                        </div>

                        <div className="stat-card inactive">
                            <div className="stat-icon">
                                <Users size={24} />
                            </div>
                            <div className="stat-content">
                                <span className="stat-label">Inaktivë</span>
                                <span className="stat-value">{stats.inactive}</span>
                            </div>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="error-banner">
                            <span className="error-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Employees Grid/Table */}
                    {employees.length > 0 ? (
                        <div className="employees-grid">
                            {employees.map((employee) => (
                                <div key={employee.id} className="employee-card">
                                    <div className="card-header">
                                        <div className="employee-avatar">
                                            {employee.name?.[0]?.toUpperCase()}{employee.surname?.[0]?.toUpperCase()}
                                        </div>
                                        <span className={`status-pill ${employee.status}`}>
                                            {employee.status === 'active' ? '✓ Aktiv' : 
                                             employee.status === 'pending' ? '⏳ Pending' : '✕ Inaktiv'}
                                        </span>
                                    </div>

                                    <div className="card-body">
                                        <h3 className="employee-name">
                                            {employee.name} {employee.surname}
                                        </h3>
                                        <span className="employee-id">ID: #{employee.id}</span>

                                        <div className="contact-details">
                                            <div className="detail-item">
                                                <Mail size={16} />
                                                <span className="detail-text">{employee.email}</span>
                                            </div>
                                            {employee.phone_number && (
                                                <div className="detail-item">
                                                    <Phone size={16} />
                                                    <span className="detail-text">{employee.phone_number}</span>
                                                </div>
                                            )}
                                            <div className="detail-item">
                                                <Calendar size={16} />
                                                <span className="detail-text">
                                                    {new Date(employee.created_at).toLocaleDateString('sq-AL', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer">
                                        <div className="footer-actions">
                                            <button className="view-details-btn">
                                                Shiko Detajet
                                            </button>
                                            <button 
                                                className="delete-btn"
                                                onClick={() => handleDeleteEmployee(employee)}
                                                disabled={deletingId === employee.id}
                                            >
                                                {deletingId === employee.id ? (
                                                    <span className="spinner-small"></span>
                                                ) : (
                                                    <Trash2 size={18} />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state-card">
                            <div className="empty-icon">
                                <Users size={64} />
                            </div>
                            <h3>Asnjë Punonjës</h3>
                            <p>Nuk ka punonjës të regjistruar për këtë biznes akoma.</p>
                            <button 
                                onClick={() => navigate(`/admin/business/${businessId}/add-employee`)}
                                className="empty-action-btn"
                            >
                                <UserPlus size={20} />
                                <span>Shto Punonjësin e Parë</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BusinessEmployees;