
// @/components/state-selection-popup.tsx
'use client';

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { X, Check } from "lucide-react";
import { states } from '@/lib/states';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

interface StateSelectionPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelectState: (stateValue: string) => void;
    selectedValue: string;
}

export function StateSelectionPopup({ open, onOpenChange, onSelectState, selectedValue }: StateSelectionPopupProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStates = useMemo(() => 
    states.filter(state => 
      state.label.toLowerCase().includes(searchTerm.toLowerCase())
    ), 
  [searchTerm]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col p-0 w-[90vw] md:w-full max-w-sm bg-custom-purple-dark border-2 border-custom-gold rounded-2xl md:rounded-[30px] h-[70vh]">
        <DialogHeader className="p-4 text-center border-b border-white/20 flex-shrink-0">
          <DialogTitle className="text-white text-lg md:text-xl">Select State</DialogTitle>
          <DialogClose className="absolute right-3 top-2 md:top-3 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white z-10">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="px-4 pt-2 flex-shrink-0">
          <Input 
            placeholder="Search for a state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/10 border-white/20 text-white rounded-lg h-11 text-base"
          />
        </div>
        <div className="min-h-0 flex-grow py-2">
            <ScrollArea className="h-full px-4 custom-scrollbar">
                <div className="space-y-1">
                    {filteredStates.map(state => (
                        <Button
                            key={state.value}
                            variant="ghost"
                            onClick={() => onSelectState(state.value)}
                            className={cn(
                                "w-full justify-between h-auto py-3 text-base font-normal",
                                selectedValue === state.value ? "text-custom-gold font-semibold" : "text-white"
                            )}
                        >
                            {state.label}
                            {selectedValue === state.value && <Check className="h-5 w-5" />}
                        </Button>
                    ))}
                </div>
            </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
