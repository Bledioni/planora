import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// Konfigurimet Globale
axios.defaults.withCredentials = true;

// 1. Krijimi i instancës API
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// 2. SHTO KËTË: Interceptori që dërgon Token-in automatikisht
api.interceptors.request.use(config => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, error => {
  return Promise.reject(error);
});

// 3. Instanca për Backend (pa /api)
export const backend = axios.create({
  baseURL: "http://127.0.0.1:8000/",
  withCredentials: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);