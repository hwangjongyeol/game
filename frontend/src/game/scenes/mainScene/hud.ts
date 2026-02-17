import Phaser from 'phaser';

type CombatUnitView = {
  state: { hp: number; mp: number };
  stats: { maxHp: number; maxMp: number; attack: number; defense: number };
};

export function hudStyle(): Phaser.Types.GameObjects.Text.TextStyle {
  return { fontFamily: 'Verdana', fontSize: '17px', color: '#e6f0ff' };
}

export function resolveSkillHudTheme(classId: string): { barColor: number; trackColor: number; textColor: string; iconText: string } {
  if (classId === 'knight') {
    return { barColor: 0x5ec4ff, trackColor: 0x1d3550, textColor: '#d9f2ff', iconText: 'BRK' };
  }
  if (classId === 'mage') {
    return { barColor: 0xcd8bff, trackColor: 0x332049, textColor: '#f1ddff', iconText: 'ARC' };
  }
  return { barColor: 0x7dffa0, trackColor: 0x1f3a2b, textColor: '#dbffe8', iconText: 'RPD' };
}

export function buildHudText(args: {
  nickname: string;
  heroLevel: number;
  classLabel: string;
  waveLabel: string;
  hero: CombatUnitView;
  monster: CombatUnitView;
  defeatedInWave: number;
  monstersPerWave: number;
  battleSpeed: number;
}): {
  heroInfo: string;
  heroHp: string;
  heroMp: string;
  monsterHp: string;
  monsterMp: string;
  rexLabel: string;
} {
  return {
    heroInfo: `${args.nickname} Lv.${args.heroLevel} (${args.classLabel})  Wave ${args.waveLabel}`,
    heroHp: `Hero HP ${args.hero.state.hp}/${args.hero.stats.maxHp}  ATK ${args.hero.stats.attack}`,
    heroMp: `Hero MP ${args.hero.state.mp}/${args.hero.stats.maxMp}  DEF ${args.hero.stats.defense}`,
    monsterHp: `Monster HP ${args.monster.state.hp}/${args.monster.stats.maxHp}  (${args.defeatedInWave + 1}/${args.monstersPerWave})`,
    monsterMp: `Monster MP ${args.monster.state.mp}/${args.monster.stats.maxMp}  DEF ${args.monster.stats.defense}`,
    rexLabel: `RexUI Combat HUD / ${args.battleSpeed}x / Wave ${args.waveLabel}`
  };
}
