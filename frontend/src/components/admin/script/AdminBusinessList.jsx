import React, { useEffect, useState } from 'react';
import { api } from '../../../index'; // Sigurohu që ky është path-i i axios-it tënd
import Swal from 'sweetalert2';

const AdminOwnerList = () => {
    const [owners, setOwners] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. Merr listën e pronarëve nga Backend
    const fetchOwners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/admin/business-owners');
            setOwners(res.data);
        } catch (err) {
            console.error("Gabim gjatë marrjes së pronarëve:", err);
            Swal.fire('Gabim', 'Nuk u ngarkua lista e pronarëve.', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOwners();
    }, []);

    // 2. Funksioni Kill-Switch (Deaktivizo/Aktivizo)
    const handleToggleStatus = async (owner) => {
        const isActive = owner.status === 'active';
        const businessId = owner.business?.id;

        // Nëse pronari nuk ka biznes, bllokojmë vetëm ID-në e tij si User
        // Por meqë kemi businessId, përdorim funksionin masiv
        const result = await Swal.fire({
            title: isActive ? 'Blloko Pronarin?' : 'Aktivizo Pronarin?',
            text: isActive 
                ? `Kjo do të bllokojë ${owner.name} dhe të gjithë punonjësit e tij!` 
                : `Kjo do t'i rikthejë aksesin ${owner.name} dhe biznesit të tij.`,
            icon: isActive ? 'warning' : 'info',
            showCancelButton: true,
            confirmButtonColor: isActive ? '#d33' : '#28a745',
            confirmButtonText: isActive ? 'Po, bllokoje!' : 'Po, aktivizoje!',
            cancelButtonText: 'Anulo'
        });

        if (result.isConfirmed) {
            try {
                // Thërrasim endpoint-in masiv që ndryshon statusin në DB
                const url = isActive 
                    ? `/admin/deactivate-business/${businessId}` 
                    : `/admin/activate-business/${businessId}`;
                
                await api.post(url);
                
                Swal.fire('Sukses!', `Statusi u ndryshua në ${isActive ? 'Pending' : 'Active'}.`, 'success');
                fetchOwners(); // Rifresko listën automatikisht
            } catch (err) {
                Swal.fire('Gabim', 'Serveri nuk u përgjigj ose rruga nuk ekziston.', 'error');
            }
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Menaxhimi i Pronarëve (Business Owners)</h2>
                <button onClick={fetchOwners} disabled={loading} style={styles.refreshBtn}>
                    {loading ? 'Duke u përditësuar...' : 'Rifresko'}
                </button>
            </div>

            <table style={styles.table}>
                <thead>
                    <tr style={styles.thead}>
                        <th style={styles.th}>Emri & Mbiemri</th>
                        <th style={styles.th}>Email</th>
                        <th style={styles.th}>Biznesi</th>
                        <th style={styles.th}>Statusi</th>
                        <th style={styles.th}>Veprime</th>
                    </tr>
                </thead>
                <tbody>
                    {owners.length > 0 ? (
                        owners.map((owner) => (
                            <tr key={owner.id} style={styles.tr}>
                                <td style={styles.td}>{owner.name} {owner.surname}</td>
                                <td style={styles.td}>{owner.email}</td>
                                <td style={styles.td}>
                                    <strong>{owner.business?.shop_name || 'Pa Biznes'}</strong>
                                    <br />
                                    <small style={{ color: '#666' }}>ID: {owner.business?.id || 'N/A'}</small>
                                </td>
                                <td style={styles.td}>
                                    <span style={{
                                        ...styles.statusBadge,
                                        backgroundColor: owner.status === 'active' ? '#e6fffa' : '#fff5f5',
                                        color: owner.status === 'active' ? '#2c7a7b' : '#c53030',
                                        border: `1px solid ${owner.status === 'active' ? '#319795' : '#feb2b2'}`
                                    }}>
                                        {owner.status.toUpperCase()}
                                    </span>
                                </td>
                                <td style={styles.td}>
                                    <button 
                                        onClick={() => handleToggleStatus(owner)}
                                        disabled={!owner.business?.id} // Disable nëse nuk ka biznes (siguri)
                                        style={{
                                            ...styles.actionBtn,
                                            backgroundColor: owner.status === 'active' ? '#e53e3e' : '#38a169'
                                        }}
                                    >
                                        {owner.status === 'active' ? 'Blloko Aksesin' : 'Aktivizo Aksesin'}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                Nuk u gjet asnjë pronar biznesi.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

// CSS-in-JS Styles
const styles = {
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    },
    thead: {
        backgroundColor: '#2d3748',
        color: 'white',
        textAlign: 'left'
    },
    th: { padding: '15px' },
    tr: { borderBottom: '1px solid #edf2f7' },
    td: { padding: '15px' },
    statusBadge: {
        padding: '5px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 'bold'
    },
    actionBtn: {
        color: 'white',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'opacity 0.2s'
    },
    refreshBtn: {
        backgroundColor: '#4a5568',
        color: 'white',
        padding: '10px 20px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer'
    }
};

export default AdminOwnerList;