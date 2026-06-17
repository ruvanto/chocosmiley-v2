
'use client';

import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';

export function FloatingEnquireButton() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const subButtonClass = `pointer-events-auto
    flex items-center gap-2 px-1 py-1
    bg-white text-gray-800 rounded-full shadow-lg
    transition-all duration-300 ease-out border border-gray-100
    hover:bg-gray-50 active:scale-95
    whitespace-nowrap origin-bottom-right
  `;

  return (
    <div className="fixed bottom-20 right-5 flex flex-col-reverse items-end gap-3 z-50 pointer-events-none">
      
      {/* Main Toggle Button */}
      <button
        onClick={toggleMenu}
        aria-label="Contact options"
        className={`pointer-events-auto
          w-12 h-12 rounded-full flex items-center justify-center 
          shadow-2xl transition-all duration-300 transform active:scale-90 z-10
          ${isOpen ? 'bg-black/100 rotate-90' : 'bg-custom-gold'}
        `}
      >
        {isOpen ? (
          <X className="text-white w-6 h-6 transition-all duration-300" />
        ) : (
          <Phone className="text-custom-purple-dark w-6 h-6 transition-all duration-300" />
        )}
      </button>

      {/* Sub Buttons Group */}
      <div className={`pointer-events-auto flex flex-col items-end gap-3 transition-all duration-300 ${
        isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 invisible'
      }`}>
        
        {/* Whatsapp Button */}
        <button
          className={subButtonClass}
          onClick={() => window.open('https://wa.me/917411414007', '_blank')}
        >
          <div className="bg-green-500 p-2 rounded-full text-white">
            <SiWhatsapp className="h-5 w-5" />
          </div>
          <span className="font-normal text-sm pr-2">Whatsapp Us</span>
        </button>

        {/* Call Us Button */}
        <button
          className={subButtonClass}
          onClick={() => window.location.href = 'tel:+917411414007'}
        >
          <div className="bg-custom-purple-dark p-2 rounded-full text-white">
            <Phone size={18} fill="currentColor" />
          </div>
          <span className="font-normal text-sm pr-2">Call Us</span>
        </button>
      </div>

    </div>
  );
};
