import { getCombatBalance } from '../balance/combatBalance';
import { AttackResult, CoreStats, FighterState } from './types';

export function calcBasicAttack(
  attacker: CoreStats,
  target: CoreStats,
  targetState: FighterState,
  critChance = 0.1
): AttackResult {
  const combatBalance = getCombatBalance();
  const critical = Math.random() < critChance;
  const raw = critical ? Math.floor(attacker.attack * combatBalance.damage.critMultiplier) : attacker.attack;
  const blocked = Math.floor(target.defense * combatBalance.damage.defenseBlockMultiplier);
  const damage = Math.max(combatBalance.damage.minDamage, raw - blocked);
  const targetHpAfter = Math.max(0, targetState.hp - damage);

  return {
    damage,
    blocked,
    targetHpAfter,
    critical
  };
}

export function canUseSkill(state: FighterState, mpCost: number): boolean {
  return state.mp >= mpCost;
}
