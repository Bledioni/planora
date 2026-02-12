import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../index'; // Sigurohu që path-i i api.js është i saktë

const Logout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const performLogout = async () => {
            try {
                // 1. Lajmërojmë Backend-in (Opsionale por e rekomanduar për siguri)
                await api.post('/logout');
            } catch (err) {
                console.error("Gabim gjatë fshirjes së tokenit në server", err);
            } finally {
                // 2. Fshijmë gjithçka nga LocalStorage pavarësisht suksesit të serverit
                localStorage.clear();
                
                // 3. Dërgojmë përdoruesin në Login
                navigate('/login');
            }
        };

        performLogout();
    }, [navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">Duke u dalë nga llogaria...</p>
            </div>
        </div>
    );
};

export default Logout;