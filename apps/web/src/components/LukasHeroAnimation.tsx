'use client';

import { useState, useEffect, useRef } from 'react';
import { Trans } from '@/components/Trans';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Play } from 'lucide-react';
import { useTranslation } from '@/lib/translator';
import { useSidebar } from '@/contexts/SidebarContext';

// Orb component for the background
const Orb = ({ size, x, y, color, delay }: { size: number; x: number; y: number; color: string; delay: number }) => {
    const orbRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (orbRef.current) {
            orbRef.current.style.setProperty('--orb-size', `${size}px`);
            orbRef.current.style.setProperty('--orb-x', `${x}vw`);
            orbRef.current.style.setProperty('--orb-y', `${y}vh`);
            orbRef.current.style.setProperty('--orb-color', color);
            orbRef.current.style.setProperty('--orb-delay', `${delay}s`);
        }
    }, [size, x, y, color, delay]);

    return (
        <div
            ref={orbRef}
            className="absolute rounded-full filter blur-3xl opacity-50 light:opacity-30 animate-orb-float pointer-events-none"
            style={{
                width: `var(--orb-size)`,
                height: `var(--orb-size)`,
                left: `var(--orb-x)`,
                top: `var(--orb-y)`,
                backgroundColor: `var(--orb-color)`,
                animationDelay: `var(--orb-delay)`
            }}
        ></div>
    );
};

