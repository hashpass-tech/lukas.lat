'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';


type ColorKey =
    | 'color1'
    | 'color2'
    | 'color3'
    | 'color4'
    | 'color5'
    | 'color6'
    | 'color7'
    | 'color8'
    | 'color9'
    | 'color10'
    | 'color11'
    | 'color12'
    | 'color13'
    | 'color14'
    | 'color15'
    | 'color16'
    | 'color17';

export type Colors = Record<ColorKey, string>;

const svgOrder = [
    'svg1',
    'svg2',
    'svg3',
    'svg4',
    'svg3',
    'svg2',
    'svg1',
] as const;

type SvgKey = (typeof svgOrder)[number];

type Stop = {
    offset: number;
    stopColor: string;
};

type SvgState = {
    gradientTransform: string;
    stops: Stop[];
};

type SvgStates = Record<SvgKey, SvgState>;

const createStopsArray = (
    svgStates: SvgStates,
    svgOrder: readonly SvgKey[],
    maxStops: number
): Stop[][] => {
    let stopsArray: Stop[][] = [];
    for (let i = 0; i < maxStops; i++) {
        let stopConfigurations = svgOrder.map((svgKey) => {
            let svg = svgStates[svgKey];
            return svg.stops[i] || svg.stops[svg.stops.length - 1];
        });
        stopsArray.push(stopConfigurations);
    }
    return stopsArray;
};

type GradientSvgProps = {
    className: string;
    isHovered: boolean;
    colors: Colors;
};

