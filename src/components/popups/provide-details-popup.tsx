
// @/components/complete-details-popup.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/context/app-context';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { states } from '@/lib/states';
import { StateSelectionPopup } from './state-selection-popup';
import { ScrollArea } from '../ui/scroll-area';

interface CompleteDetailsPopupProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (name: string, phone: string, address: string) => void;
}

export function CompleteDetailsPopup({ open, onOpenChange, onConfirm }: CompleteDetailsPopupProps) {
  const { profileInfo, setAuthPopup } = useAppContext();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [isStatePopupOpen, setIsStatePopupOpen] = useState(false);


  const { toast } = useToast();
  
  useEffect(() => {
    if (open) {
      setName(profileInfo.name || '');
      setPhone(profileInfo.phone || '');
      // We don't parse here, as new users won't have an address yet.
      setAddress('');
      setPincode('');
      setCity('');
      setState('');
    }
  }, [open, profileInfo]);

  const handleAttemptClose = () => {
    toast({
        title: "Details Required",
        description: "Please enter your name and phone number to proceed.",
        variant: "destructive",
    });
  }
  
  const handleSave = () => {
    if (!name.trim() || !phone.trim() || phone.length !== 10) {
      toast({
        title: "Name and Phone are Required",
        description: "Please provide your full name and a valid 10-digit phone number to continue.",
        variant: "destructive",
      });
      return;
    }
    
    const stateLabel = states.find(s => s.value === state)?.label || state;
    const fullAddress = [address.trim(), city.trim(), stateLabel.trim(), pincode.trim()].filter(Boolean).join(', ');
    onConfirm(name, phone, fullAddress);
    onOpenChange(false);
  };

  const handleLater = () => {
      setAuthPopup(null);
  };
  

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };
  
  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPincode(value);
    }
  };

  const handleStateSelect = (stateValue: string) => {
    setState(stateValue);
    setIsStatePopupOpen(false);
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleAttemptClose(); }}>
        <DialogContent 
          onInteractOutside={(e) => e.preventDefault()}
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
          className={cn("p-0 w-[90vw] max-w-md bg-custom-purple-dark rounded-2xl md:rounded-[30px] border-2 border-custom-gold flex flex-col h-[85vh]")}
        >
          <DialogHeader className="pt-4 pb-2 px-6 flex-shrink-0">
            <DialogTitle className="sr-only">Provide Your Details</DialogTitle>
            <h2 className="text-2xl md:text-3xl font-medium text-center font-plex-sans text-white">Provide Your Details</h2>
          </DialogHeader>

          <ScrollArea className="flex-grow min-h-0 px-6">
            <div className="flex flex-col gap-3 pb-24 text-white">
                <div className="space-y-1 text-left">
                    <label className="pl-2 text-sm font-medium font-plex-sans">Name</label>
                    <Input 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="bg-white rounded-2xl text-black placeholder:text-gray-400 placeholder:font-montserrat font-montserrat h-10 md:h-12"
                    />
                </div>
                
                <div className="space-y-1 text-left">
                    <label className="pl-2 text-sm font-medium font-plex-sans">Phone Number</label>
                     <div className="flex items-center bg-white rounded-2xl h-10 md:h-12 overflow-hidden">
                        <span className="text-black font-montserrat px-3 border-r border-gray-300">+91</span>
                        <Input 
                            type="tel"
                            value={phone}
                            onChange={handlePhoneChange}
                            placeholder="Enter your 10-digit phone number"
                            className="bg-transparent text-black placeholder:text-gray-400 placeholder:font-montserrat font-montserrat h-full border-none focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                    </div>
                </div>

                <Separator className="bg-white/20 my-2" />

                <h3 className="text-lg font-medium text-center font-plex-sans -mb-2">Delivery Address</h3>
                
                <div className='space-y-1 text-left'>
                  <label className="pl-2 text-sm font-medium font-plex-sans">Address</label>
                   <Textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="House No, Building Name, Street, Area"
                      className="bg-white rounded-2xl text-black placeholder:text-gray-400 placeholder:font-montserrat font-montserrat h-24 no-scrollbar"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                        <label className="pl-2 text-sm font-medium font-plex-sans">Pincode</label>
                        <Input 
                            type="tel"
                            value={pincode}
                            onChange={handlePincodeChange}
                            placeholder="6-digit"
                            className="bg-white rounded-2xl text-black placeholder:text-gray-400 font-montserrat h-10 md:h-12"
                        />
                    </div>
                    <div className="space-y-1 text-left">
                        <label className="pl-2 text-sm font-medium font-plex-sans">District/City</label>
                        <Input 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="District/City"
                            className="bg-white rounded-2xl text-black placeholder:text-gray-400 font-montserrat h-10 md:h-12"
                        />
                    </div>
                </div>
                
                <div className="space-y-1 text-left">
                    <label className="pl-2 text-sm font-medium font-plex-sans">State</label>
                     <Button
                        variant="outline"
                        onClick={() => setIsStatePopupOpen(true)}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white rounded-2xl h-10 md:h-12 text-base",
                          !state && "text-gray-400 hover:bg-white hover:text-gray-400",
                          state && "text-black hover:bg-white hover:text-black"
                        )}
                    >
                        {state ? states.find(s => s.value === state)?.label : "Select state..."}
                    </Button>
                </div>

            </div>
          </ScrollArea>
           {open && (
            <div className="absolute bottom-0 left-0 right-0 z-[110] p-4 bg-background/80 backdrop-blur-lg border-t border-white/20">
                <div className="flex items-center justify-center gap-4">
                    <Button onClick={handleLater} variant="outline" className="flex-1 bg-transparent text-base text-white border-white/50 rounded-full px-8 hover:bg-white/10 hover:text-white">
                        Later
                    </Button>
                    <Button onClick={handleSave} className="flex-1 bg-custom-gold text-base text-custom-purple-dark rounded-full px-8 hover:bg-custom-gold/90">
                        Save
                    </Button>
                </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <StateSelectionPopup
          open={isStatePopupOpen}
          onOpenChange={setIsStatePopupOpen}
          onSelectState={handleStateSelect}
          selectedValue={state}
      />
    </>
  )
}
