
// @/components/mobile-search-bar.tsx
'use client';

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";

interface MobileSearchBarProps {
  onSearchSubmit: (query: string) => void;
  onCollapse: () => void;
}

export function MobileSearchBar({ onSearchSubmit, onCollapse }: MobileSearchBarProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Automatically focus the input when the component mounts
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) {
        toast({
            title: "Empty Field",
            description: "Search field cannot be empty.",
            variant: "destructive",
        });
        return;
    }
    onSearchSubmit(inputValue);
  };
  
  return (
    <motion.form 
      onSubmit={handleSubmit}
      className="flex items-center w-full h-10"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "100%", opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex items-center w-full h-full rounded-full bg-white text-black shadow-lg overflow-hidden">
          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
              <Image src="/icons/search_icon.png" alt="Search" width={24} height={24} onDragStart={(e) => e.preventDefault()}/>
          </div>

          <div className="flex-1 flex items-center pr-2">
              <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search for gifts..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full bg-transparent outline-none text-black placeholder:text-gray-500 text-lg"
              />
              <button
                  type="button"
                  onClick={onCollapse}
                  className="p-2 hover:bg-gray-200 rounded-full"
                  aria-label="Close search"
              >
                  <X size={18} />
              </button>
          </div>
      </div>
    </motion.form>
  );
}
