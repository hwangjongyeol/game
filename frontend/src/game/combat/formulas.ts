import { AttackResult, CoreStats, FighterState } from './types';

export function calcBasicAttack(
  attacker: CoreStats,
  target: CoreStats,
  targetState: FighterState,
  critChance = 0.1
): AttackResult {
  const critical = Math.random() < critChance;
  const raw = critical ? Math.floor(attacker.attack * 1.5) : attacker.attack;
  const blocked = Math.floor(target.defense * 0.7);
  const damage = Math.max(1, raw - blocked);
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
