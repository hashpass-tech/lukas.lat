"use client"
import React, { useEffect, useState, memo, useRef } from 'react';

// --- Type Definitions ---
type IconType = 'brl' | 'mxn' | 'cop' | 'clp' | 'ars';

type GlowColor = 'cyan' | 'purple';

interface SkillIconProps {
    type: IconType;
}

interface SkillConfig {
    id: string;
    orbitRadius: number;
    size: number;
    speed: number;
    iconType: IconType;
    phaseShift: number;
    glowColor: GlowColor;
    label: string;
}

interface OrbitingSkillProps {
    config: SkillConfig;
    angle: number;
}

interface GlowingOrbitPathProps {
    radius: number;
    glowColor?: GlowColor;
    animationDelay?: number;
}

// --- Memoized Icon Component ---
const SkillIcon = memo(({ type }: SkillIconProps) => {
    const iconMap: Record<IconType, string> = {
        brl: '/coins/brl-coin.svg',
        mxn: '/coins/mxn-coin.svg',
        cop: '/coins/cop-coin.svg',
        clp: '/coins/clp-coin.svg',
        ars: '/coins/ars-coin.svg'
    };

    return (
        <img
            src={iconMap[type]}
            alt={`${type.toUpperCase()} Coin`}
            className="w-full h-full object-contain"
        />
    );
});
SkillIcon.displayName = 'SkillIcon';

// --- Configuration for the Orbiting Skills ---
const skillsConfig: SkillConfig[] = [
    // Inner Orbit
    {
        id: 'brl',
        orbitRadius: 100,
        size: 50,
        speed: 1,
        iconType: 'brl',
        phaseShift: 0,
        glowColor: 'cyan',
        label: 'BRL'
    },
    {
        id: 'mxn',
        orbitRadius: 100,
        size: 50,
        speed: 1,
        iconType: 'mxn',
        phaseShift: (2 * Math.PI) / 3,
        glowColor: 'cyan',
        label: 'MXN'
    },
    {
        id: 'cop',
        orbitRadius: 100,
        size: 50,
        speed: 1,
        iconType: 'cop',
        phaseShift: (4 * Math.PI) / 3,
        glowColor: 'cyan',
        label: 'COP'
    },
    // Outer Orbit
    {
        id: 'clp',
        orbitRadius: 180,
        size: 55,
        speed: -0.6,
        iconType: 'clp',
        phaseShift: 0,
        glowColor: 'purple',
        label: 'CLP'
    },
    {
        id: 'ars',
        orbitRadius: 180,
        size: 55,
        speed: -0.6,
        iconType: 'ars',
        phaseShift: Math.PI, // Opposite side
        glowColor: 'purple',
        label: 'ARS'
    }
];

// --- Memoized Orbiting Skill Component ---
const OrbitingSkill = memo(({ config, angle, onClick }: OrbitingSkillProps & { onClick?: (e: React.MouseEvent) => void }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { orbitRadius, size, iconType, label } = config;

    const x = Math.cos(angle) * orbitRadius;
    const y = Math.sin(angle) * orbitRadius;

    return (
        <div
            className="absolute top-1/2 left-1/2 transition-all duration-300 ease-out pointer-events-none"
            style={{
                width: `${size}px`,
                height: `${size}px`,
                transform: `translate(calc(${x}px - 50%), calc(${y}px - 50%))`,
                zIndex: isHovered ? 20 : 10,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
        >
            <div
                className={`
          relative w-full h-full pointer-events-auto
          rounded-full flex items-center justify-center
          transition-all duration-300 cursor-pointer
          bg-transparent
          ${isHovered ? 'scale-125 shadow-2xl' : 'shadow-lg hover:shadow-xl'}
        `}
            >
                <SkillIcon type={iconType} />
                {isHovered && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900/95 backdrop-blur-sm rounded text-xs text-white whitespace-nowrap pointer-events-none">
                        {label}
                    </div>
                )}
            </div>
        </div>
    );
});
OrbitingSkill.displayName = 'OrbitingSkill';

// --- Optimized Orbit Path Component ---
const GlowingOrbitPath = memo(({ radius, glowColor = 'cyan', animationDelay = 0 }: GlowingOrbitPathProps) => {
    const glowColors = {
        cyan: {
            primary: 'rgba(6, 182, 212, 0.4)',
            secondary: 'rgba(6, 182, 212, 0.2)',
            border: 'rgba(6, 182, 212, 0.3)'
        },
        purple: {
            primary: 'rgba(147, 51, 234, 0.4)',
            secondary: 'rgba(147, 51, 234, 0.2)',
            border: 'rgba(147, 51, 234, 0.3)'
        }
    };

    const colors = glowColors[glowColor] || glowColors.cyan;

    return (
        <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{
                width: `${radius * 2}px`,
                height: `${radius * 2}px`,
                animationDelay: `${animationDelay}s`,
            }}
        >
            {/* Glowing background */}
            <div
                className="absolute inset-0 rounded-full animate-pulse"
                style={{
                    background: `radial-gradient(circle, transparent 30%, ${colors.secondary} 70%, ${colors.primary} 100%)`,
                    boxShadow: `0 0 60px ${colors.primary}, inset 0 0 60px ${colors.secondary}`,
                    animation: 'pulse 4s ease-in-out infinite',
                    animationDelay: `${animationDelay}s`,
                }}
            />

            {/* Static ring for depth */}
            <div
                className="absolute inset-0 rounded-full"
                style={{
                    border: `1px solid ${colors.border}`,
                    boxShadow: `inset 0 0 20px ${colors.secondary}`,
                }}
            />
        </div>
    );
});
GlowingOrbitPath.displayName = 'GlowingOrbitPath';

