export type CharacterClassId = string;

export type PersistentCharacterStats = {
  attack: number;
  defense: number;
  maxHp: number;
  maxMp: number;
};

export type SessionInventoryItem = {
  itemId: string;
  itemName: string;
  quantity: number;
  upgradeLevel?: number;
  attackBonus?: number;
  defenseBonus?: number;
  hpBonus?: number;
  mpBonus?: number;
};

export type ActiveCompanionSession = {
  id: number;
  companionId: string;
  companionName: string;
  classId: CharacterClassId;
  slotNo: number | null;
};

export type WaveRuntimeEntry = {
  slotNo: number;
  monsterId: string;
  monsterCount: number;
  hpMultiplier: number;
  mpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  rewardGoldMultiplier: number;
  rewardGemMultiplier: number;
};

export type WavePatternRuntime = {
  patternWaveNo: number;
  patternGroupNo: number;
  subWaveNo: number;
  entries: WaveRuntimeEntry[];
};

export type WaveGroupScalingRuntime = {
  waveGroupNo: number;
  hpMultiplier: number;
  mpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  rewardGoldMultiplier: number;
  rewardGemMultiplier: number;
  backgroundImagePath: string | null;
};

export type WaveRuntimeConfig = {
  dungeonId: string;
  patternGroupSize: number;
  subWaveSize: number;
  patterns: WavePatternRuntime[];
  waveGroupScalings: WaveGroupScalingRuntime[];
};

export type GameSession = {
  playerId: number;
  nickname: string;
  classId: CharacterClassId;
  persistentStats?: PersistentCharacterStats;
  initialInventory?: SessionInventoryItem[];
  activeCompanions?: ActiveCompanionSession[];
  equippedItemIds?: string[];
  waveRuntimeConfig?: WaveRuntimeConfig;
  startWave?: number;
  initialBattleSpeed?: 1 | 2 | 3;
  waveLocked?: boolean;
  onMonsterKill?: (event: {
    killDelta: number;
    goldEarned: number;
    waveCleared: boolean;
    currentWave: number;
    nextWave: number;
  }) => void;
};
