import { CoreStats } from '../combat/types';
import { getRuntimeBalanceProfile } from './dbBalanceAdapter';

const DEFAULT_DUNGEON_WAVE_BALANCE = {
  monstersPerWave: {
    baseCount: 2,
    growthEveryWave: 6,
    maxCount: 6
  },
  scaling: {
    hpPerWave: 0.16,
    hpPerDungeonTier: 0.22,
    hpPerSequence: 0.06,
    mpPerWave: 0.06,
    attackPerWave: 0.1,
    attackPerDungeonTier: 0.16,
    attackPerSequence: 0.04,
    defensePerWave: 0.08,
    defensePerDungeonTier: 0.13,
    defensePerSequence: 0.03
  },
  dungeonTier: {
    cycleWaveSize: 100,
    wavePerDungeonTheme: 10
  }
} as const;

function resolveDungeonWaveBalance() {
  const profile = getRuntimeBalanceProfile();
  const patch = profile?.dungeon;
  if (!patch) return DEFAULT_DUNGEON_WAVE_BALANCE;

  return {
    monstersPerWave: {
      baseCount: Math.max(1, patch.monstersPerWave?.baseCount ?? DEFAULT_DUNGEON_WAVE_BALANCE.monstersPerWave.baseCount),
      growthEveryWave: Math.max(1, patch.monstersPerWave?.growthEveryWave ?? DEFAULT_DUNGEON_WAVE_BALANCE.monstersPerWave.growthEveryWave),
      maxCount: Math.max(1, patch.monstersPerWave?.maxCount ?? DEFAULT_DUNGEON_WAVE_BALANCE.monstersPerWave.maxCount)
    },
    scaling: {
      hpPerWave: Math.max(0, patch.scaling?.hpPerWave ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.hpPerWave),
      hpPerDungeonTier: Math.max(0, patch.scaling?.hpPerDungeonTier ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.hpPerDungeonTier),
      hpPerSequence: Math.max(0, patch.scaling?.hpPerSequence ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.hpPerSequence),
      mpPerWave: Math.max(0, patch.scaling?.mpPerWave ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.mpPerWave),
      attackPerWave: Math.max(0, patch.scaling?.attackPerWave ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.attackPerWave),
      attackPerDungeonTier: Math.max(
        0,
        patch.scaling?.attackPerDungeonTier ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.attackPerDungeonTier
      ),
      attackPerSequence: Math.max(0, patch.scaling?.attackPerSequence ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.attackPerSequence),
      defensePerWave: Math.max(0, patch.scaling?.defensePerWave ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.defensePerWave),
      defensePerDungeonTier: Math.max(
        0,
        patch.scaling?.defensePerDungeonTier ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.defensePerDungeonTier
      ),
      defensePerSequence: Math.max(0, patch.scaling?.defensePerSequence ?? DEFAULT_DUNGEON_WAVE_BALANCE.scaling.defensePerSequence)
    },
    dungeonTier: {
      cycleWaveSize: Math.max(1, patch.dungeonTier?.cycleWaveSize ?? DEFAULT_DUNGEON_WAVE_BALANCE.dungeonTier.cycleWaveSize),
      wavePerDungeonTheme: Math.max(
        1,
        patch.dungeonTier?.wavePerDungeonTheme ?? DEFAULT_DUNGEON_WAVE_BALANCE.dungeonTier.wavePerDungeonTheme
      )
    }
  };
}

export function resolveMonstersPerWaveFromBalance(wave: number): number {
  const cfg = resolveDungeonWaveBalance().monstersPerWave;
  return Math.min(cfg.maxCount, cfg.baseCount + Math.floor((wave - 1) / cfg.growthEveryWave));
}

export function resolveScaledMonsterStatsFromBalance(
  base: CoreStats,
  wave: number,
  sequence: number
): CoreStats {
  const balance = resolveDungeonWaveBalance();
  const tierCfg = balance.dungeonTier;
  const scaleCfg = balance.scaling;
  const cycleWave = ((wave - 1) % tierCfg.cycleWaveSize) + 1;
  const dungeonTier = Math.floor((cycleWave - 1) / tierCfg.wavePerDungeonTheme);
  const hpScale =
    1 + (wave - 1) * scaleCfg.hpPerWave + dungeonTier * scaleCfg.hpPerDungeonTier + (sequence - 1) * scaleCfg.hpPerSequence;
  const attackScale =
    1 +
    (wave - 1) * scaleCfg.attackPerWave +
    dungeonTier * scaleCfg.attackPerDungeonTier +
    (sequence - 1) * scaleCfg.attackPerSequence;
  const defenseScale =
    1 +
    (wave - 1) * scaleCfg.defensePerWave +
    dungeonTier * scaleCfg.defensePerDungeonTier +
    (sequence - 1) * scaleCfg.defensePerSequence;

  return {
    maxHp: Math.max(base.maxHp, Math.floor(base.maxHp * hpScale)),
    maxMp: Math.max(base.maxMp, Math.floor(base.maxMp * (1 + (wave - 1) * scaleCfg.mpPerWave))),
    attack: Math.max(base.attack, Math.floor(base.attack * attackScale)),
    defense: Math.max(base.defense, Math.floor(base.defense * defenseScale))
  };
}

export function resolveDungeonIndexFromWave(wave: number): number {
  const tierCfg = resolveDungeonWaveBalance().dungeonTier;
  const cycleWave = ((wave - 1) % tierCfg.cycleWaveSize) + 1;
  return Math.floor((cycleWave - 1) / tierCfg.wavePerDungeonTheme) + 1;
}
