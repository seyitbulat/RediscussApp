import { Loader2 } from "lucide-react";

export default function DiscuitLoading() {
    return (
        <div className="z-10">
            {/* Header skeleton */}
            <div className="justify-center flex grow h-32 ml-12 mr-12">
                <div className="h-32 grow rounded-t-xl bg-white flex items-center relative shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
                    <div className="p-2">
                        <div className="h-8 bg-white/30 rounded w-32 mb-2"></div>
                        <div className="h-4 bg-white/20 rounded w-48"></div>
                    </div>
                </div>
            </div>

            {/* Post create skeleton */}
            <div className="ml-12 mr-12 mt-4">
                <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>

            {/* Posts skeleton */}
            <div className="m-12 p-2">
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="h-9 w-9 bg-gray-200 rounded-full"></div>
                                <div className="space-y-1">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-3 bg-gray-100 rounded w-16"></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                            </div>
                            <div className="flex items-center gap-2 mt-4">
                                <div className="h-8 bg-gray-200 rounded-full w-16"></div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Loading spinner */}
                <div className="flex justify-center items-center mt-8">
                    <div className="flex flex-col items-center">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <span className="mt-2 text-sm text-gray-600">Discuit yükleniyor...</span>
                    </div>
                </div>
            </div>
        </div>
    );
}