export interface BorderPreset {
  id: string;
  type: string;
  color: string;
  name: string;
  secondaryColor?: string;
}

export const BORDER_PRESETS: BorderPreset[] = [
  { id: 'classic-blue', type: 'minimal', color: '#3B82F6', name: 'Classic Blue' },
  { id: 'glow-red', type: 'ring-glow', color: '#EF4444', name: 'Glow Red' },
  { id: 'glow-green', type: 'ring-glow', color: '#10B981', name: 'Glow Green' },
  { id: 'neon-amber', type: 'neon-pulse', color: '#F59E0B', name: 'Neon Amber' },
  { id: 'progress-blue', type: 'progress', color: '#3B82F6', name: 'Progress' },
  { id: 'wave-purple', type: 'zigzag', color: '#A855F7', name: 'Wave' },
  { id: 'cyber-blue', type: 'tech', color: '#3B82F6', name: 'Cyber' },
  { id: 'particles-green', type: 'dots', color: '#10B981', name: 'Particles' },
  { id: 'double-amber', type: 'double', color: '#F59E0B', name: 'Double' },
  { id: 'stardust-gold', type: 'fancy-stars', color: '#FCD34D', name: 'Stardust' },
  { id: 'ornate-pink', type: 'ornate', color: '#EC4899', name: 'Ornate' },
];

export const SECONDARY_BORDER_PRESETS: BorderPreset[] = [
  { id: 'gradient-sunset', type: 'gradient-ring', color: '#FF4E50', secondaryColor: '#F9D423', name: 'Sunset' },
  { id: 'dashed-white', type: 'dashed-ring', color: '#FFFFFF', name: 'Dashed' },
  { id: 'triple-cyan', type: 'triple-ring', color: '#06B6D4', name: 'Triple' },
  { id: 'square-dots-lime', type: 'square-dots', color: '#84CC16', name: 'Squares' },
  { id: 'sun-rays-orange', type: 'sun-rays', color: '#F97316', name: 'Solar' },
  { id: 'barcode-white', type: 'barcode', color: '#FFFFFF', name: 'Data' },
  { id: 'circuit-green', type: 'circuit', color: '#22C55E', name: 'Circuit' },
  { id: 'dna-blue', type: 'dna', color: '#6366F1', name: 'Helix' },
  { id: 'wave-double-red', type: 'wave-double', color: '#DC2626', name: 'Vibration' },
  { id: 'glitch-cyan', type: 'glitch', color: '#22D3EE', secondaryColor: '#F43F5E', name: 'Glitch' },
  { id: 'pixel-green', type: 'pixel', color: '#4ADE80', name: 'Retro' },
  { id: 'shards-white', type: 'shards', color: '#F8FAFC', name: 'Crystal' },
  { id: 'vignette-black', type: 'vignette', color: '#000000', name: 'Focus' },
  { id: 'flower-rose', type: 'flower', color: '#FB7185', name: 'Bloom' },
  { id: 'hex-teal', type: 'hex-grid', color: '#2DD4BF', name: 'Honeycomb' },
];
