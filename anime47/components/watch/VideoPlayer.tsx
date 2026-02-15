'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
    videoUrl: string;
    title?: string;
    animeSlug: string;
    currentEpisode: number;
    totalEpisodes: number;
}

export default function VideoPlayer({ videoUrl, title, animeSlug, currentEpisode, totalEpisodes }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<any>(null);
    const router = useRouter();

    useEffect(() => {
        const loadVideo = async () => {
            const video = videoRef.current;
            if (!video || !videoUrl) return;

            // Dynamically import HLS.js
            const Hls = (await import('hls.js')).default;

            if (Hls.isSupported()) {
                // Destroy previous instance if exists
                if (hlsRef.current) {
                    hlsRef.current.destroy();
                }

                const hls = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                });

                hlsRef.current = hls;

                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    // Video is ready to play
                    console.log('Video loaded successfully');
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR:
                                console.error('Network error');
                                hls.startLoad();
                                break;
                            case Hls.ErrorTypes.MEDIA_ERROR:
                                console.error('Media error');
                                hls.recoverMediaError();
                                break;
                            default:
                                console.error('Fatal error');
                                hls.destroy();
                                break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                // Safari native HLS support
                video.src = videoUrl;
            } else {
                console.error('HLS is not supported in this browser');
            }
        };

        loadVideo();

        return () => {
            // Cleanup
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoUrl]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleEnded = () => {
            // Auto-advance to next episode
            if (currentEpisode < totalEpisodes) {
                router.push(`/anime/${animeSlug}/tap-${currentEpisode + 1}`);
            }
        };

        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('ended', handleEnded);
        };
    }, [currentEpisode, totalEpisodes, animeSlug, router]);

    return (
        <div className="relative bg-black rounded-lg overflow-hidden">
            <video
                ref={videoRef}
                controls
                className="w-full aspect-video"
                controlsList="nodownload"
                playsInline
            >
                Trình duyệt của bạn không hỗ trợ phát video.
            </video>
        </div>
    );
}
