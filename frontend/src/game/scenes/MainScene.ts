import Phaser from 'phaser';
import { addDungeonScore, earnDungeonCurrency, syncDungeonLoot } from '../../api/client';
import { calcBasicAttack, canUseSkill } from '../combat/formulas';
import { rollCoreDrops, rollEquipmentDrop } from '../combat/reward';
import { classDefinitions, ClassDefinition, SkillNode } from '../entities/classes';
import { Fighter } from '../entities/Fighter';
import { dungeon1Monsters, DropItem, MonsterDefinition } from '../entities/monsters';
import { EventBus } from '../EventBus';
import { ActiveCompanionSession, GameSession, PersistentCharacterStats } from '../types';

type InventoryEntry = {
  itemId: string;
  itemName: string;
  quantity: number;
};

type SpritePackKey = 'warrior' | 'mage' | 'archer' | 'slime' | 'orc' | 'dragon';

const SPRITE_BLOCKS: Record<SpritePackKey, { col: number; row: number }> = {
  warrior: { col: 0, row: 0 },
  mage: { col: 8, row: 0 },
  archer: { col: 16, row: 0 },
  slime: { col: 0, row: 4 },
  orc: { col: 8, row: 4 },
  dragon: { col: 16, row: 4 }
};

export class MainScene extends Phaser.Scene {
  private session!: GameSession;
  private classDef!: ClassDefinition;

  private hero!: Fighter;
  private monster!: Fighter;
  private monsterDef!: MonsterDefinition;
  private monstersPerWave = 1;
  private defeatedInWave = 0;

  private backgroundImage!: Phaser.GameObjects.Image;
  private heroBody!: Phaser.GameObjects.Container;
  private companionBodies: Phaser.GameObjects.Container[] = [];
  private monsterBody!: Phaser.GameObjects.Container;
  private heroBaseX = 0;
  private monsterBaseX = 0;
  private heroSprite!: Phaser.GameObjects.Sprite;
  private companionSprites: Phaser.GameObjects.Sprite[] = [];
  private monsterSprite!: Phaser.GameObjects.Sprite;
  private monsterSupportSprites: Phaser.GameObjects.Sprite[] = [];
  private monsterNameText!: Phaser.GameObjects.Text;

  private heroInfoText!: Phaser.GameObjects.Text;
  private heroHpText!: Phaser.GameObjects.Text;
  private heroMpText!: Phaser.GameObjects.Text;
  private monsterHpText!: Phaser.GameObjects.Text;
  private monsterMpText!: Phaser.GameObjects.Text;
  private skillTreeText!: Phaser.GameObjects.Text;
  private inventoryText!: Phaser.GameObjects.Text;
  private logText!: Phaser.GameObjects.Text;
  private speedText!: Phaser.GameObjects.Text;
  private waveBannerText!: Phaser.GameObjects.Text;
  private rexHudLabel?: Phaser.GameObjects.GameObject;
  private rexHeroHpBar?: any;
  private rexHeroMpBar?: any;
  private rexMonsterHpBar?: any;
  private rexMonsterMpBar?: any;
  private rexHeroHpText?: Phaser.GameObjects.Text;
  private rexHeroMpText?: Phaser.GameObjects.Text;
  private rexMonsterHpText?: Phaser.GameObjects.Text;
  private rexMonsterMpText?: Phaser.GameObjects.Text;
  private rexSkillCooldownRing?: any;
  private rexSkillCooldownText?: Phaser.GameObjects.Text;
  private heroSkillTimer?: Phaser.Time.TimerEvent;

  private currentWave = 1;
  private heroLevel = 1;
  private heroExp = 0;
  private skillPoints = 0;
  private unlockedSkillIds = new Set<string>();
  private inventory = new Map<string, InventoryEntry>();
  private itemUpgradeLevels = new Map<string, number>();
  private itemStatBonuses = new Map<string, { maxHp: number; maxMp: number; attack: number; defense: number }>();
  private equippedItemIds = new Set<string>();
  private equippedBonus = { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
  private currentDungeonIndex = 1;
  private waveLocked = false;

  private resolvingVictory = false;
  private battleSpeed = 1;
  private appliedPersistentStats?: PersistentCharacterStats;

  constructor() {
    super('MainScene');
  }

  init(data: GameSession): void {
    this.session = data;
  }

  create(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.classDef = classDefinitions[this.session.classId] ?? classDefinitions.knight;
    this.hero = new Fighter(this.session.nickname, this.resolveHeroBaseStats());
    this.appliedPersistentStats = this.session.persistentStats;
    this.equippedItemIds = new Set(this.session.equippedItemIds ?? []);
    this.hydrateInventoryFromSession();
    this.applyEquipmentBonuses();
    this.currentWave = Math.max(1, this.session.startWave ?? 1);
    this.waveLocked = Boolean(this.session.waveLocked);

    this.drawDungeonBackground(width, height);
    this.createSpritePackAnimations();
    this.drawUnits(width, height);
    this.createHud(width, height);
    this.bindInput();

    this.spawnMonsterByWave(this.currentWave);
    EventBus.emit('current-scene-ready', this);

    this.time.addEvent({
      delay: 1700,
      loop: true,
      callback: () => this.monsterTurn()
    });

    this.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.heroBasicAttack()
    });

    this.heroSkillTimer = this.time.addEvent({
      delay: this.classDef.activeSkill.cooldownMs,
      loop: true,
      callback: () => this.heroSkillAttack(true)
    });
    this.time.addEvent({
      delay: 120,
      loop: true,
      callback: () => this.refreshSkillCooldownHud()
    });