const GradientSvg: React.FC<GradientSvgProps> = ({
    className,
    isHovered,
    colors,
}) => {
    const svgStates: SvgStates = {
        svg1: {
            gradientTransform:
                'translate(287.5 280) rotate(-29.0546) scale(689.807 1000)',
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.188423, stopColor: colors.color2 },
                { offset: 0.260417, stopColor: colors.color3 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.328992, stopColor: colors.color1 },
                { offset: 0.442708, stopColor: colors.color6 },
                { offset: 0.537556, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.725645, stopColor: colors.color8 },
                { offset: 0.817779, stopColor: colors.color9 },
                { offset: 0.84375, stopColor: colors.color10 },
                { offset: 0.90569, stopColor: colors.color1 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
        svg2: {
            gradientTransform:
                'translate(126.5 418.5) rotate(-64.756) scale(533.444 773.324)',
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.104167, stopColor: colors.color12 },
                { offset: 0.182292, stopColor: colors.color13 },
                { offset: 0.28125, stopColor: colors.color1 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.453125, stopColor: colors.color6 },
                { offset: 0.515625, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.692708, stopColor: colors.color8 },
                { offset: 0.75, stopColor: colors.color14 },
                { offset: 0.817708, stopColor: colors.color9 },
                { offset: 0.869792, stopColor: colors.color10 },
                { offset: 1, stopColor: colors.color1 },
            ],
        },
        svg3: {
            gradientTransform:
                'translate(264.5 339.5) rotate(-42.3022) scale(946.451 1372.05)',
            stops: [
                { offset: 0, stopColor: colors.color1 },
                { offset: 0.188423, stopColor: colors.color2 },
                { offset: 0.307292, stopColor: colors.color1 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.442708, stopColor: colors.color15 },
                { offset: 0.537556, stopColor: colors.color16 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.725645, stopColor: colors.color17 },
                { offset: 0.817779, stopColor: colors.color9 },
                { offset: 0.84375, stopColor: colors.color10 },
                { offset: 0.90569, stopColor: colors.color1 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
        svg4: {
            gradientTransform:
                'translate(860.5 420) rotate(-153.984) scale(957.528 1388.11)',
            stops: [
                { offset: 0.109375, stopColor: colors.color11 },
                { offset: 0.171875, stopColor: colors.color2 },
                { offset: 0.260417, stopColor: colors.color13 },
                { offset: 0.328792, stopColor: colors.color4 },
                { offset: 0.328892, stopColor: colors.color5 },
                { offset: 0.328992, stopColor: colors.color1 },
                { offset: 0.442708, stopColor: colors.color6 },
                { offset: 0.515625, stopColor: colors.color7 },
                { offset: 0.631738, stopColor: colors.color1 },
                { offset: 0.692708, stopColor: colors.color8 },
                { offset: 0.817708, stopColor: colors.color9 },
                { offset: 0.869792, stopColor: colors.color10 },
                { offset: 1, stopColor: colors.color11 },
            ],
        },
    };

    const maxStops = Math.max(
        ...Object.values(svgStates).map((svg) => svg.stops.length)
    );
    const stopsAnimationArray = createStopsArray(svgStates, svgOrder, maxStops);
    const gradientTransform = svgOrder.map(
        (svgKey) => svgStates[svgKey].gradientTransform
    );

    const variants = {
        hovered: {
            gradientTransform: gradientTransform,
            transition: { duration: 50, repeat: Infinity, ease: 'linear' },
        } as any,
        notHovered: {
            gradientTransform: gradientTransform,
            transition: { duration: 10, repeat: Infinity, ease: 'linear' },
        } as any,
    };

    return (
        <svg
            className={className}
            width='1030'
            height='280'
            viewBox='0 0 1030 280'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
        >
            <rect
                width='1030'
                height='280'
                rx='140'
                fill='url(#paint0_radial_hashpass)'
            />
            <defs>
                <motion.radialGradient
                    id='paint0_radial_hashpass'
                    cx='0'
                    cy='0'
                    r='1'
                    gradientUnits='userSpaceOnUse'
                    animate={isHovered ? variants.hovered : variants.notHovered}
                >
                    {stopsAnimationArray.map((stopConfigs, index) => (
                        <AnimatePresence key={index}>
                            <motion.stop
                                initial={{
                                    offset: stopConfigs[0].offset,
                                    stopColor: stopConfigs[0].stopColor,
                                }}
                                animate={{
                                    offset: stopConfigs.map((config) => config.offset),
                                    stopColor: stopConfigs.map((config) => config.stopColor),
                                }}
                                transition={{
                                    duration: 0,
                                    ease: 'linear',
                                    repeat: Infinity,
                                }}
                            />
                        </AnimatePresence>
                    ))}
                </motion.radialGradient>
            </defs>
        </svg>
    );
};

type LiquidProps = {
    isHovered: boolean;
    colors: Colors;
};

const Liquid: React.FC<LiquidProps> = ({ isHovered, colors }) => {
    return (
        <>
            {Array.from({ length: 7 }).map((_, index) => (
                <div
                    key={index}
                    className={`absolute ${index < 3 ? 'w-[443px] h-[121px]' : 'w-[756px] h-[207px]'
                        } ${index === 0
                            ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mix-blend-difference'
                            : index === 1
                                ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-[164.971deg] mix-blend-difference'
                                : index === 2
                                    ? 'top-1/2 left-1/2 -translate-x-[53%] -translate-y-[53%] rotate-[-11.61deg] mix-blend-difference'
                                    : index === 3
                                        ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-[57%] rotate-[-179.012deg] mix-blend-difference'
                                        : index === 4
                                            ? 'top-1/2 left-1/2 -translate-x-[57%] -translate-y-1/2 rotate-[-29.722deg] mix-blend-difference'
                                            : index === 5
                                                ? 'top-1/2 left-1/2 -translate-x-[62%] -translate-y-[24%] rotate-[160.227deg] mix-blend-difference'
                                                : 'top-1/2 left-1/2 -translate-x-[67%] -translate-y-[29%] rotate-180 mix-blend-hard-light'
                        }`}
                >
                    <GradientSvg
                        className='w-full h-full'
                        isHovered={isHovered}
                        colors={colors}
                    />
                </div>
            ))}
        </>
    );
};

export default function HashPassBranding() {
    const [isHovered, setIsHovered] = useState(false);
    const { theme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Handle mounting to avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    // Determine if we're in dark mode
    const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark');
    const logoSrc = isDark
        ? '/logos/logo-full-hashpass-white.svg'
        : '/logos/logo-full-hashpass-black.svg';

    const colors: Colors = {
        color1: '#1e3a8a',
        color2: '#3b82f6',
        color3: '#60a5fa',
        color4: '#93c5fd',
        color5: '#dbeafe',
        color6: '#0ea5e9',
        color7: '#06b6d4',
        color8: '#22d3ee',
        color9: '#67e8f9',
        color10: '#a5f3fc',
        color11: '#0284c7',
        color12: '#0369a1',
        color13: '#075985',
        color14: '#0c4a6e',
        color15: '#082f49',
        color16: '#1e40af',
        color17: '#1d4ed8',
    };

    const handleClick = () => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <button
            className="fixed right-3 sm:right-6 bottom-32 sm:bottom-16 z-40 group cursor-pointer"
            aria-label="Back to top"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            <div className="relative w-36 h-10 sm:w-48 sm:h-14 overflow-hidden rounded-full">
                {/* Liquid gradient background */}
                <div className="absolute inset-0">
                    <Liquid isHovered={isHovered} colors={colors} />
                </div>

                {/* Content */}
                <div className="relative z-10 w-full h-full flex items-center justify-between gap-2 px-3 sm:px-4">
                    <div className="flex items-center gap-1 sm:gap-1.5">
                        <span className={`${isDark ? 'text-black' : 'text-white'} font-bold text-[10px] sm:text-xs tracking-wide`}>By</span>
                        <img
                            src={logoSrc}
                            alt="HashPass"
                            className="h-4 sm:h-5 w-auto object-contain"
                        />
                    </div>
                    <div className="flex items-center justify-center rounded-full bg-black/40 dark:bg-white/30 text-white dark:text-black w-5 h-5 sm:w-6 sm:h-6">
                        <svg
                            viewBox="0 0 24 24"
                            className="w-3 h-3 sm:w-4 sm:h-4"
                            aria-hidden="true"
                        >
                            <path
                                d="M7.41 14.59 12 10l4.59 4.59L18 13l-6-6-6 6z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </button>
    );
}
