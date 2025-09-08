import { vi } from 'vitest';

// Mock Path2D for testing environment
global.Path2D = vi.fn().mockImplementation(() => ({
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  quadraticCurveTo: vi.fn(),
  closePath: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();