import { CoreStats, FighterState } from '../combat/types';
import { SkillBonus } from './classes';

export class Fighter {
  readonly name: string;
  stats: CoreStats;
  readonly state: FighterState;

  constructor(name: string, stats: CoreStats) {
    this.name = name;
    this.stats = { ...stats };
    this.state = {
      hp: stats.maxHp,
      mp: stats.maxMp
    };
  }

  setStats(stats: CoreStats): void {
    this.stats = {
      maxHp: Math.max(1, stats.maxHp),
      maxMp: Math.max(1, stats.maxMp),
      attack: Math.max(1, stats.attack),
      defense: Math.max(0, stats.defense)
    };
    this.state.hp = Math.max(0, Math.min(this.state.hp, this.stats.maxHp));
    this.state.mp = Math.max(0, Math.min(this.state.mp, this.stats.maxMp));
  }

  applyBonus(bonus: SkillBonus): void {
    this.stats = {
      maxHp: Math.max(1, this.stats.maxHp + (bonus.maxHp ?? 0)),
      maxMp: Math.max(1, this.stats.maxMp + (bonus.maxMp ?? 0)),
      attack: Math.max(1, this.stats.attack + (bonus.attack ?? 0)),
      defense: Math.max(0, this.stats.defense + (bonus.defense ?? 0))
    };

    this.state.hp = Math.max(0, Math.min(this.stats.maxHp, this.state.hp + (bonus.maxHp ?? 0)));
    this.state.mp = Math.max(0, Math.min(this.stats.maxMp, this.state.mp + (bonus.maxMp ?? 0)));
  }

  isAlive(): boolean {
    return this.state.hp > 0;
  }

  receiveDamage(nextHp: number): void {
    this.state.hp = Math.max(0, Math.min(this.stats.maxHp, nextHp));
  }

  spendMp(cost: number): boolean {
    if (this.state.mp < cost) {
      return false;
    }
    this.state.mp -= cost;
    return true;
  }

  recoverMp(amount: number): void {
    this.state.mp = Math.min(this.stats.maxMp, this.state.mp + amount);
  }

  reset(): void {
    this.state.hp = this.stats.maxHp;
    this.state.mp = this.stats.maxMp;
  }
}
