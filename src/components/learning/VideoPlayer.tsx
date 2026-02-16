"use client";

import { useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface VideoPlayerProps {
    videoId: string;
    onProgress?: (progress: number) => void;
    onEnded?: () => void;
}

// Helper to extract video ID from various YouTube URL formats
const extractVideoId = (urlOrId: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOrId;
};

export default function VideoPlayer({ videoId: rawVideoId }: VideoPlayerProps) {
    const videoId = extractVideoId(rawVideoId);
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    const handleError = useCallback(() => {
        setHasError(true);
        setIsLoaded(true);
    }, []);

    if (!videoId) {
        return (
            <div className="relative aspect-video bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-200 flex items-center justify-center text-zinc-400 italic text-sm">
                No video available
            </div>
        );
    }

    return (
        <div className="relative aspect-video bg-zinc-100 rounded-2xl overflow-hidden border border-zinc-200">
            {/* Loading Overlay */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center z-10 bg-zinc-50">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            )}

            {/* Error Overlay */}
            {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-zinc-50 text-center p-4">
                    <p className="text-red-500 font-medium mb-2">Unable to load video</p>
                    <p className="text-zinc-400 text-xs">Target ID: {videoId}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 rounded-lg text-sm text-zinc-900 transition-colors shadow-sm"
                    >
                        Retry
                    </button>
                </div>
            )}

            <iframe
                key={videoId}
                src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0`}
                title="YouTube video player"
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}
