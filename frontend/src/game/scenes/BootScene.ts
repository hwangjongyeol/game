import Phaser from 'phaser';
import { GameSession } from '../types';

export class BootScene extends Phaser.Scene {
  private readonly session: GameSession;

  constructor(session: GameSession) {
    super('BootScene');
    this.session = session;
  }

  preload(): void {
    for (let i = 1; i <= 10; i += 1) {
      const ext = i <= 6 ? 'png' : 'svg';
      this.load.image(`dungeon-bg-${i}`, `/dungeons/dungeon-${i}.${ext}`);
    }
    const backgroundPaths = Array.from(
      new Set(
        (this.session.waveRuntimeConfig?.waveGroupScalings ?? [])
          .map((row) => this.normalizeBackgroundPath(row.backgroundImagePath))
          .filter((path): path is string => Boolean(path))
      )
    );
    backgroundPaths.forEach((path) => {
      this.load.image(this.runtimeBgKey(path), path);
    });
    this.load.spritesheet('sprite-pack', '/sprite-pack-new.png', {
      frameWidth: 128,
      frameHeight: 128
    });
  }

  create(): void {
    this.makeSpritePackBackgroundTransparent();
    this.textures.get('sprite-pack')?.setFilter(Phaser.Textures.FilterMode.NEAREST);
    this.scene.start('MainScene', this.session);
  }

  private runtimeBgKey(path: string): string {
    return `wave-group-bg-${path.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }

  private normalizeBackgroundPath(path: string | null | undefined): string | null {
    if (!path) return null;
    const trimmed = path.trim();
    if (!trimmed) return null;
    if (trimmed.startsWith('/')) return trimmed;
    return `/${trimmed}`;
  }

  private makeSpritePackBackgroundTransparent(): void {
    const texture = this.textures.get('sprite-pack');
    const source = texture?.getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
    if (!source || !source.width || !source.height) return;
    const width = source.width;
    const height = source.height;

    const probes = [
      this.samplePixel(source, 2, 2),
      this.samplePixel(source, Math.max(2, width - 3), 2),
      this.samplePixel(source, 2, Math.max(2, height - 3)),
      this.samplePixel(source, Math.max(2, width - 3), Math.max(2, height - 3))
    ]
      .filter((p): p is [number, number, number] => Boolean(p))
      .filter((p) => this.isLikelyChecker(p[0], p[1], p[2]));
    if (probes.length === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    const pixelCount = width * height;
    const bgCandidate = new Uint8Array(pixelCount);
    const bgConnected = new Uint8Array(pixelCount);
    const queue = new Int32Array(pixelCount);
    let head = 0;
    let tail = 0;

    const matchesBg = (r: number, g: number, b: number, target: [number, number, number]) => {
      const dr = Math.abs(r - target[0]);
      const dg = Math.abs(g - target[1]);
      const db = Math.abs(b - target[2]);
      return dr <= 36 && dg <= 36 && db <= 36 && dr + dg + db <= 72;
    };

    const pushIfCandidate = (idx: number) => {
      if (idx < 0 || idx >= pixelCount) return;
      if (bgCandidate[idx] === 0 || bgConnected[idx] === 1) return;
      bgConnected[idx] = 1;
      queue[tail] = idx;
      tail += 1;
    };

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a === 0) continue;
      if (this.isLikelyChecker(r, g, b) && probes.some((probe) => matchesBg(r, g, b, probe))) {
        bgCandidate[i / 4] = 1;
      }
    }

    for (let x = 0; x < width; x += 1) {
      pushIfCandidate(x);
      pushIfCandidate((height - 1) * width + x);
    }
    for (let y = 0; y < height; y += 1) {
      pushIfCandidate(y * width);
      pushIfCandidate(y * width + (width - 1));
    }

    while (head < tail) {
      const idx = queue[head];
      head += 1;
      const x = idx % width;
      const y = Math.floor(idx / width);
      const pixelOffset = idx * 4;
      data[pixelOffset + 3] = 0;
      if (x > 0) pushIfCandidate(idx - 1);
      if (x < width - 1) pushIfCandidate(idx + 1);
      if (y > 0) pushIfCandidate(idx - width);
      if (y < height - 1) pushIfCandidate(idx + width);
    }

    ctx.putImageData(imageData, 0, 0);
    this.textures.remove('sprite-pack');
    this.textures.addSpriteSheet('sprite-pack', canvas as unknown as HTMLImageElement, {
      frameWidth: 128,
      frameHeight: 128
    });
    this.textures.get('sprite-pack')?.setFilter(Phaser.Textures.FilterMode.NEAREST);
  }

  private samplePixel(source: HTMLImageElement | HTMLCanvasElement, x: number, y: number): [number, number, number] | null {
    const c = document.createElement('canvas');
    c.width = source.width;
    c.height = source.height;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(source, 0, 0, source.width, source.height);
    const p = ctx.getImageData(x, y, 1, 1).data;
    return [p[0], p[1], p[2]];
  }

  private isLikelyChecker(r: number, g: number, b: number): boolean {
    return Math.abs(r - g) <= 8 && Math.abs(g - b) <= 8 && r >= 160 && g >= 160 && b >= 160;
  }
}
