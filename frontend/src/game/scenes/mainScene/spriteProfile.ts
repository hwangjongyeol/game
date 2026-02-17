import Phaser from 'phaser';

export type SpritePackKey = 'warrior' | 'mage' | 'archer' | 'slime' | 'orc' | 'dragon';
export type FramePoint = [number, number];
export type SpriteBlock = { col: number; row: number };
type SpriteRenderProfile = {
  spritePackKey?: SpritePackKey;
  block?: SpriteBlock;
  battleFrames?: Array<FramePoint | { c?: number; r?: number }>;
  deathFrames?: Array<FramePoint | { c?: number; r?: number }>;
};

const FRAME_SIZE = 128;
const BLOCK_SIZE = 3;
const BATTLE_ANIM_FPS = 6;
const DEATH_ANIM_FPS = 2;

export function getSheetColumns(scene: Phaser.Scene): number {
  const texture = scene.textures.get('sprite-pack');
  const source = texture?.getSourceImage() as HTMLImageElement | HTMLCanvasElement | undefined;
  const width = source?.width ?? 1024;
  return Math.max(1, Math.floor(width / FRAME_SIZE));
}

export function frameIndexFromBlock(
  block: SpriteBlock,
  localCol: number,
  localRow: number,
  sheetColumns: number
): number {
  const globalCol = block.col * BLOCK_SIZE + localCol;
  const globalRow = block.row * BLOCK_SIZE + localRow;
  return globalRow * sheetColumns + globalCol;
}

function createFramesFromBlock(
  block: SpriteBlock,
  indices: Array<[number, number]>,
  sheetColumns: number
): Phaser.Types.Animations.AnimationFrame[] {
  return indices.map(([c, r]) => ({ key: 'sprite-pack', frame: frameIndexFromBlock(block, c, r, sheetColumns) }));
}

function normalizeFramePoints(
  values: Array<FramePoint | { c?: number; r?: number }> | undefined,
  fallback: FramePoint[]
): FramePoint[] {
  if (!values || values.length === 0) return fallback;
  const points = values
    .map((point) => {
      if (Array.isArray(point)) {
        const [c, r] = point;
        if (!Number.isFinite(c) || !Number.isFinite(r)) return null;
        return [Math.max(0, Math.floor(c)), Math.max(0, Math.floor(r))] as FramePoint;
      }
      const c = point?.c;
      const r = point?.r;
      if (!Number.isFinite(c) || !Number.isFinite(r)) return null;
      return [Math.max(0, Math.floor(c as number)), Math.max(0, Math.floor(r as number))] as FramePoint;
    })
    .filter((v): v is FramePoint => Array.isArray(v));
  return points.length > 0 ? points : fallback;
}

export function resolveProfileFromJson(
  raw: string | null | undefined,
  _sheetColumns: number
): { block: SpriteBlock; battleFrames: FramePoint[]; deathFrames: FramePoint[] } | null {
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw) as SpriteRenderProfile;
    const profileBlock = parsed?.block;
    if (!profileBlock || !Number.isFinite(profileBlock.col) || !Number.isFinite(profileBlock.row)) {
      return null;
    }
    const block: SpriteBlock = {
      col: Math.max(0, Math.floor(profileBlock.col)),
      row: Math.max(0, Math.floor(profileBlock.row))
    };
    const battleFrames = normalizeFramePoints(parsed?.battleFrames, []);
    if (battleFrames.length === 0) {
      return null;
    }
    const deathFrames = parsed?.deathFrames
      ? normalizeFramePoints(parsed.deathFrames, [])
      : battleFrames.slice(0, Math.min(3, battleFrames.length));
    if (deathFrames.length === 0) {
      return null;
    }
    return {
      block,
      battleFrames,
      deathFrames: deathFrames.length > 0 ? deathFrames : battleFrames.slice(0, 3)
    };
  } catch {
    return null;
  }
}

export function ensureProfileAnimations(
  scene: Phaser.Scene,
  prefix: string,
  block: SpriteBlock,
  battleFrames: FramePoint[],
  deathFrames: FramePoint[],
  sheetColumns: number
): { battleKey: string; deathKey: string } {
  const frameSig = `${block.col}_${block.row}_${battleFrames.flat().join('_')}_${deathFrames.flat().join('_')}`;
  const fpsSig = `${BATTLE_ANIM_FPS}_${DEATH_ANIM_FPS}`;
  const battleKey = `${prefix}-battle-${frameSig}-${fpsSig}`;
  if (!scene.anims.exists(battleKey)) {
    scene.anims.create({
      key: battleKey,
      frames: createFramesFromBlock(block, battleFrames, sheetColumns),
      frameRate: BATTLE_ANIM_FPS,
      repeat: -1
    });
  }
  const deathKey = `${prefix}-death-${frameSig}-${fpsSig}`;
  if (!scene.anims.exists(deathKey)) {
    scene.anims.create({
      key: deathKey,
      frames: createFramesFromBlock(block, deathFrames, sheetColumns),
      frameRate: DEATH_ANIM_FPS,
      repeat: 0
    });
  }
  return { battleKey, deathKey };
}
