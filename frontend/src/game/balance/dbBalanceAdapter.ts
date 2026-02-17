import { CoreStats } from '../combat/types';
import { CharacterClassId } from '../types';

export type ClassBalanceOverride = {
  label?: string;
  color?: number;
  baseStats?: Partial<CoreStats>;
  activeSkill?: {
    name?: string;
    cooldownMs?: number;
    mpCost?: number;
    attackBonus?: number;
    critBonus?: number;
    effect?: 'BREAK_ARMOR' | 'ARCANE_ECHO' | 'VAMPIRIC_SHOT';
  };
  skillTree?: Array<{
    id?: string;
    name?: string;
    requiredLevel?: number;
    description?: string;
    bonus?: Partial<CoreStats>;
  }>;
};

export type CombatBalanceOverride = {
  damage?: {
    critMultiplier?: number;
    defenseBlockMultiplier?: number;
    minDamage?: number;
  };
  scene?: {
    heroBasicCritChance?: number;
    heroSkillBaseCritChance?: number;
    monsterBasicCritChance?: number;
    breakArmorDefensePenetration?: number;
    arcaneEchoAttackRatio?: number;
    arcaneEchoCritRatio?: number;
    arcaneEchoMinCritChance?: number;
    vampiricLifestealRatio?: number;
    vampiricMinHeal?: number;
    monsterTurnMpRecovery?: number;
  };
  leveling?: {
    expBase?: number;
    expPerLevel?: number;
    levelUpBonus?: Partial<CoreStats>;
  };
};

export type DungeonWaveBalanceOverride = {
  monstersPerWave?: {
    baseCount?: number;
    growthEveryWave?: number;
    maxCount?: number;
  };
  scaling?: {
    hpPerWave?: number;
    hpPerDungeonTier?: number;
    hpPerSequence?: number;
    mpPerWave?: number;
    attackPerWave?: number;
    attackPerDungeonTier?: number;
    attackPerSequence?: number;
    defensePerWave?: number;
    defensePerDungeonTier?: number;
    defensePerSequence?: number;
  };
  dungeonTier?: {
    cycleWaveSize?: number;
    wavePerDungeonTheme?: number;
  };
};

export type MonsterCatalogOverride = Array<{
  id: string;
  name: string;
  color: number;
  stats: CoreStats;
  reward: { gold: number; gem: number; exp: number; score: number };
  drops: Array<{ itemId: string; name: string; chance: number }>;
  equipmentDrops: Array<{ itemId: string; name: string; chance: number }>;
}>;

export type BalanceProfile = {
  classes?: Partial<Record<CharacterClassId, ClassBalanceOverride>>;
  combat?: CombatBalanceOverride;
  dungeon?: DungeonWaveBalanceOverride;
  monsters?: {
    dungeon1?: MonsterCatalogOverride;
  };
};

let cachedProfile: BalanceProfile | null | undefined;
const PROFILE_STORAGE_KEY = 'autogame.balance.profile';

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function parseJsonObject(raw: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
    return parsed as Record<string, unknown>;
  } catch {
    return null;
  }
}

function sanitizeCoreStats(stats: Partial<CoreStats> | undefined): Partial<CoreStats> {
  if (!stats) return {};
  return {
    maxHp: isFiniteNumber(stats.maxHp) ? stats.maxHp : undefined,
    maxMp: isFiniteNumber(stats.maxMp) ? stats.maxMp : undefined,
    attack: isFiniteNumber(stats.attack) ? stats.attack : undefined,
    defense: isFiniteNumber(stats.defense) ? stats.defense : undefined
  };
}

function sanitizeProfile(raw: Record<string, unknown>): BalanceProfile {
  const profile: BalanceProfile = {};

  const classes = raw.classes;
  if (classes && typeof classes === 'object' && !Array.isArray(classes)) {
    const next: Partial<Record<CharacterClassId, ClassBalanceOverride>> = {};
    (['knight', 'mage', 'ranger'] as CharacterClassId[]).forEach((classId) => {
      const value = (classes as Record<string, unknown>)[classId];
      if (!value || typeof value !== 'object' || Array.isArray(value)) return;
      const row = value as Record<string, unknown>;
      const baseStats = row.baseStats as Partial<CoreStats> | undefined;
      const activeSkill = row.activeSkill as ClassBalanceOverride['activeSkill'];
      const skillTreeRaw = row.skillTree;
      const skillTree = Array.isArray(skillTreeRaw)
        ? skillTreeRaw
            .filter((node) => node && typeof node === 'object' && !Array.isArray(node))
            .map((node) => {
              const item = node as Record<string, unknown>;
              return {
                id: typeof item.id === 'string' ? item.id : undefined,
                name: typeof item.name === 'string' ? item.name : undefined,
                requiredLevel: isFiniteNumber(item.requiredLevel) ? item.requiredLevel : undefined,
                description: typeof item.description === 'string' ? item.description : undefined,
                bonus: sanitizeCoreStats(item.bonus as Partial<CoreStats> | undefined)
              };
            })
        : undefined;

      next[classId] = {
        label: typeof row.label === 'string' ? row.label : undefined,
        color: isFiniteNumber(row.color) ? row.color : undefined,
        baseStats: sanitizeCoreStats(baseStats),
        activeSkill,
        skillTree
      };
    });
    profile.classes = next;
  }

  const combat = raw.combat;
  if (combat && typeof combat === 'object' && !Array.isArray(combat)) {
    profile.combat = combat as CombatBalanceOverride;
  }

  const dungeon = raw.dungeon;
  if (dungeon && typeof dungeon === 'object' && !Array.isArray(dungeon)) {
    profile.dungeon = dungeon as DungeonWaveBalanceOverride;
  }

  const monsters = raw.monsters;
  if (monsters && typeof monsters === 'object' && !Array.isArray(monsters)) {
    const dungeon1 = (monsters as Record<string, unknown>).dungeon1;
    if (Array.isArray(dungeon1)) {
      profile.monsters = {
        dungeon1: dungeon1 as MonsterCatalogOverride
      };
    }
  }

  return profile;
}

function loadRawBalanceProfileJson(): string | null {
  const envJson = import.meta.env.VITE_BALANCE_PROFILE_JSON as string | undefined;
  if (envJson && envJson.trim()) {
    return envJson;
  }

  if (typeof window !== 'undefined') {
    const fromStorage = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (fromStorage && fromStorage.trim()) return fromStorage;
  }

  return null;
}

export function getRuntimeBalanceProfile(): BalanceProfile | null {
  if (cachedProfile !== undefined) {
    return cachedProfile;
  }

  const rawJson = loadRawBalanceProfileJson();
  if (!rawJson) {
    cachedProfile = null;
    return cachedProfile;
  }

  const parsed = parseJsonObject(rawJson);
  if (!parsed) {
    cachedProfile = null;
    return cachedProfile;
  }

  cachedProfile = sanitizeProfile(parsed);
  return cachedProfile;
}

export function setRuntimeBalanceProfile(profile: Record<string, unknown> | null): void {
  if (profile == null) {
    cachedProfile = null;
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY);
    }
    return;
  }

  const sanitized = sanitizeProfile(profile);
  cachedProfile = sanitized;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }
}

export function clearRuntimeBalanceProfileCache(): void {
  cachedProfile = undefined;
}
