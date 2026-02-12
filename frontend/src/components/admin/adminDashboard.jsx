import AdminUsers from "./script/AdminUsers";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className="bg-gray-50 min-h-screen">
            <nav className="bg-white shadow-sm p-4 flex justify-between items-center">
                <span className="font-bold text-xl text-blue-600">Planora Admin</span>
                <button 
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                    Dil
                </button>
            </nav>
            <div className="p-6">
                <AdminUsers />
            </div>
        </div>
    );
}

export default AdminDashboard;