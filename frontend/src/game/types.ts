export type CharacterClassId = 'knight' | 'mage' | 'ranger';

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

export type GameSession = {
  playerId: number;
  nickname: string;
  classId: CharacterClassId;
  persistentStats?: PersistentCharacterStats;
  initialInventory?: SessionInventoryItem[];
  activeCompanions?: ActiveCompanionSession[];
  equippedItemIds?: string[];
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
