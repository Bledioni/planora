import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../../index'; 
import Swal from 'sweetalert2';

const CreateBusiness = () => {
    const { userId } = useParams(); // Ky vjen nga URL: /admin/create-business/15
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        user_id: userId || '', // Sigurohemi që merr vlerën nga URL
        category_id: '',
        shop_name: '',
        address: '',
        business_type: '',
        description: ''
    });

    // KJO ËSHTË E RËNDËSISHME: 
    // Nëse userId vjen me vonesë nga URL, e përditësojmë formData-n automatikisht
    useEffect(() => {
        if (userId) {
            setFormData(prev => ({ ...prev, user_id: userId }));
        }
    }, [userId]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await api.get('/categories');
                setCategories(res.data.data || res.data);
            } catch (err) { console.error("Gabim me kategoritë", err); }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // DEBUG: Shiko në console nëse user_id është aty para se ta dërgosh
        console.log("Të dhënat që po dërgohen:", formData);

        if (!formData.user_id) {
            Swal.fire('Gabim', 'ID e përdoruesit mungon!', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await api.post('/admin/StoreBusiness', formData);

            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Biznesi u Aktivizua!',
                    text: 'Pronari dhe stafi tani janë ACTIVE.',
                });
                navigate('/admin/users');
            }
        } catch (err) {
            // Shiko nëse backend-i kthen ndonjë mesazh specifik
            const errorMsg = err.response?.data?.message || 'Diçka shkoi gabim';
            Swal.fire('Gabim', errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-container">
            <h2>Konfiguro Biznesin për User ID: {userId}</h2>
            <form onSubmit={handleSubmit}>
                <input name="shop_name" placeholder="Emri i Dyqanit" onChange={handleChange} required />
                
                <select name="category_id" onChange={handleChange} required>
                    <option value="">Zgjidh Kategorinë</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name || c.category_name}</option>
                    ))}
                </select>

                <input name="address" placeholder="Adresa" onChange={handleChange} required />
                <input name="business_type" placeholder="Lloji (p.sh Barber)" onChange={handleChange} required />
                <textarea name="description" placeholder="Përshkrimi" onChange={handleChange} />
                
                <button type="submit" disabled={loading}>
                    {loading ? 'Duke Aktivizuar...' : 'Krijo & Aktivizo Biznesin'}
                </button>
            </form>
        </div>
    );
};

export default CreateBusiness;