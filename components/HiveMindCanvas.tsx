'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  energy: number;
}

export const HiveMindCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number | null; y: number | null; radius: number }>({
    x: null,
    y: null,
    radius: 160,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Particle nodes configuration
    const particleCount = 60;
    const colors = [
      { fill: '#f59e0b', glow: 'rgba(245, 158, 11, 0.6)' }, // Amber
      { fill: '#10b981', glow: 'rgba(16, 185, 129, 0.6)' }, // Emerald
      { fill: '#06b6d4', glow: 'rgba(6, 182, 212, 0.6)' },  // Cyan
      { fill: '#f8fafc', glow: 'rgba(248, 250, 252, 0.4)' }, // Soft White
    ];

    const particles: Particle[] = Array.from({ length: particleCount }, () => {
      const c = colors[Math.floor(Math.random() * colors.length)];
      const r = Math.random() * 2 + 1.2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: r,
        baseRadius: r,
        color: c.fill,
        glowColor: c.glow,
        energy: Math.random() * Math.PI * 2,
      };
    });

    let frame = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame += 0.02;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mRadius = mouseRef.current.radius;

      // 1. Draw subtle background hex hive grid
      const hexSize = 65;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width + hexSize; x += hexSize * 1.5) {
        for (let y = 0; y < height + hexSize; y += hexSize * Math.sqrt(3)) {
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i;
            const hx = x + hexSize * 0.5 * Math.cos(angle);
            const hy = y + hexSize * 0.5 * Math.sin(angle);
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
          }
          ctx.closePath();
          ctx.stroke();
        }
      }

      // 2. Inter-particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.22;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Dynamic synaptic color mix
            const grad = ctx.createLinearGradient(
              particles[i].x, particles[i].y,
              particles[j].x, particles[j].y
            );
            grad.addColorStop(0, `rgba(245, 158, 11, ${alpha})`);
            grad.addColorStop(0.5, `rgba(6, 182, 212, ${alpha * 0.8})`);
            grad.addColorStop(1, `rgba(16, 185, 129, ${alpha})`);
            
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // 3. Mouse Synaptic Connections & Gravitational Pull
      if (mx !== null && my !== null) {
        // Draw radiant mouse aura
        const auraGrad = ctx.createRadialGradient(mx, my, 0, mx, my, mRadius);
        auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.12)');
        auraGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
        auraGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(mx, my, mRadius, 0, Math.PI * 2);
        ctx.fill();

        particles.forEach((p) => {
          const dx = mx - p.x;
          const dy = my - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mRadius) {
            // Draw electric connection to cursor
            const force = (1 - dist / mRadius);
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.strokeStyle = `rgba(245, 158, 11, ${force * 0.45})`;
            ctx.lineWidth = 1.2;
            ctx.stroke();

            // Subtle gentle pull towards mouse
            p.x += dx * 0.015;
            p.y += dy * 0.015;
            p.radius = p.baseRadius + force * 2;
          } else {
            p.radius = p.baseRadius;
          }
        });
      }

      // 4. Draw Particles & Oscillations
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce on edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        p.energy += 0.03;
        const pulse = Math.sin(p.energy) * 0.6;
        const currentR = Math.max(1, p.radius + pulse);

        // Glowing outer halo
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor;
        ctx.globalAlpha = 0.25;
        ctx.fill();
        ctx.globalAlpha = 1.0;

        // Core dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentR, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto opacity-75 transition-opacity duration-700"
    />
  );
};
