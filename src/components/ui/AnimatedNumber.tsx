"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function AnimatedNumber({ target, duration = 2 }: { target: number, duration?: number }) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numberRef.current) return;
    
    const currentVal = parseInt(numberRef.current.innerText) || 0;
    const obj = { val: currentVal };
    
    const tween = gsap.to(obj, {
      val: target,
      duration: duration,
      ease: "power2.out",
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.innerText = Math.floor(obj.val).toString();
        }
      }
    });
    
    return () => {
      tween.kill();
    };
  }, [target, duration]);

  return <span ref={numberRef}>0</span>;
}
