import { getRuntimeBalanceProfile } from './dbBalanceAdapter';
import type { MonsterDefinition } from '../entities/monsters';

// 1차 리팩토링: 몬스터 수치 카탈로그를 분리해 추후 DB 응답으로 치환하기 쉬운 구조로 정리
const DEFAULT_DUNGEON1_MONSTER_CATALOG: MonsterDefinition[] = [
  {
    id: 'slime-green',
    name: 'Green Slime',
    color: 0x83ff93,
    stats: { maxHp: 170, maxMp: 40, attack: 16, defense: 5 },
    reward: { gold: 45, gem: 1, exp: 35, score: 12 },
    drops: [
      { itemId: 'slime-gel', name: 'Slime Gel', chance: 0.7 },
      { itemId: 'minor-potion', name: 'Minor Potion', chance: 0.2 }
    ],
    equipmentDrops: []
  },
  {
    id: 'goblin-guard',
    name: 'Goblin Guard',
    color: 0xc8f574,
    stats: { maxHp: 210, maxMp: 50, attack: 20, defense: 8 },
    reward: { gold: 65, gem: 1, exp: 50, score: 20 },
    drops: [{ itemId: 'goblin-coin', name: 'Goblin Coin', chance: 0.65 }],
    equipmentDrops: [
      { itemId: 'rusty-dagger', name: 'Rusty Dagger', chance: 0.15 },
      { itemId: 'iron-helm', name: 'Iron Helm', chance: 0.08 }
    ]
  },
  {
    id: 'skeleton-warrior',
    name: 'Skeleton Warrior',
    color: 0xe8eef7,
    stats: { maxHp: 260, maxMp: 70, attack: 24, defense: 10 },
    reward: { gold: 95, gem: 2, exp: 75, score: 30 },
    drops: [
      { itemId: 'bone-fragment', name: 'Bone Fragment', chance: 0.8 },
      { itemId: 'ancient-core', name: 'Ancient Core', chance: 0.12 }
    ],
    equipmentDrops: [
      { itemId: 'hunter-ring', name: 'Hunter Ring', chance: 0.07 },
      { itemId: 'flame-sword', name: 'Flame Sword', chance: 0.04 },
      { itemId: 'guardian-charm', name: 'Guardian Charm', chance: 0.05 }
    ]
  }
];

function resolveMonsterCatalog(): MonsterDefinition[] {
  const profile = getRuntimeBalanceProfile();
  const fromProfile = profile?.monsters?.dungeon1;
  if (Array.isArray(fromProfile) && fromProfile.length > 0) {
    return fromProfile as MonsterDefinition[];
  }
  return DEFAULT_DUNGEON1_MONSTER_CATALOG;
}

export function getDungeon1MonsterCatalog(): MonsterDefinition[] {
  return resolveMonsterCatalog();
}
