export type CoreStats = {
  maxHp: number;
  maxMp: number;
  attack: number;
  defense: number;
};

export type FighterState = {
  hp: number;
  mp: number;
};

export type AttackResult = {
  damage: number;
  blocked: number;
  targetHpAfter: number;
  critical: boolean;
};
