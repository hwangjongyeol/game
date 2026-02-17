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
      this.load.image(`dungeon-bg-${i}`, `/dungeons/dungeon-${i}.png`);
    }
    const backgroundPaths = Array.from(
      new Set(
        (this.session.waveRuntimeConfig?.waveGroupScalings ?? [])
          .map((row) => row.backgroundImagePath?.trim())
          .filter((path): path is string => Boolean(path))
      )
    );
    backgroundPaths.forEach((path) => {
      this.load.image(this.runtimeBgKey(path), path);
    });
    this.load.spritesheet('sprite-pack', '/characters/img_1.png', {
      frameWidth: 128,
      frameHeight: 128
    });
  }

  create(): void {
    this.scene.start('MainScene', this.session);
  }

  private runtimeBgKey(path: string): string {
    return `wave-group-bg-${path.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
  }
}
