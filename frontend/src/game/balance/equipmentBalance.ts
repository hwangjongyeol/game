import { CoreStats } from '../combat/types';

export type EquipmentSlot = 'weapon' | 'armor' | 'accessory';

export type EquipmentUiMeta = {
  slot: EquipmentSlot;
  label: string;
  effect: string;
  rarity: 'rare' | 'epic' | 'legend';
  icon: string;
};

type SetBonusRule = {
  key: string;
  requiredCount: number;
  itemIds: string[];
  bonus: CoreStats;
  label: string;
};

const LEGACY_EQUIP_BASE_AND_STEP: Record<
  string,
  { base: CoreStats; step: CoreStats }
> = {
  'flame-sword': { base: { maxHp: 0, maxMp: 0, attack: 14, defense: 0 }, step: { maxHp: 0, maxMp: 0, attack: 3, defense: 0 } },
  'rusty-dagger': { base: { maxHp: 0, maxMp: 0, attack: 6, defense: 0 }, step: { maxHp: 0, maxMp: 0, attack: 2, defense: 0 } },
  'iron-helm': { base: { maxHp: 70, maxMp: 0, attack: 0, defense: 3 }, step: { maxHp: 12, maxMp: 0, attack: 0, defense: 1 } },
  'guardian-charm': { base: { maxHp: 20, maxMp: 0, attack: 0, defense: 5 }, step: { maxHp: 8, maxMp: 0, attack: 0, defense: 1 } },
  'hunter-ring': { base: { maxHp: 0, maxMp: 35, attack: 6, defense: 0 }, step: { maxHp: 0, maxMp: 10, attack: 2, defense: 0 } }
};

const SET_BONUS_RULES: SetBonusRule[] = [
  {
    key: 'fortress-2',
    requiredCount: 2,
    itemIds: ['flame-sword', 'iron-helm', 'guardian-charm'],
    bonus: { maxHp: 80, maxMp: 0, attack: 0, defense: 4 },
    label: 'Fortress 2세트: HP +80 / DEF +4'
  },
  {
    key: 'fortress-3',
    requiredCount: 3,
    itemIds: ['flame-sword', 'iron-helm', 'guardian-charm'],
    bonus: { maxHp: 140, maxMp: 0, attack: 10, defense: 4 },
    label: 'Fortress 3세트: HP +140 / ATK +10 / DEF +4'
  },
  {
    key: 'hunter-2',
    requiredCount: 2,
    itemIds: ['rusty-dagger', 'hunter-ring'],
    bonus: { maxHp: 0, maxMp: 30, attack: 8, defense: 0 },
    label: 'Hunter 2세트: ATK +8 / MP +30'
  }
];

export const EQUIPMENT_UI_META: Record<string, EquipmentUiMeta> = {
  'flame-sword': { slot: 'weapon', label: 'Flame Sword', effect: 'ATK +14', rarity: 'legend', icon: '⚔' },
  'rusty-dagger': { slot: 'weapon', label: 'Rusty Dagger', effect: 'ATK +6', rarity: 'rare', icon: '🗡' },
  'iron-helm': { slot: 'armor', label: 'Iron Helm', effect: 'HP +70 / DEF +3', rarity: 'epic', icon: '🛡' },
  'guardian-charm': { slot: 'accessory', label: 'Guardian Charm', effect: 'DEF +5 / HP +20', rarity: 'epic', icon: '✦' },
  'hunter-ring': { slot: 'accessory', label: 'Hunter Ring', effect: 'ATK +6 / MP +35', rarity: 'legend', icon: '◉' }
};

export const EQUIPMENT_RARITY_SORT_WEIGHT: Record<string, number> = {
  'flame-sword': 5,
  'ancient-core': 4,
  'hunter-ring': 4,
  'iron-helm': 3,
  'guardian-charm': 3,
  'rusty-dagger': 3,
  'minor-potion': 2,
  'goblin-coin': 2,
  'bone-fragment': 1,
  'slime-gel': 1
};

export const DEFAULT_UPGRADE_GOLD_BASE = 150;

export function calcItemUpgradeGoldCost(level: number, upgradeGoldBase = DEFAULT_UPGRADE_GOLD_BASE): number {
  const next = level + 1;
  const base = Math.max(1, upgradeGoldBase);
  return base * next * next;
}

export function getLegacyEquipBonus(itemId: string, lv: number): CoreStats {
  const def = LEGACY_EQUIP_BASE_AND_STEP[itemId];
  if (!def) {
    return { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
  }
  return {
    maxHp: def.base.maxHp + def.step.maxHp * lv,
    maxMp: def.base.maxMp + def.step.maxMp * lv,
    attack: def.base.attack + def.step.attack * lv,
    defense: def.base.defense + def.step.defense * lv
  };
}

export function calcSetBonus(equippedItemIds: Iterable<string>): CoreStats {
  const equipped = new Set(equippedItemIds);
  const total: CoreStats = { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };

  for (const rule of SET_BONUS_RULES) {
    const count = rule.itemIds.filter((id) => equipped.has(id)).length;
    if (count < rule.requiredCount) continue;
    total.maxHp += rule.bonus.maxHp;
    total.maxMp += rule.bonus.maxMp;
    total.attack += rule.bonus.attack;
    total.defense += rule.bonus.defense;
  }
  return total;
}

export function describeActiveSetEffects(equippedItemIds: Iterable<string>): string[] {
  const equipped = new Set(equippedItemIds);
  const lines: string[] = [];
  for (const rule of SET_BONUS_RULES) {
    const count = rule.itemIds.filter((id) => equipped.has(id)).length;
    if (count >= rule.requiredCount) {
      lines.push(rule.label);
    }
  }
  return lines;
}

export const ITEM_PASSIVE_BONUS = {
  boneFragmentHp: 8,
  ancientCoreMp: 10,
  ancientCoreAttack: 2,
  goblinCoinDefenseEvery: 3
} as const;

export const CONSUMABLE_EFFECT = {
  slimeGelHeal: 15,
  minorPotionHealHp: 40,
  minorPotionRecoverMp: 25
} as const;
