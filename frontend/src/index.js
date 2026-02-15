import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

// Konfigurimet Globale
axios.defaults.withCredentials = true;

// 1. Krijimi i instancës API
export const api = axios.create({
  baseURL: `${BASE_URL}/api/`,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// 2. Instanca për Backend (pa /api)
export const backend = axios.create({
  baseURL: `${BASE_URL}/`,
  withCredentials: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);