
// @/components/loading-fallback.tsx
import { Loader } from '@/components/loaders/loader';

interface LoadingFallbackProps {
  text?: string;
  logo?: boolean;
}

export const LoadingFallback = ({ text = "Loading",logo=true }: LoadingFallbackProps) => (
    <div className="fixed inset-0 z-[200] flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
            {logo && <img src="/homepage-logo.png" alt="Choco Smiley" width="180" height="70" />}
            <Loader size={64} />
            {text && <p className="text-white">{text}</p>}
        </div>
    </div>
);


export const ProcessingOrderFallback = () => (
    <div className="fixed inset-0 z-[200] flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
            <Loader size={64} />
            <div className="flex flex-col gap-1">
                <h1 className="font-base font-poppins text-lg md:text-xl text-white">Processing your order</h1>
                <p className="text-sm md:text-base text-white/80">Please do not refresh the page</p>
            </div>
        </div>
    </div>
);

export const AuthLoadingFallback = ({ message }: { message: string }) => (
    <div className="fixed inset-0 z-[200] flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center">
            <img src="/homepage-logo.png" alt="Choco Smiley" width="180" height="70" />
            <Loader size={64} />
            <div className="flex flex-col gap-1">
                <h1 className="font-base font-poppins text-lg md:text-xl text-white">{message}</h1>
                <p className="text-sm md:text-base text-white/80">Please do not refresh the page</p>
            </div>
        </div>
    </div>
);
