// @/app/admin/admin-client-page.tsx
'use client';

import { useState, useMemo, UIEvent, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { SparkleBackground } from '@/components/sparkle-background';
import { useIsMobile } from '@/hooks/use-mobile';
import { StaticSparkleBackground } from '@/components/static-sparkle-background';
import { useAppContext } from '@/context/app-context';
import type { Order } from '@/types';
import { EmptyState } from '@/components/empty-state';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { AdminOrderItemCard } from '@/components/admin-order-item-card';
import { AdminOrderDetails } from '@/components/admin-order-details';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { PopupsManager } from '@/components/popups/popups-manager';
import { Loader } from '@/components/loader';
import { AdminOrderItemCardSkeleton } from '@/components/skeletons/admin-order-item-card-skeleton';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import CustomScreenLoader from '@/components/custom-screen-loader';


type StatusFilter = Order['status'] | 'All';
type SortOption = 'newest' | 'oldest' | 'rating-high' | 'rating-low';


const statusOptions: StatusFilter[] = ['All', 'Order Requested', 'In Progress', 'Order Delivered', 'Order Cancelled'];
const sortOptions: { label: string; value: SortOption; section: 'date' | 'rating' }[] = [
  { label: 'Newest First', value: 'newest', section: 'date' },
  { label: 'Oldest First', value: 'oldest', section: 'date' },
  { label: 'High to Low', value: 'rating-high', section: 'rating' },
  { label: 'Low to High', value: 'rating-low', section: 'rating' },
];

const FilterSection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div>
        <h3 className="text-sm font-semibold text-white/70 mb-3 px-4">{title}</h3>
        <div className="flex flex-col space-y-2">
            {children}
        </div>
    </div>
);


