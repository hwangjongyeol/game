import { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { StartGame } from './main';
import { ActiveCompanionSession, CharacterClassId, PersistentCharacterStats, SessionInventoryItem } from './types';

type Props = {
  playerId: number;
  nickname: string;
  classId: CharacterClassId;
  startWave?: number;
  waveFxTick?: number;
  hidden?: boolean;
  battleSpeed?: 1 | 2 | 3;
  waveLocked?: boolean;
  persistentStats?: PersistentCharacterStats;
  initialInventory?: SessionInventoryItem[];
  activeCompanions?: ActiveCompanionSession[];
  equippedItemIds?: string[];
  onMonsterKill?: (event: {
    killDelta: number;
    goldEarned: number;
    waveCleared: boolean;
    currentWave: number;
    nextWave: number;
  }) => void;
};

export default function GameContainer({
  playerId,
  nickname,
  classId,
  startWave,
  waveFxTick,
  hidden,
  battleSpeed,
  waveLocked,
  persistentStats,
  initialInventory,
  activeCompanions,
  equippedItemIds,
  onMonsterKill
}: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const onMonsterKillRef = useRef<Props['onMonsterKill']>(onMonsterKill);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [waveFxClass, setWaveFxClass] = useState('');

  onMonsterKillRef.current = onMonsterKill;

  useEffect(() => {
    if (!hostRef.current) return;

    const elementId = `game-root-${playerId}`;
    hostRef.current.id = elementId;

    const game = StartGame(elementId, {
      playerId,
      nickname,
      classId,
      startWave,
      initialBattleSpeed: battleSpeed ?? 1,
      waveLocked,
      persistentStats,
      initialInventory,
      activeCompanions,
      equippedItemIds,
      onMonsterKill: (event) => onMonsterKillRef.current?.(event)
    });
    gameRef.current = game;
    return () => {
      gameRef.current = null;
      game.destroy(true);
    };
  }, [playerId, nickname, classId]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !equippedItemIds) return;
    if (!game.scene.isActive('MainScene')) return;

    const scene = game.scene.getScene('MainScene') as {
      updateEquippedItems?: (itemIds: string[]) => void;
    };
    scene.updateEquippedItems?.(equippedItemIds);
  }, [equippedItemIds]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !battleSpeed) return;
    if (!game.scene.isActive('MainScene')) return;

    const scene = game.scene.getScene('MainScene') as {
      updateBattleSpeed?: (speed: 1 | 2 | 3) => void;
    };
    scene.updateBattleSpeed?.(battleSpeed);
  }, [battleSpeed]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || waveLocked == null) return;
    if (!game.scene.isActive('MainScene')) return;

    const scene = game.scene.getScene('MainScene') as {
      updateWaveLock?: (locked: boolean) => void;
    };
    scene.updateWaveLock?.(waveLocked);
  }, [waveLocked]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !initialInventory) return;
    if (!game.scene.isActive('MainScene')) return;

    const scene = game.scene.getScene('MainScene') as {
      updateInventorySnapshot?: (items: SessionInventoryItem[]) => void;
    };
    scene.updateInventorySnapshot?.(initialInventory);
  }, [initialInventory]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !persistentStats) return;
    if (!game.scene.isActive('MainScene')) return;

    const scene = game.scene.getScene('MainScene') as {
      updatePersistentStats?: (stats: PersistentCharacterStats) => void;
    };
    scene.updatePersistentStats?.(persistentStats);
  }, [persistentStats]);

  useEffect(() => {
    const game = gameRef.current;
    if (!game || !activeCompanions) return;
    if (!game.scene.isActive('MainScene')) return;

    const scene = game.scene.getScene('MainScene') as {
      updateActiveCompanions?: (companions: ActiveCompanionSession[]) => void;
    };
    scene.updateActiveCompanions?.(activeCompanions);
  }, [activeCompanions]);

  useEffect(() => {
    if (!waveFxTick) return;
    setWaveFxClass('wave-switch-anim');
    const timer = window.setTimeout(() => setWaveFxClass(''), 420);
    return () => window.clearTimeout(timer);
  }, [waveFxTick]);

  return (
    <section className={`game-shell ${waveFxClass} ${hidden ? 'game-shell-hidden' : ''}`.trim()}>
      <header className="game-head">
        <strong>{nickname}</strong>
        <span>
          #{playerId} / {classId}
        </span>
      </header>
      <div ref={hostRef} className="game-stage" />
    </section>
  );
}
