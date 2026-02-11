import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Importet tuaja
import Wishlist from "../components/wishlist/script/Wishlist";
import BookingApp from "../components/appointments/scripts/BookingApp";
import BarberDiscovery from "../components/appointments/scripts/BarberDiscovery";
import PlanoraLanding from "../landing/planoraLanding";
import Login from "../components/login";
import Logout from "../components/logout";
import AdminUsers from "../components/admin/script/AdminUsers";
import AdminDashboard from "../components/admin/adminDashboard";
import BusinessList from "../components/admin/script/BusinessList";
import BusinessDashboard from "../components/admin/script/BusinessDashboard";
import CreateBusiness from "../components/admin/script/CreateBusiness";
import AddEmployee from "../components/admin/script/AddEmployee";
import OwnerLayout from "../components/business/OwnerLayout";
import ManageSchedules from "../components/business/ManageSchedules";
import AppointmentsView from "../components/business/AppointmentsView";
import ProtectedRoute from "./ProtectedRoute";
import BusinessRegister from "../components/BusinessRegister";
import AdminBusinessList from "../components/admin/script/AdminBusinessList";


function Header() {
  return (
    <Router>
      <Routes>
        {/* --- RRUGËT PUBLIKE --- */}
        <Route path="/" element={<PlanoraLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/barberdiscovery" element={<BarberDiscovery />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/:shopSlug" element={<BookingApp />} />
        <Route path="/businessRegister" element={<BusinessRegister />} />

        {/* --- RRUGËT E MBROJTURA: PËRDORUESIT (Klientët) --- */}
        {/* Këtu shtohen të gjitha rolet që lejohen të kenë një wishlist */}
        <Route element={<ProtectedRoute allowedRoles={['user', 'admin', 'business_owner']} />}>
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        {/* --- RRUGËT E MBROJTURA: ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/adminDashboard" element={<AdminDashboard />} />
          <Route path="/adminUsers" element={<AdminUsers />} />
          <Route path="/admin/businesses" element={<BusinessList />} />
          <Route path="/admin/business/:businessId" element={<BusinessDashboard />} />
          <Route path="/admin/business/:businessId/add-employee" element={<AddEmployee />} />
          <Route path="/admin/create-business/:userId" element={<CreateBusiness />} />
          <Route path="/admin/AdminBusinessList" element={<AdminBusinessList />} />
        </Route>

        {/* --- RRUGËT E MBROJTURA: BUSINESS OWNER --- */}
        <Route element={<ProtectedRoute allowedRoles={['business_owner', 'admin']} />}>
          <Route path="/owner" element={<OwnerLayout />}>
            {/* Ky rresht bën që /owner të hapë automatikisht dashboard-in */}
            <Route index element={<Navigate to="dashboard" />} /> 
            <Route path="dashboard" element={<div>Dashboard Content</div>} /> {/* Shto komponentin tend ketu */}
            <Route path="schedules/:businessId" element={<ManageSchedules />} />
            <Route path="appointments/:businessId" element={<AppointmentsView />} />
          </Route>
        </Route>

        {/* --- 404 --- */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default Header;