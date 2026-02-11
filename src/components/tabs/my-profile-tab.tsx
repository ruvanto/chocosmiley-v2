// @/components/my-profile-tab.tsx
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User, Home, Lock } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAppContext, type ProfileInfo } from '@/context/app-context';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Loader } from '../loaders/loader';
import { Textarea } from '../ui/textarea';
import { states } from '@/lib/states';
import { SecurityUpdatePopup } from '../popups/security-update-popup';
import { Separator } from '../ui/separator';
import { StateSelectionPopup } from '../popups/state-selection-popup';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '../ui/scroll-area';

const parseAddress = (fullAddress: string | undefined) => {
    if (!fullAddress) return { address: '', pincode: '', city: '', state: '' };

    const pincodeMatch = fullAddress.match(/\b\d{6}\b/);
    const pincode = pincodeMatch ? pincodeMatch[0] : '';
    
    let address = fullAddress;
    let state = ''; // This will now store the value, e.g., "karnataka"
    let city = '';

    // Extract state
    const stateMatch = states.find(s => address.toLowerCase().includes(s.label.toLowerCase()));
    if (stateMatch) {
        state = stateMatch.value; // <-- FIX: Store the value, not the label
        // Use the label for replacing text in the address string
        address = address.replace(new RegExp(`,?\\s*${stateMatch.label}`, 'i'), '').trim().replace(/,$/, '').trim();
    }

    // Extract pincode
    if (pincode) {
        address = address.replace(pincode, '').trim().replace(/,$/, '').trim();
    }
    
    // What remains could be address and city
    const remainingParts = address.split(',').map(p => p.trim());
    if (remainingParts.length > 1) {
        city = remainingParts.pop() || '';
        address = remainingParts.join(', ');
    } else {
        address = remainingParts[0] || '';
    }

    return { address, pincode, city, state };
};


const ProfileSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <div className="bg-white/10 p-4 rounded-xl relative">
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
                <div className="text-custom-gold">{icon}</div>
                <h3 className="font-semibold text-white">{title}</h3>
            </div>
        </div>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);


const FormField = ({ id, label, children, message, messageType = 'info' }: { id: string, label: string, children: React.ReactNode, message?: string, messageType?: 'info' | 'error' }) => (
    <div className="space-y-1">
        <label htmlFor={id} className="pl-1 text-xs text-white/80">{label}</label>
        {children}
        {message && (
            <p className={cn(
                "text-xs pl-1 pt-0.5",
                messageType === 'error' ? 'text-red-400' : 'text-custom-gold'
            )}>
                {message}
            </p>
        )}
    </div>
);


