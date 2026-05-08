import { useEffect, useRef } from 'react';

export default function StarField({ forceShow = false }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let shootingTimer = 0;
    let shootingStar = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random(),
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleDir: Math.random() > 0.5 ? 1 : -1,
      driftX: (Math.random() - 0.5) * 0.08,
      driftY: (Math.random() - 0.5) * 0.04,
    }));

    const spawnShooting = () => ({
      x: Math.random() * canvas.width * 0.6,
      y: Math.random() * canvas.height * 0.4,
      len: Math.random() * 120 + 80,
      speed: Math.random() * 6 + 8,
      opacity: 1,
      angle: Math.PI / 5,
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      stars.forEach(s => {
        s.opacity += s.twinkleSpeed * s.twinkleDir;
        if (s.opacity >= 1) { s.opacity = 1; s.twinkleDir = -1; }
        if (s.opacity <= 0.1) { s.opacity = 0.1; s.twinkleDir = 1; }

        s.x = (s.x + s.driftX + canvas.width) % canvas.width;
        s.y = (s.y + s.driftY + canvas.height) % canvas.height;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 244, 255, ${s.opacity})`;
        ctx.fill();
      });

      shootingTimer++;
      if (shootingTimer > 480 && !shootingStar) {
        shootingStar = spawnShooting();
        shootingTimer = 0;
      }

      if (shootingStar) {
        const { x, y, len, speed, angle, opacity } = shootingStar;
        const dx = Math.cos(angle) * len;
        const dy = Math.sin(angle) * len;

        const grad = ctx.createLinearGradient(x, y, x + dx, y + dy);
        grad.addColorStop(0, `rgba(245,200,66,0)`);
        grad.addColorStop(0.6, `rgba(245,200,66,${opacity * 0.6})`);
        grad.addColorStop(1, `rgba(255,255,255,${opacity})`);

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx, y + dy);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        shootingStar.x += Math.cos(angle) * speed;
        shootingStar.y += Math.sin(angle) * speed;
        shootingStar.opacity -= 0.018;

        if (shootingStar.opacity <= 0 || shootingStar.x > canvas.width) {
          shootingStar = null;
        }
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="star-field fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent', ...(forceShow && { display: 'block' }) }}
    />
  );
}
