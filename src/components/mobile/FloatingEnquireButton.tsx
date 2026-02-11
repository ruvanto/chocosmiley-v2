
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, X } from 'lucide-react';
import { SiWhatsapp } from 'react-icons/si';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

const wrapperVariants = {
  open: {
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 },
  },
};

const itemVariants = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 },
    },
  },
};

export function FloatingEnquireButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-[60] md:hidden">
      <motion.div
        initial={false}
        animate={isOpen ? 'open' : 'closed'}
        className="flex flex-col items-end gap-3"
      >
        <AnimatePresence>
          {isOpen && (
            <motion.div
              variants={wrapperVariants}
              className="flex flex-col items-end gap-3"
            >
              <motion.div variants={itemVariants}>
                <Button
                  asChild
                  className="rounded-full bg-custom-purple-dark text-white shadow-lg h-12 flex items-center gap-2 pr-4 border border-white/30"
                >
                  <a href="tel:+917975283091">
                    <Phone className="h-5 w-5" />
                    <span className="font-semibold">Call Us</span>
                  </a>
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button
                  asChild
                  className="rounded-full bg-custom-purple-dark text-white shadow-lg h-12 flex items-center gap-2 pr-4 border border-white/30"
                >
                  <a href="https://wa.me/917975283091" target="_blank" rel="noopener noreferrer">
                    <SiWhatsapp className="h-5 w-5" />
                    <span className="font-semibold">Whatsapp Us</span>
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'h-14 w-14 rounded-full flex items-center justify-center text-white shadow-xl transition-colors duration-300',
            isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          )}
          whileTap={{ scale: 0.9 }}
        >
          <AnimatePresence initial={false} mode="wait">
            <motion.div
              key={isOpen ? 'x' : 'whatsapp'}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {isOpen ? <X size={28} /> : <SiWhatsapp size={28} />}
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </motion.div>
    </div>
  );
}
