import { CoreStats } from '../combat/types';
import { getRuntimeBalanceProfile } from './dbBalanceAdapter';

export const DEFAULT_COMBAT_BALANCE = {
  damage: {
    critMultiplier: 1.5,
    defenseBlockMultiplier: 0.7,
    minDamage: 1
  },
  scene: {
    heroBasicCritChance: 0.14,
    heroSkillBaseCritChance: 0.16,
    monsterBasicCritChance: 0.08,
    breakArmorDefensePenetration: 6,
    arcaneEchoAttackRatio: 0.55,
    arcaneEchoCritRatio: 0.45,
    arcaneEchoMinCritChance: 0.05,
    vampiricLifestealRatio: 0.3,
    vampiricMinHeal: 6,
    monsterTurnMpRecovery: 4
  },
  leveling: {
    expBase: 70,
    expPerLevel: 35,
    levelUpBonus: {
      maxHp: 12,
      maxMp: 6,
      attack: 2,
      defense: 1
    } as CoreStats
  }
} as const;

export function resolveCombatBalance() {
  const profile = getRuntimeBalanceProfile();
  const patch = profile?.combat;
  if (!patch) return DEFAULT_COMBAT_BALANCE;

  return {
    damage: {
      critMultiplier: Math.max(1, patch.damage?.critMultiplier ?? DEFAULT_COMBAT_BALANCE.damage.critMultiplier),
      defenseBlockMultiplier: Math.max(0, patch.damage?.defenseBlockMultiplier ?? DEFAULT_COMBAT_BALANCE.damage.defenseBlockMultiplier),
      minDamage: Math.max(1, Math.floor(patch.damage?.minDamage ?? DEFAULT_COMBAT_BALANCE.damage.minDamage))
    },
    scene: {
      heroBasicCritChance: Math.max(0, patch.scene?.heroBasicCritChance ?? DEFAULT_COMBAT_BALANCE.scene.heroBasicCritChance),
      heroSkillBaseCritChance: Math.max(0, patch.scene?.heroSkillBaseCritChance ?? DEFAULT_COMBAT_BALANCE.scene.heroSkillBaseCritChance),
      monsterBasicCritChance: Math.max(0, patch.scene?.monsterBasicCritChance ?? DEFAULT_COMBAT_BALANCE.scene.monsterBasicCritChance),
      breakArmorDefensePenetration: Math.max(
        0,
        patch.scene?.breakArmorDefensePenetration ?? DEFAULT_COMBAT_BALANCE.scene.breakArmorDefensePenetration
      ),
      arcaneEchoAttackRatio: Math.max(0, patch.scene?.arcaneEchoAttackRatio ?? DEFAULT_COMBAT_BALANCE.scene.arcaneEchoAttackRatio),
      arcaneEchoCritRatio: Math.max(0, patch.scene?.arcaneEchoCritRatio ?? DEFAULT_COMBAT_BALANCE.scene.arcaneEchoCritRatio),
      arcaneEchoMinCritChance: Math.max(0, patch.scene?.arcaneEchoMinCritChance ?? DEFAULT_COMBAT_BALANCE.scene.arcaneEchoMinCritChance),
      vampiricLifestealRatio: Math.max(0, patch.scene?.vampiricLifestealRatio ?? DEFAULT_COMBAT_BALANCE.scene.vampiricLifestealRatio),
      vampiricMinHeal: Math.max(0, patch.scene?.vampiricMinHeal ?? DEFAULT_COMBAT_BALANCE.scene.vampiricMinHeal),
      monsterTurnMpRecovery: Math.max(0, patch.scene?.monsterTurnMpRecovery ?? DEFAULT_COMBAT_BALANCE.scene.monsterTurnMpRecovery)
    },
    leveling: {
      expBase: Math.max(1, patch.leveling?.expBase ?? DEFAULT_COMBAT_BALANCE.leveling.expBase),
      expPerLevel: Math.max(0, patch.leveling?.expPerLevel ?? DEFAULT_COMBAT_BALANCE.leveling.expPerLevel),
      levelUpBonus: {
        maxHp: Math.max(0, patch.leveling?.levelUpBonus?.maxHp ?? DEFAULT_COMBAT_BALANCE.leveling.levelUpBonus.maxHp),
        maxMp: Math.max(0, patch.leveling?.levelUpBonus?.maxMp ?? DEFAULT_COMBAT_BALANCE.leveling.levelUpBonus.maxMp),
        attack: Math.max(0, patch.leveling?.levelUpBonus?.attack ?? DEFAULT_COMBAT_BALANCE.leveling.levelUpBonus.attack),
        defense: Math.max(0, patch.leveling?.levelUpBonus?.defense ?? DEFAULT_COMBAT_BALANCE.leveling.levelUpBonus.defense)
      }
    }
  };
}

export function getCombatBalance() {
  return resolveCombatBalance();
}

export function calcRequiredExp(level: number): number {
  const balance = getCombatBalance();
  return balance.leveling.expBase + level * balance.leveling.expPerLevel;
}
