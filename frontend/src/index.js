import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://api.planorabook.com';
// const BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000';

axios.defaults.withCredentials = true;

export const api = axios.create({
  baseURL: `${BASE_URL}/api/`,
  withCredentials: true,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

export const backend = axios.create({
  baseURL: `${BASE_URL}/`,
  withCredentials: true
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
    <App />
);