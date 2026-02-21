/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { 
    Search, RefreshCw, ShieldAlert, ShieldCheck, 
    Calendar as CalIcon 
} from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from '../script/AdminSidebar';
import Swal from 'sweetalert2';

const AdminOwnerList = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [subStartDate, setSubStartDate] = useState(null);
    const [subEndDate, setSubEndDate] = useState(null);
    const [subStatus, setSubStatus] = useState("");

    const fetchOwners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/users/business-owners');
            // FIX: Added a fallback empty array to prevent .filter() errors
            setOwners(res.data.business_owners || res.data || []);
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Gabim', text: 'Nuk u ngarkua lista.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOwners(); }, []);

    const toLocalISO = (dateStr) => {
        if (!dateStr) return null;
        try {
            return new Date(dateStr).toISOString().split('T')[0];
        } catch (e) {
            return null;
        }
    };

    const filteredOwners = (owners || []).filter(owner => {
        const fullName = `${owner.name || ''} ${owner.surname || ''}`.toLowerCase();
        const bizName = (owner.business?.shop_name || owner.business?.name || "").toLowerCase();
        const email = (owner.email || "").toLowerCase();
        
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                              bizName.includes(searchTerm.toLowerCase()) || 
                              email.includes(searchTerm.toLowerCase());

        const matchesSubStart = !subStartDate || toLocalISO(owner.business?.subscription?.start_date) === toLocalISO(subStartDate);
        const matchesSubEnd = !subEndDate || toLocalISO(owner.business?.subscription?.end_date) === toLocalISO(subEndDate);

        const matchesSubStatus = !subStatus || (() => {
            if (!owner.business?.subscription) return subStatus === 'none';
            const isExpired = new Date(owner.business.subscription.end_date) < new Date();
            return subStatus === 'expired' ? isExpired : subStatus === 'active' ? !isExpired : true;
        })();

        return matchesSearch && matchesSubStart && matchesSubEnd && matchesSubStatus;
    });

    const handleToggleStatus = async (owner) => {
        const isActive = owner.status === 'active';

        if (isActive) {
            const result = await Swal.fire({
                title: 'Blloko Aksesin?',
                text: `Kjo do të bllokojë ${owner.name} dhe stafin e tij!`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Po, bllokoje!',
                cancelButtonText: 'Anulo'
            });

            if (result.isConfirmed) {
                try {
                    await api.post(`/admin/businesses/deactivate/${owner.business.id}`);
                    fetchOwners();
                    Swal.fire('Sukses', 'Biznesi u bllokua.', 'success');
                } catch (err) {
                    Swal.fire('Gabim', 'Veprimi dështoi.', 'error');
                }
            }
        } else {
            const { value: formData } = await Swal.fire({
                title: 'Aktivizo Biznesin',
                html: `
                    <div style="text-align:left;">
                        <p style="color:#64748b; font-size:14px; margin-bottom:15px;">Zgjidh abonimin për <strong>${owner.name}</strong>:</p>
                        <div style="display:flex; gap:10px; margin-bottom:20px;">
                            <button type="button" id="tab-m" class="swal-tab-btn active-tab">Me Muaj</button>
                            <button type="button" id="tab-d" class="swal-tab-btn">Datë Specifike</button>
                        </div>
                        <div id="m-sec">
                            <input id="m-inp" type="number" min="1" placeholder="Numri i muajve (psh. 12)" class="swal-custom-input" />
                        </div>
                        <div id="d-sec" style="display:none;">
                            <input id="d-inp" type="date" min="${new Date().toISOString().split('T')[0]}" class="swal-custom-input" />
                        </div>
                    </div>
                `,
                didOpen: () => {
                    const tm = document.getElementById('tab-m');
                    const td = document.getElementById('tab-d');
                    const ms = document.getElementById('m-sec');
                    const ds = document.getElementById('d-sec');
                    tm.onclick = () => { tm.classList.add('active-tab'); td.classList.remove('active-tab'); ms.style.display='block'; ds.style.display='none'; };
                    td.onclick = () => { td.classList.add('active-tab'); tm.classList.remove('active-tab'); ds.style.display='block'; ms.style.display='none'; };
                },
                showCancelButton: true,
                confirmButtonText: 'Aktivizo',
                confirmButtonColor: '#22c55e',
                preConfirm: () => {
                    const isM = document.getElementById('m-sec').style.display !== 'none';
                    if (isM) {
                        const val = document.getElementById('m-inp').value;
                        if (!val) return Swal.showValidationMessage('Shkruaj muajt!');
                        return { type: 'months', months: val };
                    } else {
                        const val = document.getElementById('d-inp').value;
                        if (!val) return Swal.showValidationMessage('Zgjidh datën!');
                        return { type: 'date', end_date: val };
                    }
                }
            });

            if (formData) {
                try {
                    const payload = formData.type === 'months' ? { months: formData.months } : { end_date: formData.end_date };
                    await api.post(`/admin/businesses/activate/${owner.business.id}`, payload);
                    fetchOwners();
                    Swal.fire('Sukses', 'Biznesi u aktivizua!', 'success');
                } catch (err) {
                    Swal.fire('Gabim', 'Aktivizimi dështoi.', 'error');
                }
            }
        }
    };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('sq-AL', { 
        day: '2-digit', month: 'short', year: 'numeric' 
    }) : '—';

    return (
        <div className="owner-layout">
            <AdminSidebar />
            <main className="owner-main-content">
                <div className="schedule-container-wide">
                    <header className="schedule-header-big">
                        <h1>Menaxhimi i Pronarëve</h1>
                        <p>Kontrollo licencat e bizneseve në Planora</p>
                    </header>

                    <div className="planora-calendar-big filter-dock">
                        <div className="modern-search-wrapper">
                            <Search size={18} color="#2563eb" />
                            <input type="text" placeholder="Kërko pronar, biznes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <div className="date-picker-custom">
                                <CalIcon size={14} />
                                <DatePicker 
                                    selected={subStartDate} 
                                    onChange={d => setSubStartDate(d)} 
                                    placeholderText="Fillimi" 
                                    dateFormat="dd/MM/yy" 
                                />
                            </div>
                            <div className="date-picker-custom">
                                <CalIcon size={14} />
                                <DatePicker 
                                    selected={subEndDate} 
                                    onChange={d => setSubEndDate(d)} 
                                    placeholderText="Mbarimi" 
                                    dateFormat="dd/MM/yy" 
                                />
                            </div>
                            <select className="status-select" value={subStatus} onChange={e => setSubStatus(e.target.value)}>
                                <option value="">Statusi</option>
                                <option value="active">Aktivë</option>
                                <option value="expired">Skaduar</option>
                            </select>
                        </div>
                        <button onClick={fetchOwners} className={`refresh-btn-circle ${loading ? 'spin' : ''}`}>
                            <RefreshCw size={18} />
                        </button>
                    </div>

                    <div className="table-wrapper-premium">
                        <table className="planora-table">
                            <thead>
                                <tr><th>PRONARI</th><th>BIZNESI</th><th>ABONIMI</th><th className="text-right">VEPRIMI</th></tr>
                            </thead>
                            <tbody>
                                {filteredOwners.map((owner) => (
                                    <tr key={owner.id}>
                                        <td data-label="Pronari">
                                            <div className="profile-cell">
                                                <div className="avatar-circle">{owner.name?.[0]}</div>
                                                <div className="profile-info">
                                                    <span className="main-text">{owner.name} {owner.surname}</span>
                                                    <span className="sub-text email-text">{owner.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td data-label="Biznesi">
                                            <div className="biz-cell">
                                                <span className="main-text">{owner.business?.shop_name || "N/A"}</span>
                                                <span className="id-tag">ID: {owner.business?.id}</span>
                                            </div>
                                        </td>
                                        <td data-label="Abonimi">
                                            {owner.business?.subscription ? (
                                                <div className="sub-info-cell">
                                                    <div className="date-row"><span>Skadon:</span> {formatDate(owner.business.subscription.end_date)}</div>
                                                    <div className={`status-pill-mini ${new Date(owner.business.subscription.end_date) > new Date() ? 'active' : 'expired'}`}>
                                                        {new Date(owner.business.subscription.end_date) > new Date() ? 'Aktiv' : 'Skaduar'}
                                                    </div>
                                                </div>
                                            ) : <span className="no-sub-tag">Pa Abonim</span>}
                                        </td>
                                        <td data-label="Veprimi" className="text-right">
                                            <div className="action-toggle-cell">
                                                <span className={`status-text ${owner.status}`}>{owner.status}</span>
                                                <button onClick={() => handleToggleStatus(owner)} className={`ios-switch-btn ${owner.status === 'active' ? 'active' : ''}`}>
                                                    <div className="thumb">{owner.status === 'active' ? <ShieldCheck size={10}/> : <ShieldAlert size={10}/>}</div>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOwners.length === 0 && !loading && (
                                    <tr><td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>Nuk u gjet asnjë rezultat.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default AdminOwnerList;