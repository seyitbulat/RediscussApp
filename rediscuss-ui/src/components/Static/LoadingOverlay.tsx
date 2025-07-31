import { Loader2 } from "lucide-react";


export default function LoadingOverlay() {
    return (
        <div className="absolute inset-0 bg-secondary-500/50 bg-opacity-80 flex justify-center items-center z-50">
            <div className="flex flex-col items-center">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                <span className="mt-4 text-lg font-semibold text-gray-700">Giriş Yapılıyor...</span>
            </div>
        </div>
    );
}