    this.pushLog(`던전1 자동전투 시작 / 현재 Wave ${this.currentWave} / [1/2:스킬트리, R:재전투]`);
    this.setBattleSpeed(this.session.initialBattleSpeed ?? 1);
    this.playHeroBattleAnimation();
    this.refreshHud();
  }

  private drawDungeonBackground(width: number, height: number): void {
    this.backgroundImage = this.add.image(width / 2, height / 2, 'dungeon-bg-1').setDisplaySize(width, height);
  }

  private drawUnits(width: number, height: number): void {
    this.heroBody = this.createHeroAvatar(width * 0.14, height * 0.58);
    this.monsterBody = this.createMonsterAvatar(width * 0.74, height * 0.58);
    this.heroBaseX = this.heroBody.x;
    this.monsterBaseX = this.monsterBody.x;
    this.createCompanionAvatars(width, height);

    this.add.text(width * 0.14 - 80, height * 0.58 - 180, `${this.session.nickname} (${this.classDef.label})`, {
      fontFamily: 'Verdana',
      fontSize: '18px',
      color: '#dce8ff'
    });

    this.monsterNameText = this.add.text(this.monsterBody.x - 90, this.monsterBody.y - 140, '', {
      fontFamily: 'Verdana',
      fontSize: '18px',
      color: '#ddffdf'
    });

    this.tweens.add({
      targets: this.heroBody,
      y: this.heroBody.y - 6,
      duration: 560,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.tweens.add({
      targets: this.monsterBody,
      y: this.monsterBody.y - 8,
      duration: 640,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  private createHud(width: number, height: number): void {
    this.heroInfoText = this.add.text(30, 16, '', this.hudStyle());
    this.heroHpText = this.add.text(30, 42, '', this.hudStyle());
    this.heroMpText = this.add.text(30, 68, '', this.hudStyle());
    this.monsterHpText = this.add.text(width - 320, 20, '', this.hudStyle());
    this.monsterMpText = this.add.text(width - 320, 46, '', this.hudStyle());

    this.skillTreeText = this.add.text(30, 102, '', { ...this.hudStyle(), fontSize: '15px', color: '#d4f2ff' });
    this.inventoryText = this.add.text(width - 320, 88, '', {
      ...this.hudStyle(),
      fontSize: '15px',
      color: '#ffefbf',
      wordWrap: { width: 300 }
    });
    this.logText = this.add.text(30, height - 120, '', {
      fontFamily: 'Verdana',
      fontSize: '18px',
      color: '#ffe6b8',
      wordWrap: { width: width - 60 }
    });
    this.speedText = this.add.text(width - 320, height - 140, '', {
      fontFamily: 'Verdana',
      fontSize: '16px',
      color: '#aee3ff'
    });

    this.waveBannerText = this.add
      .text(width / 2, 28, '', {
        fontFamily: 'Verdana',
        fontSize: '28px',
        color: '#ecf9ff',
        stroke: '#10223d',
        strokeThickness: 5
      })
      .setOrigin(0.5, 0)
      .setAlpha(0)
      .setScale(0.9);

    this.createRexUiHud(width, height);
  }

  private createRexUiHud(width: number, height: number): void {
    const rexUI = (this as any).rexUI;
    if (!rexUI?.add?.label || !rexUI?.add?.roundRectangleProgress) return;
    const skillHudTheme = this.resolveSkillHudTheme();

    this.add
      .rectangle(width - 196, height - 106, 296, 132, 0x07131f, 0.76)
      .setStrokeStyle(1, 0x4c83ba, 0.85)
      .setDepth(29);

    this.rexHeroHpText = this.add.text(width - 330, height - 150, 'Hero HP', {
      fontFamily: 'Verdana',
      fontSize: '11px',
      color: '#a5d9ff'
    });
    this.rexHeroMpText = this.add.text(width - 330, height - 128, 'Hero MP', {
      fontFamily: 'Verdana',
      fontSize: '11px',
      color: '#a5d9ff'
    });
    this.rexMonsterHpText = this.add.text(width - 330, height - 106, 'Monster HP', {
      fontFamily: 'Verdana',
      fontSize: '11px',
      color: '#ffc5bd'
    });
    this.rexMonsterMpText = this.add.text(width - 330, height - 84, 'Monster MP', {
      fontFamily: 'Verdana',
      fontSize: '11px',
      color: '#ffc5bd'
    });
    this.rexHeroHpText.setDepth(30);
    this.rexHeroMpText.setDepth(30);
    this.rexMonsterHpText.setDepth(30);
    this.rexMonsterMpText.setDepth(30);

    this.rexHeroHpBar = rexUI.add.roundRectangleProgress(width - 220, height - 142, 188, 10, 6, 0x31d0bf, 1, {
      trackColor: 0x1f3246
    });
    this.rexHeroMpBar = rexUI.add.roundRectangleProgress(width - 220, height - 120, 188, 10, 6, 0x6c9dff, 1, {
      trackColor: 0x1f3246
    });
    this.rexMonsterHpBar = rexUI.add.roundRectangleProgress(width - 220, height - 98, 188, 10, 6, 0xff7d70, 1, {
      trackColor: 0x3a2a30
    });
    this.rexMonsterMpBar = rexUI.add.roundRectangleProgress(width - 220, height - 76, 188, 10, 6, 0xffb764, 1, {
      trackColor: 0x3a2a30
    });

    this.rexSkillCooldownRing = rexUI.add.circularProgress(width - 58, height - 94, 24, skillHudTheme.barColor, 1, {
      trackColor: skillHudTheme.trackColor,
      thickness: 0.26
    });
    this.rexSkillCooldownText = this.add.text(width - 58, height - 94, skillHudTheme.iconText, {
      fontFamily: 'Verdana',
      fontSize: '11px',
      color: skillHudTheme.textColor
    }).setOrigin(0.5);
    this.rexSkillCooldownRing?.setDepth?.(30);
    this.rexSkillCooldownText?.setDepth(31);

    this.rexHudLabel = rexUI.add
      .label({
        x: width - 176,
        y: height - 36,
        background: this.add
          .rectangle(0, 0, 240, 30, 0x0f2a45, 0.86)
          .setStrokeStyle(1, 0x69b8ff, 0.9),
        text: this.add.text(0, 0, 'RexUI Combat HUD', {
          fontFamily: 'Verdana',
          fontSize: '12px',
          color: '#d6f0ff'
        }),
        space: { left: 10, right: 10, top: 6, bottom: 6 }
      })
      .setDepth(30);

    this.rexHeroHpBar?.setDepth?.(30);
    this.rexHeroMpBar?.setDepth?.(30);
    this.rexMonsterHpBar?.setDepth?.(30);
    this.rexMonsterMpBar?.setDepth?.(30);
  }

  private bindInput(): void {
    this.input.keyboard?.on('keydown-ONE', () => this.tryUnlockSkill(0));
    this.input.keyboard?.on('keydown-TWO', () => this.tryUnlockSkill(1));
    this.input.keyboard?.on('keydown-R', () => this.resetBattle());
  }

  private heroBasicAttack(): void {
    if (!this.ensureBattleActive()) return;
    this.playStrikeTween(this.heroBody, this.heroBaseX, 26);
    const prevHp = this.monster.state.hp;
    const result = calcBasicAttack(this.hero.stats, this.monster.stats, this.monster.state, 0.14);
    this.monster.receiveDamage(result.targetHpAfter);
    const dealt = Math.max(0, prevHp - this.monster.state.hp);
    this.showFloatingText(
      this.monsterBody.x,
      this.monsterBody.y - 125,
      `-${dealt}${result.critical ? ' CRIT' : ''}`,
      result.critical ? '#ffd15a' : '#ff9c87'
    );
    this.checkBattleEnd();
  }

  private heroSkillAttack(silentFail = false): void {
    if (!this.ensureBattleActive()) return;

    const skill = this.classDef.activeSkill;
    if (!canUseSkill(this.hero.state, skill.mpCost) || !this.hero.spendMp(skill.mpCost)) {
      if (!silentFail) this.pushLog(`MP 부족: ${skill.name} 사용 실패`);
      return;
    }

    this.playStrikeTween(this.heroBody, this.heroBaseX, 40);
    this.playSkillVisualEffect(skill.effect);
    const primaryStats = { ...this.hero.stats, attack: this.hero.stats.attack + skill.attackBonus };
    let targetStats = this.monster.stats;

    if (skill.effect === 'BREAK_ARMOR') {
      targetStats = { ...targetStats, defense: Math.max(0, targetStats.defense - 6) };
    }

    const first = calcBasicAttack(primaryStats, targetStats, this.monster.state, 0.16 + skill.critBonus);
    const firstDamage = Math.max(0, this.monster.state.hp - first.targetHpAfter);
    this.monster.receiveDamage(first.targetHpAfter);
    const primaryTag = skill.effect === 'BREAK_ARMOR' ? 'BREAK' : skill.effect === 'ARCANE_ECHO' ? 'ARC' : 'SHOT';
    this.showFloatingText(
      this.monsterBody.x + Phaser.Math.Between(-10, 10),
      this.monsterBody.y - 130,
      `-${firstDamage}${first.critical ? ' CRIT' : ''} ${primaryTag}`,
      first.critical ? '#ffe078' : '#ffb49a'
    );

    let totalDamage = firstDamage;
    if (skill.effect === 'ARCANE_ECHO' && this.monster.isAlive()) {
      const echoStats = { ...this.hero.stats, attack: this.hero.stats.attack + Math.floor(skill.attackBonus * 0.55) };
      const echo = calcBasicAttack(echoStats, targetStats, this.monster.state, Math.max(0.05, skill.critBonus * 0.45));
      const echoDamage = Math.max(0, this.monster.state.hp - echo.targetHpAfter);
      this.monster.receiveDamage(echo.targetHpAfter);
      totalDamage += echoDamage;
      this.showFloatingText(this.monsterBody.x + 18, this.monsterBody.y - 112, `-${echoDamage} ECHO`, '#ffcfb6');
    }

    if (skill.effect === 'VAMPIRIC_SHOT') {
      const healAmount = Math.max(6, Math.floor(totalDamage * 0.3));
      this.hero.receiveDamage(this.hero.state.hp + healAmount);
      this.showFloatingText(this.heroBody.x, this.heroBody.y - 130, `+${healAmount} LIFESTEAL`, '#93ffb4');
    }

    this.checkBattleEnd();
  }

  private monsterTurn(): void {
    if (!this.ensureBattleActive()) return;
    this.playStrikeTween(this.monsterBody, this.monsterBaseX, -22);
    const prevHp = this.hero.state.hp;
    const result = calcBasicAttack(this.monster.stats, this.hero.stats, this.hero.state, 0.08);
    this.hero.receiveDamage(result.targetHpAfter);
    const dealt = Math.max(0, prevHp - this.hero.state.hp);
    this.showFloatingText(
      this.heroBody.x,
      this.heroBody.y - 118,
      `-${dealt}${result.critical ? ' CRIT' : ''} HIT`,
      result.critical ? '#ff8e54' : '#ffb482'
    );
    this.monster.recoverMp(4);
    this.checkBattleEnd();
  }

  private ensureBattleActive(): boolean {
    return !this.resolvingVictory && this.hero.isAlive() && this.monster.isAlive();
  }

  private checkBattleEnd(): void {
    if (!this.monster.isAlive()) {
      this.playMonsterDeathAnimation(this.resolveMonsterKind(this.monsterDef.id));
      this.handleVictory();
      return;
    }
    if (!this.hero.isAlive()) {
      this.playHeroDeathAnimation();
      this.pushLog(`패배: Wave ${this.currentWave} 유지됨. R로 재전투`);
      this.refreshHud();
    } else {
      this.refreshHud();
    }
  }

  private handleVictory(): void {
    if (this.resolvingVictory) return;
    this.resolvingVictory = true;

    const drops = [...rollCoreDrops(this.monsterDef.drops), ...rollEquipmentDrop(this.monsterDef.equipmentDrops)];
    for (const drop of drops) {
      this.addDropToInventory(drop);
      this.applyItemEffects(drop);
    }

    const reward = this.monsterDef.reward;
    this.gainExp(reward.exp);
    this.defeatedInWave += 1;
    const waveCleared = this.defeatedInWave >= this.monstersPerWave;
    const remain = Math.max(0, this.monstersPerWave - this.defeatedInWave);
    this.session.onMonsterKill?.({
      killDelta: 1,
      goldEarned: reward.gold,
      waveCleared,
      currentWave: this.currentWave,
      nextWave: this.currentWave + 1
    });
    void this.syncBattleReward(reward.gold, reward.gem, reward.score, this.monsterDef.id, drops);

    this.time.delayedCall(1200, () => {
      if (waveCleared) {
        this.pushLog(`Wave ${this.currentWave} 클리어 (${this.monstersPerWave}마리) / +${reward.gold}G +${reward.gem}Gem`);
        this.hero.reset();
        this.playHeroBattleAnimation();
        if (this.waveLocked) {
          this.pushLog(`Wave ${this.currentWave} 고정 전투 재시작`);
          this.spawnMonsterByWave(this.currentWave);
        } else {
          const nextWave = this.currentWave + 1;
          this.currentWave = nextWave;
          this.spawnMonsterByWave(this.currentWave);
        }
      } else {
        this.pushLog(
          `승리: ${this.monsterDef.name} 처치 / +${reward.gold}G +${reward.gem}Gem / 남은 몬스터 ${remain}마리`
        );
        this.spawnNextMonsterInWave();
        this.playHeroBattleAnimation();
      }
      this.resolvingVictory = false;
      this.refreshHud();
    });
  }

  private addDropToInventory(drop: DropItem): void {
    const prev = this.inventory.get(drop.itemId);
    this.inventory.set(drop.itemId, {
      itemId: drop.itemId,
      itemName: drop.name,
      quantity: (prev?.quantity ?? 0) + 1
    });
  }

  private hydrateInventoryFromSession(): void {
    const initialInventory = this.session.initialInventory ?? [];
    for (const item of initialInventory) {
      if (item.quantity <= 0) continue;
      this.inventory.set(item.itemId, {
        itemId: item.itemId,
        itemName: item.itemName,
        quantity: item.quantity
      });
      this.itemUpgradeLevels.set(item.itemId, item.upgradeLevel ?? 0);
      this.itemStatBonuses.set(item.itemId, {
        attack: item.attackBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).attack,
        defense: item.defenseBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).defense,
        maxHp: item.hpBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).maxHp,
        maxMp: item.mpBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).maxMp
      });
    }
    this.reapplyInventoryPassiveBonuses();
  }

  updateEquippedItems(itemIds: string[]): void {
    this.equippedItemIds = new Set(itemIds);
    this.applyEquipmentBonuses();
    this.pushLog(`장착 반영: ${itemIds.length}개`);
    this.refreshHud();
  }

  updateInventorySnapshot(
    items: Array<{
      itemId: string;
      itemName: string;
      quantity: number;
      upgradeLevel?: number;
      attackBonus?: number;
      defenseBonus?: number;
      hpBonus?: number;
      mpBonus?: number;
    }>
  ): void {
    for (const item of items) {
      this.itemUpgradeLevels.set(item.itemId, item.upgradeLevel ?? 0);
      this.itemStatBonuses.set(item.itemId, {
        attack: item.attackBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).attack,
        defense: item.defenseBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).defense,
        maxHp: item.hpBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).maxHp,
        maxMp: item.mpBonus ?? this.getLegacyEquipBonus(item.itemId, item.upgradeLevel ?? 0).maxMp
      });
      if (item.quantity > 0) {
        this.inventory.set(item.itemId, { itemId: item.itemId, itemName: item.itemName, quantity: item.quantity });
      }
    }
    this.applyEquipmentBonuses();
    this.refreshHud();
  }

  updatePersistentStats(next: PersistentCharacterStats): void {
    const prev = this.appliedPersistentStats;
    this.session.persistentStats = next;
    this.appliedPersistentStats = next;
    if (!prev) {
      this.hero.setStats(this.resolveHeroBaseStats());
      this.applyEquipmentBonuses();
      this.refreshHud();
      return;
    }

    const delta = {
      attack: next.attack - prev.attack,
      defense: next.defense - prev.defense,
      maxHp: next.maxHp - prev.maxHp,
      maxMp: next.maxMp - prev.maxMp
    };

    if (delta.attack !== 0 || delta.defense !== 0 || delta.maxHp !== 0 || delta.maxMp !== 0) {
      this.hero.applyBonus(delta);
      this.pushLog(`능력치 반영: ATK ${next.attack} / DEF ${next.defense} / HP ${next.maxHp} / MP ${next.maxMp}`);
      this.refreshHud();
    }
  }

  updateActiveCompanions(companions: ActiveCompanionSession[]): void {
    this.session.activeCompanions = companions;
    const { width, height } = this.scale.gameSize;
    this.createCompanionAvatars(width, height);
    this.refreshHud();
  }

  updateBattleSpeed(speed: 1 | 2 | 3): void {
    this.setBattleSpeed(speed);
    this.refreshHud();
  }

  updateWaveLock(locked: boolean): void {
    this.waveLocked = locked;
    this.pushLog(locked ? `Wave 고정 모드 ON` : `Wave 고정 모드 OFF`);
    this.refreshHud();
  }

  private applyItemEffects(drop: DropItem): void {
    if (drop.itemId === 'slime-gel') {
      this.hero.receiveDamage(this.hero.state.hp + 15);
      return;
    }

    if (drop.itemId === 'minor-potion') {
      this.hero.receiveDamage(this.hero.state.hp + 40);
      this.hero.recoverMp(25);
      return;
    }

    if (drop.itemId === 'bone-fragment') {
      this.hero.applyBonus({ maxHp: 8 });
      return;
    }

    if (drop.itemId === 'ancient-core') {
      this.hero.applyBonus({ maxMp: 10, attack: 2 });
      return;
    }

    if (drop.itemId === 'goblin-coin') {
      const count = this.inventory.get('goblin-coin')?.quantity ?? 0;
      if (count % 3 === 0) {
        this.hero.applyBonus({ defense: 1 });
      }
    }
  }

  private async syncBattleReward(
    gold: number,
    gem: number,
    score: number,
    monsterId: string,
    drops: DropItem[]
  ): Promise<void> {
    try {
      await earnDungeonCurrency(this.session.playerId, 'GOLD', gold, `${monsterId}-gold-${Date.now()}`);
      await earnDungeonCurrency(this.session.playerId, 'GEM', gem, `${monsterId}-gem-${Date.now()}`);
      await addDungeonScore(this.session.playerId, score);

      const countMap = new Map<string, { itemId: string; itemName: string; quantity: number }>();
      for (const item of drops) {
        const prev = countMap.get(item.itemId);
        if (!prev) {
          countMap.set(item.itemId, { itemId: item.itemId, itemName: item.name, quantity: 1 });
          continue;
        }
        prev.quantity += 1;
      }

      const lootPayload = Array.from(countMap.values());
      await syncDungeonLoot(this.session.playerId, lootPayload);
    } catch (e) {
      const msg = e instanceof Error ? e.message : '보상 API 동기화 실패';
      this.pushLog(`주의: ${msg}`);
    }
  }

  private gainExp(amount: number): void {
    this.heroExp += amount;
    while (this.heroExp >= this.requiredExp(this.heroLevel)) {
      this.heroExp -= this.requiredExp(this.heroLevel);
      this.heroLevel += 1;
      this.skillPoints += 1;
      this.hero.applyBonus({ maxHp: 12, maxMp: 6, attack: 2, defense: 1 });
    }
  }

  private requiredExp(level: number): number {
    return 70 + level * 35;
  }

  private tryUnlockSkill(index: number): void {
    const skill = this.classDef.skillTree[index];
    if (!skill) return;
    if (this.unlockedSkillIds.has(skill.id) || this.skillPoints <= 0 || this.heroLevel < skill.requiredLevel) return;

    this.skillPoints -= 1;
    this.unlockedSkillIds.add(skill.id);
    this.hero.applyBonus(skill.bonus);
    this.refreshHud();
  }

  private spawnMonsterByWave(wave: number): void {
    this.applyDungeonTheme(wave);
    this.monstersPerWave = this.resolveMonstersPerWave(wave);
    this.defeatedInWave = 0;
    this.spawnNextMonsterInWave();
    this.showWaveBanner(wave);
  }

  private spawnNextMonsterInWave(): void {
    const sequence = this.defeatedInWave + 1;
    const idx = (this.currentWave + sequence - 2) % dungeon1Monsters.length;
    const base = dungeon1Monsters[idx];
    const scaledStats = this.resolveScaledMonsterStats(base.stats, this.currentWave, sequence);
    this.monsterDef = {
      ...base,
      stats: scaledStats
    };
    this.monster = new Fighter(this.monsterDef.name, this.monsterDef.stats);

    this.monsterNameText.setText(
      `D${this.currentDungeonIndex} ${this.monsterDef.name} [Wave ${this.currentWave}] (${sequence}/${this.monstersPerWave})`
    );
    this.playMonsterBattleAnimation(this.resolveMonsterKind(this.monsterDef.id));
    this.refreshMonsterSupportSprites();
  }

  private showWaveBanner(wave: number): void {
    this.waveBannerText.setText(`DUNGEON ${this.currentDungeonIndex}  WAVE ${wave}`).setAlpha(0).setScale(0.88).setY(28);
    this.tweens.killTweensOf(this.waveBannerText);
    this.tweens.add({
      targets: this.waveBannerText,
      alpha: 1,
      scale: 1,
      y: 34,
      duration: 240,
      yoyo: true,
      hold: 340,
      ease: 'Sine.easeOut'
    });
  }

  private applyDungeonTheme(wave: number): void {
    const cycleWave = ((wave - 1) % 100) + 1;
    const dungeonIndex = Math.floor((cycleWave - 1) / 10) + 1;
    this.currentDungeonIndex = dungeonIndex;
    this.backgroundImage.setTexture(`dungeon-bg-${dungeonIndex}`);
  }

  private createHeroAvatar(x: number, y: number): Phaser.GameObjects.Container {
    const heroKind = (this.classDef.id === 'knight' ? 'warrior' :
                     this.classDef.id === 'ranger' ? 'archer' :
                     this.classDef.id === 'mage' ? 'mage' : 'warrior') as SpritePackKey;
    this.heroSprite = this.add
      .sprite(0, -96, 'sprite-pack', this.frameIndexFromBlock(SPRITE_BLOCKS[heroKind], 0, 0))
      .setDisplaySize(180, 212)
      .setOrigin(0.5, 0.5);
    return this.add.container(x, y, [this.heroSprite]);
  }

  private createCompanionAvatars(width: number, height: number): void {
    this.companionBodies.forEach((body) => body.destroy(true));
    this.companionBodies = [];
    this.companionSprites = [];

    const active = (this.session.activeCompanions ?? []).slice(0, 5);
    if (active.length === 0) {
      return;
    }

    const baseX = width * 0.42;
    const baseY = height * 0.62;
    const spacingX = 90;
    const spacingY = 56;

    active.forEach((companion, idx) => {
      const row = Math.floor(idx / 3);
      const col = idx % 3;
      const x = baseX + (col - 1) * spacingX + row * 30;
      const y = baseY + row * spacingY;
      const kind = (companion.classId === 'knight' ? 'warrior' :
                   companion.classId === 'ranger' ? 'archer' : 'mage') as SpritePackKey;

      const sprite = this.add
        .sprite(0, -72, 'sprite-pack', this.frameIndexFromBlock(SPRITE_BLOCKS[kind], 0, 0))
        .setDisplaySize(132, 156)
        .setOrigin(0.5, 0.5)
        .setAlpha(0.95);
      const body = this.add.container(x, y, [sprite]);
      this.companionSprites.push(sprite);
      this.companionBodies.push(body);

      this.add.text(x - 54, y - 126, companion.companionName, {
        fontFamily: 'Verdana',
        fontSize: '12px',
        color: '#e6f6ff'
      });
    });
  }

  private createSpritePackAnimations(): void {
    const entities: SpritePackKey[] = ['warrior', 'mage', 'archer', 'slime', 'orc', 'dragon'];
    entities.forEach((kind) => {
      const block = SPRITE_BLOCKS[kind];
      const battleKey = `${kind}-battle`;
      if (!this.anims.exists(battleKey)) {
        this.anims.create({
          key: battleKey,
          frames: this.createFramesFromBlock(block, [
            [0, 0],
            [1, 0],
            [2, 0],
            [3, 0],
            [0, 1],
            [1, 1],
            [2, 1],
            [3, 1]
          ]),
          frameRate: 10,
          repeat: -1
        });
      }
      const deathKey = `${kind}-death`;
      if (!this.anims.exists(deathKey)) {
        this.anims.create({
          key: deathKey,
          frames: this.createFramesFromBlock(block, [
            [0, 2],
            [1, 2],
            [2, 2]
          ]),
          frameRate: 6,
          repeat: 0
        });
      }
    });
  }

  private frameIndexFromBlock(
    block: { col: number; row: number },
    localCol: number,
    localRow: number
  ): string {
    const SHEET_COLUMNS = 32; // 8 frames per row × 4 blocks
    const index = (block.row + localRow) * SHEET_COLUMNS + (block.col + localCol);
    return `frame_${index.toString().padStart(4, '0')}`; // TexturePacker atlas frame key
  }

  private createFramesFromBlock(
    block: { col: number; row: number },
    indices: Array<[number, number]>
  ): Phaser.Types.Animations.AnimationFrame[] {
    return indices.map(([c, r]) => ({ key: 'sprite-pack', frame: this.frameIndexFromBlock(block, c, r) }));
  }

  private playHeroBattleAnimation(): void {
    const heroKind = (this.classDef.id === 'knight' ? 'warrior' :
                     this.classDef.id === 'ranger' ? 'archer' : 'mage') as SpritePackKey;
    this.heroSprite.play(`${heroKind}-battle`, true);
    this.playCompanionBattleAnimation();
  }

  private playHeroDeathAnimation(): void {
    const heroKind = (this.classDef.id === 'knight' ? 'warrior' :
                     this.classDef.id === 'ranger' ? 'archer' : 'mage') as SpritePackKey;
    this.heroSprite.play(`${heroKind}-death`, true);
  }

  private playCompanionBattleAnimation(): void {
    const active = this.session.activeCompanions ?? [];
    this.companionSprites.forEach((sprite, idx) => {
      const companion = active[idx];
      if (!companion) return;
      const kind = (companion.classId === 'knight' ? 'warrior' :
                   companion.classId === 'ranger' ? 'archer' : 'mage') as SpritePackKey;
      sprite.play(`${kind}-battle`, true);
    });
  }

  private createMonsterAvatar(x: number, y: number): Phaser.GameObjects.Container {
    const baseFrame = this.frameIndexFromBlock(SPRITE_BLOCKS.slime, 0, 0);
    this.monsterSprite = this.add.sprite(0, -96, 'sprite-pack', baseFrame).setDisplaySize(180, 212).setOrigin(0.5, 0.5);
    const support1 = this.add.sprite(-118, -78, 'sprite-pack', baseFrame).setDisplaySize(124, 148).setAlpha(0.82);
    const support2 = this.add.sprite(116, -76, 'sprite-pack', baseFrame).setDisplaySize(124, 148).setAlpha(0.82);
    const support3 = this.add.sprite(-184, -50, 'sprite-pack', baseFrame).setDisplaySize(104, 126).setAlpha(0.7);
    const support4 = this.add.sprite(184, -48, 'sprite-pack', baseFrame).setDisplaySize(104, 126).setAlpha(0.7);
    this.monsterSupportSprites = [support1, support2, support3, support4];
    return this.add.container(x, y, [support3, support1, this.monsterSprite, support2, support4]);
  }

  private resolveMonsterKind(monsterId: string): SpritePackKey {
    if (monsterId.includes('orc')) return 'orc';
    if (monsterId.includes('dragon')) return 'dragon';
    return 'slime';
  }

  private playMonsterBattleAnimation(kind: SpritePackKey): void {
    this.monsterSprite.play(`${kind}-battle`, true);
    const frame = this.frameIndexFromBlock(SPRITE_BLOCKS[kind], 0, 0);
    this.monsterSupportSprites.forEach((sprite) => sprite.setFrame(frame));
  }

  private playMonsterDeathAnimation(kind: SpritePackKey): void {
    this.monsterSprite.play(`${kind}-death`, true);
  }

  private playStrikeTween(target: Phaser.GameObjects.Container, baseX: number, shiftX: number): void {
    this.tweens.killTweensOf(target);
    target.x = baseX;
    this.tweens.add({
      targets: target,
      x: baseX + shiftX,
      duration: 80,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }

  private resetBattle(): void {
    this.heroLevel = 1;
    this.heroExp = 0;
    this.skillPoints = 0;
    this.unlockedSkillIds.clear();

    this.hero.setStats(this.resolveHeroBaseStats());
    this.equippedBonus = { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
    this.reapplyInventoryPassiveBonuses();
    this.applyEquipmentBonuses();
    this.hero.reset();
    this.playHeroBattleAnimation();
    this.spawnMonsterByWave(this.currentWave);

    this.pushLog(`Wave ${this.currentWave} 재전투 시작`);
    this.refreshHud();
  }

  private reapplyInventoryPassiveBonuses(): void {
    const fragmentCount = this.inventory.get('bone-fragment')?.quantity ?? 0;
    const coreCount = this.inventory.get('ancient-core')?.quantity ?? 0;
    const coinCount = this.inventory.get('goblin-coin')?.quantity ?? 0;

    if (fragmentCount > 0) {
      this.hero.applyBonus({ maxHp: fragmentCount * 8 });
    }
    if (coreCount > 0) {
      this.hero.applyBonus({ maxMp: coreCount * 10, attack: coreCount * 2 });
    }
    const coinDefense = Math.floor(coinCount / 3);
    if (coinDefense > 0) {
      this.hero.applyBonus({ defense: coinDefense });
    }
  }

  private applyEquipmentBonuses(): void {
    const next = { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
    for (const itemId of this.equippedItemIds) {
      const bonus = this.getEquipBonus(itemId);
      next.maxHp += bonus.maxHp;
      next.maxMp += bonus.maxMp;
      next.attack += bonus.attack;
      next.defense += bonus.defense;
    }
    const setBonus = this.getSetBonus();
    next.maxHp += setBonus.maxHp;
    next.maxMp += setBonus.maxMp;
    next.attack += setBonus.attack;
    next.defense += setBonus.defense;

    const delta = {
      maxHp: next.maxHp - this.equippedBonus.maxHp,
      maxMp: next.maxMp - this.equippedBonus.maxMp,
      attack: next.attack - this.equippedBonus.attack,
      defense: next.defense - this.equippedBonus.defense
    };

    if (delta.maxHp !== 0 || delta.maxMp !== 0 || delta.attack !== 0 || delta.defense !== 0) {
      this.hero.applyBonus(delta);
    }

    this.equippedBonus = next;
  }

  private getEquipBonus(itemId: string): { maxHp: number; maxMp: number; attack: number; defense: number } {
    const fromDb = this.itemStatBonuses.get(itemId);
    if (fromDb) {
      return fromDb;
    }
    return this.getLegacyEquipBonus(itemId, this.itemUpgradeLevels.get(itemId) ?? 0);
  }

  private getLegacyEquipBonus(itemId: string, lv: number): { maxHp: number; maxMp: number; attack: number; defense: number } {
    if (itemId === 'flame-sword') return { maxHp: 0, maxMp: 0, attack: 14 + lv * 3, defense: 0 };
    if (itemId === 'rusty-dagger') return { maxHp: 0, maxMp: 0, attack: 6 + lv * 2, defense: 0 };
    if (itemId === 'iron-helm') return { maxHp: 70 + lv * 12, maxMp: 0, attack: 0, defense: 3 + lv };
    if (itemId === 'guardian-charm') return { maxHp: 20 + lv * 8, maxMp: 0, attack: 0, defense: 5 + lv };
    if (itemId === 'hunter-ring') return { maxHp: 0, maxMp: 35 + lv * 10, attack: 6 + lv * 2, defense: 0 };
    return { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
  }

  private getSetBonus(): { maxHp: number; maxMp: number; attack: number; defense: number } {
    let bonus = { maxHp: 0, maxMp: 0, attack: 0, defense: 0 };
    const equipped = this.equippedItemIds;

    const fortressCount = ['flame-sword', 'iron-helm', 'guardian-charm'].filter((id) => equipped.has(id)).length;
    if (fortressCount >= 2) {
      bonus.maxHp += 80;
      bonus.defense += 4;
    }
    if (fortressCount >= 3) {
      bonus.maxHp += 140;
      bonus.attack += 10;
      bonus.defense += 4;
    }

    const hunterCount = ['rusty-dagger', 'hunter-ring'].filter((id) => equipped.has(id)).length;
    if (hunterCount >= 2) {
      bonus.attack += 8;
      bonus.maxMp += 30;
    }

    return bonus;
  }

  private refreshHud(): void {
    this.heroInfoText.setText(
      `${this.session.nickname} Lv.${this.heroLevel} (${this.classDef.label})  Wave ${this.currentWave}`
    );
    this.heroHpText.setText(`Hero HP ${this.hero.state.hp}/${this.hero.stats.maxHp}  ATK ${this.hero.stats.attack}`);
    this.heroMpText.setText(`Hero MP ${this.hero.state.mp}/${this.hero.stats.maxMp}  DEF ${this.hero.stats.defense}`);

    this.monsterHpText.setText(
      `Monster HP ${this.monster.state.hp}/${this.monster.stats.maxHp}  (${this.defeatedInWave + 1}/${this.monstersPerWave})`
    );
    this.monsterMpText.setText(
      `Monster MP ${this.monster.state.mp}/${this.monster.stats.maxMp}  DEF ${this.monster.stats.defense}`
    );

    this.skillTreeText.setText(this.formatSkillTreeText(this.classDef.skillTree));
    //this.inventoryText.setText(this.formatInventoryText());
    this.speedText.setText(`전투 속도: ${this.battleSpeed}x / Wave 고정: ${this.waveLocked ? 'ON' : 'OFF'}`);
    this.refreshRexBars();

    const labelText = (this.rexHudLabel as any)?.getElement?.('text');
    if (labelText?.setText) {
      labelText.setText(`RexUI Combat HUD / ${this.battleSpeed}x / Wave ${this.currentWave}`);
    }
  }

  private formatSkillTreeText(skillTree: SkillNode[]): string {
    const lines = skillTree.map((skill, idx) => {
      const key = idx + 1;
      const unlocked = this.unlockedSkillIds.has(skill.id) ? '해금' : '잠김';
      return `[${key}] ${skill.name} (Lv.${skill.requiredLevel}) ${unlocked}`;
    });
    return `스킬트리\n${lines.join('\n')}`;
  }

  private formatInventoryText(): string {
    if (this.inventory.size === 0) return `인벤토리\n- 비어있음`;

    const lines = Array.from(this.inventory.values())
      .map((entry) => {
        const effect = this.getItemEffectHint(entry.itemId);
        const lv = this.itemUpgradeLevels.get(entry.itemId) ?? 0;
        return `- ${entry.itemName} +${lv} x${entry.quantity} (${effect})`;
      })
      .slice(0, 8);

    return `인벤토리\n${lines.join('\n')}`;
  }

  private getItemEffectHint(itemId: string): string {
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

  private pushLog(text: string): void {
    this.logText.setText(text);
    this.tweens.killTweensOf(this.logText);
    this.tweens.add({
      targets: this.logText,
      alpha: { from: 0.45, to: 1 },
      duration: 250,
      ease: 'Sine.easeOut'
    });
  }

  private refreshRexBars(): void {
    this.setRexBarValue(this.rexHeroHpBar, this.hero.state.hp / Math.max(1, this.hero.stats.maxHp));
    this.setRexBarValue(this.rexHeroMpBar, this.hero.state.mp / Math.max(1, this.hero.stats.maxMp));
    this.setRexBarValue(this.rexMonsterHpBar, this.monster.state.hp / Math.max(1, this.monster.stats.maxHp));
    this.setRexBarValue(this.rexMonsterMpBar, this.monster.state.mp / Math.max(1, this.monster.stats.maxMp));
    this.refreshSkillCooldownHud();
  }

  private setRexBarValue(bar: any, ratio: number): void {
    if (!bar?.setValue) return;
    bar.setValue(Phaser.Math.Clamp(ratio, 0, 1));
  }

  private resolveSkillHudTheme(): { barColor: number; trackColor: number; textColor: string; iconText: string } {
    if (this.classDef.id === 'knight') {
      return { barColor: 0x5ec4ff, trackColor: 0x1d3550, textColor: '#d9f2ff', iconText: 'BRK' };
    }
    if (this.classDef.id === 'mage') {
      return { barColor: 0xcd8bff, trackColor: 0x332049, textColor: '#f1ddff', iconText: 'ARC' };
    }
    return { barColor: 0x7dffa0, trackColor: 0x1f3a2b, textColor: '#dbffe8', iconText: 'RPD' };
  }

  private refreshSkillCooldownHud(): void {
    if (!this.rexSkillCooldownRing?.setValue || !this.heroSkillTimer) return;
    const progress = Phaser.Math.Clamp(this.heroSkillTimer.getProgress(), 0, 1);
    this.rexSkillCooldownRing.setValue(1 - progress);
    const remainingMs = Math.max(0, this.classDef.activeSkill.cooldownMs * (1 - progress));
    EventBus.emit('skill-cooldown-update', {
      playerId: this.session.playerId,
      ratio: 1 - progress,
      remainingMs,
      skillName: this.classDef.activeSkill.name,
      effect: this.classDef.activeSkill.effect
    });
    if (this.rexSkillCooldownText) {
      const remainSec = remainingMs / 1000;
      this.rexSkillCooldownText.setText(remainSec <= 0.2 ? 'READY' : remainSec.toFixed(1));
    }
  }

  private showFloatingText(x: number, y: number, text: string, color: string): void {
    const floatText = this.add
      .text(x, y, text, {
        fontFamily: 'Verdana',
        fontSize: '18px',
        color,
        stroke: '#1a1a1a',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(36);

    this.tweens.add({
      targets: floatText,
      y: y - 44,
      alpha: 0,
      duration: 580,
      ease: 'Sine.easeOut',
      onComplete: () => floatText.destroy()
    });
  }

  private playSkillVisualEffect(effect: 'BREAK_ARMOR' | 'ARCANE_ECHO' | 'VAMPIRIC_SHOT'): void {
    if (effect === 'BREAK_ARMOR') {
      this.cameras.main.shake(90, 0.0028);
      const slash = this.add.rectangle(this.monsterBody.x - 6, this.monsterBody.y - 24, 14, 128, 0x86d8ff, 0.72).setAngle(34).setDepth(35);
      this.tweens.add({
        targets: slash,
        alpha: 0,
        scaleX: 0.2,
        duration: 170,
        ease: 'Sine.easeOut',
        onComplete: () => slash.destroy()
      });
      return;
    }

    if (effect === 'ARCANE_ECHO') {
      this.cameras.main.flash(120, 130, 80, 175, true);
      const ring = this.add.circle(this.monsterBody.x, this.monsterBody.y - 32, 16, 0xc389ff, 0.28).setDepth(35);
      this.tweens.add({
        targets: ring,
        scale: 3.1,
        alpha: 0,
        duration: 320,
        ease: 'Cubic.easeOut',
        onComplete: () => ring.destroy()
      });
      return;
    }

    this.cameras.main.shake(70, 0.0018);
    const lifesteal = this.add.circle(this.heroBody.x, this.heroBody.y - 26, 12, 0x86ffb0, 0.35).setDepth(35);
    this.tweens.add({
      targets: lifesteal,
      y: lifesteal.y - 36,
      scale: 1.9,
      alpha: 0,
      duration: 300,
      ease: 'Sine.easeOut',
      onComplete: () => lifesteal.destroy()
    });
  }

  private resolveHeroBaseStats() {
    if (!this.session.persistentStats) return this.classDef.baseStats;

    return {
      attack: Math.max(1, this.session.persistentStats.attack),
      defense: Math.max(0, this.session.persistentStats.defense),
      maxHp: Math.max(1, this.session.persistentStats.maxHp),
      maxMp: Math.max(1, this.session.persistentStats.maxMp)
    };
  }

  private setBattleSpeed(multiplier: number): void {
    this.battleSpeed = multiplier;
    this.time.timeScale = multiplier;
  }

  private resolveMonstersPerWave(wave: number): number {
    return Math.min(6, 2 + Math.floor((wave - 1) / 6));
  }

  private resolveScaledMonsterStats(
    base: { maxHp: number; maxMp: number; attack: number; defense: number },
    wave: number,
    sequence: number
  ): { maxHp: number; maxMp: number; attack: number; defense: number } {
    const cycleWave = ((wave - 1) % 100) + 1;
    const dungeonTier = Math.floor((cycleWave - 1) / 10);
    const hpScale = 1 + (wave - 1) * 0.16 + dungeonTier * 0.22 + (sequence - 1) * 0.06;
    const attackScale = 1 + (wave - 1) * 0.1 + dungeonTier * 0.16 + (sequence - 1) * 0.04;
    const defenseScale = 1 + (wave - 1) * 0.08 + dungeonTier * 0.13 + (sequence - 1) * 0.03;
    return {
      maxHp: Math.max(base.maxHp, Math.floor(base.maxHp * hpScale)),
      maxMp: Math.max(base.maxMp, Math.floor(base.maxMp * (1 + (wave - 1) * 0.06))),
      attack: Math.max(base.attack, Math.floor(base.attack * attackScale)),
      defense: Math.max(base.defense, Math.floor(base.defense * defenseScale))
    };
  }

  private refreshMonsterSupportSprites(): void {
    const kind = this.resolveMonsterKind(this.monsterDef.id);
    const frame = this.frameIndexFromBlock(SPRITE_BLOCKS[kind], 0, 0);
    const aliveSupportCount = Math.max(0, this.monstersPerWave - this.defeatedInWave - 1);
    this.monsterSupportSprites.forEach((sprite, idx) => {
      sprite.setTexture('sprite-pack', frame);
      sprite.setVisible(idx < aliveSupportCount);
    });
  }

  private hudStyle(): Phaser.Types.GameObjects.Text.TextStyle {
    return { fontFamily: 'Verdana', fontSize: '17px', color: '#e6f0ff' };
  }
}
