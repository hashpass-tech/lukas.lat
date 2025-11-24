"use client";

import { useEffect, useRef, useState, RefObject } from "react";

type FalloffType = "linear" | "gaussian" | "exponential";

interface TextCursorProximityProps {
    label: string;
    className?: string;
    styles?: {
        transform?: {
            from: string;
            to: string;
        };
        color?: {
            from: string;
            to: string;
        };
    };
    falloff?: FalloffType;
    radius?: number;
    containerRef?: RefObject<HTMLElement>;
}

export default function TextCursorProximity({
    label,
    className = "",
    styles = {
        transform: { from: "scale(1)", to: "scale(1.4)" },
        color: { from: "#FFFFFF", to: "#FF4444" },
    },
    falloff = "gaussian",
    radius = 100,
    containerRef,
}: TextCursorProximityProps) {
    const textRef = useRef<HTMLDivElement>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        const container = containerRef?.current || document;
        container.addEventListener("mousemove", handleMouseMove as any);

        return () => {
            container.removeEventListener("mousemove", handleMouseMove as any);
        };
    }, [containerRef]);

    const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    };

    const calculateFalloff = (distance: number, radius: number, type: FalloffType) => {
        if (distance > radius) return 0;

        switch (type) {
            case "linear":
                return 1 - distance / radius;
            case "gaussian":
                return Math.exp(-Math.pow(distance / radius, 2));
            case "exponential":
                return Math.pow(1 - distance / radius, 2);
            default:
                return 1 - distance / radius;
        }
    };

    const interpolateColor = (color1: string, color2: string, factor: number) => {
        const hex1 = color1.replace("#", "");
        const hex2 = color2.replace("#", "");

        const r1 = parseInt(hex1.substring(0, 2), 16);
        const g1 = parseInt(hex1.substring(2, 4), 16);
        const b1 = parseInt(hex1.substring(4, 6), 16);

        const r2 = parseInt(hex2.substring(0, 2), 16);
        const g2 = parseInt(hex2.substring(2, 4), 16);
        const b2 = parseInt(hex2.substring(4, 6), 16);

        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);

        return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
    };

    const interpolateTransform = (from: string, to: string, factor: number) => {
        const scaleMatch1 = from.match(/scale\(([\d.]+)\)/);
        const scaleMatch2 = to.match(/scale\(([\d.]+)\)/);

        if (scaleMatch1 && scaleMatch2) {
            const scale1 = parseFloat(scaleMatch1[1]);
            const scale2 = parseFloat(scaleMatch2[1]);
            const scale = scale1 + (scale2 - scale1) * factor;
            return `scale(${scale})`;
        }

        return from;
    };

    const letters = label.split("").map((char, index) => {
        const letterRef = useRef<HTMLSpanElement>(null);

        useEffect(() => {
            if (!letterRef.current) return;

            const rect = letterRef.current.getBoundingClientRect();
            const letterX = rect.left + rect.width / 2;
            const letterY = rect.top + rect.height / 2;

            const distance = calculateDistance(mousePosition.x, mousePosition.y, letterX, letterY);
            const proximity = calculateFalloff(distance, radius, falloff);

            if (styles.color) {
                const color = interpolateColor(styles.color.from, styles.color.to, proximity);
                letterRef.current.style.color = color;
            }

            if (styles.transform) {
                const transform = interpolateTransform(styles.transform.from, styles.transform.to, proximity);
                letterRef.current.style.transform = transform;
            }
        }, [mousePosition, index]);

        return (
            <span
                key={index}
                ref={letterRef}
                className="inline-block transition-all duration-100 ease-out"
                style={{
                    color: styles.color?.from || "#FFFFFF",
                    transform: styles.transform?.from || "scale(1)",
                }}
            >
                {char === " " ? "\u00A0" : char}
            </span>
        );
    });

    return (
        <div ref={textRef} className={className}>
            {letters}
        </div>
    );
}
