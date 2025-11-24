'use client';

import { useState, useEffect } from "react";
import HashPassBranding from "@/components/HashPassBranding";

export default function HashPassBrandingWrapper() {
    const [show, setShow] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            // Show only while scrolling in the second viewport section
            const scrolled =
                window.scrollY > window.innerHeight &&
                window.scrollY < window.innerHeight * 2;
            setShow(scrolled);
        };
        window.addEventListener("scroll", handleScroll);
        // Run once on mount to set initial state
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return show ? <HashPassBranding /> : null;
}
