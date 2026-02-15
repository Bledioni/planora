import React, { useState } from "react";
import { api } from "../../../index"; 
import "../style/Wishlist.css"; 

function WishlistRegister() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email_address: "",
    password: "",
    phone_number: "",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      await api.post("/public/wishlist/add", formData);
      alert("Welcome to Planora Salon Management!");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        alert("Server error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-card">
        <h1>Planora</h1>
        <p className="subtitle">Barber & Beauty Appointment Management</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input 
              className={errors.name ? "error-input" : ""}
              type="text" name="name" placeholder="First Name" 
              onChange={handleChange} value={formData.name} 
            />
            {errors.name && <div className="error-message">{errors.name[0]}</div>}
          </div>

          <div className="form-group">
            <input 
              className={errors.surname ? "error-input" : ""}
              type="text" name="surname" placeholder="Surname" 
              onChange={handleChange} value={formData.surname} 
            />
            {errors.surname && <div className="error-message">{errors.surname[0]}</div>}
          </div>

          <div className="form-group">
            <input 
              className={errors.email_address ? "error-input" : ""}
              type="email" name="email_address" placeholder="Email Address" 
              onChange={handleChange} value={formData.email_address} 
            />
            {errors.email_address && <div className="error-message">{errors.email_address[0]}</div>}
          </div>

          <div className="form-group">
            <input 
              className={errors.phone_number ? "error-input" : ""}
              type="text" name="phone_number" placeholder="Phone Number" 
              onChange={handleChange} value={formData.phone_number} 
            />
            {errors.phone_number && <div className="error-message">{errors.phone_number[0]}</div>}
          </div>
          
          <div className="form-group">
            <input 
              className={errors.password ? "error-input" : ""}
              type="password" name="password" placeholder="Create Password" 
              onChange={handleChange} value={formData.password}
            />
            {errors.password && <div className="error-message">{errors.password[0]}</div>}
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Processing..." : "Register My Salon"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default WishlistRegister;