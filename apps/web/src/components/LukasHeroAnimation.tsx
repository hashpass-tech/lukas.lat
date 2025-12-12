'use client';

import { useState, useEffect, useRef } from 'react';
import { Trans } from '@/components/Trans';

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
    const [isMobile, setIsMobile] = useState(false);
    const titleWords = (isMobile ? '$LUKAS' : '$(LKS) LUKAS').split('');
    const [visibleWords, setVisibleWords] = useState(0);
    const [subtitleVisible, setSubtitleVisible] = useState(false);
    const [delays, setDelays] = useState<number[]>([]);
    const [subtitleDelay, setSubtitleDelay] = useState(0);
    const [orbs, setOrbs] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);
    const [themeKey, setThemeKey] = useState(0);

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
        
        return () => window.removeEventListener('resize', checkMobile);
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
            const timeout = setTimeout(() => setSubtitleVisible(true), 800);
            return () => clearTimeout(timeout);
        }
    }, [visibleWords, titleWords.length]);

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
            </div>

            <button
                className="explore-btn z-20"
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

            {/* Global styles for animations (ideally in a global CSS file) */}
            <style jsx global>{`
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
