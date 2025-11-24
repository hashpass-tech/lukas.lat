"use client";

import { motion, useAnimation } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function LightPullThemeSwitcher() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const controls = useAnimation();
    const [lineHeight, setLineHeight] = useState(20); // Initial line height in rem (h-20 = 5rem = 80px)

    useEffect(() => {
        setMounted(true);
    }, []);

    const toggleDarkMode = async () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        // Animate back to starting position
        await controls.start({ y: 0 });
        setLineHeight(20); // Reset line height
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
                    onDrag={(_, info) => {
                        // Update line height based on drag position
                        const newHeight = Math.max(20, Math.min(40, 20 + info.offset.y / 4)); // Scale drag to reasonable height range
                        setLineHeight(newHeight);
                    }}
                    onDragEnd={async (event, info) => {
                        if (Math.abs(info.offset.y) > 30) {
                            await toggleDarkMode();
                        } else {
                            // Pull back if not enough drag
                            await controls.start({ y: 0 });
                            setLineHeight(20); // Reset line height
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
                    {/* String/Rope attached to the circle */}
                    <motion.div 
                        animate={{ height: `${lineHeight * 0.25}rem` }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 w-0.5 bg-gradient-to-b from-neutral-400 to-neutral-300 dark:from-neutral-500 dark:to-neutral-600 z-[-1] pointer-events-none shadow-sm"
                        style={{ transformOrigin: 'bottom center' }}
                    ></motion.div>
                </motion.div>
            </div>
        </div>
    );
}
