import { useEffect, useState, useCallback } from 'react'; // Shtuar useCallback
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, UserPlus, Users, Mail, Phone, 
    Calendar, RefreshCw, Trash2, Search, // Hequr 'Shield' që nuk përdorej
    UserCheck, UserX, Clock
} from 'lucide-react';
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
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });

    // Përdorim useCallback për të parandaluar ri-krijimin e funksionit në çdo render
    // Kjo zgjidh warning-un e 'react-hooks/exhaustive-deps'
    const fetchEmployees = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/employees/${businessId}/employees`);
            
            if (response.data.status === 'success') {
                const employeesData = response.data.employees;
                setEmployees(employeesData);
                setBusiness(response.data.business);
                
                setStats({
                    total: employeesData.length,
                    active: employeesData.filter(e => e.status === 'active').length,
                    pending: employeesData.filter(e => e.status === 'pending').length,
                    inactive: employeesData.filter(e => e.status === 'inactive' || e.status === 'suspended').length
                });
            }
        } catch (err) {
            Swal.fire('Gabim', 'Nuk mund të ngarkohen punonjësit.', 'error');
        } finally {
            setLoading(false);
        }
    }, [businessId]); // Varësia e vetme është businessId

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]); // Tani fetchEmployees është një varësi e sigurt

    const filteredEmployees = employees.filter(e => 
        `${e.name} ${e.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteEmployee = async (employee) => {
        const result = await Swal.fire({
            title: 'Fshi Punonjësin?',
            text: `A jeni i sigurt për fshirjen e ${employee.name} ${employee.surname}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Po, Fshije!',
            cancelButtonText: 'Anulo'
        });

        if (result.isConfirmed) {
            setDeletingId(employee.id);
            try {
                await api.delete(`/admin/employees/delete/${employee.id}`);
                Swal.fire('Sukses', 'Punonjësi u fshi.', 'success');
                fetchEmployees();
            } catch (err) {
                Swal.fire('Gabim', 'Fshirja dështoi.', 'error');
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
                    <div className="admin-loading-state">
                        <RefreshCw className="spinner-icon" size={40} />
                        <p>Duke ngarkuar stafin...</p>
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
                    <header className="modern-header">
                        <div className="header-left">
                            <button onClick={() => navigate(`/admin/business/${businessId}`)} className="back-pill">
                                <ArrowLeft size={16} />
                                <span>Pas tek Biznesi</span>
                            </button>
                            <h1>Stafi i {business?.name || business?.shop_name}</h1>
                            <p>Menaxho rolet dhe aksesin e punonjësve</p>
                        </div>
                        
                        <div className="header-right">
                            <div className="search-pill">
                                <Search size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Kërko punonjësit..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button onClick={() => navigate(`/admin/business/${businessId}/add-employee`)} className="btn-premium-action success">
                                <UserPlus size={18} />
                                <span>Shto Staf</span>
                            </button>
                        </div>
                    </header>

                    <div className="stats-indicator-grid">
                        <div className="stat-pill-box total">
                            <div className="icon-wrap"><Users size={20} /></div>
                            <div className="info">
                                <span className="val">{stats.total}</span>
                                <span className="lbl">Total</span>
                            </div>
                        </div>
                        <div className="stat-pill-box active">
                            <div className="icon-wrap"><UserCheck size={20} /></div>
                            <div className="info">
                                <span className="val">{stats.active}</span>
                                <span className="lbl">Aktivë</span>
                            </div>
                        </div>
                        <div className="stat-pill-box pending">
                            <div className="icon-wrap"><Clock size={20} /></div>
                            <div className="info">
                                <span className="val">{stats.pending}</span>
                                <span className="lbl">Pritje</span>
                            </div>
                        </div>
                    </div>

                    <div className="employees-premium-grid">
                        {filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                                <div key={employee.id} className="employee-premium-card">
                                    <div className="card-top">
                                        <div className="avatar-large">
                                            {employee.name?.[0]}{employee.surname?.[0]}
                                        </div>
                                        <span className={`status-badge-modern ${employee.status}`}>
                                            {employee.status}
                                        </span>
                                    </div>

                                    <div className="card-mid">
                                        <h3>{employee.name} {employee.surname}</h3>
                                        <p className="emp-id">ID: #{employee.id}</p>
                                        <div className="info-list">
                                            <div className="info-item">
                                                <Mail size={14} /> <span>{employee.email}</span>
                                            </div>
                                            <div className="info-item">
                                                <Phone size={14} /> <span>{employee.phone_number || 'Pa numër'}</span>
                                            </div>
                                            <div className="info-item">
                                                <Calendar size={14} /> <span>{new Date(employee.created_at).toLocaleDateString('sq-AL')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-bottom">
                                        <button className="btn-secondary">Detajet</button>
                                        <button 
                                            className="btn-danger-icon"
                                            onClick={() => handleDeleteEmployee(employee)}
                                            disabled={deletingId === employee.id}
                                        >
                                            {deletingId === employee.id ? <RefreshCw className="spinning" size={16} /> : <Trash2 size={16} />}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-dashboard-state full-width">
                                <div className="empty-icon-wrap"><UserX size={40} /></div>
                                <h3>Nuk u gjet asnjë punonjës</h3>
                                <p>Provo një kërkim tjetër ose shto një punonjës të ri.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessEmployees;