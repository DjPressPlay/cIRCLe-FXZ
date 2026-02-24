export interface DrawBorderOptions {
  ctx: CanvasRenderingContext2D;
  type: string;
  color: string;
  secondaryColor?: string;
  size: number;
  progress?: number;
  shape?: 'circle' | 'square';
}

export const drawBorderToCanvas = ({
  ctx,
  type,
  color,
  secondaryColor,
  size,
  progress = 1,
  shape = 'circle',
}: DrawBorderOptions) => {
  const center = size / 2;
  const margin = size * 0.035;
  const radius = (size / 2) - margin; 
  const rectSize = size - (margin * 2);
  const rectPos = margin;

  const getPointOnSquare = (angle: number, r: number) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const absCos = Math.abs(cos);
    const absSin = Math.abs(sin);
    
    let x, y;
    if (absCos > absSin) {
      x = cos > 0 ? r : -r;
      y = r * sin / absCos;
    } else {
      y = sin > 0 ? r : -r;
      x = r * cos / absSin;
    }
    return { x: center + x, y: center + y };
  };

  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  switch (type) {
    case 'minimal':
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.lineWidth = size * 0.025;
      ctx.stroke();
      break;

    case 'progress':
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = size * 0.03;
      ctx.stroke();
      
      ctx.beginPath();
      if (shape === 'square') {
        // For square progress, we can draw segments of the perimeter
        const perimeter = rectSize * 4;
        const target = perimeter * progress;
        ctx.moveTo(center, rectPos);
        
        let current = 0;
        // Top right
        if (target > rectSize / 2) {
          ctx.lineTo(rectPos + rectSize, rectPos);
          current = rectSize / 2;
        } else {
          ctx.lineTo(center + target, rectPos);
          current = target;
        }
        
        // Right side
        if (target > current + rectSize) {
          ctx.lineTo(rectPos + rectSize, rectPos + rectSize);
          current += rectSize;
        } else if (target > current) {
          ctx.lineTo(rectPos + rectSize, rectPos + (target - current));
          current = target;
        }
        
        // Bottom side
        if (target > current + rectSize) {
          ctx.lineTo(rectPos, rectPos + rectSize);
          current += rectSize;
        } else if (target > current) {
          ctx.lineTo(rectPos + rectSize - (target - current), rectPos + rectSize);
          current = target;
        }
        
        // Left side
        if (target > current + rectSize) {
          ctx.lineTo(rectPos, rectPos);
          current += rectSize;
        } else if (target > current) {
          ctx.lineTo(rectPos, rectPos + rectSize - (target - current));
          current = target;
        }
        
        // Top left
        if (target > current && current < perimeter) {
          ctx.lineTo(rectPos + (target - current), rectPos);
        }

      } else {
        ctx.arc(center, center, radius, -Math.PI / 2, (-Math.PI / 2) + (Math.PI * 2 * progress));
      }
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
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, r) : { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
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
        if (shape === 'square') {
          // Simple square corners for tech mode
          const cornerSize = rectSize * 0.2;
          if (i === 0) ctx.moveTo(rectPos + rectSize - cornerSize, rectPos);
          if (i === 0) ctx.lineTo(rectPos + rectSize, rectPos);
          if (i === 0) ctx.lineTo(rectPos + rectSize, rectPos + cornerSize);
          
          if (i === 2) ctx.moveTo(rectPos + rectSize, rectPos + rectSize - cornerSize);
          if (i === 2) ctx.lineTo(rectPos + rectSize, rectPos + rectSize);
          if (i === 2) ctx.lineTo(rectPos + rectSize - cornerSize, rectPos + rectSize);
          
          if (i === 4) ctx.moveTo(rectPos + cornerSize, rectPos + rectSize);
          if (i === 4) ctx.lineTo(rectPos, rectPos + rectSize);
          if (i === 4) ctx.lineTo(rectPos, rectPos + rectSize - cornerSize);
          
          if (i === 6) ctx.moveTo(rectPos, rectPos + cornerSize);
          if (i === 6) ctx.lineTo(rectPos, rectPos);
          if (i === 6) ctx.lineTo(rectPos + cornerSize, rectPos);
        } else {
          ctx.arc(center, center, radius + (size * 0.01), startAngle, endAngle);
        }
        ctx.lineWidth = size * 0.02;
        ctx.stroke();
      }
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos + size * 0.01, rectPos + size * 0.01, rectSize - size * 0.02, rectSize - size * 0.02);
      } else {
        ctx.arc(center, center, radius - (size * 0.01), 0, Math.PI * 2);
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.lineWidth = size * 0.005;
      ctx.stroke();
      break;

    case 'dots':
      const dotCount = 40;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i / dotCount) * Math.PI * 2;
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, radius) : { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
        ctx.beginPath();
        ctx.arc(x, y, size * 0.01, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case 'double':
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.lineWidth = size * 0.015;
      ctx.stroke();
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos + size * 0.015, rectPos + size * 0.015, rectSize - size * 0.03, rectSize - size * 0.03);
      } else {
        ctx.arc(center, center, radius - (size * 0.02), 0, Math.PI * 2);
      }
      ctx.lineWidth = size * 0.008;
      ctx.stroke();
      break;

    case 'ring-glow':
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.lineWidth = size * 0.04;
      ctx.stroke();
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.strokeStyle = 'white';
      ctx.lineWidth = size * 0.01;
      ctx.stroke();
      break;

    case 'fancy-stars':
      const stars = 8;
      for (let i = 0; i < stars; i++) {
        const angle = (i * Math.PI * 2) / stars;
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, radius) : { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
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
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.setLineDash([size * 0.025, size * 0.025]);
      ctx.stroke();
      ctx.setLineDash([]);
      break;

    case 'neon-pulse':
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.lineWidth = size * 0.025;
      ctx.stroke();
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos - size * 0.015, rectPos - size * 0.015, rectSize + size * 0.03, rectSize + size * 0.03);
      } else {
        ctx.arc(center, center, radius + (size * 0.015), 0, Math.PI * 2);
      }
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
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, r) : { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
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
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.strokeStyle = grad;
      ctx.lineWidth = size * 0.04;
      ctx.stroke();
      break;

    case 'dashed-ring':
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.setLineDash([size * 0.035, size * 0.025]);
      ctx.lineWidth = size * 0.025;
      ctx.stroke();
      ctx.setLineDash([]);
      break;

    case 'triple-ring':
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        if (shape === 'square') {
          const offset = i * size * 0.015;
          ctx.rect(rectPos + offset, rectPos + offset, rectSize - offset * 2, rectSize - offset * 2);
        } else {
          ctx.arc(center, center, radius - (i * size * 0.015), 0, Math.PI * 2);
        }
        ctx.lineWidth = size * 0.015;
        ctx.stroke();
      }
      break;

    case 'square-dots':
      const sqCount = 24;
      for (let i = 0; i < sqCount; i++) {
        const angle = (i / sqCount) * Math.PI * 2;
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, radius) : { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
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
        const p1 = shape === 'square' ? getPointOnSquare(angle, radius - size * 0.025) : { x: center + Math.cos(angle) * (radius - size * 0.025), y: center + Math.sin(angle) * (radius - size * 0.025) };
        const p2 = shape === 'square' ? getPointOnSquare(angle, radius + size * 0.025) : { x: center + Math.cos(angle) * (radius + size * 0.025), y: center + Math.sin(angle) * (radius + size * 0.025) };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = size * 0.015;
        ctx.stroke();
      }
      break;

    case 'barcode':
      for (let i = 0; i < 100; i++) {
        const angle = (i / 100) * Math.PI * 2;
        const h = Math.random() > 0.5 ? size * 0.035 : size * 0.012;
        const p1 = shape === 'square' ? getPointOnSquare(angle, radius - h/2) : { x: center + Math.cos(angle) * (radius - h/2), y: center + Math.sin(angle) * (radius - h/2) };
        const p2 = shape === 'square' ? getPointOnSquare(angle, radius + h/2) : { x: center + Math.cos(angle) * (radius + h/2), y: center + Math.sin(angle) * (radius + h/2) };
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.lineWidth = size * 0.005;
        ctx.stroke();
      }
      break;

    case 'circuit':
      ctx.beginPath();
      if (shape === 'square') {
        ctx.rect(rectPos, rectPos, rectSize, rectSize);
      } else {
        ctx.arc(center, center, radius, 0, Math.PI * 2);
      }
      ctx.lineWidth = size * 0.005;
      ctx.stroke();
      for (let i = 0; i < 8; i++) {
        let x, y;
        if (shape === 'square') {
          if (i === 0) { x = rectPos; y = rectPos; }
          else if (i === 1) { x = center; y = rectPos; }
          else if (i === 2) { x = rectPos + rectSize; y = rectPos; }
          else if (i === 3) { x = rectPos + rectSize; y = center; }
          else if (i === 4) { x = rectPos + rectSize; y = rectPos + rectSize; }
          else if (i === 5) { x = center; y = rectPos + rectSize; }
          else if (i === 6) { x = rectPos; y = rectPos + rectSize; }
          else { x = rectPos; y = center; }
        } else {
          const angle = (i / 8) * Math.PI * 2;
          x = center + Math.cos(angle) * radius;
          y = center + Math.sin(angle) * radius;
        }
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
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, radius + offset) : { x: center + Math.cos(angle) * (radius + offset), y: center + Math.sin(angle) * (radius + offset) };
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
          const { x, y } = shape === 'square' ? getPointOnSquare(angle, r) : { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
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
        if (shape === 'square') {
          ctx.rect(rectPos, rectPos, rectSize, rectSize);
        } else {
          ctx.arc(center, center, radius, 0, Math.PI * 2);
        }
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
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, radius) : { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
        ctx.fillRect(x - pSize/2, y - pSize/2, pSize, pSize);
      }
      break;

    case 'shards':
      const sCount = 16;
      for (let i = 0; i < sCount; i++) {
        const angle = (i / sCount) * Math.PI * 2;
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, radius) : { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
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
      if (shape === 'square') {
        ctx.rect(rectPos - size * 0.025, rectPos - size * 0.025, rectSize + size * 0.05, rectSize + size * 0.05);
      } else {
        ctx.arc(center, center, radius + size * 0.025, 0, Math.PI * 2);
      }
      ctx.fillStyle = vGrad;
      ctx.fill();
      break;

    case 'flower':
      ctx.beginPath();
      const fPetals = 8;
      for (let i = 0; i <= 360; i++) {
        const angle = (i * Math.PI) / 180;
        const r = radius + Math.abs(Math.sin(angle * fPetals / 2)) * (size * 0.035);
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, r) : { x: center + Math.cos(angle) * r, y: center + Math.sin(angle) * r };
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineWidth = size * 0.02;
      ctx.stroke();
      break;

    case 'hex-grid':
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const { x, y } = shape === 'square' ? getPointOnSquare(angle, radius) : { x: center + Math.cos(angle) * radius, y: center + Math.sin(angle) * radius };
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
