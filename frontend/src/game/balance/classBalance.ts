import { CoreStats } from '../combat/types';
import { CharacterClassId } from '../types';
import { getRuntimeBalanceProfile } from './dbBalanceAdapter';

export type SkillBonus = Partial<Pick<CoreStats, 'maxHp' | 'maxMp' | 'attack' | 'defense'>>;

export type SkillNode = {
  id: string;
  name: string;
  requiredLevel: number;
  description: string;
  bonus: SkillBonus;
};

export type ActiveSkillEffect = 'BREAK_ARMOR' | 'ARCANE_ECHO' | 'VAMPIRIC_SHOT';

export type ActiveSkillDefinition = {
  name: string;
  cooldownMs: number;
  mpCost: number;
  attackBonus: number;
  critBonus: number;
  effect: ActiveSkillEffect;
};

export type ClassDefinition = {
  id: CharacterClassId;
  label: string;
  color: number;
  baseStats: CoreStats;
  activeSkill: ActiveSkillDefinition;
  skillTree: SkillNode[];
};

export const DEFAULT_CLASS_DEFINITIONS: Record<CharacterClassId, ClassDefinition> = {
  knight: {
    id: 'knight',
    label: 'Knight',
    color: 0x4cb8ff,
    baseStats: { maxHp: 240, maxMp: 70, attack: 26, defense: 10 },
    activeSkill: {
      name: 'Shield Break',
      cooldownMs: 2800,
      mpCost: 20,
      attackBonus: 20,
      critBonus: 0.15,
      effect: 'BREAK_ARMOR'
    },
    skillTree: [
      { id: 'k1', name: 'Steel Body', requiredLevel: 2, description: 'HP +40 / DEF +2', bonus: { maxHp: 40, defense: 2 } },
      { id: 'k2', name: 'Heavy Slash', requiredLevel: 4, description: 'ATK +8', bonus: { attack: 8 } }
    ]
  },
  mage: {
    id: 'mage',
    label: 'Mage',
    color: 0xb58bff,
    baseStats: { maxHp: 180, maxMp: 120, attack: 30, defense: 5 },
    activeSkill: {
      name: 'Arc Burst',
      cooldownMs: 2400,
      mpCost: 24,
      attackBonus: 26,
      critBonus: 0.2,
      effect: 'ARCANE_ECHO'
    },
    skillTree: [
      { id: 'm1', name: 'Mana Core', requiredLevel: 2, description: 'MP +35 / ATK +4', bonus: { maxMp: 35, attack: 4 } },
      { id: 'm2', name: 'Barrier', requiredLevel: 4, description: 'DEF +4 / HP +20', bonus: { defense: 4, maxHp: 20 } }
    ]
  },
  ranger: {
    id: 'ranger',
    label: 'Ranger',
    color: 0x6df08a,
    baseStats: { maxHp: 210, maxMp: 90, attack: 28, defense: 7 },
    activeSkill: {
      name: 'Rapid Shot',
      cooldownMs: 2200,
      mpCost: 18,
      attackBonus: 18,
      critBonus: 0.22,
      effect: 'VAMPIRIC_SHOT'
    },
    skillTree: [
      { id: 'r1', name: 'Precise Aim', requiredLevel: 2, description: 'ATK +6', bonus: { attack: 6 } },
      { id: 'r2', name: 'Light Step', requiredLevel: 4, description: 'MP +25 / DEF +2', bonus: { maxMp: 25, defense: 2 } }
    ]
  }
};

function normalizeStats(base: CoreStats, override?: Partial<CoreStats>): CoreStats {
  if (!override) return base;
  return {
    maxHp: Math.max(1, override.maxHp ?? base.maxHp),
    maxMp: Math.max(1, override.maxMp ?? base.maxMp),
    attack: Math.max(1, override.attack ?? base.attack),
    defense: Math.max(0, override.defense ?? base.defense)
  };
}

function mergeSkillNode(base: SkillNode, override?: Partial<SkillNode>): SkillNode {
  return {
    id: override?.id ?? base.id,
    name: override?.name ?? base.name,
    requiredLevel: Math.max(1, override?.requiredLevel ?? base.requiredLevel),
    description: override?.description ?? base.description,
    bonus: {
      maxHp: override?.bonus?.maxHp ?? base.bonus.maxHp,
      maxMp: override?.bonus?.maxMp ?? base.bonus.maxMp,
      attack: override?.bonus?.attack ?? base.bonus.attack,
      defense: override?.bonus?.defense ?? base.bonus.defense
    }
  };
}

export function resolveClassDefinitions(): Record<CharacterClassId, ClassDefinition> {
  const profile = getRuntimeBalanceProfile();
  const override = profile?.classes;
  if (!override) return DEFAULT_CLASS_DEFINITIONS as Record<CharacterClassId, ClassDefinition>;

  const merged = { ...DEFAULT_CLASS_DEFINITIONS } as Record<CharacterClassId, ClassDefinition>;
  Object.keys(DEFAULT_CLASS_DEFINITIONS).forEach((classId) => {
    const base = DEFAULT_CLASS_DEFINITIONS[classId];
    const patch = override[classId];
    if (!patch) return;

    merged[classId] = {
      ...base,
      label: patch.label ?? base.label,
      color: patch.color ?? base.color,
      baseStats: normalizeStats(base.baseStats, patch.baseStats),
      activeSkill: {
        name: patch.activeSkill?.name ?? base.activeSkill.name,
        cooldownMs: Math.max(300, patch.activeSkill?.cooldownMs ?? base.activeSkill.cooldownMs),
        mpCost: Math.max(0, patch.activeSkill?.mpCost ?? base.activeSkill.mpCost),
        attackBonus: Math.max(0, patch.activeSkill?.attackBonus ?? base.activeSkill.attackBonus),
        critBonus: Math.max(0, patch.activeSkill?.critBonus ?? base.activeSkill.critBonus),
        effect: patch.activeSkill?.effect ?? base.activeSkill.effect
      },
      skillTree: base.skillTree.map((skill, idx) => mergeSkillNode(skill, patch.skillTree?.[idx]))
    };
  });

  Object.entries(override).forEach(([classId, patch]) => {
    if (!patch || merged[classId]) return;
    const base = DEFAULT_CLASS_DEFINITIONS.knight;
    merged[classId] = {
      ...base,
      id: classId,
      label: patch.label ?? classId,
      color: patch.color ?? base.color,
      baseStats: normalizeStats(base.baseStats, patch.baseStats),
      activeSkill: {
        name: patch.activeSkill?.name ?? base.activeSkill.name,
        cooldownMs: Math.max(300, patch.activeSkill?.cooldownMs ?? base.activeSkill.cooldownMs),
        mpCost: Math.max(0, patch.activeSkill?.mpCost ?? base.activeSkill.mpCost),
        attackBonus: Math.max(0, patch.activeSkill?.attackBonus ?? base.activeSkill.attackBonus),
        critBonus: Math.max(0, patch.activeSkill?.critBonus ?? base.activeSkill.critBonus),
        effect: patch.activeSkill?.effect ?? base.activeSkill.effect
      },
      skillTree: base.skillTree.map((skill, idx) => mergeSkillNode(skill, patch.skillTree?.[idx]))
    };
  });

  return merged;
}

export function getClassDefinitions(): Record<CharacterClassId, ClassDefinition> {
  return resolveClassDefinitions();
}

export const CLASS_SELECT_OPTIONS: Array<{ id: CharacterClassId; label: string }> = [
  { id: 'knight', label: 'Knight' },
  { id: 'mage', label: 'Mage' },
  { id: 'ranger', label: 'Ranger' }
];
