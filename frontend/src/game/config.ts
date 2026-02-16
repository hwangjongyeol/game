import Phaser from 'phaser';
import RexUIPlugin from 'phaser3-rex-plugins/templates/ui/ui-plugin.js';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';
import { GameSession } from './types';

export const createGameConfig = (parent: string, session: GameSession): Phaser.Types.Core.GameConfig => {
  return {
    type: Phaser.AUTO,
    parent,
    width: 1280,
    height: 720,
    scene: [new BootScene(session), new MainScene()],
    backgroundColor: '#121726',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
      default: 'arcade',
      arcade: {
        debug: false
      }
    },
    plugins: {
      scene: [
        {
          key: 'rexUI',
          plugin: RexUIPlugin,
          mapping: 'rexUI'
        }
      ]
    }
  };
};
