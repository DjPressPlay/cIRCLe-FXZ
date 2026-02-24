export interface DrawBorderOptions {
  ctx: CanvasRenderingContext2D;
  type: string;
  color: string;
  secondaryColor?: string;
  size: number;
  progress?: number;
}

export const drawBorderToCanvas = ({
  ctx,
  type,
  color,
  secondaryColor,
  size,
  progress = 1,
}: DrawBorderOptions) => {
  const center = size / 2;
  // Use a consistent offset that scales well. 
  // For 1024px export, 40px was used. For 384px preview, 10px was used.
  // 40/1024 = 0.039. 10/384 = 0.026.
  // Let's use 0.035 as a middle ground.
  const radius = (size / 2) - (size * 0.035); 

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  switch (type) {
    case 'minimal':
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.025;
      ctx.stroke();
      break;

    case 'progress':
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = size * 0.03;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
      ctx.strokeStyle = color;
      ctx.lineWidth = size * 0.03;
      ctx.stroke();
      break;

    case 'zigzag':
      ctx.beginPath();
      const points = 60;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = radius + (i % 2 === 0 ? size * 0.015 : -size * 0.015);
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.lineWidth = size * 0.015;
      ctx.stroke();
      break;

    case 'tech':
      for (let i = 0; i < 8; i++) {
        const startAngle = (i * Math.PI * 2) / 8;
        const endAngle = startAngle + (Math.PI * 2) / 12;
        ctx.beginPath();
        ctx.arc(center, center, radius + (size * 0.01), startAngle, endAngle);
        ctx.lineWidth = size * 0.02;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(center, center, radius - (size * 0.01), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = size * 0.005;
      ctx.stroke();
      break;

    case 'dots':
      const dotCount = 40;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.01, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'double':
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.015;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, radius - (size * 0.02), 0, Math.PI * 2);
      ctx.lineWidth = size * 0.008;
      ctx.stroke();
      break;

    case 'ring-glow':
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.04;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = size * 0.01;
      ctx.stroke();
      break;

    case 'fancy-stars':
      const stars = 8;
      for (let i = 0; i < stars; i++) {
        const angle = (i * Math.PI * 2) / stars;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
          ctx.lineTo(Math.cos((18 + j * 72) * Math.PI / 180) * (size * 0.02),
                   Math.sin((18 + j * 72) * Math.PI / 180) * (size * 0.02));
          ctx.lineTo(Math.cos((54 + j * 72) * Math.PI / 180) * (size * 0.01),
                   Math.sin((54 + j * 72) * Math.PI / 180) * (size * 0.01));
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.setLineDash([size * 0.025, size * 0.025]);
      ctx.stroke();
      ctx.setLineDash([]);
      break;

    case 'neon-pulse':
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.025;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(center, center, radius + (size * 0.015), 0, Math.PI * 2);
      ctx.globalAlpha = 0.3;
      ctx.lineWidth = size * 0.015;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
      break;

    case 'ornate':
      ctx.beginPath();
      const petals = 12;
      for (let i = 0; i <= petals * 10; i++) {
        const angle = (i / (petals * 10)) * Math.PI * 2;
        const r = radius + Math.sin(angle * petals) * (size * 0.02);
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.lineWidth = size * 0.015;
      ctx.stroke();
      break;

    case 'gradient-ring':
      const grad = ctx.createLinearGradient(0, 0, size, size);
      grad.addColorStop(0, color);
      grad.addColorStop(1, secondaryColor || 'white');
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = size * 0.04;
      ctx.stroke();
      break;

    case 'dashed-ring':
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.setLineDash([size * 0.035, size * 0.025]);
      ctx.lineWidth = size * 0.025;
      ctx.stroke();
      ctx.setLineDash([]);
      break;

    case 'triple-ring':
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(center, center, radius - (i * size * 0.015), 0, Math.PI * 2);
        ctx.lineWidth = size * 0.015;
        ctx.stroke();
      }
      break;

    case 'square-dots':
      const sqCount = 24;
      for (let i = 0; i < sqCount; i++) {
        const angle = (i / sqCount) * Math.PI * 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.fillRect(-size * 0.008, -size * 0.008, size * 0.016, size * 0.016);
        ctx.restore();
      }
      break;

    case 'sun-rays':
      const rays = 36;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const x1 = center + Math.cos(angle) * (radius - size * 0.025);
        const y1 = center + Math.sin(angle) * (radius - size * 0.025);
        const x2 = center + Math.cos(angle) * (radius + size * 0.025);
        const y2 = center + Math.sin(angle) * (radius + size * 0.025);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = size * 0.015;
        ctx.stroke();
      }
      break;

    case 'barcode':
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        const h = Math.random() > 0.5 ? size * 0.035 : size * 0.012;
        const x1 = center + Math.cos(angle) * (radius - h/2);
        const y1 = center + Math.sin(angle) * (radius - h/2);
        const x2 = center + Math.cos(angle) * (radius + h/2);
        const y2 = center + Math.sin(angle) * (radius + h/2);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = size * 0.005;
        ctx.stroke();
      }
      break;

    case 'circuit':
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.lineWidth = size * 0.005;
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.015, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'dna':
      const helix = 40;
      for (let i = 0; i < helix; i++) {
        const angle = (i / helix) * Math.PI * 2;
        const offset = Math.sin(i * 0.5) * (size * 0.02);
        const x = center + Math.cos(angle) * (radius + offset);
        const y = center + Math.sin(angle) * (radius + offset);
        ctx.beginPath();
        ctx.arc(x, y, size * 0.005, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'wave-double':
      for (let j = 0; j < 2; j++) {
        ctx.beginPath();
        const wPoints = 100;
        for (let i = 0; i <= wPoints; i++) {
          const angle = (i / wPoints) * Math.PI * 2;
          const r = radius - (j * size * 0.025) + Math.sin(angle * 10) * (size * 0.012);
          const x = center + Math.cos(angle) * r;
          const y = center + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = size * 0.015;
        ctx.stroke();
      }
      break;

    case 'glitch':
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(Math.random() * size * 0.01 - size * 0.005, Math.random() * size * 0.01 - size * 0.005);
        ctx.beginPath();
        ctx.arc(center, center, radius, 0, Math.PI * 2);
        ctx.strokeStyle = i === 0 ? color : (secondaryColor || 'cyan');
        ctx.lineWidth = size * 0.015;
        ctx.stroke();
        ctx.restore();
      }
      break;

    case 'pixel':
      const pSize = size * 0.015;
      const pCount = 32;
      for (let i = 0; i < pCount; i++) {
        const angle = (i / pCount) * Math.PI * 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        ctx.fillRect(x - pSize/2, y - pSize/2, pSize, pSize);
      }
      break;

    case 'shards':
      const sCount = 16;
      for (let i = 0; i < sCount; i++) {
        const angle = (i / sCount) * Math.PI * 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle + Math.PI/2);
        ctx.beginPath();
        ctx.moveTo(0, -size * 0.025);
        ctx.lineTo(size * 0.012, size * 0.025);
        ctx.lineTo(-size * 0.012, size * 0.025);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
      break;

    case 'vignette':
      const vGrad = ctx.createRadialGradient(center, center, radius - size * 0.05, center, center, radius + size * 0.05);
      vGrad.addColorStop(0, 'transparent');
      vGrad.addColorStop(1, color);
      ctx.beginPath();
      ctx.arc(center, center, radius + size * 0.025, 0, Math.PI * 2);
      ctx.fillStyle = vGrad;
      ctx.fill();
      break;

    case 'flower':
      ctx.beginPath();
      const fPetals = 8;
      for (let i = 0; i <= 360; i++) {
        const angle = (i * Math.PI) / 180;
        const r = radius + Math.abs(Math.sin(angle * fPetals / 2)) * (size * 0.035);
        const x = center + Math.cos(angle) * r;
        const y = center + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = size * 0.02;
      ctx.stroke();
      break;

    case 'hex-grid':
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const x = center + Math.cos(angle) * radius;
        const y = center + Math.sin(angle) * radius;
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const ha = (j * Math.PI * 2) / 6;
          ctx.lineTo(Math.cos(ha) * (size * 0.02), Math.sin(ha) * (size * 0.02));
        }
        ctx.closePath();
        ctx.lineWidth = size * 0.015;
        ctx.stroke();
        ctx.restore();
      }
      break;
  }
};