// --- Main App Component ---
export default function OrbitingSkills() {
    const [time, setTime] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    // Start stationary; only follow the cursor after the user clicks a coin
    const isFollowing = useRef(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current && isFollowing.current) {
                // Check if the mouse is over an element with data-no-orbit attribute
                const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
                const isOverNoOrbitZone = elementUnderCursor?.closest('[data-no-orbit]');
                
                // Check if cursor is within the hero section
                const heroSection = document.getElementById('hero');
                const isInHeroSection = heroSection && (
                    e.clientY >= heroSection.offsetTop && 
                    e.clientY <= heroSection.offsetTop + heroSection.offsetHeight
                );

                if (!isOverNoOrbitZone && isInHeroSection) {
                    containerRef.current.style.left = `${e.clientX}px`;
                    containerRef.current.style.top = `${e.clientY}px`;
                }
            }
        };

        const handleGlobalClick = (e: MouseEvent) => {
            if (isFollowing.current && containerRef.current) {
                // Check if clicking on a no-orbit zone - if so, don't drop
                const elementUnderCursor = document.elementFromPoint(e.clientX, e.clientY);
                const isOverNoOrbitZone = elementUnderCursor?.closest('[data-no-orbit]');
                
                // Check if cursor is within the hero section
                const heroSection = document.getElementById('hero');
                const isInHeroSection = heroSection && (
                    e.clientY >= heroSection.offsetTop && 
                    e.clientY <= heroSection.offsetTop + heroSection.offsetHeight
                );

                if (!isOverNoOrbitZone && isInHeroSection) {
                    isFollowing.current = false;
                    containerRef.current.style.position = 'absolute';
                    containerRef.current.style.left = `${e.pageX}px`;
                    containerRef.current.style.top = `${e.pageY}px`;
                }
            }
        };

        const handleScroll = () => {
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                const scrollY = window.scrollY;
                const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
                
                // Hide animation when scrolled past hero section
                setIsVisible(scrollY < heroBottom);
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        // Use bubble phase (default) so we can stop propagation from the component
        window.addEventListener('click', handleGlobalClick);
        window.addEventListener('scroll', handleScroll, { passive: true });
        // If the user scrolls, begin following the cursor (so scroll CTA works then tracking starts)
        const handleScrollOrWheel = () => {
            isFollowing.current = true;
        };
        window.addEventListener('wheel', handleScrollOrWheel, { passive: true });

        // Initial visibility check
        handleScroll();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('click', handleGlobalClick);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('wheel', handleScrollOrWheel);
        };
    }, []);

    useEffect(() => {
        if (isPaused) return;

        let animationFrameId: number;
        let lastTime = performance.now();

        const animate = (currentTime: number) => {
            const deltaTime = (currentTime - lastTime) / 1000;
            lastTime = currentTime;

            setTime(prevTime => prevTime + deltaTime);
            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused]);

    const handleResumeFollow = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent the global click listener from immediately dropping it again
        isFollowing.current = true;

        if (containerRef.current) {
            containerRef.current.style.position = 'fixed';
            containerRef.current.style.left = `${e.clientX}px`;
            containerRef.current.style.top = `${e.clientY}px`;
        }
    };

    const orbitConfigs: Array<{ radius: number; glowColor: GlowColor; delay: number }> = [
        { radius: 100, glowColor: 'cyan', delay: 0 },
        { radius: 180, glowColor: 'purple', delay: 1.5 }
    ];

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-30 flex items-center justify-center pointer-events-none transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            style={{
                // Start slightly above the page center to sit near the $LUKAS title
                top: '40%',
                width: '450px',
                height: '450px',
                transform: 'translate(-50%, -50%)',
                left: '50%'
            }}
        >

            {/* Central "Code" Icon with enhanced glow */}
            <div
                className="w-20 h-20 rounded-full flex items-center justify-center z-10 relative shadow-2xl pointer-events-none cursor-default overflow-hidden"
            >
                <div className="absolute inset-0 rounded-full bg-cyan-500/30 blur-xl animate-pulse"></div>
                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="relative z-10 w-full h-full">
                    <img
                        src="/coins/lukas-coin.svg"
                        alt="LUKAS Coin"
                        className="w-full h-full object-contain"
                    />
                </div>
            </div>

            {/* Render glowing orbit paths */}
            {orbitConfigs.map((config) => (
                <GlowingOrbitPath
                    key={`path-${config.radius}`}
                    radius={config.radius}
                    glowColor={config.glowColor}
                    animationDelay={config.delay}
                />
            ))}

            {/* Render orbiting skill icons */}
            {skillsConfig.map((config) => {
                const angle = time * config.speed + (config.phaseShift || 0);
                return (
                    <OrbitingSkill
                        key={config.id}
                        config={config}
                        angle={angle}
                        onClick={handleResumeFollow}
                    />
                );
            })}
        </div>
    );
}
