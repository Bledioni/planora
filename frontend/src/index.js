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
  baseURL: "https://planora-production-bd59.up.railway.app/api/", 
  withCredentials: true
});

export const backend = axios.create({
  baseURL: "https://planora-production-bd59.up.railway.app/",
  withCredentials: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);