export default function AdminClientPage() {
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();
  const { allOrders, isAllOrdersLoaded, isAdmin, loadMoreOrders, hasMoreOrders, setIsGlobalLoading, adminStatusFilter, handleAdminStatusFilterChange } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEnquireOpen, setIsEnquireOpen] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [isClient, setIsClient] = useState(false);


  // Ref for the loader element to be observed
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    setIsGlobalLoading(false);
  }, []);

  const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
    if (`/${view}` === pathname) return;
    setIsGlobalLoading(true);
    router.push(`/${view}`);
  }

  const filteredOrders = useMemo(() => {
    let filtered = allOrders.filter(order => {
      const searchMatch = !searchTerm || (
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customOrderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const statusMatch = adminStatusFilter === 'All' || order.status === adminStatusFilter;
      return searchMatch && statusMatch;
    });

    return filtered.sort((a, b) => {
        switch (sortOption) {
            case 'oldest': return new Date(a.date).getTime() - new Date(b.date).getTime();
            case 'rating-high': return (b.rating ?? -1) - (a.rating ?? -1);
            case 'rating-low': return (a.rating ?? -1) - (b.rating ?? -1);
            case 'newest': default: return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
    });
  }, [allOrders, searchTerm, sortOption, adminStatusFilter]);

  const handleStatusCheckboxChange = (status: StatusFilter) => {
    handleAdminStatusFilterChange(status);
  };
  
  const handleSortCheckboxChange = (option: SortOption) => {
    setSortOption(option);
  };

    // Infinite scroll logic using IntersectionObserver
  const handleLoadMoreMobile = useCallback(async () => {
    if (isFetchingMore || !hasMoreOrders) return;
    
    setIsFetchingMore(true);
    await loadMoreOrders();
    setIsFetchingMore(false);
  }, [isFetchingMore, hasMoreOrders, loadMoreOrders]);

  useEffect(() => {

    const observer = new IntersectionObserver(
        (entries) => {
            const firstEntry = entries[0];
            if (firstEntry.isIntersecting) {
                handleLoadMoreMobile();
            }
        },
        { threshold: 0.5 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
        observer.observe(currentLoader);
    }

    return () => {
        if (currentLoader) {
            observer.unobserve(currentLoader);
        }
    };
  }, [isMobile, handleLoadMoreMobile]);


  if (!isClient || (!isAllOrdersLoaded && allOrders.length === 0)) {
    return <CustomScreenLoader text="Loading admin dashboard" />;
  }

  if (!isAdmin) {
    return (
       <div className="flex h-screen w-full items-center justify-center bg-background">
         <EmptyState
            imageUrl="/icons/profile_icon.png"
            title="Access Denied"
            description="You do not have permission to view this page."
            buttonText="Go to Homepage"
            onButtonClick={() => {
              setIsGlobalLoading(true);
              router.push('/');
            }}
            imageClassName='w-24 h-24'
          />
      </div>
    )
  }

  return (
    <>
      {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
      <div className={cn("flex flex-col min-h-screen md:h-screen", (!!selectedOrder || isProfileOpen || isEnquireOpen) && 'opacity-50')}>
        <Header
          onProfileOpenChange={setIsProfileOpen}
          isContentScrolled={true}
          onReset={() => {
            if (pathname === '/') return;
            setIsGlobalLoading(true);
            router.push('/');
          }}
          onNavigate={handleHeaderNavigate}
          activeView={'admin'}
          isEnquireOpen={isEnquireOpen}
          onEnquireOpenChange={setIsEnquireOpen}
        />
        <div className="pt-20 md:pt-28 flex flex-col flex-grow min-h-0">
          <div className="relative w-full p-2 z-10 md:px-16 lg:px-32 md:bg-transparent pb-2 px-4 sticky top-20 md:top-auto bg-background">
          <div className="flex items-center w-full h-12 bg-white/10 border border-white/20 rounded-full px-3">
                      {/* Search Icon */}
                      <Search className="h-5 w-5 text-white/80" />

                      {/* Input Field */}
                      <input
                        type="text"
                        placeholder="Search by Product or Customer..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow bg-transparent border-none outline-none text-white placeholder:text-gray-400 px-3"
                      />

                      {/* Filter Button */}
                      <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                        <SheetTrigger asChild>
                          <button
                            className="flex items-center justify-center h-8 w-8 rounded-full text-white/80 hover:bg-white/20 transition"
                          >
                            <Filter className="h-5 w-5" />
                      </button>
                      </SheetTrigger>
                      <SheetContent side="right" className="bg-custom-purple-dark text-white border-l-2 border-custom-gold w-3/4 max-w-sm p-0">
                        <SheetHeader className="p-4 border-b border-white/20">
                          <SheetTitle className="text-white text-center">Filters</SheetTitle>
                          <SheetDescription className="sr-only">A dialog for filtering and sorting admin orders.</SheetDescription>
                        </SheetHeader>
                        <div className="flex flex-col gap-6 py-4 overflow-y-auto custom-scrollbar">
                          <FilterSection title="Filter by Status">
                              {statusOptions.map(option => (
                                  <div key={option} className="flex items-center space-x-2 px-4">
                                    <Checkbox
                                      id={`filter-status-${option}`}
                                      checked={adminStatusFilter === option}
                                      onCheckedChange={() => {
                                        handleStatusCheckboxChange(option);
                                        setIsFilterSheetOpen(false);
                                      }}
                                    />
                                    <Label htmlFor={`filter-status-${option}`} className="text-base w-full">
                                      {option === 'All' ? 'All Statuses' : option}
                                    </Label>
                                  </div>
                              ))}
                          </FilterSection>
                          <Separator className="bg-white/20" />
                          <FilterSection title="Sort by Date">
                              {sortOptions.filter(o => o.section === 'date').map(option => (
                                <div key={option.value} className="flex items-center space-x-2 px-4">
                                  <Checkbox
                                    id={`sort-${option.value}`}
                                    checked={sortOption === option.value}
                                    onCheckedChange={() => {
                                        handleSortCheckboxChange(option.value)
                                        setIsFilterSheetOpen(false);
                                    }}
                                  />
                                  <Label htmlFor={`sort-${option.value}`} className="text-base w-full">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                          </FilterSection>
                          <Separator className="bg-white/20" />
                          <FilterSection title="Sort by Rating">
                              {sortOptions.filter(o => o.section === 'rating').map(option => (
                                <div key={option.value} className="flex items-center space-x-2 px-4">
                                  <Checkbox
                                    id={`sort-${option.value}`}
                                    checked={sortOption === option.value}
                                    onCheckedChange={() => {
                                      handleSortCheckboxChange(option.value)
                                      setIsFilterSheetOpen(false);
                                    }}
                                  />
                                  <Label htmlFor={`sort-${option.value}`} className="text-base w-full">
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                          </FilterSection>
                        </div>
                      </SheetContent>
                    </Sheet>
              </div>
          </div>

          <main className={cn(
            "flex-grow flex flex-col transition-all duration-300 relative min-h-0",
          )}>
            <div className="md:px-16 lg:px-32 flex-grow flex flex-col min-h-0">
              
              {!isAllOrdersLoaded && allOrders.length === 0 ? (
                 <div className="flex-grow flex flex-col items-center justify-center h-full px-4">
                  <Loader/>
                 </div>
              ) : filteredOrders.length > 0 ? (
                <div className="flex-grow overflow-y-auto no-scrollbar pb-4 space-y-4 px-4 md:px-0">
                  {filteredOrders.map(order => (
                    <AdminOrderItemCard key={order.id} order={order} onClick={() => setSelectedOrder(order)} />
                  ))}
                  
                  {hasMoreOrders && (
                    <div ref={loaderRef} className='flex flex-col items-center justify-center gap-3'>
                      <AdminOrderItemCardSkeleton />
                      <p>Loading More...</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-grow flex items-center justify-center px-4 md:px-0">
                  <EmptyState
                    imageUrl="/icons/empty.png"
                    title="No Orders Found"
                    description="There are no orders matching your search and filter criteria."
                    showButton={false}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <AdminOrderDetails 
        order={selectedOrder}
        open={!!selectedOrder}
        onOpenChange={(isOpen) => {
            if (!isOpen) {
                setSelectedOrder(null);
            }
        }}
      />
      <PopupsManager
        isProfileOpen={isProfileOpen}
        setIsProfileOpen={setIsProfileOpen}
        isEnquireOpen={isEnquireOpen}
      />
    </>
  );
}
