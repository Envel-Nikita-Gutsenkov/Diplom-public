"use client";

import { motion, useMotionValue, useSpring, useMotionTemplate, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

export const InteractiveBackground = () => {
  const [mounted, setMounted] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);


  const springX = useSpring(mouseX, { damping: 50, stiffness: 200 });
  const springY = useSpring(mouseY, { damping: 50, stiffness: 200 });


  const rotateX = useTransform(springY, [0, 1000], [4, -4]);
  const rotateY = useTransform(springX, [0, 2000], [-4, 4]);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);


  const spotlightMask = useMotionTemplate`radial-gradient(400px circle at ${springX}px ${springY}px, black, transparent)`;
  


  const centerClearMask = "radial-gradient(ellipse at center, transparent 20%, black 70%)";

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none bg-background perspective-[1000px]">
      <motion.div 
        className="absolute inset-0 opacity-[0.15] dark:opacity-[0.1]"
        style={{
          rotateX,
          rotateY,
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #3b82f6 1.5px, transparent 0)`,
          backgroundSize: '40px 40px',
          WebkitMaskImage: centerClearMask,
          maskImage: centerClearMask,
        }}
      />

      {}
      <motion.div
        className="absolute inset-0"
        style={{
          rotateX,
          rotateY,
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, #60a5fa 1.5px, transparent 0)`,
          backgroundSize: '40px 40px',
          WebkitMaskImage: spotlightMask,
          maskImage: spotlightMask,
        }}
      />
      
      {}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-blue-500/10 blur-[100px]"
        style={{
          left: springX,
          top: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
    </div>
  );
};
