/* =========================================================
   SortLab — StreetFX
   A synthwave-style "flying down a neon street" canvas engine,
   used for the page-transition warp: neon buildings recede on
   both the left and right toward a glowing vanishing point,
   with fast horizontal light streaks rushing past — instead of
   the circular tunnel look used for the ambient background.
   ========================================================= */

(function(){
  "use strict";

  const DPR = Math.min(window.devicePixelRatio || 1, 2);
  const PALETTE = ["#33E6FF", "#FF3DBE", "#8A6BFF", "#FF7AD9", "#4CF2C0"];

  function start(canvas, opts){
    opts = Object.assign({
      speed: 1,
      density: 26,
      streakCount: 44,
      labels: [],
      labelScale: 1
    }, opts || {});

    const ctx = canvas.getContext("2d");
    let w = 0, h = 0, cx = 0, cy = 0, raf = null, running = true, t = 0;

    function resize(){
      const rect = canvas.getBoundingClientRect();
      w = canvas.width = Math.max(1, Math.round(rect.width * DPR));
      h = canvas.height = Math.max(1, Math.round(rect.height * DPR));
      cx = w / 2; cy = h * 0.42;
    }
    window.addEventListener("resize", resize);
    resize();

    const buildings = [];
    for (let i = 0; i < opts.density; i++){
      buildings.push({
        side: (i % 2 === 0) ? -1 : 1,
        seed: i / opts.density,
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        heightF: 0.45 + Math.random() * 0.9,
        label: opts.labels.length ? opts.labels[Math.floor(Math.random() * opts.labels.length)] : null
      });
    }

    const streaks = [];
    for (let i = 0; i < opts.streakCount; i++){
      streaks.push({
        y: Math.random(),
        side: Math.random() < 0.5 ? -1 : 1,
        seed: Math.random(),
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)]
      });
    }

    function draw(){
      if (!running) return;
      t += 0.016 * opts.speed;

      ctx.fillStyle = "#05030f";
      ctx.fillRect(0, 0, w, h);

      // faint converging road lines toward the vanishing point
      ctx.save();
      ctx.strokeStyle = "rgba(150,120,255,0.28)";
      ctx.lineWidth = 1.4 * DPR;
      for (let lx = -4; lx <= 4; lx++){
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + lx * w * 0.1, h);
        ctx.stroke();
      }
      ctx.restore();

      // neon buildings receding on both sides, rushing toward the viewer
      for (let i = 0; i < buildings.length; i++){
        const b = buildings[i];
        const prog = (t * 0.22 * opts.speed * 0.5 + b.seed) % 1;
        const ease = prog * prog;
        const x = cx + b.side * ease * (w * 0.62);
        const yTop = cy - ease * (cy * 0.9) * b.heightF;
        const yBot = cy + ease * (h - cy) * 1.05;
        const bw = 8 * DPR + ease * 68 * DPR;
        const alpha = Math.min(1, prog * 2.4) * (1 - Math.max(0, prog - 0.72) / 0.28);
        if (alpha <= 0.02) continue;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.fillStyle = b.color;
        ctx.shadowBlur = 16 * DPR;
        ctx.shadowColor = b.color;
        ctx.fillRect(x - (b.side < 0 ? bw : 0), yTop, bw, Math.max(0, yBot - yTop));

        if (b.label && prog > 0.14 && prog < 0.78){
          ctx.globalAlpha = Math.min(1, alpha * 1.2);
          ctx.fillStyle = "#F4F8FF";
          ctx.font = `${Math.round((10 + ease * 14) * opts.labelScale * DPR)}px 'IBM Plex Mono', monospace`;
          ctx.textAlign = b.side < 0 ? "right" : "left";
          ctx.fillText(b.label, x + (b.side < 0 ? -6 * DPR : 6 * DPR), yTop + 16 * DPR);
        }
        ctx.restore();
      }

      // fast horizontal light streaks rushing outward — the "speed" cue
      for (let i = 0; i < streaks.length; i++){
        const s = streaks[i];
        const prog = (t * 0.5 * opts.speed + s.seed) % 1;
        const yy = cy + (s.y - 0.5) * h * 0.95;
        const len = 36 * DPR + prog * 240 * DPR;
        const x0 = cx + s.side * prog * w * 0.06;
        const x1 = cx + s.side * (prog * w * 0.72 + len);
        const alpha = Math.min(1, prog * 3) * (1 - Math.max(0, prog - 0.6) / 0.4);
        if (alpha <= 0.02) continue;

        ctx.save();
        ctx.globalAlpha = alpha * 0.85;
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 2 * DPR;
        ctx.shadowBlur = 9 * DPR;
        ctx.shadowColor = s.color;
        ctx.beginPath();
        ctx.moveTo(x0, yy);
        ctx.lineTo(x1, yy);
        ctx.stroke();
        ctx.restore();
      }

      // glow at the vanishing point
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 80 * DPR);
      g.addColorStop(0, "rgba(255,255,255,0.85)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(cx, cy, 80 * DPR, 0, Math.PI * 2);
      ctx.fill();

      raf = requestAnimationFrame(draw);
    }
    draw();

    return {
      stop(){ running = false; if (raf) cancelAnimationFrame(raf); window.removeEventListener("resize", resize); },
      setSpeed(v){ opts.speed = v; }
    };
  }

  window.StreetFX = { start };
})();
