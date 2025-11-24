"use client";

import { motion, useAnimation } from "motion/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function LightPullThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const controls = useAnimation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleDarkMode = async () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        // Animate back to starting position
        await controls.start({ y: 0 });
    };

    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <div className="relative flex justify-center items-start pt-4 z-50">
            <div className="relative overflow-visible h-20 w-16 flex justify-center">
                <motion.div
                    drag="y"
                    dragDirectionLock
                    animate={controls}
                    onDragEnd={async (event, info) => {
                        if (Math.abs(info.offset.y) > 30) {
                            await toggleDarkMode();
                        } else {
                            // Pull back if not enough drag
                            await controls.start({ y: 0 });
                        }
                    }}
                    dragConstraints={{ top: 0, right: 0, bottom: 80, left: 0 }}
                    dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                    dragElastic={0.15}
                    whileDrag={{ cursor: "grabbing", scale: 1.1 }}
                    whileHover={{ scale: 1.05 }}
                    className={`relative z-20 w-10 h-10 rounded-full cursor-grab active:cursor-grabbing transition-all duration-300
                        ${isDark
                            ? 'bg-[radial-gradient(circle_at_30%_30%,_#6b7280,_#374151,_#1f2937)] shadow-[0_0_25px_10px_rgba(55,65,81,0.6)]'
                            : 'bg-[radial-gradient(circle_at_30%_30%,_#fef08a,_#fde047,_#facc15)] shadow-[0_0_30px_12px_rgba(250,204,21,0.6)]'
                        }`}
                >
                    {/* Moon craters for dark mode */}
                    {isDark && (
                        <>
                            <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-gray-800/40"></div>
                            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-gray-800/30"></div>
                        </>
                    )}
                </motion.div>
                {/* String/Rope */}
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-0.5 h-20 bg-gradient-to-b from-neutral-400 to-neutral-300 dark:from-neutral-500 dark:to-neutral-600 z-10 pointer-events-none shadow-sm"></div>
            </div>
        </div>
    );
}