export function MyProfileTab({ profile, onProfileUpdate }: { profile: ProfileInfo; onProfileUpdate: (updatedProfile: Partial<ProfileInfo>) => void; }) {
  const { user, setAuthPopup } = useAppContext();
  
  const [initialAddressParts, setInitialAddressParts] = useState(parseAddress(profile.address));

  // States for each field
  const [name, setName] = useState(profile.name || '');
  const [phone, setPhone] = useState(profile.phone || '');
  
  const [address, setAddress] = useState(initialAddressParts.address);
  const [pincode, setPincode] = useState(initialAddressParts.pincode);
  const [city, setCity] = useState(initialAddressParts.city);
  const [state, setState] = useState(initialAddressParts.state);
  
  const [isSaving, setIsSaving] = useState(false);
  const [isSecurityPopupOpen, setIsSecurityPopupOpen] = useState(false);
  const [isStatePopupOpen, setIsStatePopupOpen] = useState(false);

  const { toast } = useToast();

  const isGoogleSignIn = user?.providerData.some(
    (provider) => provider.providerId === 'google.com'
  );
  
  useEffect(() => {
    setName(profile.name || '');
    setPhone(profile.phone || '');
    const newAddressParts = parseAddress(profile.address);
    setInitialAddressParts(newAddressParts);
    setAddress(newAddressParts.address);
    setPincode(newAddressParts.pincode);
    setCity(newAddressParts.city);
    setState(newAddressParts.state);
  }, [profile]);


const fullAddressFromState = useMemo(() => {
    const stateLabel = states.find(s => s.value === state)?.label || state;
    return [address.trim(), city.trim(), stateLabel.trim(), pincode.trim()].filter(Boolean).join(', ');
  }, [address, city, state, pincode]);

  // Granular change tracking
  const nameChanged = name !== (profile.name || '');
  const phoneChanged = phone !== (profile.phone || '');
  
  const addressChanged = address !== initialAddressParts.address;
  const pincodeChanged = pincode !== initialAddressParts.pincode;
  const cityChanged = city !== initialAddressParts.city;
  const stateChanged = state !== initialAddressParts.state;
  
  const personalDetailsChanged = nameChanged || phoneChanged;
  const addressDetailsChanged = addressChanged || pincodeChanged || cityChanged || stateChanged;

  const hasAnyChanges = personalDetailsChanged || addressDetailsChanged;

  const phoneIsInvalid = phone.length > 0 && phone.length < 10;
  const pincodeIsInvalid = pincode.length > 0 && pincode.length < 6;


  const handleCancelAll = () => {
    setName(profile.name || '');
    setPhone(profile.phone || '');
    setAddress(initialAddressParts.address);
    setPincode(initialAddressParts.pincode);
    setCity(initialAddressParts.city);
    setState(initialAddressParts.state);
  };
  
  const handleSaveAll = () => {
    const updatedFields: Partial<ProfileInfo> = {};
    let hasErrors = false;

    if (personalDetailsChanged) {
        if (phoneIsInvalid) {
            toast({ title: "Invalid Phone Number", description: "Please enter a valid 10-digit phone number.", variant: "destructive" });
            hasErrors = true;
        } else {
            updatedFields.name = name;
            updatedFields.phone = phone;
        }
    }

    if (addressDetailsChanged && !hasErrors) {
        if (pincodeIsInvalid) {
            toast({ title: "Invalid Pincode", description: "Please enter a valid 6-digit pincode.", variant: "destructive" });
            hasErrors = true;
        } else if (!address.trim()) {
            toast({ title: "Incomplete Address", description: "Please provide your delivery address.", variant: "destructive" });
            hasErrors = true;
        } else if (!city.trim()) {
            toast({ title: "City is required", description: "Please enter your city.", variant: "destructive" });
            hasErrors = true;
        } else if (!state.trim()) {
            toast({ title: "State is required", description: "Please select your state.", variant: "destructive" });
            hasErrors = true;
        } else {
            updatedFields.address = fullAddressFromState;
        }
    }

    if (!hasErrors && Object.keys(updatedFields).length > 0) {
        handleSave(updatedFields);
    } else if (!hasErrors) {
        toast({ title: "No Changes", description: "You haven't made any changes to save.", variant: "default" });
    }
  };

  const handleSave = async (updatedFields: Partial<ProfileInfo>) => {
    setIsSaving(true);
    try {
      onProfileUpdate(updatedFields);
    } catch (error: any) {
       toast({ title: "Update Failed", description: "Could not update your profile. Please try again.", variant: "destructive" });
    } finally {
        setIsSaving(false);
    }
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

  const handleForgotPassword = () => {
    setIsSecurityPopupOpen(false);
    setAuthPopup('forgotPassword');
  };
  
  const handleStateSelect = (stateValue: string) => {
    setState(stateValue);
    setIsStatePopupOpen(false);
  };
  
  const handleDeleteClick = () => {
    toast({
      title: "Feature Under Development",
      description: "This feature will be available soon.",
    });
  };


  if (isSaving) {
    return (
      <div className="flex flex-col items-center justify-center h-full pt-16">
        <Loader />
        <p className="mt-4 text-white">Saving your details...</p>
      </div>
    );
  }

  return (
    <>
        <div className="text-white h-full flex flex-col relative pb-0">
            <div className="hidden md:block p-8 pb-6">
                <h2 className="text-3xl font-normal font-poppins">My Profile</h2>
            </div>
            
            <div className="overflow-y-auto no-scrollbar flex-grow min-h-0 px-4 pt-4 pb-20 md:p-8 md:pt-2">
                  <div className="bg-white/10 rounded-xl p-4 flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                      <AvatarImage src={user?.photoURL ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(name || profile.email)}&background=random`} alt="User avatar" data-ai-hint="person portrait" onDragStart={(e) => e.preventDefault()}/>
                      <AvatarFallback>{profile.name?.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                          <h2 className="text-lg font-bold text-white truncate">{name || "Guest User"}</h2>
                          <p className="text-sm text-white/70 truncate">{profile.email}</p>
                          {isGoogleSignIn && (
                              <div className="flex items-center gap-1.5 bg-black/20 text-white text-xs px-2 py-0.5 rounded-full mt-1 w-fit">
                                  <Image src="/icons/google.png" alt="Google" width={12} height={12} onDragStart={(e) => e.preventDefault()} />
                                  <span>Google Account</span>
                              </div>
                          )}
                      </div>
                  </div>

                  <div className="space-y-4 mt-6">
                      <ProfileSection title="Personal Details" icon={<User size={18} />}>
                          <FormField id="name-mobile" label="Full Name" message={nameChanged ? 'You have unsaved changes' : undefined}>
                              <Input 
                                  id="name-mobile"
                                  type="search"
                                  value={name}
                                  onChange={(e) => setName(e.target.value)}
                                  className="bg-white/5 border-white/20 text-white rounded-lg h-11 text-base" 
                              />
                          </FormField>
                          <FormField id="phone-mobile" label="Phone Number" message={phoneIsInvalid ? "Phone number must be 10 digits" : (phoneChanged ? 'You have unsaved changes' : undefined)} messageType={phoneIsInvalid ? 'error' : 'info'}>
                              <div className="flex items-center bg-white/5 border border-white/20 rounded-lg h-11 overflow-hidden">
                                  <span className="text-white/70 font-montserrat px-3 border-r border-white/20">+91</span>
                                  <Input 
                                      id="phone-mobile" 
                                      type="tel"
                                      autoComplete="off"
                                      value={phone}
                                      onChange={handlePhoneChange}
                                      className="bg-transparent border-none text-white h-full text-base focus-visible:ring-0 focus-visible:ring-offset-0" 
                                  />
                              </div>
                          </FormField>
                      </ProfileSection>

                      <ProfileSection title="Delivery Address" icon={<Home size={18} />}>
                          <FormField id="address-mobile" label="Address" message={addressChanged ? 'You have unsaved changes' : undefined}>
                              <Textarea
                                  id="address-mobile"
                                  value={address}
                                  onChange={(e) => setAddress(e.target.value)}
                                  placeholder="House No, Building, Street..."
                                  className="bg-white/5 border-white/20 text-white rounded-lg h-32 no-scrollbar text-base"
                              />
                          </FormField>
                          <div className="grid grid-cols-2 gap-4">
                              <FormField id="pincode-mobile" label="Pincode" message={pincodeIsInvalid ? "Pincode must be 6 digits" : (pincodeChanged ? 'You have unsaved changes' : undefined)} messageType={pincodeIsInvalid ? 'error' : 'info'}>
                                  <Input
                                      id="pincode-mobile"
                                      type="tel"
                                      value={pincode}
                                      onChange={handlePincodeChange}
                                      className="bg-white/5 border-white/20 text-white rounded-lg h-11 text-base"
                                  />
                              </FormField>
                              <FormField id="city-mobile" label="District / City" message={cityChanged ? 'You have unsaved changes' : undefined}>
                                  <Input
                                      id="city-mobile"
                                      type="search"
                                      value={city}
                                      onChange={(e) => setCity(e.target.value)}
                                      className="bg-white/5 border-white/20 text-white rounded-lg h-11 text-base"
                                  />
                              </FormField>
                          </div>
                          <FormField id="state-mobile" label="State" message={stateChanged ? 'You have unsaved changes' : undefined}>
                              <Button
                                  variant="outline"
                                  onClick={() => setIsStatePopupOpen(true)}
                                  className="w-full justify-start text-left font-normal bg-white/5 border-white/20 text-white rounded-lg h-11 text-base hover:bg-white/10 hover:text-white"
                              >
                                  {state ? states.find(s => s.value === state)?.label : "Select state..."}
                              </Button>
                          </FormField>
                      </ProfileSection>

                      <ProfileSection title="Security" icon={<Lock size={18} />}>
                          <div className="flex flex-col md:flex-row gap-3">
                              {!isGoogleSignIn && (
                                  <Button
                                    onClick={() => setIsSecurityPopupOpen(true)} 
                                    className="w-auto md:w-full bg-custom-gold text-custom-purple-dark hover:bg-custom-gold/90"
                                  >
                                      Change Password
                                  </Button>
                              )}

                              <Button 
                                onClick={handleDeleteClick} 
                                variant="destructive"
                                className="w-auto md:w-full"
                              >
                                  Delete Account
                              </Button>
                          </div>
                      </ProfileSection>
                  </div>
              
            </div>
             <AnimatePresence>
                {hasAnyChanges && (
                    <motion.div
                        initial={{ y: "100%", opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-16 left-0 right-0 z-50 md:absolute md:bottom-0 md:left-0 md:right-0 p-4 bg-background/80 backdrop-blur-lg border-t border-white/20"
                    >
                        <div className="max-w-2xl mx-auto flex items-center justify-center gap-4">
                            <Button onClick={handleCancelAll} variant="outline" className="flex-1 bg-transparent text-base text-white border-white/50 rounded-full px-8 hover:bg-white/10 hover:text-white">
                                Cancel
                            </Button>
                            <Button onClick={handleSaveAll} className="flex-1 bg-custom-gold text-base text-custom-purple-dark rounded-full px-8 hover:bg-custom-gold/90">
                                Save All
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
        <SecurityUpdatePopup 
            open={isSecurityPopupOpen} 
            onOpenChange={setIsSecurityPopupOpen}
            onForgotPasswordClick={handleForgotPassword}
        />
        <StateSelectionPopup
          open={isStatePopupOpen}
          onOpenChange={setIsStatePopupOpen}
          onSelectState={handleStateSelect}
          selectedValue={state}
        />
    </>
  );
}