export const LukasHeroAnimation = () => {
    const { locale } = useTranslation();
    const { isMobileSidebarOpen } = useSidebar();
    const [isMobile, setIsMobile] = useState(false);
    const titleWords = (isMobile ? '$LUKAS' : '$(LKS) LUKAS').split('');
    const [visibleWords, setVisibleWords] = useState(0);
    const [subtitleVisible, setSubtitleVisible] = useState(false);
    const [delays, setDelays] = useState<number[]>([]);
    const [subtitleDelay, setSubtitleDelay] = useState(0);
    const [orbs, setOrbs] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [themeKey, setThemeKey] = useState(0);
    const [coinAnchored, setCoinAnchored] = useState(false);
    const [coinVisible, setCoinVisible] = useState(false);
    const [videoModalOpen, setVideoModalOpen] = useState(false);
    const [isAnyOverlayOpen, setIsAnyOverlayOpen] = useState(false);
    const [isHoveringCoin, setIsHoveringCoin] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [isCountingDown, setIsCountingDown] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const computeOverlayState = () => {
            const dialogOpen = !!document.querySelector(
                '[data-dialog-content][data-state="open"], [data-dialog-overlay][data-state="open"], [role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"], [data-state="open"][role="dialog"], [data-state="open"][role="alertdialog"]'
            );

            setIsAnyOverlayOpen(Boolean(isMobileSidebarOpen || videoModalOpen || dialogOpen));
        };

        computeOverlayState();

        const observer = new MutationObserver(() => computeOverlayState());
        observer.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ['data-state', 'role', 'aria-hidden', 'class', 'style']
        });

        window.addEventListener('focus', computeOverlayState);

        return () => {
            observer.disconnect();
            window.removeEventListener('focus', computeOverlayState);
        };
    }, [isMobileSidebarOpen, videoModalOpen]);

    // Ensure component is mounted for proper theme detection
    useEffect(() => {
        setMounted(true);
    }, []);

    // Detect mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768); // md breakpoint
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, []);

    // Listen for theme changes
    useEffect(() => {
        const handleThemeChange = () => {
            // Force re-render by updating theme key
            setThemeKey(prev => prev + 1);
        };

        // Listen for theme changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    handleThemeChange();
                }
            });
        });

        // Also listen for storage changes (for theme persistence)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme') {
                handleThemeChange();
            }
        };

        if (typeof window !== 'undefined') {
            observer.observe(document.documentElement, {
                attributes: true,
                attributeFilter: ['class']
            });
            window.addEventListener('storage', handleStorageChange);
        }

        return () => {
            if (typeof window !== 'undefined') {
                observer.disconnect();
                window.removeEventListener('storage', handleStorageChange);
            }
        };
    }, []);

    // Generate random orbs
    useEffect(() => {
        const newOrbs = Array.from({ length: 5 }).map((_, i) => ({
            id: i,
            size: Math.random() * 100 + 150, // 150-250px
            x: Math.random() * 100,
            y: Math.random() * 100,
            color: `hsl(${Math.random() * 60 + 200}, 70%, 50%)`, // Blue-purple range for both themes
            delay: Math.random() * 5
        }));
        setOrbs(newOrbs);
    }, []);

    useEffect(() => {
        setDelays(titleWords.map(() => Math.random() * 0.07));
        setSubtitleDelay(Math.random() * 0.1);
    }, [titleWords.length]);

    useEffect(() => {
        if (visibleWords < titleWords.length) {
            const timeout = setTimeout(() => setVisibleWords(visibleWords + 1), 600);
            return () => clearTimeout(timeout);
        } else {
            const timeout = setTimeout(() => {
                setSubtitleVisible(true);
                // Show coin anchor after subtitle appears
                setTimeout(() => setCoinVisible(true), 500);
            }, 800);
            return () => clearTimeout(timeout);
        }
    }, [visibleWords, titleWords.length]);

    const handleCoinClick = () => {
        if (coinAnchored) {
            // Pick up the coin and stop countdown
            setCoinAnchored(false);
            setIsCountingDown(false);
            setCountdown(0);
        } else {
            // Put down/anchor the coin and start countdown
            setCoinAnchored(true);
            setIsCountingDown(true);
            setCountdown(3);
        }
    };

    // Countdown effect
    useEffect(() => {
        if (isCountingDown && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (isCountingDown && countdown === 0) {
            // Start video when countdown reaches 0
            setVideoModalOpen(true);
            setIsCountingDown(false);
            setCountdown(0);
        }
    }, [isCountingDown, countdown]);

    const handleCoinMouseEnter = () => {
        console.log('Coin mouse enter detected');
        setIsHoveringCoin(true);
    };

    const handleCoinMouseLeave = () => {
        console.log('Coin mouse leave detected');
        setIsHoveringCoin(false);
    };

    const handlePlayButtonClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent coin anchor toggle
        
        // Center cursor effect on play button
        const cursorCenterEvent = new CustomEvent('centerCursorOnElement', {
            detail: {
                x: e.clientX,
                y: e.clientY
            }
        });
        window.dispatchEvent(cursorCenterEvent);
        
        setVideoModalOpen(true);
    };

    const getVideoUrl = () => {
        // Return language-specific YouTube video URLs
        const spanishLangs = ['es', 'pt', 'cl'];
        console.log('Current language for video:', locale);
        if (spanishLangs.includes(locale)) {
            console.log('Using Spanish video');
            return 'https://www.youtube.com/embed/_endxVObD4U'; // Spanish video
        }
        console.log('Using English video');
        return 'https://www.youtube.com/embed/g9Wi6E5re8g'; // English video (https://youtu.be/g9Wi6E5re8g)
    };

    const getCountdownText = () => {
        // Return language-specific countdown text
        const spanishLangs = ['es', 'pt', 'cl'];
        if (spanishLangs.includes(locale)) {
            return `Iniciando en ${countdown}...`; // Spanish
        }
        return `Starting in ${countdown}...`; // English
    };

    return (
        <div key={`${mounted}-${themeKey}`} className="h-svh relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 light:from-blue-100 light:via-gray-50 light:to-blue-100">
            {/* Background Orbs */}
            {orbs.map(orb => (
                <Orb key={orb.id} {...orb} />
            ))}

            {/* Background Scanning Effect */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-grid-pattern opacity-10 light:opacity-5 animate-grid-scan"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950 light:to-blue-200 opacity-50"></div>
            </div>

            {/* Content */}
            <div className="h-svh uppercase items-center w-full absolute z-10 pointer-events-none px-10 flex justify-center flex-col">
                <div className="text-3xl md:text-5xl xl:text-6xl 2xl:text-7xl font-extrabold">
                    <div className="flex space-x-2 lg:space-x-6 overflow-hidden text-white light:text-foreground drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                        {titleWords.map((word, index) => (
                            <div
                                key={index}
                                className={index < visibleWords ? 'fade-in' : ''}
                                style={{
                                    animationDelay: `${index * 0.13 + (delays[index] || 0)}s`,
                                    opacity: index < visibleWords ? undefined : 0
                                }}
                            >
                                {word}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="text-xs md:text-xl xl:text-2xl 2xl:text-3xl mt-2 overflow-hidden text-white light:text-foreground font-bold">
                    <div
                        className={subtitleVisible ? 'fade-in-subtitle' : ''}
                        style={{
                            animationDelay: `${titleWords.length * 0.13 + 0.2 + subtitleDelay}s`,
                            opacity: subtitleVisible ? undefined : 0
                        }}
                    >
                        <Trans i18nKey="hero.subtitle" fallback="The Center of Gravity for Latin American Weights" />
                    </div>
                </div>

                {/* Interactive LUKAS Coin Anchor Area */}
                {coinVisible && (
                    <div className="flex justify-center mt-8">
                        <div
                            className={`relative cursor-pointer transition-all duration-500 transform group pointer-events-auto ${
                                coinAnchored 
                                    ? 'scale-100 opacity-100' 
                                    : 'scale-90 opacity-60 hover:scale-95 hover:opacity-80'
                            }`}
                            onClick={handleCoinClick}
                            onMouseEnter={handleCoinMouseEnter}
                            onMouseLeave={handleCoinMouseLeave}
                            role="button"
                            tabIndex={0}
                            aria-label={coinAnchored ? "Pick up LUKAS coin" : "Put down LUKAS coin"}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleCoinClick();
                                }
                            }}
                        >
                            {/* Coin Container */}
                            <div className="relative w-24 h-24 md:w-32 md:h-32">
                                {/* Glow Effect */}
                                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                                    isHoveringCoin
                                        ? 'bg-yellow-400/50 blur-xl animate-pulse' 
                                        : coinAnchored 
                                            ? 'bg-slate-500/40 blur-xl animate-pulse' 
                                            : 'bg-slate-500/15 blur-md'
                                }`} />
                                
                                {/* Coin Ring */}
                                <div className={`absolute inset-2 rounded-full border-4 transition-all duration-500 ${
                                    isHoveringCoin
                                        ? 'border-yellow-500 shadow-lg shadow-yellow-500/50' 
                                        : coinAnchored 
                                            ? 'border-slate-600 shadow-lg shadow-slate-600/50' 
                                            : 'border-slate-500/60'
                                }`} />
                                
                                {/* Coin Center */}
                                <div className={`absolute inset-4 rounded-full bg-gradient-to-br flex items-center justify-center transition-all duration-500 ${
                                    isHoveringCoin
                                        ? 'from-yellow-400 to-yellow-600 shadow-inner shadow-yellow-700/50' 
                                        : coinAnchored 
                                            ? 'from-slate-600 to-slate-800 shadow-inner shadow-slate-900/50' 
                                            : 'from-slate-600 to-slate-800 shadow-sm'
                                }`}>
                                    {coinAnchored ? (
                                        <button
                                            onClick={handlePlayButtonClick}
                                            className="relative group flex items-center justify-center w-full h-full"
                                            aria-label="Play video"
                                        >
                                            <div className="absolute inset-0 bg-white/30 rounded-full transition-all duration-300 group-hover:bg-white/40 shadow-lg" />
                                            <Play className="w-8 h-8 md:w-10 md:h-10 text-white relative z-20 transition-transform duration-300 group-hover:scale-110 drop-shadow-lg" />
                                        </button>
                                    ) : (
                                        <span className="text-white font-black text-lg md:text-2xl tracking-tight">
                                            $LKS
                                        </span>
                                    )}
                                </div>

                                {/* Hover Hint */}
                                {!coinAnchored && (
                                    <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all duration-300 pointer-events-none z-50 ${
                                        isHoveringCoin ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                                    }`}>
                                        <div className="relative">
                                            <span className={`text-xs px-3 py-1 rounded-full border font-bold transition-all duration-500 block ${
                                                isHoveringCoin 
                                                    ? 'text-yellow-300 bg-black/95 border-yellow-500/60 shadow-xl' 
                                                    : 'text-slate-300 bg-black/90 border-slate-500/40'
                                            }`}>
                                                ANCHOR LUKAS HERE TO PLAY VIDEO
                                            </span>
                                            {/* Debug indicator */}
                                            {isHoveringCoin && (
                                                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Countdown Popup */}
                {isCountingDown && (
                    <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-all duration-300 pointer-events-none z-50">
                        <div className="relative">
                            <span className="text-xs px-3 py-1 rounded-full border font-bold transition-all duration-500 block bg-black/95 border-red-500/60 shadow-xl animate-pulse">
                                <span className="text-red-300 font-black text-lg mr-2">{countdown}</span>
                                {getCountdownText()}
                            </span>
                        </div>
                    </div>
                )}
            </div>

            {!isAnyOverlayOpen && (
            <button
                className="explore-btn"
                style={{ animationDelay: '2.2s' }}
                onClick={() => {
                    const content = document.getElementById('content');
                    if (content) {
                        content.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    } else {
                        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
                    }
                }}
            >
                <Trans i18nKey="Scroll to explore" fallback="Scroll to explore" />
                <span className="explore-arrow">
                    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg" className="arrow-svg">
                        <path d="M11 5V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M6 12L11 17L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </span>
            </button>
            )}

            {/* Video Modal */}
            <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
                <DialogContent className="!max-w-none !w-[calc(100vw-1rem)] sm:!w-[85vw] md:!w-[75vw] lg:!w-[65vw] !max-h-[calc(100vh-4rem)] sm:!max-h-[80vh] md:!max-h-[85vh] bg-background border-border rounded-lg sm:rounded-2xl !p-0 !overflow-hidden !gap-0">
                    <div className="relative w-full aspect-video bg-black">
                        <iframe
                            src={`${getVideoUrl()}?autoplay=1&rel=0&modestbranding=1`}
                            title="LUKAS Video"
                            className="absolute inset-0 w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    </div>
                </DialogContent>
            </Dialog>

            {/* Global styles for animations (ideally in a global CSS file) */}
            <style jsx global>{`
                /* Video Modal Overflow Prevention */
                [data-dialog-overlay] {
                    overflow: hidden !important;
                    overscroll-behavior: none !important;
                }

                [data-dialog-content] {
                    max-width: calc(100vw - 1rem) !important;
                    max-height: calc(100vh - 4rem) !important;
                    overflow: hidden !important;
                    width: calc(100vw - 1rem) !important;
                    height: auto !important;
                    padding: 0 !important;
                    gap: 0 !important;
                    margin: 0 !important;
                    border-radius: 0.5rem !important;
                }

                @media (min-width: 640px) {
                    [data-dialog-content] {
                        max-width: 85vw !important;
                        max-height: 80vh !important;
                        width: 85vw !important;
                        border-radius: 0.75rem !important;
                    }
                }

                @media (min-width: 768px) {
                    [data-dialog-content] {
                        max-width: 75vw !important;
                        max-height: 85vh !important;
                        width: 75vw !important;
                        border-radius: 1rem !important;
                    }
                }

                @media (min-width: 1024px) {
                    [data-dialog-content] {
                        max-width: 65vw !important;
                        max-height: 85vh !important;
                        width: 65vw !important;
                        border-radius: 1rem !important;
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .fade-in {
                    animation: fade-in 0.6s ease-out forwards;
                }

                @keyframes fade-in-subtitle {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .fade-in-subtitle {
                    animation: fade-in-subtitle 0.8s ease-out forwards;
                }

                @keyframes explore-btn-appear {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .explore-btn {
                    position: absolute;
                    bottom: 50px;
                    left: 50%;
                    transform: translateX(-50%);
                    opacity: 0;
                    animation: explore-btn-appear 0.8s ease-out forwards;
                    padding: 12px 24px;
                    background-color: rgba(255, 255, 255, 0.1);
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    border-radius: 30px;
                    color: white;
                    font-weight: bold;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background-color 0.3s ease, border-color 0.3s ease;
                }
                .explore-btn:hover {
                    background-color: rgba(255, 255, 255, 0.2);
                    border-color: rgba(255, 255, 255, 0.5);
                }
                .explore-arrow {
                    display: inline-block;
                    transition: transform 0.3s ease;
                }
                .explore-btn:hover .explore-arrow {
                    transform: translateY(3px);
                }

                /* Background Scanning */
                .bg-grid-pattern {
                    background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px),
                                      linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px);
                    background-size: 40px 40px;
                }

                @keyframes grid-scan {
                    0% {
                        background-position: 0% 0%;
                    }
                    100% {
                        background-position: 100% 100%;
                    }
                }
                .animate-grid-scan {
                    animation: grid-scan 60s linear infinite;
                }

                /* Orb Animation */
                @keyframes orb-float {
                    0% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.5;
                    }
                    25% {
                        transform: translate(5vw, 5vh) scale(1.05);
                        opacity: 0.6;
                    }
                    50% {
                        transform: translate(0, 10vh) scale(0.95);
                        opacity: 0.4;
                    }
                    75% {
                        transform: translate(-5vw, 5vh) scale(1.02);
                        opacity: 0.55;
                    }
                    100% {
                        transform: translate(0, 0) scale(1);
                        opacity: 0.5;
                    }
                }
                .animate-orb-float {
                    animation: orb-float 20s ease-in-out infinite alternate var(--orb-delay);
                }
            `}</style>
        </div>
    );
};

export default LukasHeroAnimation;
