import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, Building2, AlertCircle, Search, ArrowLeft } from 'lucide-react';
import { api } from '../../../index';
import AdminSidebar from './AdminSidebar';
import Swal from 'sweetalert2';
import '../style/SendEmail.css';

const SendEmail = () => {
    const [businesses, setBusinesses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sendToAll, setSendToAll] = useState(false);
    const [selectedBusiness, setSelectedBusiness] = useState('');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchBusinesses(); }, []);

    const fetchBusinesses = async () => {
        try {
            const res = await api.get('/admin/users/business-owners');
            setBusinesses(res.data.business_owners || res.data);
        } catch (err) {
            Swal.fire('Gabim', 'Nuk u ngarkua lista.', 'error');
        }
    };

    const filteredBusinesses = businesses.filter(owner => {
        const bizName = (owner.business?.shop_name || owner.business?.name || '').toLowerCase();
        const ownerName = `${owner.name} ${owner.surname}`.toLowerCase();
        return bizName.includes(searchTerm.toLowerCase()) || ownerName.includes(searchTerm.toLowerCase());
    });

    const handleSendEmail = async (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) return Swal.fire('Kujdes', 'Plotëso të gjitha fushat.', 'warning');
        
        const confirmResult = await Swal.fire({
            title: 'Konfirmo dërgimin',
            text: sendToAll ? `Email do t'u dërgohet ${businesses.length} bizneseve.` : "Email do të dërgohet te marrësi i zgjedhur.",
            icon: 'paperplane',
            showCancelButton: true,
            confirmButtonText: 'Dërgo',
            confirmButtonColor: '#2563eb'
        });

        if (!confirmResult.isConfirmed) return;

        setLoading(true);
        try {
            const payload = { subject, message, send_to_all: sendToAll, business_id: sendToAll ? null : selectedBusiness };
            await api.post('/admin/businesses/send-email', payload);
            Swal.fire('Dërguar!', 'Mesazhi u dërgua me sukses.', 'success');
            setSubject(''); setMessage('');
        } catch (err) {
            Swal.fire('Gabim', 'Ndodhi një problem gjatë dërgimit.', 'error');
        } finally { setLoading(false); }
    };

    return (
        <div className="owner-layout">
            <AdminSidebar />
            <main className="owner-main-content">
                <div className="premium-email-wrapper">
                    
                    {/* Header Section */}
                    <header className="schedule-header-big">
                        <div className="header-top-tag">
                            <Mail size={14} /> Komunikimi me Bizneset
                        </div>
                        <h1>Dërgo Email</h1>
                        <p>Krijo njoftime të personalizuara ose masive</p>
                    </header>

                    <form onSubmit={handleSendEmail} className="email-form-container">
                        
                        {/* Selector Section */}
                        <section className="email-section-card">
                            <h3 className="section-title"><Users size={18} /> Zgjidh Marrësin</h3>
                            <div className="mode-toggle-grid">
                                <button 
                                    type="button" 
                                    className={`mode-btn ${!sendToAll ? 'active' : ''}`}
                                    onClick={() => setSendToAll(false)}
                                >
                                    <Building2 size={20} />
                                    <span>Individual</span>
                                </button>
                                <button 
                                    type="button" 
                                    className={`mode-btn ${sendToAll ? 'active' : ''}`}
                                    onClick={() => setSendToAll(true)}
                                >
                                    <Users size={20} />
                                    <span>Të Gjithë ({businesses.length})</span>
                                </button>
                            </div>

                            {!sendToAll && (
                                <div className="recipient-selector-area fade-in">
                                    <div className="search-bar-mini">
                                        <Search size={16} />
                                        <input 
                                            type="text" 
                                            placeholder="Kërko biznesin..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                    </div>
                                    <select 
                                        className="premium-dropdown"
                                        value={selectedBusiness}
                                        onChange={(e) => setSelectedBusiness(e.target.value)}
                                        required={!sendToAll}
                                    >
                                        <option value="">Zgjidhni një biznes...</option>
                                        {filteredBusinesses.map(b => (
                                            <option key={b.business?.id} value={b.business?.id}>
                                                {b.business?.shop_name || "Pa emër"} - ({b.name} {b.surname})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </section>

                        {/* Content Section */}
                        <section className="email-section-card">
                            <h3 className="section-title"><Mail size={18} /> Përmbajtja</h3>
                            <div className="input-stack">
                                <input 
                                    type="text"
                                    className="premium-field"
                                    placeholder="Subjekti i email-it"
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    required
                                />
                                <textarea 
                                    className="premium-field textarea"
                                    placeholder="Shkruaj mesazhin tënd këtu..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    rows="10"
                                />
                            </div>
                        </section>

                        {/* Submit Action */}
                        <div className="action-bar-email">
                            <button type="submit" className="send-btn-main" disabled={loading}>
                                {loading ? (
                                    <span className="loader-spin"></span>
                                ) : (
                                    <><Send size={20} /> Dërgo Mesazhin</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default SendEmail;