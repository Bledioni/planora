import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, UserPlus, Users, Mail, Phone, 
    Calendar, RefreshCw, Trash2, Search, 
    UserCheck, UserX, Clock
} from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';
import '../style/AdminDashboard.css'; // Unifikimi i stilit

const BusinessEmployees = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [employees, setEmployees] = useState([]);
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deletingId, setDeletingId] = useState(null);
    const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, inactive: 0 });

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
    }, [businessId]);

    useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

    const filteredEmployees = employees.filter(e => 
        `${e.name} ${e.surname}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDeleteEmployee = async (employee) => {
        const result = await Swal.fire({
            title: 'Fshi Punonjësin?',
            text: `A jeni i sigurt për fshirjen e ${employee.name}?`,
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
            } finally { setDeletingId(null); }
        }
    };

    return (
        <div className="owner-layout">
            <AdminSidebar />
            <main className="owner-main-content">
                <div className="schedule-container-wide">
                    
                    <header className="schedule-header-big">
                        <button onClick={() => navigate(`/admin/business/${businessId}`)} className="header-top-tag" style={{border:'none', cursor:'pointer'}}>
                            <ArrowLeft size={14} />
                            <span>Kthehu te Biznesi</span>
                        </button>
                        <h1>Stafi: {business?.name || "Ngarkimi..."}</h1>
                        <p>Menaxho ekipin dhe rolet në <strong>Planora</strong></p>
                    </header>

                    {/* Stats Indicator - Premium Row */}
                    <div className="stats-indicator-grid" style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'15px', marginBottom:'30px'}}>
                        <div className="stat-pill-box total">
                            <Users size={18} />
                            <span><strong>{stats.total}</strong> Total</span>
                        </div>
                        <div className="stat-pill-box active">
                            <UserCheck size={18} />
                            <span><strong>{stats.active}</strong> Aktivë</span>
                        </div>
                        <div className="stat-pill-box pending">
                            <Clock size={18} />
                            <span><strong>{stats.pending}</strong> Pritje</span>
                        </div>
                    </div>

                    {/* Search & Action Bar */}
                    <div className="planora-calendar-big" style={{padding:'15px', marginBottom:'2rem', justifyContent:'space-between', flexWrap:'wrap'}}>
                        <div className="modern-search-wrapper" style={{background:'white', padding:'10px 15px', borderRadius:'12px', display:'flex', alignItems:'center', gap:'10px', flex:'1', minWidth:'250px'}}>
                            <Search size={18} color="#2563eb" />
                            <input 
                                type="text" 
                                placeholder="Kërko stafin..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{border:'none', outline:'none', width:'100%'}}
                            />
                        </div>
                        <button onClick={() => navigate(`/admin/business/${businessId}/add-employee`)} className="planora-submit-btn" style={{marginTop:'0', padding:'12px 20px', fontSize:'0.9rem'}}>
                            <UserPlus size={18} /> Shto Staf
                        </button>
                    </div>

                    <div className="actions-card-grid">
                        {loading ? (
                            <div className="planora-loader-big"></div>
                        ) : filteredEmployees.length > 0 ? (
                            filteredEmployees.map((employee) => (
                                <div key={employee.id} className="premium-action-card employee-card">
                                    <div className="card-top-flex" style={{display:'flex', justifyContent:'space-between', width:'100%', marginBottom:'15px'}}>
                                        <div className="avatar-circle" style={{width:'50px', height:'50px', fontSize:'1.1rem'}}>
                                            {employee.name?.[0]}{employee.surname?.[0]}
                                        </div>
                                        <div className={`status-pill ${employee.status}`}>
                                            {employee.status}
                                        </div>
                                    </div>

                                    <div className="card-info" style={{width:'100%'}}>
                                        <h3 style={{margin:'0'}}>{employee.name} {employee.surname}</h3>
                                        <p style={{fontSize:'0.75rem', marginBottom:'12px', color:'#94a3b8'}}>ID: #{employee.id}</p>
                                        
                                        <div className="emp-details-list" style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                                            <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'#64748b'}}>
                                                <Mail size={14}/> {employee.email}
                                            </div>
                                            <div style={{display:'flex', alignItems:'center', gap:'8px', fontSize:'0.85rem', color:'#64748b'}}>
                                                <Phone size={14}/> {employee.phone_number || 'Pa numër'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="card-footer-actions" style={{display:'flex', gap:'10px', width:'100%', marginTop:'20px', borderTop:'1px solid #f1f5f9', paddingTop:'15px'}}>
                                        <button className="status-pill confirmed" style={{flex:'1', border:'none', cursor:'pointer'}}>Detajet</button>
                                        <button 
                                            onClick={() => handleDeleteEmployee(employee)}
                                            style={{background:'#fee2e2', color:'#ef4444', border:'none', padding:'10px', borderRadius:'10px', cursor:'pointer'}}
                                        >
                                            {deletingId === employee.id ? <RefreshCw className="spin" size={16}/> : <Trash2 size={16}/>}
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-schedule-card" style={{gridColumn:'1/-1'}}>
                                <UserX size={40} style={{opacity:0.2, marginBottom:'10px'}}/>
                                <p>Nuk u gjet asnjë punonjës.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusinessEmployees;