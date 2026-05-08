import { useEffect, useRef } from 'react';

const CHARS = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ$%#@!';
const FONT_SIZE = 14;

export default function MatrixField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let drops = [];

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const cols = Math.floor(canvas.width / FONT_SIZE);
      drops = Array.from({ length: cols }, () => ({
        y:     Math.random() * -canvas.height,
        speed: Math.random() * 1.5 + 0.5,
        len:   Math.floor(Math.random() * 20 + 10),
        chars: Array.from({ length: 30 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]),
      }));
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = `${FONT_SIZE}px monospace`;

      drops.forEach((drop, i) => {
        const x = i * FONT_SIZE;

        drop.chars.forEach((ch, j) => {
          const y = drop.y + j * FONT_SIZE;
          if (y < 0 || y > canvas.height + FONT_SIZE) return;

          if (j === drop.chars.length - 1) {
            // Bright white head
            ctx.fillStyle = '#CCFFCC';
            ctx.shadowColor = '#00FF41';
            ctx.shadowBlur = 12;
          } else {
            const fade = 1 - j / drop.chars.length;
            const g = Math.floor(180 * fade + 40);
            ctx.fillStyle = `rgba(0,${g},0,${fade * 0.9 + 0.1})`;
            ctx.shadowBlur = 0;
          }

          ctx.fillText(ch, x, y);

          if (Math.random() < 0.015) {
            drop.chars[j] = CHARS[Math.floor(Math.random() * CHARS.length)];
          }
        });

        ctx.shadowBlur = 0;
        drop.y += drop.speed;

        if (drop.y > canvas.height + drop.len * FONT_SIZE) {
          drop.y     = Math.random() * -canvas.height * 0.5;
          drop.speed = Math.random() * 1.5 + 0.5;
          drop.len   = Math.floor(Math.random() * 20 + 10);
        }
      });

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
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: '#000' }}
    />
  );
}
