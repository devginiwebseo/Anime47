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
    const [volume, setVolume] = React.useState(1);
    const [isMuted, setIsMuted] = React.useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
    const [progress, setProgress] = React.useState(0);
    const [duration, setDuration] = React.useState(0);
    const [showControls, setShowControls] = React.useState(true);
    const [isFullscreen, setIsFullscreen] = React.useState(false);
    const [showSettings, setShowSettings] = React.useState(false);
    const [settingsView, setSettingsView] = React.useState<'main' | 'speed' | 'subtitle' | 'quality'>('main');
    const [subtitle, setSubtitle] = React.useState('Tiếng Việt');
    const [quality, setQuality] = React.useState('Auto');
    const [hlsQualities, setHlsQualities] = React.useState<{ height: number, level: number }[]>([]);
    const [isExpanded, setIsExpanded] = React.useState(false);
    const [isLightsOff, setIsLightsOff] = React.useState(false);
    const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

                hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                    const availableQualities = data.levels
                        .map((l: any, i: number) => ({ height: l.height || 0, level: i }))
                        .filter((q: any) => q.height > 0)
                        .sort((a, b) => b.height - a.height); // Sort descending
                    
                    if (availableQualities.length > 0) {
                        setHlsQualities(availableQualities);
                        setQuality('Auto');
                    }

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
            setProgress(video.currentTime);
        };

        const handleLoadedMetadata = () => {
            setDuration(video.duration);
        };

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadedmetadata', handleLoadedMetadata);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
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
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;
            if (x + 256 > rect.width) x = rect.width - 256;
            if (y + 140 > rect.height) y = rect.height - 140;
            if (x < 0) x = 0; if (y < 0) y = 0;
            
            setContextMenu({ x, y, visible: true });
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
        setSettingsView('main');
        setShowSettings(false);
    };

    const changeQuality = (qName: string, levelIndex?: number) => {
        setQuality(qName);
        if (hlsRef.current && levelIndex !== undefined) {
            hlsRef.current.currentLevel = levelIndex; // -1 is auto
        }
        setSettingsView('main');
        setShowSettings(false);
    };

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
            }
        }
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        setVolume(val);
        if (videoRef.current) {
            videoRef.current.volume = val;
            videoRef.current.muted = val === 0;
        }
        setIsMuted(val === 0);
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            setIsMuted(newMuted);
            videoRef.current.muted = newMuted;
            if (newMuted) {
                // videoRef.current.volume = 0; // Don't change actual volume state, just mute
            }
        }
    };

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseFloat(e.target.value);
        if (videoRef.current) {
            videoRef.current.currentTime = val;
            setProgress(val);
        }
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false);
        }, 3000);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().catch(err => console.error(err));
        } else {
            document.exitFullscreen().catch(err => console.error(err));
        }
    };

    const togglePiP = async () => {
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (videoRef.current) {
                await videoRef.current.requestPictureInPicture();
            }
        } catch (err) {
            console.error('Failed to toggle PiP:', err);
        }
    };

    const takeScreenshot = () => {
        const video = videoRef.current;
        if (!video) return;
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = dataUrl;
            a.download = `screenshot_${animeSlug}_ep${currentEpisode}_${formatTime(progress).replace(':', '')}.png`;
            a.click();
        }
    };

    const skipTime = (amount: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime += amount;
            setProgress(videoRef.current.currentTime);
        }
    };

    const toggleSettings = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (showSettings) {
            setShowSettings(false);
        } else {
            setSettingsView('main');
            setShowSettings(true);
        }
    };

    const handleToggleExpand = () => {
        setIsExpanded(prev => !prev);
        // Try to find columns by ID first, then fallback to classes used in Anime47 template
        let mainCol = document.getElementById('watch-main-col') || document.querySelector('.lg\\:col-span-8');
        let sideCol = document.getElementById('watch-sidebar') || document.querySelector('.lg\\:col-span-4');
        
        if (mainCol) mainCol.classList.toggle('lg:col-span-12');
        if (sideCol) {
            // Drop it to the next row as full width
            sideCol.classList.toggle('lg:col-span-12');
            sideCol.classList.toggle('lg:col-span-4');
        }
    };

    return (
        <div className="w-full flex flex-col gap-4">
            {/* Lights Off Overlay */}
            {isLightsOff && (
                <div 
                    className="fixed inset-0 bg-black/95 z-[50]" 
                    onClick={() => setIsLightsOff(false)}
                />
            )}
            
            {/* Video Wrapper */}
            <div
                ref={containerRef}
                className={`relative group bg-black w-full rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 ${isLightsOff ? 'z-[60] relative' : ''}`}
            onContextMenu={handleContextMenu}
            onMouseMove={handleMouseMove}
            onClick={() => {
                setContextMenu(prev => ({ ...prev, visible: false }));
                setShowSettings(false);
            }}
        >
            <video
                ref={videoRef}
                controls={false}
                poster={poster}
                className="w-full aspect-video cursor-pointer"
                controlsList="nodownload"
                playsInline
                onClick={togglePlay}
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
                </div>
            )}


            {/* Custom Settings Menu */}
            {showSettings && (
                <div 
                    className="absolute z-50 bottom-24 right-6 bg-[#161616] border border-white/5 rounded-xl shadow-2xl w-60 text-[14px] animate-fadeIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    {settingsView === 'main' && (
                        <div className="py-2 flex flex-col gap-1">
                            {/* Play Speed item */}
                            <button onClick={() => setSettingsView('speed')} className="w-full px-4 py-2.5 hover:bg-white/5 flex items-center justify-between text-white transition-colors group">
                                <div className="flex items-center gap-4">
                                    <svg className="w-[22px] h-[22px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-semibold tracking-wide">Play Speed</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span className="text-[13px] font-bold">{playbackRate === 1 ? 'Normal' : `${playbackRate}x`}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </button>
                            
                            {/* Subtitles item */}
                            <button onClick={() => setSettingsView('subtitle')} className="w-full px-4 py-2.5 hover:bg-white/5 flex items-center justify-between text-white transition-colors group">
                                <div className="flex items-center gap-4">
                                    <svg className="w-[22px] h-[22px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h10M4 18h4m4-2l2 2 4-4" />
                                    </svg>
                                    <span className="font-semibold tracking-wide">Subtitles</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span className="text-[13px] font-bold">Tiếng Việt</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </button>
                            
                            {/* Quality item */}
                            <button onClick={() => setSettingsView('quality')} className="w-full px-4 py-2.5 hover:bg-white/5 flex items-center justify-between text-white transition-colors group">
                                <div className="flex items-center gap-4">
                                    <svg className="w-[22px] h-[22px] text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="font-semibold tracking-wide">Chất Lượng</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-400">
                                    <span className="text-[13px] font-bold">{quality}</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </button>
                        </div>
                    )}
                    
                    {settingsView === 'speed' && (
                        <div className="py-2">
                            <button onClick={() => setSettingsView('main')} className="w-full px-4 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors border-b border-white/5 mb-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                <span className="font-bold text-[15px]">Play Speed</span>
                            </button>
                            {[0.5, 0.75, 1, 1.25, 1.5, 2.0].map(speed => (
                                <button
                                    key={speed}
                                    onClick={() => changeSpeed(speed)}
                                    className="w-full px-6 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors group"
                                >
                                    <div className="w-5 flex justify-center">
                                        {playbackRate === speed && <svg className="w-[18px] h-[18px] text-[#db4a39]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                    </div>
                                    <span className={`font-semibold ${playbackRate === speed ? 'text-[#db4a39]' : 'text-gray-300'}`}>
                                        {speed === 1 ? 'Normal' : speed}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {settingsView === 'subtitle' && (
                        <div className="py-2">
                            <button onClick={() => setSettingsView('main')} className="w-full px-4 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors border-b border-white/5 mb-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                <span className="font-bold text-[15px]">Subtitles</span>
                            </button>
                            <button onClick={() => { setSubtitle('Subtitle 1'); setSettingsView('main'); setShowSettings(false); }} className="w-full px-6 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors">
                                <div className="w-5 flex justify-center">
                                    {subtitle === 'Subtitle 1' && <svg className="w-[18px] h-[18px] text-[#db4a39]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <span className={`font-semibold ${subtitle === 'Subtitle 1' ? 'text-[#db4a39]' : 'text-gray-300'}`}>Subtitle 1</span>
                            </button>
                        </div>
                    )}

                    {settingsView === 'quality' && (
                        <div className="py-2">
                            <button onClick={() => setSettingsView('main')} className="w-full px-4 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors border-b border-white/5 mb-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                                <span className="font-bold text-[15px]">Chất Lượng</span>
                            </button>
                            
                            {hlsQualities.length > 0 ? (
                                <>
                                    <button onClick={() => changeQuality('Auto', -1)} className="w-full px-6 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors">
                                        <div className="w-5 flex justify-center">
                                            {quality === 'Auto' && <svg className="w-[18px] h-[18px] text-[#db4a39]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className={`font-semibold ${quality === 'Auto' ? 'text-[#db4a39]' : 'text-gray-300'}`}>Auto</span>
                                    </button>
                                    {hlsQualities.map(q => (
                                        <button key={q.level} onClick={() => changeQuality(`${q.height}P`, q.level)} className="w-full px-6 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors">
                                            <div className="w-5 flex justify-center">
                                                {quality === `${q.height}P` && <svg className="w-[18px] h-[18px] text-[#db4a39]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                            </div>
                                            <span className={`font-semibold ${quality === `${q.height}P` ? 'text-[#db4a39]' : 'text-gray-300'}`}>{q.height}P</span>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                ['1080P', '720P', '480P'].map(q => (
                                    <button key={q} onClick={() => changeQuality(q)} className="w-full px-6 py-3 hover:bg-white/5 flex items-center gap-4 text-white transition-colors">
                                        <div className="w-5 flex justify-center">
                                            {quality === q && <svg className="w-[18px] h-[18px] text-[#db4a39]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                        </div>
                                        <span className={`font-semibold ${quality === q ? 'text-[#db4a39]' : 'text-gray-300'}`}>{q}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}

                </div>
            )}

            {!isPlaying && !error && (
                <div
                    className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] cursor-pointer group/overlay transition-all duration-300 z-20"
                    onClick={() => {
                        videoRef.current?.play();
                        setIsPlaying(true);
                    }}
                >
                    <div className="relative pointer-events-auto">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl group-hover/overlay:bg-primary/40 transition-all duration-500 scale-150"></div>
                        <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(211,47,47,0.5)] transform transition-all duration-300 group-hover/overlay:scale-110 group-hover/overlay:rotate-12">
                            <svg className="w-10 h-10 text-white ml-2" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute bottom-24 left-0 right-0 text-center">
                        <p className="text-white font-bold text-lg tracking-wide uppercase">Click để xem tập {currentEpisode}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 text-center p-6 z-20">
                    <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <p className="text-white font-bold text-lg">{error}</p>
                </div>
            )}

            {title && !isPlaying && !error && (
                <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/80 to-transparent z-20 pointer-events-none">
                    <h2 className="text-white text-xl font-bold drop-shadow-lg truncate">{title}</h2>
                </div>
            )}

            {/* Custom Control Bar */}
            {!error && (
                <div 
                    className={`absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 z-30 ${showControls || !isPlaying ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Progress Slider */}
                    <div className="mb-4 relative group/progress flex items-center h-4">
                        <input
                            type="range"
                            min="0"
                            max={duration}
                            step="0.1"
                            value={progress}
                            onChange={handleProgressChange}
                            className="absolute inset-x-0 top-1/2 -translate-y-1/2 w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary group-hover/progress:h-2 transition-all z-10"
                        />
                        <div 
                            className="absolute top-1/2 -translate-y-1/2 left-0 h-1.5 bg-primary rounded-lg pointer-events-none transition-all group-hover/progress:h-2 z-0"
                            style={{ width: `${(progress / duration) * 100}%` }}
                        ></div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-5">
                            {/* Play/Pause Button */}
                            <button onClick={togglePlay} className="text-white hover:text-primary transition-colors">
                                {isPlaying ? (
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                    </svg>
                                ) : (
                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                )}
                            </button>

                            {/* Volume Control */}
                            <div className="flex items-center relative group/volume" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
                                <button onClick={toggleMute} className="text-white hover:text-primary transition-colors p-1.5 ml-2">
                                    {isMuted || volume === 0 ? (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 12l2 2m0-4l-2 2m2-2l2 2m0-4l-2 2" />
                                        </svg>
                                    ) : (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                        </svg>
                                    )}
                                </button>
                                
                                {/* Refined Vertical Volume Slider */}
                                <div className={`absolute bottom-[100%] left-1/2 -translate-x-1/2 pb-4 transition-all duration-200 z-50 ${showVolumeSlider ? 'flex opacity-100' : 'hidden opacity-0 pointer-events-none'}`}>
                                    <div className="w-10 h-32 bg-[#121212] rounded-full flex flex-col items-center py-3 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                                        <span className="text-[11px] font-bold text-white mb-2">{Math.round(volume * 100)}</span>
                                        <div className="relative flex-1 w-1.5 flex justify-center items-end bg-white/20 rounded-full mx-auto">
                                            {/* Filled Volume Track */}
                                            <div 
                                                className="absolute bottom-0 w-full bg-primary rounded-full pointer-events-none"
                                                style={{ height: `${volume * 100}%` }}
                                            />
                                            {/* Volume Thumb */}
                                            <div 
                                                className="absolute w-3.5 h-3.5 bg-[#cd4c4b] rounded-full shadow-md pointer-events-none"
                                                style={{ bottom: `calc(${volume * 100}% - 7px)` }}
                                            />
                                            {/* Interactive Range Input rotated */}
                                            <input
                                                type="range"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={isMuted ? 0 : volume}
                                                onChange={handleVolumeChange}
                                                className="absolute w-[80px] h-6 -translate-x-1/2 left-1/2 bottom-[30px] -rotate-90 appearance-none bg-transparent cursor-pointer opacity-0"
                                                style={{ margin: 0, padding: 0 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Time Display */}
                            <div className="text-white text-[13px] font-medium tabular-nums ml-1">
                                <span>{formatTime(progress)}</span>
                                <span className="mx-1 text-white/40">/</span>
                                <span className="text-white/60">{formatTime(duration)}</span>
                            </div>

                            {/* Seek Buttons */}
                            <div className="flex items-center gap-1.5 ml-3">
                                <button onClick={() => skipTime(-10)} className="text-white hover:text-primary transition-colors p-1" title="Tua lại 10s">
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 8V5L8.5 8.5L12 12V9A5 5 0 1 1 7.5 11.5H5.5A7 7 0 1 0 12 7V8Z" fill="currentColor"/>
                                        <text x="12" y="15" fontSize="5.5" fontWeight="900" textAnchor="middle" fill="currentColor">10</text>
                                    </svg>
                                </button>
                                <button onClick={() => skipTime(10)} className="text-white hover:text-primary transition-colors p-1" title="Tua tới 10s">
                                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 8V5L15.5 8.5L12 12V9A5 5 0 1 0 16.5 11.5H18.5A7 7 0 1 1 12 7V8Z" fill="currentColor"/>
                                        <text x="12" y="15" fontSize="5.5" fontWeight="900" textAnchor="middle" fill="currentColor">10</text>
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-5 mr-3">
                            {/* Screenshot Button */}
                            <button onClick={takeScreenshot} className="text-white hover:text-primary transition-colors" title="Chụp ảnh màn hình">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>

                            {/* Settings Overlay Toggle */}
                            <button onClick={toggleSettings} className="text-white hover:text-primary transition-colors" title="Cài đặt">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>

                            {/* PiP Mode */}
                            <button 
                                onClick={togglePiP}
                                className="text-white hover:text-primary transition-colors"
                                title="Picture-in-picture"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={1.8} />
                                    <rect x="12" y="11" width="7" height="6" rx="1" strokeWidth={1.8} />
                                </svg>
                            </button>

                            {/* Fullscreen Button */}
                            <button 
                                onClick={toggleFullscreen}
                                className="text-white hover:text-primary transition-colors"
                                title={isFullscreen ? "Thu nhỏ" : "Toàn màn hình"}
                            >
                                {isFullscreen ? (
                                    <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 14h6m0 0v6m0-6l-7 7m17-11h-6m0 0V4m0 6l7-7m-7 17v-6m0 0h6m-6 0l7 7M7 10V4m0 6H1m6 0l-7-7" />
                                    </svg>
                                ) : (
                                    <svg className="w-6 h-6 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>

            {/* Controls Below Video */}
            <div className={`flex flex-wrap items-center justify-end gap-3 ${isLightsOff ? 'z-[60] relative' : ''}`}>
                <div className="flex flex-wrap items-center gap-2">
                    {currentEpisode > 1 ? (
                        <button
                            onClick={() => router.push(`/anime/${animeSlug}/tap-${currentEpisode - 1}`)}
                            className="bg-[#24252f] hover:bg-gray-700 text-gray-300 px-4 py-2.5 rounded shadow-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-white/5"
                        >
                            « Tập trước
                        </button>
                    ) : (
                        <button disabled className="bg-[#1a1c23] text-gray-600 px-4 py-2.5 rounded shadow-lg text-sm font-semibold cursor-not-allowed border border-white/5">
                            « Tập trước
                        </button>
                    )}

                    {currentEpisode < totalEpisodes ? (
                        <button
                            onClick={() => router.push(`/anime/${animeSlug}/tap-${currentEpisode + 1}`)}
                            className="bg-[#2a2c38] hover:bg-gray-700 text-white px-4 py-2.5 rounded shadow-lg text-sm font-semibold transition-colors flex items-center gap-2 border border-white/5"
                        >
                            Tập tiếp »
                        </button>
                    ) : (
                        <button disabled className="bg-[#1a1c23] text-gray-600 px-4 py-2.5 rounded shadow-lg text-sm font-semibold cursor-not-allowed border border-white/5">
                            Tập tiếp »
                        </button>
                    )}

                    <button
                        onClick={handleToggleExpand}
                        className="bg-[#1a1c23] hover:bg-gray-800 text-gray-300 px-4 py-2.5 rounded shadow-lg text-[13px] font-semibold transition-colors flex items-center gap-2 border border-white/5"
                    >
                        {isExpanded ? '⤢ Thu nhỏ' : '⤢ Mở rộng'}
                    </button>

                    <button
                        onClick={() => setIsLightsOff(!isLightsOff)}
                        className="bg-[#1a1c23] hover:bg-gray-800 text-gray-300 px-4 py-2.5 rounded shadow-lg text-[13px] font-semibold transition-colors flex items-center gap-2 border border-white/5"
                    >
                        🔆 Tắt đèn
                    </button>

                    <button className="bg-[#1a1c23] cursor-default text-gray-400 px-4 py-2.5 rounded shadow-lg text-[13px] font-semibold flex items-center gap-2 border border-transparent">
                        👁 {Math.floor(Math.random() * 500) + 200} lượt xem
                    </button>
                </div>
            </div>

            {/* Server Selector Area */}
            <div className={`mt-2 mx-auto ${isLightsOff ? 'z-[60] relative' : ''}`}>
                <button className="text-white px-5 py-2.5 rounded shadow-[0_4px_14px_0_rgba(211,47,47,0.39)] text-sm font-bold tracking-wide uppercase transition-all hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(211,47,47,0.23)]" style={{ backgroundColor: 'var(--theme-primary, #d32f2f)' }}>
                    SERVER 1
                </button>
            </div>
        </div>
    );
}
