import React, { useState } from "react";
import { api } from "../../../index"; 
import "../style/Register.css"; 

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    phone_number: "",
    password: "",
    password_confirmation: "",
    role: "user",
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const { data } = await api.post("/register", formData);
      alert(data.message || "Welcome to Planora!");
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors(err.response.data.errors);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="brand-header">
          <h1>Planora</h1>
          <p>Welcome to Planora! Create your account below.</p>
        </div>

        <form onSubmit={handleRegister} noValidate>
          <div className="form-group">
            <input 
              className={errors.name ? "error-input" : ""}
              type="text" name="name" placeholder="First Name" 
              onChange={handleChange} value={formData.name} 
            />
            {errors.name && <span className="error-text">{errors.name[0]}</span>}
          </div>

          <div className="form-group">
            <input 
              className={errors.surname ? "error-input" : ""}
              type="text" name="surname" placeholder="Surname" 
              onChange={handleChange} value={formData.surname} 
            />
            {errors.surname && <span className="error-text">{errors.surname[0]}</span>}
          </div>

          <div className="form-group">
            <input 
              className={errors.email ? "error-input" : ""}
              type="email" name="email" placeholder="Email Address" 
              onChange={handleChange} value={formData.email} 
            />
            {errors.email && <span className="error-text">{errors.email[0]}</span>}
          </div>

          <div className="form-group">
            <input 
              className={errors.phone_number ? "error-input" : ""}
              type="text" name="phone_number" placeholder="Phone Number" 
              onChange={handleChange} value={formData.phone_number} 
            />
            {errors.phone_number && <span className="error-text">{errors.phone_number[0]}</span>}
          </div>
          
          <div className="form-group">
            <input 
              className={errors.password ? "error-input" : ""}
              type="password" name="password" placeholder="Password" 
              onChange={handleChange} 
            />
            {errors.password && <span className="error-text">{errors.password[0]}</span>}
          </div>

          <div className="form-group">
            <input 
              type="password" name="password_confirmation" 
              placeholder="Confirm Password" onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <select name="role" onChange={handleChange} value={formData.role}>
              <option value="user">Register as User</option>
              <option value="admin">Register as Admin</option>
            </select>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? "Creating Account..." : "Join Planora"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Register;