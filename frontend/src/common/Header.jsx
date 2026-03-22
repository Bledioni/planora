import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Wishlist from "../components/wishlist/script/Wishlist";
import BookingApp from "../components/appointments/scripts/BookingApp";
import BarberDiscovery from "../components/appointments/scripts/BarberDiscovery";
import PlanoraLanding from "../landing/planoraLanding";
import Login from "../components/login";
import Logout from "../components/logout";
import AdminDashboard from "../components/admin/script/AdminDashboard";
import BusinessList from "../components/admin/script/BusinessList";
import BusinessDashboard from "../components/admin/script/BusinessDashboard";
import CreateBusiness from "../components/admin/script/CreateBusiness";
import AddEmployee from "../components/admin/script/AddEmployee";
import ProtectedRoute from "./ProtectedRoute";
import Register from "../components/Register";
import AdminBusinessList from "../components/admin/script/AdminBusinessList";
import NotFound from "../components/script/NotFound";
import AdminSidebar from "../components/admin/script/AdminSidebar";
import BusinessEmployees from "../components/admin/script/BusinessEmployees";
import SendEmail from "../components/admin/script/SendEmail";
import AdminAnalyticsDashboard from "../components/admin/script/AdminAnalyticsDashboard";
import OwnerAnalyticsDashboard from "../components/business/script/OwnerAnalyticsDashboard";
import EmployeesSchedule from "../components/business/script/EmployeesSchedule";
import MySchedule from "../components/business/script/MySchedule";
import OwnerSidebar from "../components/business/script/OwnerSidebar";
import ManageSchedule from "../components/business/script/ManageSchedule";
import ManageServices from "../components/business/script/ManageServices";
import EmployeeAppointments from "../components/employees/script/EmployeeAppointments";
import EmployeeDashboard from "../components/employees/script/EmployeeDashboard";
import EmployeeSidebar from "../components/employees/script/EmployeeSidebar";
import EmployeeStats from "../components/employees/script/EmployeeStats";
import ForgotPassword from "../components/ForgotPassword";
import ResetPassword from "../components/ResetPassword";
import AppointmentConfirmed from "../components/appointments/scripts/AppointmentConfirmed";
import AdminBusinessConfig from "../components/admin/script/AdminBusinessConfig";
import AdminBusinessVisits from "../components/admin/script/AdminBusinessVisits";
import AdminCreateCategory from "../components/admin/script/AdminCreateCategory";
import OwnerSettings from "../components/settings/OwnerSettings";
import AdminSettings from "../components/settings/AdminSettings";
import EmployeeSettings from "../components/settings/EmployeeSettings";


function Header() {
  return (
    <Router>
      <Routes>



        {/* --- PUBLIC --- */}
        <Route path="/" element={<PlanoraLanding />} />
        <Route path="/login" element={<Login />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/barberdiscovery" element={<BarberDiscovery />} />
        <Route path="/appointment/:id" element={<AppointmentConfirmed />} />
        <Route path="/:shopSlug/:employeeSlug" element={<BookingApp />} />
        <Route path="/:shopSlug" element={<BookingApp />} />
        {/* --- PROTECTED: USER --- */}
        <Route element={<ProtectedRoute allowedRoles={["user", "admin", "business_owner"]} />}>
          <Route path="/wishlist" element={<Wishlist />} />
        </Route>

        {/* --- PROTECTED: ADMIN --- */}
        <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/adminDashboard" element={<AdminDashboard />} />
          <Route path="/admin/businesses" element={<BusinessList />} />
          <Route path="/admin/business/:businessId" element={<BusinessDashboard />} />
          <Route path="/admin/business/:businessId/add-employee" element={<AddEmployee />} />
          <Route path="/admin/create-business/:userId" element={<CreateBusiness />} />
          <Route path="/admin/AdminBusinessList" element={<AdminBusinessList />} />
          <Route path="/admin/AdminSideBar" element={<AdminSidebar />} />
          <Route path="/admin/employees/:businessId/employees" element={<BusinessEmployees />} />
          <Route path="/admin/send-email" element={<SendEmail />} />
          <Route path="/admin/admin-analytics-dashboard" element={<AdminAnalyticsDashboard />} />
          <Route path="/admin/business/:businessId/config" element={<AdminBusinessConfig />} />
          <Route path="/admin/visits" element={<AdminBusinessVisits />} />
          <Route path="/admin/categories" element={<AdminCreateCategory />} />
          <Route path="/admin/settings" element={<AdminSettings />} />
        </Route>
        

        {/* --- PROTECTED: BUSINESS OWNER --- */}
        <Route element={<ProtectedRoute allowedRoles={["business_owner", "admin"]} />}>
          <Route path="/owner/analytics-dashboard" element={<OwnerAnalyticsDashboard />} />
          <Route path="/owner/employees-schedules" element={<EmployeesSchedule />} />
          <Route path="/owner/my-schedules" element={<MySchedule />} />
          <Route path="/owner/side-bar" element={<OwnerSidebar />} />
          <Route path="/owner/manage-schedule" element={<ManageSchedule />} />
          <Route path="/owner/manage-services" element={<ManageServices />} />
          <Route path="/owner/settings" element={<OwnerSettings />} />
        </Route>

        {/* --- PROTECTED: EMPLOYEE --- */}
        <Route element={<ProtectedRoute allowedRoles={["employee", "admin"]} />}>
          <Route path="/employee/appointments" element={<EmployeeAppointments />} />
          <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
          <Route path="/employee/side-bar" element={<EmployeeSidebar />} />
          <Route path="/employee/stats" element={<EmployeeStats />} />
          <Route path="/employee/settings" element={<EmployeeSettings />} />
        </Route>

        {/* /:shopSlug — must stay last among real routes */}
        <Route path="/:shopSlug" element={<BookingApp />} />

        {/* --- 404 --- */}
        <Route path="/404" element={<NotFound />} />
        <Route path="*" element={<Navigate to="/404" replace />} />

      </Routes>
    </Router>
  );
}

export default Header;