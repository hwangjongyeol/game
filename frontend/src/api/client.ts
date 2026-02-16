export type ApiResponse<T> = {
  success: boolean;
  data: T;
  error: { code: string; message: string } | null;
};

async function parseApiResponse<T>(response: Response): Promise<ApiResponse<T>> {
  const raw = await response.text();
  if (!raw) {
    throw new Error(`Empty response body (HTTP ${response.status})`);
  }

  try {
    return JSON.parse(raw) as ApiResponse<T>;
  } catch {
    throw new Error(`Invalid JSON response (HTTP ${response.status}): ${raw.slice(0, 120)}`);
  }
}

export type PlayerResponse = {
  id: number;
  accountId: number;
  nickname: string;
  classId: 'knight' | 'mage' | 'ranger';
  level: number;
  gold: number;
};

export type AccountResponse = {
  accountId: number;
  loginId: string;
};

export type WalletResponse = {
  userId: number;
  gold: number;
  gem: number;
  energy: number;
  updatedAt: string;
};

type RankingResponse = {
  seasonId: string;
  userId: number;
  rank: number;
  score: number;
};

export type LootSyncItem = {
  itemId: string;
  itemName: string;
  quantity: number;
};

export type UserItemResponse = {
  userId: number;
  itemId: string;
  itemName: string;
  quantity: number;
  upgradeLevel: number;
  quality: string;
  attackBonus: number;
  defenseBonus: number;
  hpBonus: number;
  mpBonus: number;
  updatedAt: string;
};

export type UserEquipmentResponse = {
  userId: number;
  weaponItemId: string | null;
  armorItemId: string | null;
  accessoryItemId: string | null;
  updatedAt: string | null;
};

export type UserEquipmentPresetResponse = {
  userId: number;
  presetName: string;
  weaponItemId: string | null;
  armorItemId: string | null;
  accessoryItemId: string | null;
  updatedAt: string;
};

export type ItemMasterResponse = {
  itemId: string;
  itemName: string;
  itemType: 'MATERIAL' | 'CONSUMABLE' | 'EQUIPMENT';
  equipSlot: 'weapon' | 'armor' | 'accessory' | null;
  requiredClassId: 'knight' | 'mage' | 'ranger' | null;
  quality: string;
  attackBonus: number;
  defenseBonus: number;
  hpBonus: number;
  mpBonus: number;
  upgradeGoldBase: number;
  upgradeAttackStep: number;
  upgradeDefenseStep: number;
  upgradeHpStep: number;
  upgradeMpStep: number;
  imageUrl: string;
  description: string;
  active: boolean;
};

export type MonsterDropResponse = {
  monsterId: string;
  itemId: string;
  dropChance: number;
  minQuantity: number;
  maxQuantity: number;
  equipmentDrop: boolean;
};

export type CharacterStatType = 'ATTACK' | 'DEFENSE' | 'MAX_HP' | 'MAX_MP';

export type CharacterStatResponse = {
  userId: number;
  attack: number;
  defense: number;
  maxHp: number;
  maxMp: number;
  companionBonusAttack: number;
  companionBonusDefense: number;
  companionBonusHp: number;
  companionBonusMp: number;
  attackLevel: number;
  defenseLevel: number;
  hpLevel: number;
  mpLevel: number;
  nextAttackGoldCost: number;
  nextDefenseGoldCost: number;
  nextHpGoldCost: number;
  nextMpGoldCost: number;
};

export type CompanionMasterResponse = {
  companionId: string;
  companionName: string;
  grade: string;
  classId: 'knight' | 'mage' | 'ranger';
  baseAttack: number;
  baseDefense: number;
  baseHp: number;
  baseMp: number;
  imageUrl: string;
  recruitWeight: number;
  active: boolean;
};

export type UserCompanionResponse = {
  id: number;
  userId: number;
  companionId: string;
  companionName: string;
  grade: string;
  classId: 'knight' | 'mage' | 'ranger';
  level: number;
  copies: number;
  slotNo: number | null;
  attack: number;
  defense: number;
  hp: number;
  mp: number;
  imageUrl: string;
};

