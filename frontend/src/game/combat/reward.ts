import { DropItem } from '../entities/monsters';

export function rollCoreDrops(candidates: DropItem[]): DropItem[] {
  const drops: DropItem[] = [];
  for (const item of candidates) {
    if (Math.random() <= item.chance) {
      drops.push(item);
    }
  }
  return drops;
}

export function rollEquipmentDrop(candidates: DropItem[]): DropItem[] {
  if (candidates.length === 0) return [];
  const result: DropItem[] = [];
  for (const item of candidates) {
    if (Math.random() <= item.chance) {
      result.push(item);
    }
  }
  if (result.length <= 1) {
    return result;
  }
  return [result[Math.floor(Math.random() * result.length)]];
}
