
// @/app/admin/analytics/analytics-client-page.tsx
'use client';

import { useMemo, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Header } from '@/components/header';
import { SparkleBackground } from '@/components/sparkle-background';
import { useIsMobile } from '@/hooks/use-mobile';
import { StaticSparkleBackground } from '@/components/static-sparkle-background';
import { useAppContext } from '@/context/app-context';
import type { SanityProduct } from '@/types';
import { EmptyState } from '@/components/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { PopupsManager } from '@/components/popups/popups-manager';
import { ProfileCompletionBanner } from '@/components/profile-completion-banner';
import { client } from '@/lib/sanity';
import { Loader } from '@/components/loader';

const MetricCard = ({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description?: string }) => (
    <Card className="bg-white/10 text-white border-white/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-white/60">{description}</p>}
        </CardContent>
    </Card>
)

export default function AnalyticsClientPage() {
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useIsMobile();
    const { allOrders, isAllOrdersLoaded, isAdmin, setIsGlobalLoading } = useAppContext();
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isEnquireOpen, setIsEnquireOpen] = useState(false);
    
    useEffect(() => {
        setIsGlobalLoading(false);
    }, []);

    const handleHeaderNavigate = (view: 'about' | 'faq' | 'admin' | 'admin-analytics') => {
        const newPath = `/${view}`;
        if (newPath === pathname) return;
        setIsGlobalLoading(true);
        router.push(newPath);
    }

    const analyticsData = useMemo(() => {
        if (!isAllOrdersLoaded || allOrders.length === 0) {
            return { totalRevenue: 0, totalOrders: 0, avgOrderValue: 0, totalProductsSold: 0, topProducts: [] };
        }
        const completedOrders = allOrders.filter(order => order.status === 'Order Delivered');
        const totalRevenue = completedOrders.reduce((acc, order) => acc + order.total, 0);
        const totalOrders = allOrders.length;
        const avgOrderValue = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

        const productCounts = allOrders.reduce((acc, order) => {
            order.items.forEach(item => {
                acc[item.name] = (acc[item.name] || 0) + item.quantity;
            });
            return acc;
        }, {} as Record<string, number>);

        const totalProductsSold = Object.values(productCounts).reduce((acc, q) => acc + q, 0);

        const topProducts = Object.entries(productCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([name, quantity]) => ({
                name,
                quantity,
                image: '/placeholder.png' // Using a placeholder as we are no longer fetching all products
            }));

        return { totalRevenue, totalOrders, avgOrderValue, totalProductsSold, topProducts };
    }, [allOrders, isAllOrdersLoaded]);


    if (!isAllOrdersLoaded) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader />
            </div>
        );
    }

    if (!isAdmin) {
        return ( <div className="flex h-screen w-full items-center justify-center bg-background"><EmptyState imageUrl="/icons/profile_drpdwn_btn.png" title="Access Denied" description="You do not have permission to view this page." buttonText="Go to Homepage" onButtonClick={() => {
            setIsGlobalLoading(true);
            router.push('/');
        }} imageClassName='w-24 h-24' /></div> )
    }

    return (
        <>
            {isMobile ? <StaticSparkleBackground /> : <SparkleBackground />}
            <div className={cn("flex flex-col h-screen", (isProfileOpen || isEnquireOpen) && "opacity-50")}>
                <Header onProfileOpenChange={setIsProfileOpen} isContentScrolled={true} onReset={() => {
                    if (pathname === '/') return;
                    setIsGlobalLoading(true);
                    router.push('/');
                }} onNavigate={handleHeaderNavigate} activeView={'admin-analytics'} isEnquireOpen={isEnquireOpen} onEnquireOpenChange={setIsEnquireOpen} />
                <ProfileCompletionBanner isMobile={isMobile} />
                <main className={cn("flex-grow flex flex-col transition-all duration-300 relative min-h-0", "pt-24 md:pt-32" )}>
                    <div className="px-4 md:px-16 lg:px-32 flex-grow flex flex-col pb-12">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6">Analytics Dashboard</h1>
                        
                        {allOrders.length === 0 ? (
                            <div className="flex-grow flex items-center justify-center">
                                <EmptyState imageUrl="/icons/empty.png" title="No Data Available" description="Analytics will be shown here once you have some orders." showButton={false} />
                            </div>
                        ) : (
                            <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <MetricCard title="Total Revenue" value={`₹${analyticsData.totalRevenue.toFixed(2)}`} icon={<span className="text-white/80">₹</span>} description="From delivered orders" />
                                    <MetricCard title="Total Orders" value={analyticsData.totalOrders} icon={<span className="text-white/80">#</span>} />
                                    <MetricCard title="Avg. Order Value" value={`₹${analyticsData.avgOrderValue.toFixed(2)}`} icon={<span className="text-white/80">AV</span>} description="From delivered orders"/>
                                    <MetricCard title="Products Sold" value={analyticsData.totalProductsSold} icon={<span className="text-white/80">QTY</span>}/>
                                </div>

                                <div className="mt-6 bg-white/10 p-4 rounded-2xl">
                                    <h2 className="text-lg font-semibold text-white mb-4">Top Selling Products</h2>
                                    <div className="space-y-4">
                                        {analyticsData.topProducts.map((product, index) => (
                                            <div key={product.name} className="flex items-center gap-4">
                                                <span className="font-bold text-lg w-6">#{index + 1}</span>
                                                <p className="flex-grow font-medium">{product.name}</p>
                                                <p className="font-semibold">{product.quantity} sold</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
            <PopupsManager
              isProfileOpen={isProfileOpen}
              setIsProfileOpen={setIsProfileOpen}
              isEnquireOpen={isEnquireOpen}
            />
        </>
    );
}