export type CompanionPartyBonusResponse = {
  userId: number;
  bonusAttack: number;
  bonusDefense: number;
  bonusHp: number;
  bonusMp: number;
  activeCompanions: UserCompanionResponse[];
};

export type DailyQuestStatusResponse = {
  userId: number;
  questDate: string;
  dungeonKillCount: number;
  targetKillCount: number;
  goldEarned: number;
  targetGoldEarned: number;
  statUpgradeCount: number;
  targetStatUpgradeCount: number;
  claimable: boolean;
  claimed: boolean;
  rewardGold: number;
  rewardGem: number;
};

export type DailyQuestEntryResponse = {
  questCode: string;
  title: string;
  objectiveType: 'KILL' | 'GOLD' | 'UPGRADE';
  progress: number;
  target: number;
  claimable: boolean;
  claimed: boolean;
  rewardGold: number;
  rewardGem: number;
};

export type DailyQuestListResponse = {
  userId: number;
  questDate: string;
  dungeonKillCount: number;
  goldEarned: number;
  statUpgradeCount: number;
  quests: DailyQuestEntryResponse[];
};

export type DungeonProgressResponse = {
  userId: number;
  dungeonId: string;
  currentWave: number;
  maxUnlockedWave: number;
};

export async function signUpAccount(loginId: string, password: string): Promise<AccountResponse> {
  const response = await fetch('/api/v1/accounts/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId, password })
  });
  const body = (await response.json()) as ApiResponse<AccountResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to sign up account');
  }
  return body.data;
}

export async function loginAccount(loginId: string, password: string): Promise<AccountResponse> {
  const response = await fetch('/api/v1/accounts/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ loginId, password })
  });
  const body = (await response.json()) as ApiResponse<AccountResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to login account');
  }
  return body.data;
}

export async function createPlayer(
  accountId: number,
  nickname: string,
  classId: 'knight' | 'mage' | 'ranger'
): Promise<PlayerResponse> {
  const response = await fetch('/api/v1/players', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accountId, nickname, classId })
  });

  const body = (await response.json()) as ApiResponse<PlayerResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to create player');
  }
  return body.data;
}

export async function getPlayers(): Promise<PlayerResponse[]> {
  const response = await fetch('/api/v1/players');
  const body = (await response.json()) as ApiResponse<PlayerResponse[]>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load players');
  }
  return body.data;
}

export async function getPlayersByAccount(accountId: number): Promise<PlayerResponse[]> {
  const response = await fetch(`/api/v1/players/accounts/${accountId}`);
  const body = (await response.json()) as ApiResponse<PlayerResponse[]>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load account players');
  }
  return body.data;
}

export async function deletePlayer(playerId: number, accountId: number): Promise<void> {
  const response = await fetch(`/api/v1/players/${playerId}?accountId=${accountId}`, {
    method: 'DELETE'
  });
  const body = (await response.json()) as ApiResponse<null>;
  if (!body.success) {
    throw new Error(body.error?.message ?? 'Failed to delete player');
  }
}

export async function earnDungeonCurrency(
  userId: number,
  currencyType: 'GOLD' | 'GEM',
  amount: number,
  referenceId: string
): Promise<void> {
  if (amount <= 0) {
    return;
  }

  const response = await fetch('/api/v1/economy/earn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId,
      currencyType,
      amount,
      reasonCode: 'DUNGEON_CLEAR',
      referenceId
    })
  });

  const body = (await response.json()) as ApiResponse<WalletResponse>;
  if (!body.success) {
    throw new Error(body.error?.message ?? 'Failed to sync dungeon reward');
  }
}

export async function addDungeonScore(userId: number, scoreDelta: number): Promise<void> {
  const response = await fetch('/api/v1/rankings/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      seasonId: 'DUNGEON1',
      userId,
      scoreDelta
    })
  });

  const body = (await response.json()) as ApiResponse<RankingResponse>;
  if (!body.success) {
    throw new Error(body.error?.message ?? 'Failed to sync ranking score');
  }
}

export async function syncDungeonLoot(userId: number, items: LootSyncItem[]): Promise<void> {
  if (items.length === 0) {
    return;
  }

  const response = await fetch('/api/v1/items/loot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, items })
  });

  const body = (await response.json()) as ApiResponse<unknown>;
  if (!body.success) {
    throw new Error(body.error?.message ?? 'Failed to sync loot items');
  }
}

