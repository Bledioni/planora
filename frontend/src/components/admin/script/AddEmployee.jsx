import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../index';
import Swal from 'sweetalert2';

const AddEmployee = () => {
    const { businessId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        business_id: businessId,
        name: '',
        surname: '',
        email: '',
        phone_number: '',
        password: '',
        password_confirmation: '',
        role: 'employee' // E detyrueshme për t'u bërë direkt active
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Thirrja e API që sapo modifikuam te AuthenticationController
            const response = await api.post('/register', formData);
            if (response.status === 201) {
                Swal.fire('Sukses', 'Punonjësi u shtua dhe është ACTIVE!', 'success');
                navigate(`/admin/business/${businessId}`);
            }
        } catch (err) {
            Swal.fire('Gabim', err.response?.data?.message || "Dështoi regjistrimi", 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Shto Punonjës (Business ID: {businessId})</h2>
            <form onSubmit={handleSubmit}>
                <input name="name" placeholder="Emri" onChange={handleChange} required />
                <input name="surname" placeholder="Mbiemri" onChange={handleChange} required />
                <input name="email" type="email" placeholder="Email" onChange={handleChange} required />
                <input name="phone_number" placeholder="Telefon" onChange={handleChange} required />
                <input name="password" type="password" placeholder="Fjalëkalimi" onChange={handleChange} required />
                <input name="password_confirmation" type="password" placeholder="Konfirmo" onChange={handleChange} required />
                <button type="submit" disabled={loading}>
                    {loading ? "Duke u ruajtur..." : "Regjistro Punonjësin"}
                </button>
            </form>
        </div>
    );
};

export default AddEmployee;