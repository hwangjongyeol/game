import { CoreStats } from '../combat/types';
import { getDungeon1MonsterCatalog } from '../balance/monsterCatalog';

export type DropItem = {
  itemId: string;
  name: string;
  chance: number;
};

export type MonsterDefinition = {
  id: string;
  name: string;
  color: number;
  stats: CoreStats;
  reward: {
    gold: number;
    gem: number;
    exp: number;
    score: number;
  };
  drops: DropItem[];
  equipmentDrops: DropItem[];
};

export function getDungeon1Monsters(): MonsterDefinition[] {
  return getDungeon1MonsterCatalog();
}
