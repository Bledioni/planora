import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6">
      <div className="text-center">
        {/* Animacioni i Numrit */}
        <h1 className="text-9xl font-black text-indigo-600 animate-bounce">
          404
        </h1>
        
        <div className="mt-4">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Oops! Faqja nuk u gjet.
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Duket se jeni larguar pak si shumë nga rruga kryesore. 
            Mos u shqetësoni, ndodh edhe me më të mirët!
          </p>
        </div>

        {/* Butonat e Veprimit */}
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Link
            to="/"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-300 transform hover:-translate-y-1"
          >
            Kthehu në Ballinë
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg border border-indigo-200 shadow-sm hover:bg-indigo-50 transition-all duration-300"
          >
            Shko Mbrapa
          </button>
        </div>
      </div>

      {/* Ilustrim minimalist poshtë (Opsionale) */}
      <div className="mt-16 w-full max-w-lg opacity-20">
         <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-indigo-900">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
         </svg>
      </div>
    </div>
  );
};

export default NotFound;