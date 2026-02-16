import Phaser from 'phaser';
import { createGameConfig } from './config';
import { EventBus } from './EventBus';
import { GameSession } from './types';

let game: Phaser.Game | null = null;

export const StartGame = (parent: string, session: GameSession): Phaser.Game => {
  if (game) {
    game.destroy(true);
  }
  game = new Phaser.Game(createGameConfig(parent, session));
  return game;
};

export const GetGame = (): Phaser.Game | null => game;

export const OnSceneReady = (callback: (scene: Phaser.Scene) => void): void => {
  EventBus.once('current-scene-ready', callback);
};

