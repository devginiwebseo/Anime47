'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface VideoPlayerProps {
    videoUrl: string;
    title?: string;
    animeSlug: string;
    currentEpisode: number;
    totalEpisodes: number;
    storyId?: string;
    poster?: string;
}

export default function VideoPlayer({ videoUrl, title, animeSlug, currentEpisode, totalEpisodes, storyId, poster }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<any>(null);
    const router = useRouter();

    // States
    const [isPlaying, setIsPlaying] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);
    const [contextMenu, setContextMenu] = React.useState<{ x: number, y: number, visible: boolean }>({ x: 0, y: 0, visible: false });
    const [playbackRate, setPlaybackRate] = React.useState(1);
    const [lastSeen, setLastSeen] = React.useState<{ time: number, visible: boolean }>({ time: 0, visible: false });

    // Format time MM:SS
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    // Load video logic
    useEffect(() => {
        const loadVideo = async () => {
            const video = videoRef.current;
            if (!video || !videoUrl) return;

            if (!videoUrl.includes('.m3u8') && !videoUrl.includes('.mp4')) {
                setError('Vui lòng chọn server khác hoặc đợi cập nhật link stream.');
                return;
            }

            setError(null);
            const Hls = (await import('hls.js')).default;

            if (Hls.isSupported()) {
                if (hlsRef.current) hlsRef.current.destroy();
                const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
                hlsRef.current = hls;
                hls.loadSource(videoUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, () => {
                    // Check for last seen time
                    const savedTime = localStorage.getItem(`last_seen_${storyId}_${currentEpisode}`);
                    if (savedTime) {
                        const time = parseFloat(savedTime);
                        if (time > 10) {
                            setLastSeen({ time, visible: true });
                            // Auto hide after 15s if not clicked
                            setTimeout(() => setLastSeen(prev => ({ ...prev, visible: false })), 15000);
                        }
                    }
                });

                hls.on(Hls.Events.ERROR, (event, data) => {
                    if (data.fatal) {
                        switch (data.type) {
                            case Hls.ErrorTypes.NETWORK_ERROR: hls.startLoad(); break;
                            case Hls.ErrorTypes.MEDIA_ERROR: hls.recoverMediaError(); break;
                            default: hls.destroy(); setError('Lỗi khi tải stream video'); break;
                        }
                    }
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = videoUrl;
            }
        };

        loadVideo();
        return () => { if (hlsRef.current) hlsRef.current.destroy(); };
    }, [videoUrl, storyId, currentEpisode]);

    // Save playback position
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (video.currentTime > 5 && !video.ended) {
                localStorage.setItem(`last_seen_${storyId}_${currentEpisode}`, video.currentTime.toString());
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }, [storyId, currentEpisode]);

    useEffect(() => {
        const video = videoRef.current;
        const handlePlay = () => {
            setIsPlaying(true);
            setLastSeen(prev => ({ ...prev, visible: false }));
            if (storyId) {
                fetch('/api/anime/view', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storyId }),
                }).catch(err => console.error('Failed to increment view:', err));
            }
            video?.removeEventListener('play', handlePlay);
        };
        video?.addEventListener('play', handlePlay);
        return () => video?.removeEventListener('play', handlePlay);
    }, [storyId]);

    // Handle auto-next
    useEffect(() => {
        const video = videoRef.current;
        const handleEnded = () => {
            if (currentEpisode < totalEpisodes) {
                router.push(`/anime/${animeSlug}/tap-${currentEpisode + 1}`);
            }
        };
        video?.addEventListener('ended', handleEnded);
        return () => video?.removeEventListener('ended', handleEnded);
    }, [currentEpisode, totalEpisodes, animeSlug, router]);

    // Context Menu Handlers
    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (rect) {
            setContextMenu({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
                visible: true
            });
        }
    };

    const handleJumpPlay = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = lastSeen.time;
            videoRef.current.play();
            setIsPlaying(true);
        }
        setLastSeen(prev => ({ ...prev, visible: false }));
    };

    const changeSpeed = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackRate(speed);
        }
        setContextMenu(prev => ({ ...prev, visible: false }));
    };

    return (
        <div
            ref={containerRef}
            className="relative group bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10"
            onContextMenu={handleContextMenu}
            onClick={() => setContextMenu(prev => ({ ...prev, visible: false }))}
        >
            <video
                ref={videoRef}
                controls={isPlaying}
                poster={poster}
                className="w-full aspect-video cursor-pointer"
                controlsList="nodownload"
                playsInline
                onClick={(e) => {
                    if (!isPlaying) {
                        videoRef.current?.play();
                        setIsPlaying(true);
                    }
                }}
            >
                Trình duyệt của bạn không hỗ trợ phát video.
            </video>

            {/* Last Seen Overlay */}
            {lastSeen.visible && (
                <div className="absolute bottom-20 left-6 z-40 flex items-center gap-3 bg-black/80 backdrop-blur-md border border-white/10 rounded-lg p-3 pr-4 animate-fadeInLeft">
                    <button
                        onClick={() => setLastSeen(prev => ({ ...prev, visible: false }))}
                        className="text-gray-400 hover:text-white"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div className="flex flex-col">
                        <span className="text-white text-sm font-medium">Last Seen <span className="text-primary">{formatTime(lastSeen.time)}</span></span>
                        <button
                            onClick={handleJumpPlay}
                            className="text-primary hover:text-red-400 text-xs font-bold uppercase tracking-wider text-left mt-0.5"
                        >
                            Jump Play
                        </button>
                    </div>
                </div>
            )}

            {/* Custom Context Menu */}
            {contextMenu.visible && (
                <div
                    className="absolute z-50 bg-[#141414] border border-white/10 rounded overflow-hidden shadow-2xl w-64 text-sm animate-fadeIn"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-3 border-b border-white/5 space-y-2">
                        <div className="text-gray-400 text-[10px] uppercase font-bold tracking-widest px-1">Play Speed</div>
                        <div className="flex justify-between px-1">
                            {[0.5, 0.8, 1, 1.3, 1.5, 2.0].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => changeSpeed(speed)}
                                    className={`text-[11px] font-bold ${playbackRate === speed ? 'text-primary' : 'text-gray-400 hover:text-white'}`}
                                >
                                    {speed === 1 ? 'Normal' : speed}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button className="w-full text-left p-3 hover:bg-white/5 text-gray-200 flex justify-between items-center group">
                        <span>Video Info</span>
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-gray-400 group-hover:bg-white/20">HLS.js</span>
                    </button>
                    <div className="p-3 text-[11px] text-gray-500 bg-black/20 flex justify-between items-center">
                        <span>ArtPlayer 5.3.0</span>
                    </div>
                    <button
                        onClick={() => setContextMenu(prev => ({ ...prev, visible: false }))}
                        className="w-full text-left p-3 hover:bg-white/5 text-gray-400"
                    >
                        Close
                    </button>
                </div>
            )}

            {!isPlaying && !error && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group/overlay transition-all duration-300"
                    onClick={() => {
                        videoRef.current?.play();
                        setIsPlaying(true);
                    }}
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover/overlay:bg-primary/40 transition-all duration-500 scale-150"></div>
                        <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(211,47,47,0.5)] transform transition-all duration-300 group-hover/overlay:scale-110 group-hover/overlay:rotate-12">
                            <svg className="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute bottom-8 left-0 right-0 text-center">
                        <p className="text-white font-bold text-lg tracking-wide uppercase">Click để xem tập {currentEpisode}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-center p-6">
                    <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-white font-bold text-lg">{error}</p>
                </div>
            )}

            {title && !isPlaying && !error && (
                <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent">
                    <h2 className="text-white text-xl font-bold drop-shadow-lg truncate">{title}</h2>
                </div>
            )}
        </div>
    );
}
