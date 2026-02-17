import { SkillNode } from '../../entities/classes';
import { WaveGroupScalingRuntime, WavePatternRuntime, WaveRuntimeConfig, WaveRuntimeEntry } from '../../types';

export type RuntimeSpawnEntry = {
  monsterId: string;
  monsterRenderProfileJson?: string | null;
  hpMultiplier: number;
  mpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  rewardGoldMultiplier: number;
  rewardGemMultiplier: number;
};

export function resolveWavePattern(
  wave: number,
  waveRuntimeConfig?: WaveRuntimeConfig
): { waveGroupNo: number; subWaveNo: number; patternWaveNo: number } {
  const groupSize = Math.max(1, waveRuntimeConfig?.patternGroupSize ?? 10);
  const subWaveSize = Math.max(1, waveRuntimeConfig?.subWaveSize ?? 10);
  const waveGroupNo = Math.floor((wave - 1) / subWaveSize) + 1;
  const subWaveNo = ((wave - 1) % subWaveSize) + 1;
  const patternGroupNo = ((waveGroupNo - 1) % groupSize) + 1;
  const patternWaveNo = (patternGroupNo - 1) * subWaveSize + subWaveNo;
  return { waveGroupNo, subWaveNo, patternWaveNo };
}

export function resolveWaveLabel(wave: number, waveRuntimeConfig?: WaveRuntimeConfig): string {
  if (!waveRuntimeConfig) {
    return String(wave);
  }
  const { waveGroupNo, subWaveNo } = resolveWavePattern(wave, waveRuntimeConfig);
  return `${waveGroupNo}-${subWaveNo}`;
}

export function toRuntimeSpawnEntry(entry: WaveRuntimeEntry): RuntimeSpawnEntry {
  return {
    monsterId: entry.monsterId,
    monsterRenderProfileJson: entry.monsterRenderProfileJson,
    hpMultiplier: Math.max(0.01, entry.hpMultiplier),
    mpMultiplier: Math.max(0.01, entry.mpMultiplier),
    attackMultiplier: Math.max(0.01, entry.attackMultiplier),
    defenseMultiplier: Math.max(0.01, entry.defenseMultiplier),
    rewardGoldMultiplier: Math.max(0.01, entry.rewardGoldMultiplier),
    rewardGemMultiplier: Math.max(0.01, entry.rewardGemMultiplier)
  };
}

export function resolveRuntimeSpawnQueue(
  wave: number,
  waveRuntimeConfig: WaveRuntimeConfig | undefined,
  wavePatternByNo: Map<number, WavePatternRuntime>
): RuntimeSpawnEntry[] {
  if (!waveRuntimeConfig) {
    return [];
  }
  const mapping = resolveWavePattern(wave, waveRuntimeConfig);
  const pattern = wavePatternByNo.get(mapping.patternWaveNo);
  const entries = [...(pattern?.entries ?? [])]
    .filter((row) => row.monsterCount > 0)
    .sort((a, b) => a.slotNo - b.slotNo);
  if (entries.length === 0) {
    return [];
  }
  const queue: RuntimeSpawnEntry[] = [];
  entries.forEach((entry) => {
    for (let i = 0; i < Math.max(1, entry.monsterCount); i += 1) {
      queue.push(toRuntimeSpawnEntry(entry));
    }
  });
  return queue;
}

export function resolveCurrentRewardMultiplier(
  runtimeSpawn: RuntimeSpawnEntry | undefined,
  wave: number,
  waveRuntimeConfig: WaveRuntimeConfig | undefined,
  waveGroupScalingByNo: Map<number, WaveGroupScalingRuntime>
): {
  hpMultiplier: number;
  mpMultiplier: number;
  attackMultiplier: number;
  defenseMultiplier: number;
  rewardGoldMultiplier: number;
  rewardGemMultiplier: number;
} {
  if (!runtimeSpawn || !waveRuntimeConfig) {
    return {
      hpMultiplier: 1,
      mpMultiplier: 1,
      attackMultiplier: 1,
      defenseMultiplier: 1,
      rewardGoldMultiplier: 1,
      rewardGemMultiplier: 1
    };
  }
  const { waveGroupNo } = resolveWavePattern(wave, waveRuntimeConfig);
  const groupScale = waveGroupScalingByNo.get(waveGroupNo);
  const groupHp = Math.max(0.01, groupScale?.hpMultiplier ?? 1);
  const groupMp = Math.max(0.01, groupScale?.mpMultiplier ?? 1);
  const groupAtk = Math.max(0.01, groupScale?.attackMultiplier ?? 1);
  const groupDef = Math.max(0.01, groupScale?.defenseMultiplier ?? 1);
  const groupGold = Math.max(0.01, groupScale?.rewardGoldMultiplier ?? 1);
  const groupGem = Math.max(0.01, groupScale?.rewardGemMultiplier ?? 1);
  return {
    hpMultiplier: runtimeSpawn.hpMultiplier * groupHp,
    mpMultiplier: runtimeSpawn.mpMultiplier * groupMp,
    attackMultiplier: runtimeSpawn.attackMultiplier * groupAtk,
    defenseMultiplier: runtimeSpawn.defenseMultiplier * groupDef,
    rewardGoldMultiplier: runtimeSpawn.rewardGoldMultiplier * groupGold,
    rewardGemMultiplier: runtimeSpawn.rewardGemMultiplier * groupGem
  };
}

export function getItemEffectHint(itemId: string): string {
  if (itemId === 'slime-gel') return '즉시 HP +15';
  if (itemId === 'minor-potion') return '즉시 HP/MP 회복';
  if (itemId === 'rusty-dagger') return '장착형/강화형 무기';
  if (itemId === 'goblin-coin') return '3개당 DEF +1';
  if (itemId === 'bone-fragment') return '영구 MaxHP +8';
  if (itemId === 'ancient-core') return '영구 MaxMP +10, ATK +2';
  if (itemId === 'flame-sword') return '장착형/강화형 무기';
  if (itemId === 'iron-helm') return '장착형/강화형 방어구';
  if (itemId === 'guardian-charm') return '장착형/강화형 장신구';
  if (itemId === 'hunter-ring') return '장착형/강화형 장신구';
  return '효과 없음';
}

export function formatSkillTreeText(skillTree: SkillNode[], unlockedSkillIds: Set<string>): string {
  const lines = skillTree.map((skill, idx) => {
    const key = idx + 1;
    const unlocked = unlockedSkillIds.has(skill.id) ? '해금' : '잠김';
    return `[${key}] ${skill.name} (Lv.${skill.requiredLevel}) ${unlocked}`;
  });
  return `스킬트리\n${lines.join('\n')}`;
}
