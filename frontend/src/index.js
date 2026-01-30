import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

// 1. Set global defaults BEFORE creating instances
axios.defaults.withCredentials = true;
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// 2. Create and export instances
export const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // Removed trailing slash for consistency
  withCredentials: true
});

export const backend = axios.create({
  baseURL: "http://127.0.0.1:8000",
  withCredentials: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);