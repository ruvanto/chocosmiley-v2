'use client';

import React, { useState } from 'react';
import { Phone, X, MessageCircle } from 'lucide-react';

export function FloatingEnquireButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // Modern, clean styles for the sub-buttons
  const subButtonClass = `
    flex items-center gap-3 px-5 py-3 
    bg-white text-gray-800 rounded-full shadow-lg 
    transition-all duration-300 ease-out border border-gray-100
    hover:bg-gray-50 active:scale-95
    whitespace-nowrap origin-bottom-right
  `;

  return (
    <div className="fixed bottom-8 right-8 flex flex-col-reverse items-end gap-3 z-[9999]">
      
      {/* Main Toggle Button */}
      <button
        onClick={toggleMenu}
        aria-label="Contact options"
        className={`
          w-16 h-16 rounded-full flex items-center justify-center 
          shadow-2xl transition-all duration-300 transform active:scale-90 z-10
          ${isOpen ? 'bg-slate-800 rotate-90' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {isOpen ? (
          <X className="text-white w-8 h-8 transition-all duration-300" />
        ) : (
          <Phone className="text-white w-8 h-8 transition-all duration-300" />
        )}
      </button>

      {/* Sub Buttons Group */}
      <div className={`flex flex-col items-end gap-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}>
        
        {/* Whatsapp Button */}
        <button
          className={subButtonClass}
          onClick={() => window.open('https://wa.me/917975283091', '_blank')}
        >
          <div className="bg-green-500 p-1.5 rounded-full text-white">
            <MessageCircle size={18} fill="currentColor" />
          </div>
          <span className="font-semibold text-sm">Whatsapp Us</span>
        </button>

        {/* Call Us Button */}
        <button
          className={subButtonClass}
          onClick={() => window.location.href = 'tel:+917975283091'}
        >
          <div className="bg-blue-500 p-1.5 rounded-full text-white">
            <Phone size={18} fill="currentColor" />
          </div>
          <span className="font-semibold text-sm">Call Us</span>
        </button>
      </div>

    </div>
  );
};
