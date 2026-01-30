import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "../components/auth/script/Register";
import Wishlist from "../components/wishlist/script/Wishlist";
import BookingApp from "../components/appointments/scripts/BookingApp";
import BarberDiscovery from "../components/appointments/scripts/BarberDiscovery";


function Header() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/bookingApp" element={<BookingApp />} />
        <Route path="/:shopSlug" element={<BookingApp />} />
        <Route path="/barberdiscovery" element={<BarberDiscovery />} />
      </Routes>
    </Router>
  );
}

export default Header;