import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    ArrowLeft, UserPlus, Users, Mail, Phone, 
    Calendar, RefreshCw, Trash2, Search, 
    UserCheck, UserX, Clock, X, Save
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
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({ name: '', surname: '', email: '', phone_number: '', status: '' });

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

    const openModal = (employee) => {
        setSelectedEmployee(employee);
        setForm({
            name: employee.name,
            surname: employee.surname,
            email: employee.email,
            phone_number: employee.phone_number,
            status: employee.status,
        });
    };

    const closeModal = () => {
        setSelectedEmployee(null);
        setForm({ name: '', surname: '', email: '', phone_number: '', status: '' });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.put(`/admin/employees/update/${selectedEmployee.id}`, form);
            Swal.fire('Sukses', 'Punonjësi u përditësua.', 'success');
            closeModal();
            fetchEmployees();
        } catch (err) {
            const errors = err.response?.data?.errors;
            const msg = errors ? Object.values(errors).flat().join('\n') : 'Përditësimi dështoi.';
            Swal.fire('Gabim', msg, 'error');
        } finally {
            setSaving(false);
        }
    };

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
                                        <button 
                                            onClick={() => openModal(employee)}
                                            className="status-pill confirmed" 
                                            style={{flex:'1', border:'none', cursor:'pointer'}}
                                        >
                                            Detajet
                                        </button>
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

            {/* Employee Detail Modal */}
            {selectedEmployee && (
                <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px'}}>
                    <div style={{background:'white', borderRadius:'20px', padding:'30px', width:'100%', maxWidth:'480px', boxShadow:'0 25px 50px rgba(0,0,0,0.15)'}}>
                        
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'25px'}}>
                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                <div className="avatar-circle" style={{width:'50px', height:'50px', fontSize:'1.1rem'}}>
                                    {selectedEmployee.name?.[0]}{selectedEmployee.surname?.[0]}
                                </div>
                                <div>
                                    <h3 style={{margin:0}}>{selectedEmployee.name} {selectedEmployee.surname}</h3>
                                    <p style={{margin:0, fontSize:'0.75rem', color:'#94a3b8'}}>ID: #{selectedEmployee.id}</p>
                                </div>
                            </div>
                            <button onClick={closeModal} style={{background:'#f1f5f9', border:'none', borderRadius:'10px', padding:'8px', cursor:'pointer'}}>
                                <X size={18} />
                            </button>
                        </div>

                        <div style={{display:'flex', flexDirection:'column', gap:'15px'}}>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                                <div>
                                    <label style={{fontSize:'0.75rem', fontWeight:'600', color:'#64748b', display:'block', marginBottom:'6px'}}>EMRI</label>
                                    <input
                                        value={form.name}
                                        onChange={e => setForm(p => ({...p, name: e.target.value}))}
                                        style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.9rem', boxSizing:'border-box'}}
                                    />
                                </div>
                                <div>
                                    <label style={{fontSize:'0.75rem', fontWeight:'600', color:'#64748b', display:'block', marginBottom:'6px'}}>MBIEMRI</label>
                                    <input
                                        value={form.surname}
                                        onChange={e => setForm(p => ({...p, surname: e.target.value}))}
                                        style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.9rem', boxSizing:'border-box'}}
                                    />
                                </div>
                            </div>

                            <div>
                                <label style={{fontSize:'0.75rem', fontWeight:'600', color:'#64748b', display:'block', marginBottom:'6px'}}>EMAIL</label>
                                <input
                                    value={form.email}
                                    onChange={e => setForm(p => ({...p, email: e.target.value}))}
                                    style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.9rem', boxSizing:'border-box'}}
                                />
                            </div>

                            <div>
                                <label style={{fontSize:'0.75rem', fontWeight:'600', color:'#64748b', display:'block', marginBottom:'6px'}}>TELEFONI</label>
                                <input
                                    value={form.phone_number}
                                    onChange={e => setForm(p => ({...p, phone_number: e.target.value}))}
                                    style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.9rem', boxSizing:'border-box'}}
                                />
                            </div>

                            <div>
                                <label style={{fontSize:'0.75rem', fontWeight:'600', color:'#64748b', display:'block', marginBottom:'6px'}}>STATUSI</label>
                                <select
                                    value={form.status}
                                    onChange={e => setForm(p => ({...p, status: e.target.value}))}
                                    style={{width:'100%', padding:'10px 12px', borderRadius:'10px', border:'1px solid #e2e8f0', outline:'none', fontSize:'0.9rem', boxSizing:'border-box'}}
                                >
                                    <option value="active">Active</option>
                                    <option value="pending">Pending</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'25px'}}>
                            <button onClick={closeModal} style={{flex:'1', padding:'12px', borderRadius:'12px', border:'1px solid #e2e8f0', background:'white', cursor:'pointer', fontWeight:'600'}}>
                                Anulo
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={saving}
                                style={{flex:'2', padding:'12px', borderRadius:'12px', border:'none', background:'#2563eb', color:'white', cursor:'pointer', fontWeight:'600', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px'}}
                            >
                                {saving ? <RefreshCw className="spin" size={16}/> : <Save size={16}/>}
                                {saving ? 'Duke ruajtur...' : 'Ruaj Ndryshimet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BusinessEmployees;