export async function getUserItems(userId: number): Promise<UserItemResponse[]> {
  const response = await fetch(`/api/v1/items/${userId}`);
  const body = (await response.json()) as ApiResponse<UserItemResponse[]>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load inventory');
  }
  return body.data;
}

export async function getItemCatalog(): Promise<ItemMasterResponse[]> {
  const response = await fetch('/api/v1/items/catalog');
  const body = await parseApiResponse<ItemMasterResponse[]>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load item catalog');
  }
  return body.data;
}

export async function getMonsterDropTable(monsterId: string): Promise<MonsterDropResponse[]> {
  const response = await fetch(`/api/v1/items/drop-table/${monsterId}`);
  const body = await parseApiResponse<MonsterDropResponse[]>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load monster drop table');
  }
  return body.data;
}

export async function consumeItem(userId: number, itemId: string, quantity = 1): Promise<UserItemResponse[]> {
  const response = await fetch('/api/v1/items/consume', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId, quantity })
  });
  const body = await parseApiResponse<UserItemResponse[]>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to consume item');
  }
  return body.data;
}

export async function getEquipment(userId: number): Promise<UserEquipmentResponse> {
  const response = await fetch(`/api/v1/items/equipment/${userId}`);
  const body = await parseApiResponse<UserEquipmentResponse>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load equipment');
  }
  return body.data;
}

export async function updateEquipment(
  userId: number,
  slot: 'weapon' | 'armor' | 'accessory',
  itemId: string | null
): Promise<UserEquipmentResponse> {
  const response = await fetch('/api/v1/items/equipment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, slot, itemId })
  });
  const body = await parseApiResponse<UserEquipmentResponse>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to update equipment');
  }
  return body.data;
}

export async function upgradeItem(userId: number, itemId: string): Promise<UserItemResponse> {
  const response = await fetch('/api/v1/items/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, itemId })
  });
  const body = await parseApiResponse<UserItemResponse>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to upgrade item');
  }
  return body.data;
}

export async function getEquipmentPresets(userId: number): Promise<UserEquipmentPresetResponse[]> {
  const response = await fetch(`/api/v1/items/equipment/presets/${userId}`);
  const body = await parseApiResponse<UserEquipmentPresetResponse[]>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load equipment presets');
  }
  return body.data;
}

export async function saveEquipmentPreset(userId: number, presetName: string): Promise<UserEquipmentPresetResponse> {
  const response = await fetch('/api/v1/items/equipment/presets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, presetName })
  });
  const body = await parseApiResponse<UserEquipmentPresetResponse>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to save equipment preset');
  }
  return body.data;
}

export async function applyEquipmentPreset(userId: number, presetName: string): Promise<UserEquipmentResponse> {
  const response = await fetch('/api/v1/items/equipment/presets/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, presetName })
  });
  const body = await parseApiResponse<UserEquipmentResponse>(response);
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to apply equipment preset');
  }
  return body.data;
}

export async function addDailyQuestProgress(
  userId: number,
  dungeonKillDelta: number,
  goldEarnedDelta: number,
  statUpgradeDelta: number
): Promise<void> {
  const response = await fetch('/api/v1/daily-quests/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, dungeonKillDelta, goldEarnedDelta, statUpgradeDelta })
  });

  const body = (await response.json()) as ApiResponse<DailyQuestStatusResponse>;
  if (!body.success) {
    throw new Error(body.error?.message ?? 'Failed to update daily quest progress');
  }
}

export async function getDungeonProgress(userId: number): Promise<DungeonProgressResponse> {
  const response = await fetch(`/api/v1/dungeons/dungeon1/progress/${userId}`);
  const body = (await response.json()) as ApiResponse<DungeonProgressResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load dungeon progress');
  }
  return body.data;
}

export async function updateDungeonProgress(
  userId: number,
  currentWave: number,
  maxUnlockedWave: number
): Promise<DungeonProgressResponse> {
  const response = await fetch('/api/v1/dungeons/dungeon1/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, currentWave, maxUnlockedWave })
  });
  const body = (await response.json()) as ApiResponse<DungeonProgressResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to update dungeon progress');
  }
  return body.data;
}

