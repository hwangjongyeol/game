import { CharacterClassId } from '../types';
import { CoreStats } from '../combat/types';

export type SkillBonus = Partial<Pick<CoreStats, 'maxHp' | 'maxMp' | 'attack' | 'defense'>>;

export type SkillNode = {
  id: string;
  name: string;
  requiredLevel: number;
  description: string;
  bonus: SkillBonus;
};

export type ClassDefinition = {
  id: CharacterClassId;
  label: string;
  color: number;
  baseStats: CoreStats;
  activeSkill: {
    name: string;
    cooldownMs: number;
    mpCost: number;
    attackBonus: number;
    critBonus: number;
    effect: 'BREAK_ARMOR' | 'ARCANE_ECHO' | 'VAMPIRIC_SHOT';
  };
  skillTree: SkillNode[];
};

export const classDefinitions: Record<CharacterClassId, ClassDefinition> = {
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

export const classSelectOptions: Array<{ id: CharacterClassId; label: string }> = [
  { id: 'knight', label: 'Knight' },
  { id: 'mage', label: 'Mage' },
  { id: 'ranger', label: 'Ranger' }
];