export async function getDailyQuestStatus(userId: number): Promise<DailyQuestStatusResponse> {
  const response = await fetch(`/api/v1/daily-quests/${userId}`);
  const body = (await response.json()) as ApiResponse<DailyQuestStatusResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load daily quest status');
  }
  return body.data;
}

export async function getDailyQuestList(userId: number): Promise<DailyQuestListResponse> {
  const response = await fetch(`/api/v1/daily-quests/list/${userId}`);
  const body = (await response.json()) as ApiResponse<DailyQuestListResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load daily quest list');
  }
  return body.data;
}

export async function claimDailyQuest(userId: number): Promise<DailyQuestStatusResponse> {
  const response = await fetch('/api/v1/daily-quests/claim', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId })
  });

  const body = (await response.json()) as ApiResponse<DailyQuestStatusResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to claim daily quest reward');
  }
  return body.data;
}

export async function claimDailyQuestOne(userId: number, questCode: string): Promise<DailyQuestListResponse> {
  const response = await fetch('/api/v1/daily-quests/claim-one', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, questCode })
  });
  const body = (await response.json()) as ApiResponse<DailyQuestListResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to claim daily quest');
  }
  return body.data;
}

export async function getWallet(userId: number): Promise<WalletResponse> {
  const response = await fetch(`/api/v1/wallets/${userId}`);
  const body = (await response.json()) as ApiResponse<WalletResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load wallet');
  }
  return body.data;
}

export async function getCharacterStats(userId: number): Promise<CharacterStatResponse> {
  const response = await fetch(`/api/v1/characters/${userId}`);
  const body = (await response.json()) as ApiResponse<CharacterStatResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load character stats');
  }
  return body.data;
}

export async function getCompanionMasters(): Promise<CompanionMasterResponse[]> {
  const response = await fetch('/api/v1/companions/masters');
  const body = (await response.json()) as ApiResponse<CompanionMasterResponse[]>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load companion masters');
  }
  return body.data;
}

export async function getUserCompanions(userId: number): Promise<UserCompanionResponse[]> {
  const response = await fetch(`/api/v1/companions/${userId}`);
  const body = (await response.json()) as ApiResponse<UserCompanionResponse[]>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load user companions');
  }
  return body.data;
}

export async function getCompanionPartyBonus(userId: number): Promise<CompanionPartyBonusResponse> {
  const response = await fetch(`/api/v1/companions/${userId}/party`);
  const body = (await response.json()) as ApiResponse<CompanionPartyBonusResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to load companion party');
  }
  return body.data;
}

export async function recruitCompanions(userId: number, count: 1 | 10): Promise<UserCompanionResponse[]> {
  const response = await fetch('/api/v1/companions/recruit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, count })
  });
  const body = (await response.json()) as ApiResponse<UserCompanionResponse[]>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to recruit companions');
  }
  return body.data;
}

export async function assignCompanion(userId: number, userCompanionId: number, slotNo: number | null): Promise<UserCompanionResponse[]> {
  const response = await fetch('/api/v1/companions/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userCompanionId, slotNo })
  });
  const body = (await response.json()) as ApiResponse<UserCompanionResponse[]>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to assign companion');
  }
  return body.data;
}

export async function fuseCompanion(userId: number, userCompanionId: number): Promise<UserCompanionResponse> {
  const response = await fetch('/api/v1/companions/fuse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, userCompanionId })
  });
  const body = (await response.json()) as ApiResponse<UserCompanionResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to fuse companion');
  }
  return body.data;
}

export async function upgradeCharacterStat(
  userId: number,
  statType: CharacterStatType
): Promise<CharacterStatResponse> {
  const response = await fetch('/api/v1/characters/upgrade', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, statType })
  });

  const body = (await response.json()) as ApiResponse<CharacterStatResponse>;
  if (!body.success || !body.data) {
    throw new Error(body.error?.message ?? 'Failed to upgrade stat');
  }
  return body.data;
}
