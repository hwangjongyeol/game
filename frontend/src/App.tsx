import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  AccountResponse,
  CharacterStatResponse,
  CharacterStatType,
  CompanionMasterResponse,
  CompanionPartyBonusResponse,
  UserCompanionResponse,
  assignCompanion,
  fuseCompanion,
  getCompanionMasters,
  getCompanionPartyBonus,
  getUserCompanions,
  recruitCompanions,
  claimDailyQuestOne,
  createPlayer,
  deletePlayer,
  DailyQuestListResponse,
  getCharacterStats,
  getDailyQuestList,
  getDungeonProgress,
  getEquipment,
  getEquipmentPresets,
  getItemCatalog,
  getPlayersByAccount,
  getUserItems,
  getWallet,
  loginAccount,
  ItemMasterResponse,
  PlayerResponse,
  saveEquipmentPreset,
  signUpAccount,
  consumeItem,
  upgradeItem,
  updateDungeonProgress,
  updateEquipment,
  applyEquipmentPreset,
  upgradeCharacterStat,
  UserEquipmentPresetResponse,
  UserEquipmentResponse,
  UserItemResponse,
  WalletResponse,
  addDailyQuestProgress
} from './api/client';
import GameContainer from './game/GameContainer';
import { classSelectOptions } from './game/entities/classes';
import { CharacterClassId } from './game/types';

type ViewTab = 'game' | 'inventory' | 'equipment' | 'quest' | 'companionRecruit' | 'companionManage' | 'companionFuse';
type SortType = 'rarity' | 'name' | 'quantity';
type EquipmentSlot = 'weapon' | 'armor' | 'accessory';
type CompanionSlot = 1 | 2 | 3 | 4 | 5;

const rarityOrder: Record<string, number> = {
  'flame-sword': 5,
  'ancient-core': 4,
  'hunter-ring': 4,
  'iron-helm': 3,
  'guardian-charm': 3,
  'rusty-dagger': 3,
  'minor-potion': 2,
  'goblin-coin': 2,
  'bone-fragment': 1,
  'slime-gel': 1
};

const equipmentDefs: Record<
  string,
  { slot: EquipmentSlot; label: string; effect: string; rarity: 'rare' | 'epic' | 'legend'; icon: string }
> = {
  'flame-sword': { slot: 'weapon', label: 'Flame Sword', effect: 'ATK +14', rarity: 'legend', icon: '⚔' },
  'rusty-dagger': { slot: 'weapon', label: 'Rusty Dagger', effect: 'ATK +6', rarity: 'rare', icon: '🗡' },
  'iron-helm': { slot: 'armor', label: 'Iron Helm', effect: 'HP +70 / DEF +3', rarity: 'epic', icon: '🛡' },
  'guardian-charm': { slot: 'accessory', label: 'Guardian Charm', effect: 'DEF +5 / HP +20', rarity: 'epic', icon: '✦' },
  'hunter-ring': { slot: 'accessory', label: 'Hunter Ring', effect: 'ATK +6 / MP +35', rarity: 'legend', icon: '◉' }
};

function fromEquipmentResponse(response: UserEquipmentResponse): Record<EquipmentSlot, string | null> {
  return {
    weapon: response.weaponItemId,
    armor: response.armorItemId,
    accessory: response.accessoryItemId
  };
}

function calcItemUpgradeGoldCost(level: number): number {
  const next = level + 1;
  return 150 * next * next;
}

function getEquipBonus(item: UserItemResponse): { attack: number; defense: number; maxHp: number; maxMp: number } {
  return {
    attack: item.attackBonus ?? 0,
    defense: item.defenseBonus ?? 0,
    maxHp: item.hpBonus ?? 0,
    maxMp: item.mpBonus ?? 0
  };
}

function formatItemBonus(item: UserItemResponse): string {
  const parts: string[] = [];
  if (item.attackBonus > 0) parts.push(`ATK +${item.attackBonus}`);
  if (item.defenseBonus > 0) parts.push(`DEF +${item.defenseBonus}`);
  if (item.hpBonus > 0) parts.push(`HP +${item.hpBonus}`);
  if (item.mpBonus > 0) parts.push(`MP +${item.mpBonus}`);
  return parts.length > 0 ? parts.join(' / ') : '효과 없음';
}

function calcProgressiveTotalCost(firstCost: number, step: number, count: number): number {
  if (count <= 0) return 0;
  return count * firstCost + (step * count * (count - 1)) / 2;
}

function normalizeClassId(classId: string | null | undefined): CharacterClassId {
  if (classId === 'mage' || classId === 'ranger' || classId === 'knight') {
    return classId;
  }
  return 'knight';
}

function classLabel(classId: CharacterClassId | null | undefined): string {
  if (classId === 'knight') return '전사';
  if (classId === 'mage') return '마법사';
  if (classId === 'ranger') return '궁수';
  return '전체';
}

function findNextCompanionSlot(rows: UserCompanionResponse[]): CompanionSlot | null {
  const used = new Set(rows.map((row) => row.slotNo).filter((slot): slot is CompanionSlot => slot != null));
  const slots: CompanionSlot[] = [1, 2, 3, 4, 5];
  for (const slot of slots) {
    if (!used.has(slot)) return slot;
  }
  return null;
}

export default function App() {
  const [nickname, setNickname] = useState('');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState<AccountResponse | null>(null);
  const [players, setPlayers] = useState<PlayerResponse[]>([]);
  const [player, setPlayer] = useState<PlayerResponse | null>(null);
  const [classId, setClassId] = useState<CharacterClassId>('knight');
  const [entered, setEntered] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTab>('game');
  const [sortType, setSortType] = useState<SortType>('rarity');
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [deletingPlayerId, setDeletingPlayerId] = useState<number | null>(null);
  const [upgrading, setUpgrading] = useState(false);
  const [questLoadingCode, setQuestLoadingCode] = useState<string | null>(null);
  const [wallet, setWallet] = useState<WalletResponse | null>(null);
  const [characterStats, setCharacterStats] = useState<CharacterStatResponse | null>(null);
  const [dailyQuestList, setDailyQuestList] = useState<DailyQuestListResponse | null>(null);
  const [inventory, setInventory] = useState<UserItemResponse[]>([]);
  const [currentWave, setCurrentWave] = useState(1);
  const [maxUnlockedWave, setMaxUnlockedWave] = useState(1);
  const [gameSeed, setGameSeed] = useState(0);
  const [waveFxTick, setWaveFxTick] = useState(0);
  const [pendingWave, setPendingWave] = useState<number | null>(null);
  const [waveSwitching, setWaveSwitching] = useState(false);
  const [waveLocked, setWaveLocked] = useState(false);
  const [battleSpeed, setBattleSpeed] = useState<1 | 2 | 3>(() => {
    const raw = window.localStorage.getItem('battle-speed');
    if (raw === '2' || raw === '3') return Number(raw) as 2 | 3;
    return 1;
  });
  const [upgradeMultiplier, setUpgradeMultiplier] = useState<1 | 10 | 100>(1);
  const [equipped, setEquipped] = useState<Record<EquipmentSlot, string | null>>({ weapon: null, armor: null, accessory: null });
  const [consumingItemId, setConsumingItemId] = useState<string | null>(null);
  const [upgradingItemId, setUpgradingItemId] = useState<string | null>(null);
  const [equipmentViewSlot, setEquipmentViewSlot] = useState<EquipmentSlot>('weapon');
  const [presets, setPresets] = useState<UserEquipmentPresetResponse[]>([]);
  const [presetName, setPresetName] = useState('');
  const [presetLoading, setPresetLoading] = useState(false);
  const [itemCatalogById, setItemCatalogById] = useState<Record<string, ItemMasterResponse>>({});
  const [companionMasters, setCompanionMasters] = useState<CompanionMasterResponse[]>([]);
  const [userCompanions, setUserCompanions] = useState<UserCompanionResponse[]>([]);
  const [companionPartyBonus, setCompanionPartyBonus] = useState<CompanionPartyBonusResponse | null>(null);
  const [recruitingCount, setRecruitingCount] = useState<1 | 10>(1);
  const [recruiting, setRecruiting] = useState(false);
  const [assigningCompanionId, setAssigningCompanionId] = useState<number | null>(null);
  const [fusingCompanionId, setFusingCompanionId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!account) {
      setError('먼저 계정 로그인/가입을 진행하세요.');
      return;
    }

    const trimmed = nickname.trim();
    if (!trimmed) {
      setError('닉네임을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      const created = await createPlayer(account.accountId, trimmed, classId);
      setPlayer(created);
      setClassId(normalizeClassId(created.classId));
    } catch (e) {
      setError(e instanceof Error ? e.message : '계정 생성 실패');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadPlayers = async () => {
    if (!account) {
      setError('먼저 계정 로그인/가입을 진행하세요.');
      return;
    }
    setError(null);
    try {
      setLoadingPlayers(true);
      const list = await getPlayersByAccount(account.accountId);
      setPlayers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '계정 목록 조회 실패');
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    if (!account) return;
    void handleLoadPlayers();
  }, [account]);

  const handleAccountSignUp = async () => {
    setError(null);
    try {
      const signed = await signUpAccount(loginId.trim(), password);
      setAccount(signed);
      setPlayers([]);
      setPlayer(null);
      setEntered(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '계정 가입 실패');
    }
  };

  const handleAccountLogin = async () => {
    setError(null);
    try {
      const loggedIn = await loginAccount(loginId.trim(), password);
      setAccount(loggedIn);
      setPlayers([]);
      setPlayer(null);
      setEntered(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : '계정 로그인 실패');
    }
  };

  const handleDeletePlayer = async (target: PlayerResponse) => {
    if (!account) return;
    if (!window.confirm(`${target.nickname} 캐릭터를 삭제할까요? (소프트 삭제)`)) return;
    setError(null);
    try {
      setDeletingPlayerId(target.id);
      await deletePlayer(target.id, account.accountId);
      if (player?.id === target.id) {
        setPlayer(null);
        setEntered(false);
      }
      const list = await getPlayersByAccount(account.accountId);
      setPlayers(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : '캐릭터 삭제 실패');
    } finally {
      setDeletingPlayerId(null);
    }
  };

  const loadAllPlayerData = useCallback(async (userId: number) => {
    const [walletResponse, statResponse, questResponse, itemsResponse, progress, equipment, presetRows, itemCatalog, masters, companions, partyBonus] = await Promise.all([
      getWallet(userId),
      getCharacterStats(userId),
      getDailyQuestList(userId),
      getUserItems(userId),
      getDungeonProgress(userId),
      getEquipment(userId),
      getEquipmentPresets(userId),
      getItemCatalog(),
      getCompanionMasters(),
      getUserCompanions(userId),
      getCompanionPartyBonus(userId)
    ]);

    setWallet(walletResponse);
    setCharacterStats(statResponse);
    setDailyQuestList(questResponse);
    setInventory(itemsResponse);
    setCurrentWave(progress.currentWave);
    setMaxUnlockedWave(progress.maxUnlockedWave);
    setEquipped(fromEquipmentResponse(equipment));
    setPresets(presetRows);
    setItemCatalogById(Object.fromEntries(itemCatalog.map((row) => [row.itemId, row])));
    setCompanionMasters(masters);
    setUserCompanions(companions);
    setCompanionPartyBonus(partyBonus);
  }, []);

  const handleUpgrade = async (statType: CharacterStatType) => {
    if (!player) return;
    if (!characterStats) return;

    setError(null);
    try {
      setUpgrading(true);
      let nextStats = characterStats;
      let successCount = 0;
      for (let i = 0; i < upgradeMultiplier; i += 1) {
        try {
          nextStats = await upgradeCharacterStat(player.id, statType);
          successCount += 1;
        } catch (e) {
          if (successCount === 0) {
            throw e;
          }
          break;
        }
      }
      setCharacterStats(nextStats);
      const [nextWallet, nextQuest] = await Promise.all([getWallet(player.id), getDailyQuestList(player.id)]);
      setWallet(nextWallet);
      setDailyQuestList(nextQuest);
      if (successCount > 0 && successCount < upgradeMultiplier) {
        setError(`자원 부족으로 ${successCount}회만 적용됨`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '업그레이드 실패');
    } finally {
      setUpgrading(false);
    }
  };

  const handleClaimDailyQuest = async (questCode: string) => {
    if (!player) return;
    setError(null);
    try {
      setQuestLoadingCode(questCode);
      const quests = await claimDailyQuestOne(player.id, questCode);
      setDailyQuestList(quests);
      const nextWallet = await getWallet(player.id);
      setWallet(nextWallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : '데일리 퀘스트 보상 수령 실패');
    } finally {
      setQuestLoadingCode(null);
    }
  };

  const handleMonsterKill = useCallback(
    async (event: {
      killDelta: number;
      goldEarned: number;
      waveCleared: boolean;
      currentWave: number;
      nextWave: number;
    }) => {
      if (!player) return;
      try {
        const jobs: Promise<unknown>[] = [addDailyQuestProgress(player.id, event.killDelta, event.goldEarned, 0)];
        if (event.waveCleared && !waveLocked) {
          jobs.push(updateDungeonProgress(player.id, event.nextWave, Math.max(maxUnlockedWave, event.nextWave)));
          setCurrentWave(event.nextWave);
          setMaxUnlockedWave((prev) => Math.max(prev, event.nextWave));
        }
        await Promise.all(jobs);

        const [quest, nextWallet, items] = await Promise.all([
          getDailyQuestList(player.id),
          getWallet(player.id),
          getUserItems(player.id)
        ]);

        setDailyQuestList(quest);
        setWallet(nextWallet);
        setInventory(items);
      } catch {
        // Keep combat loop unaffected by sync error
      }
    },
    [player, maxUnlockedWave, waveLocked]
  );

  useEffect(() => {
    window.localStorage.setItem('battle-speed', String(battleSpeed));
  }, [battleSpeed]);

  const handleSelectWave = async (wave: number) => {
    if (wave === currentWave) return;
    setPendingWave(wave);
  };

  const confirmSelectWave = async () => {
    if (!player) return;
    if (pendingWave == null) return;

    try {
      setWaveSwitching(true);
      const next = await updateDungeonProgress(player.id, pendingWave, maxUnlockedWave);
      setCurrentWave(next.currentWave);
      setMaxUnlockedWave(next.maxUnlockedWave);
      setGameSeed((prev) => prev + 1);
      setWaveFxTick((prev) => prev + 1);
      setPendingWave(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : '웨이브 변경 실패');
    } finally {
      setWaveSwitching(false);
    }
  };

  useEffect(() => {
    if (!player) return;

    let mounted = true;
    (async () => {
      try {
        await loadAllPlayerData(player.id);
      } catch (e) {
        if (!mounted) return;
        setError(e instanceof Error ? e.message : '초기 데이터 로드 실패');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [player, loadAllPlayerData]);

  const questSummaryLabel = useMemo(() => {
    if (!dailyQuestList) return '';
    return `처치 ${dailyQuestList.dungeonKillCount}, 골드 ${dailyQuestList.goldEarned}, 강화 ${dailyQuestList.statUpgradeCount}`;
  }, [dailyQuestList]);

  const sortedInventory = useMemo(() => {
    const arr = [...inventory];
    if (sortType === 'name') {
      arr.sort((a, b) => a.itemName.localeCompare(b.itemName));
    } else if (sortType === 'quantity') {
      arr.sort((a, b) => b.quantity - a.quantity);
    } else {
      arr.sort((a, b) => (rarityOrder[b.itemId] ?? 0) - (rarityOrder[a.itemId] ?? 0) || b.quantity - a.quantity);
    }
    return arr;
  }, [inventory, sortType]);

  const equippedItemIds = useMemo(
    () => Object.values(equipped).filter((itemId): itemId is string => Boolean(itemId)),
    [equipped]
  );

  const activeSetEffects = useMemo(() => {
    const effects: string[] = [];
    const fortressCount = ['flame-sword', 'iron-helm', 'guardian-charm'].filter((id) => equippedItemIds.includes(id)).length;
    if (fortressCount >= 2) effects.push('Fortress 2세트: HP +80 / DEF +4');
    if (fortressCount >= 3) effects.push('Fortress 3세트: HP +140 / ATK +10 / DEF +4');
    const hunterCount = ['rusty-dagger', 'hunter-ring'].filter((id) => equippedItemIds.includes(id)).length;
    if (hunterCount >= 2) effects.push('Hunter 2세트: ATK +8 / MP +30');
    return effects;
  }, [equippedItemIds]);

  const totalStatsPreview = useMemo(() => {
    if (!characterStats) return null;
    const itemRows = new Map(inventory.map((item) => [item.itemId, item]));
    const total = {
      attack: characterStats.attack,
      defense: characterStats.defense,
      maxHp: characterStats.maxHp,
      maxMp: characterStats.maxMp
    };

    for (const itemId of equippedItemIds) {
      const row = itemRows.get(itemId);
      if (!row) continue;
      const bonus = getEquipBonus(row);
      total.attack += bonus.attack;
      total.defense += bonus.defense;
      total.maxHp += bonus.maxHp;
      total.maxMp += bonus.maxMp;
    }

    const fortressCount = ['flame-sword', 'iron-helm', 'guardian-charm'].filter((id) => equippedItemIds.includes(id)).length;
    if (fortressCount >= 2) {
      total.maxHp += 80;
      total.defense += 4;
    }
    if (fortressCount >= 3) {
      total.maxHp += 140;
      total.attack += 10;
      total.defense += 4;
    }

    const hunterCount = ['rusty-dagger', 'hunter-ring'].filter((id) => equippedItemIds.includes(id)).length;
    if (hunterCount >= 2) {
      total.attack += 8;
      total.maxMp += 30;
    }

    return total;
  }, [characterStats, inventory, equippedItemIds]);

  const upgradeCostPreview = useMemo(() => {
    if (!characterStats) return null;
    return {
      attack: calcProgressiveTotalCost(characterStats.nextAttackGoldCost, 40, upgradeMultiplier),
      defense: calcProgressiveTotalCost(characterStats.nextDefenseGoldCost, 35, upgradeMultiplier),
      hp: calcProgressiveTotalCost(characterStats.nextHpGoldCost, 45, upgradeMultiplier),
      mp: calcProgressiveTotalCost(characterStats.nextMpGoldCost, 45, upgradeMultiplier)
    };
  }, [characterStats, upgradeMultiplier]);

  const canUpgrade = useMemo(() => {
    if (!wallet || !upgradeCostPreview) {
      return { attack: false, defense: false, hp: false, mp: false };
    }
    return {
      attack: wallet.gold >= upgradeCostPreview.attack,
      defense: wallet.gold >= upgradeCostPreview.defense,
      hp: wallet.gold >= upgradeCostPreview.hp,
      mp: wallet.gold >= upgradeCostPreview.mp
    };
  }, [wallet, upgradeCostPreview]);

  const canCreateCharacter = useMemo(() => players.length < 5, [players.length]);

  const equippedRows = useMemo(() => {
    const map = new Map(inventory.map((item) => [item.itemId, item]));
    return {
      weapon: equipped.weapon ? map.get(equipped.weapon) ?? null : null,
      armor: equipped.armor ? map.get(equipped.armor) ?? null : null,
      accessory: equipped.accessory ? map.get(equipped.accessory) ?? null : null
    };
  }, [inventory, equipped]);

  const equipCandidates = useMemo(() => {
    const playerClass = normalizeClassId(player?.classId);
    const rows = sortedInventory.filter((item) => {
      if (!equipmentDefs[item.itemId] || item.quantity <= 0) return false;
      const catalog = itemCatalogById[item.itemId];
      if (!catalog?.requiredClassId) return true;
      return normalizeClassId(catalog.requiredClassId) === playerClass;
    });
    return {
      weapon: rows.filter((item) => equipmentDefs[item.itemId].slot === 'weapon'),
      armor: rows.filter((item) => equipmentDefs[item.itemId].slot === 'armor'),
      accessory: rows.filter((item) => equipmentDefs[item.itemId].slot === 'accessory')
    };
  }, [sortedInventory, itemCatalogById, player?.classId]);

  const selectedEquipCandidates = useMemo(() => {
    if (equipmentViewSlot === 'weapon') return equipCandidates.weapon;
    if (equipmentViewSlot === 'armor') return equipCandidates.armor;
    return equipCandidates.accessory;
  }, [equipCandidates, equipmentViewSlot]);

  const currentPlayerClass = useMemo(() => normalizeClassId(player?.classId), [player?.classId]);

  const activeCompanions = useMemo(
    () => userCompanions.filter((row) => row.slotNo != null).sort((a, b) => (a.slotNo ?? 99) - (b.slotNo ?? 99)),
    [userCompanions]
  );

  const sortedCompanionsForManage = useMemo(
    () =>
      [...userCompanions].sort((a, b) => {
        const aChecked = a.slotNo != null ? 1 : 0;
        const bChecked = b.slotNo != null ? 1 : 0;
        if (aChecked !== bChecked) return bChecked - aChecked;
        if ((a.slotNo ?? 99) !== (b.slotNo ?? 99)) return (a.slotNo ?? 99) - (b.slotNo ?? 99);
        return a.id - b.id;
      }),
    [userCompanions]
  );

  const recruitCost = useMemo(() => (recruitingCount === 10 ? 2700 : 300), [recruitingCount]);

  const handleRecruitCompanion = async () => {
    if (!player) return;
    try {
      setRecruiting(true);
      const [companions, nextWallet, nextParty, stats] = await Promise.all([
        recruitCompanions(player.id, recruitingCount),
        getWallet(player.id),
        getCompanionPartyBonus(player.id),
        getCharacterStats(player.id)
      ]);
      setUserCompanions(companions);
      setWallet(nextWallet);
      setCompanionPartyBonus(nextParty);
      setCharacterStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : '동료 뽑기 실패');
    } finally {
      setRecruiting(false);
    }
  };

  const handleAssignCompanion = async (userCompanionId: number, slotNo: CompanionSlot | null) => {
    if (!player) return;
    try {
      setAssigningCompanionId(userCompanionId);
      const [companions, party, stats] = await Promise.all([
        assignCompanion(player.id, userCompanionId, slotNo),
        getCompanionPartyBonus(player.id),
        getCharacterStats(player.id)
      ]);
      setUserCompanions(companions);
      setCompanionPartyBonus(party);
      setCharacterStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : '동료 편성 실패');
    } finally {
      setAssigningCompanionId(null);
    }
  };

  const handleToggleCompanionAssign = async (row: UserCompanionResponse) => {
    if (row.slotNo != null) {
      await handleAssignCompanion(row.id, null);
      return;
    }
    const nextSlot = findNextCompanionSlot(userCompanions);
    if (!nextSlot) {
      setError('동료 편성은 최대 5명까지 가능합니다.');
      return;
    }
    await handleAssignCompanion(row.id, nextSlot);
  };

  const resolveFuseNeed = (level: number): number => {
    if (level <= 1) return 1;
    if (level === 2) return 3;
    if (level === 3) return 5;
    if (level === 4) return 7;
    return 10;
  };

  const handleFuseCompanion = async (row: UserCompanionResponse) => {
    if (!player) return;
    try {
      setFusingCompanionId(row.id);
      await fuseCompanion(player.id, row.id);
      const [companions, party, stats] = await Promise.all([
        getUserCompanions(player.id),
        getCompanionPartyBonus(player.id),
        getCharacterStats(player.id)
      ]);
      setUserCompanions(companions);
      setCompanionPartyBonus(party);
      setCharacterStats(stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : '동료 합성 실패');
    } finally {
      setFusingCompanionId(null);
    }
  };

  const handleToggleEquip = async (item: UserItemResponse) => {
    if (!player) return;
    const meta = equipmentDefs[item.itemId];
    if (!meta || item.quantity <= 0) return;

    try {
      const itemId = equipped[meta.slot] === item.itemId ? null : item.itemId;
      const next = await updateEquipment(player.id, meta.slot, itemId);
      setEquipped(fromEquipmentResponse(next));
    } catch (e) {
      setError(e instanceof Error ? e.message : '장착 변경 실패');
    }
  };

  const handleUnequipSlot = async (slot: EquipmentSlot) => {
    if (!player) return;
    try {
      const next = await updateEquipment(player.id, slot, null);
      setEquipped(fromEquipmentResponse(next));
    } catch (e) {
      setError(e instanceof Error ? e.message : '장착 해제 실패');
    }
  };

  const handleConsumeItem = async (item: UserItemResponse) => {
    if (!player) return;
    if (!['minor-potion', 'slime-gel'].includes(item.itemId)) return;
    try {
      setConsumingItemId(item.itemId);
      const nextItems = await consumeItem(player.id, item.itemId, 1);
      setInventory(nextItems);
      const nextWallet = await getWallet(player.id);
      setWallet(nextWallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : '아이템 사용 실패');
    } finally {
      setConsumingItemId(null);
    }
  };

  const handleUpgradeItem = async (item: UserItemResponse) => {
    if (!player) return;
    if (!equipmentDefs[item.itemId]) return;
    try {
      setUpgradingItemId(item.itemId);
      await upgradeItem(player.id, item.itemId);
      const [nextItems, nextWallet] = await Promise.all([getUserItems(player.id), getWallet(player.id)]);
      setInventory(nextItems);
      setWallet(nextWallet);
    } catch (e) {
      setError(e instanceof Error ? e.message : '아이템 강화 실패');
    } finally {
      setUpgradingItemId(null);
    }
  };

  const handleSavePreset = async () => {
    if (!player) return;
    const name = presetName.trim();
    if (!name) return;
    try {
      setPresetLoading(true);
      await saveEquipmentPreset(player.id, name);
      const rows = await getEquipmentPresets(player.id);
      setPresets(rows);
      setPresetName('');
    } catch (e) {
      setError(e instanceof Error ? e.message : '프리셋 저장 실패');
    } finally {
      setPresetLoading(false);
    }
  };

  const handleApplyPreset = async (name: string) => {
    if (!player) return;
    try {
      setPresetLoading(true);
      const next = await applyEquipmentPreset(player.id, name);
      setEquipped(fromEquipmentResponse(next));
    } catch (e) {
      setError(e instanceof Error ? e.message : '프리셋 적용 실패');
    } finally {
      setPresetLoading(false);
    }
  };

  return (
    <main className="app-root">
      <section className="panel">
        <h1>AutoGame</h1>
        {!account && (
          <div className="form-box">
            <label htmlFor="loginId">계정 ID</label>
            <input id="loginId" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="예: test001" />
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8자 이상"
            />
            <div className="segment-row">
              <button type="button" onClick={handleAccountSignUp}>
                계정 가입
              </button>
              <button type="button" onClick={handleAccountLogin}>
                로그인
              </button>
            </div>
          </div>
        )}

        {account && (
          <div className="ready-box">
            <p>
              로그인 계정: {account.loginId} (ID: {account.accountId})
            </p>
            <p>캐릭터 슬롯: {players.length}/5</p>
          </div>
        )}

        {!player && account && (
          <form onSubmit={handleCreate} className="form-box">
            <label htmlFor="nickname">닉네임</label>
            <input
              id="nickname"
              maxLength={20}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="예: dbtest01"
            />

            <label htmlFor="classId">클래스</label>
            <select id="classId" value={classId} onChange={(e) => setClassId(e.target.value as CharacterClassId)}>
              {classSelectOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </select>

            <button type="submit" disabled={loading || !canCreateCharacter}>
              {loading ? '생성중...' : '계정 만들기'}
            </button>
            {!canCreateCharacter && <p className="error">계정당 캐릭터는 최대 5개입니다.</p>}
          </form>
        )}

        {!player && account && (
          <div className="list-box">
            <button onClick={handleLoadPlayers} type="button" disabled={loadingPlayers}>
              {loadingPlayers ? '조회중...' : '기존 계정 조회'}
            </button>
            {players.length > 0 && (
              <ul className="player-list">
                {players.map((item) => (
                  <li key={item.id}>
                    <div className="player-row">
                      <button
                        type="button"
                        onClick={() => {
                          setPlayer(item);
                          setClassId(normalizeClassId(item.classId));
                        }}
                      >
                        {item.nickname} (ID: {item.id}) / {item.classId}
                      </button>
                      <button
                        type="button"
                        className="mini-btn"
                        onClick={() => handleDeletePlayer(item)}
                        disabled={deletingPlayerId === item.id}
                      >
                        {deletingPlayerId === item.id ? '삭제중' : '삭제'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {player && !entered && (
          <div className="ready-box">
            <p>
              선택 계정: {player.nickname} (ID: {player.id}) / 클래스: {classId}
            </p>
            <button onClick={() => setEntered(true)}>게임 입장</button>
          </div>
        )}

        {player && entered && (
          <div className="tab-box">
            <button type="button" onClick={() => setViewTab('game')} disabled={viewTab === 'game'}>
              게임
            </button>
            <button type="button" onClick={() => setViewTab('inventory')} disabled={viewTab === 'inventory'}>
              인벤토리
            </button>
            <button type="button" onClick={() => setViewTab('equipment')} disabled={viewTab === 'equipment'}>
              장착
            </button>
            <button type="button" onClick={() => setViewTab('quest')} disabled={viewTab === 'quest'}>
              퀘스트
            </button>
            <button type="button" onClick={() => setViewTab('companionRecruit')} disabled={viewTab === 'companionRecruit'}>
              동료 뽑기
            </button>
            <button type="button" onClick={() => setViewTab('companionManage')} disabled={viewTab === 'companionManage'}>
              동료 설정
            </button>
            <button type="button" onClick={() => setViewTab('companionFuse')} disabled={viewTab === 'companionFuse'}>
              동료 합성
            </button>
          </div>
        )}

        {player && entered && viewTab === 'game' && (
          <div className="wave-box">
            <h3>웨이브 선택</h3>
            <p>
              현재: {currentWave} / 최대: {maxUnlockedWave}
            </p>
            <div className="segment-row">
              <button type="button" className={!waveLocked ? 'seg-active' : ''} onClick={() => setWaveLocked(false)}>
                진행
              </button>
              <button type="button" className={waveLocked ? 'seg-active' : ''} onClick={() => setWaveLocked(true)}>
                고정
              </button>
            </div>
            <select value={currentWave} onChange={(e) => handleSelectWave(Number(e.target.value))}>
              {Array.from({ length: maxUnlockedWave }, (_, i) => i + 1).map((wave) => (
                <option key={wave} value={wave}>
                  Wave {wave}
                </option>
              ))}
            </select>
            <div className="segment-row">
              <button type="button" className={battleSpeed === 1 ? 'seg-active' : ''} onClick={() => setBattleSpeed(1)}>
                X1
              </button>
              <button type="button" className={battleSpeed === 2 ? 'seg-active' : ''} onClick={() => setBattleSpeed(2)}>
                X2
              </button>
              <button type="button" className={battleSpeed === 3 ? 'seg-active' : ''} onClick={() => setBattleSpeed(3)}>
                X3
              </button>
            </div>
          </div>
        )}

        {player && wallet && viewTab === 'game' && (
          <div className="economy-box">
            <h3>재화</h3>
            <p>Gold: {wallet.gold}</p>
            <p>Gem: {wallet.gem}</p>
          </div>
        )}

        {player && characterStats && viewTab === 'game' && (
          <div className="upgrade-box">
            <h3>능력치 업그레이드</h3>
            <div className="segment-row">
              <button
                type="button"
                className={upgradeMultiplier === 1 ? 'seg-active' : ''}
                onClick={() => setUpgradeMultiplier(1)}
              >
                X1
              </button>
              <button
                type="button"
                className={upgradeMultiplier === 10 ? 'seg-active' : ''}
                onClick={() => setUpgradeMultiplier(10)}
              >
                X10
              </button>
              <button
                type="button"
                className={upgradeMultiplier === 100 ? 'seg-active' : ''}
                onClick={() => setUpgradeMultiplier(100)}
              >
                X100
              </button>
            </div>
            <p>ATK {characterStats.attack} (Lv.{characterStats.attackLevel})</p>
            <button type="button" onClick={() => handleUpgrade('ATTACK')} disabled={upgrading || !canUpgrade.attack}>
              공격 업 x{upgradeMultiplier} (Gold {upgradeCostPreview?.attack ?? characterStats.nextAttackGoldCost})
            </button>

            <p>DEF {characterStats.defense} (Lv.{characterStats.defenseLevel})</p>
            <button type="button" onClick={() => handleUpgrade('DEFENSE')} disabled={upgrading || !canUpgrade.defense}>
              방어 업 x{upgradeMultiplier} (Gold {upgradeCostPreview?.defense ?? characterStats.nextDefenseGoldCost})
            </button>

            <p>HP {characterStats.maxHp} (Lv.{characterStats.hpLevel})</p>
            <button type="button" onClick={() => handleUpgrade('MAX_HP')} disabled={upgrading || !canUpgrade.hp}>
              HP 업 x{upgradeMultiplier} (Gold {upgradeCostPreview?.hp ?? characterStats.nextHpGoldCost})
            </button>

            <p>MP {characterStats.maxMp} (Lv.{characterStats.mpLevel})</p>
            <button type="button" onClick={() => handleUpgrade('MAX_MP')} disabled={upgrading || !canUpgrade.mp}>
              MP 업 x{upgradeMultiplier} (Gold {upgradeCostPreview?.mp ?? characterStats.nextMpGoldCost})
            </button>
            {totalStatsPreview && (
              <p>
                합산(장비/세트 포함) ATK {totalStatsPreview.attack} / DEF {totalStatsPreview.defense} / HP{' '}
                {totalStatsPreview.maxHp} / MP {totalStatsPreview.maxMp}
              </p>
            )}
          </div>
        )}

        {viewTab === 'inventory' && (
          <div className="inventory-box">
            <h3>인벤토리</h3>
            <select value={sortType} onChange={(e) => setSortType(e.target.value as SortType)}>
              <option value="rarity">희귀도</option>
              <option value="quantity">수량</option>
              <option value="name">이름</option>
            </select>
            {sortedInventory.length === 0 ? (
              <p>아이템 없음</p>
            ) : (
              <ul className="item-list">
                {sortedInventory.map((item) => (
                  <li
                    key={`${item.itemId}-${item.userId}`}
                    className={equipmentDefs[item.itemId] ? `rarity-${equipmentDefs[item.itemId].rarity}` : ''}
                  >
                    <span>
                      {equipmentDefs[item.itemId] ? `${equipmentDefs[item.itemId].icon} ` : ''}
                      {item.itemName}
                      {item.upgradeLevel > 0 ? ` +${item.upgradeLevel}` : ''}
                      {equipmentDefs[item.itemId] && (
                        <small className="item-effect"> ({formatItemBonus(item)})</small>
                      )}
                      {itemCatalogById[item.itemId]?.requiredClassId && (
                        <small className="item-effect">
                          {' '}
                          [직업: {classLabel(normalizeClassId(itemCatalogById[item.itemId].requiredClassId))}]
                          {normalizeClassId(itemCatalogById[item.itemId].requiredClassId) !== currentPlayerClass && ' 장착 불가'}
                        </small>
                      )}
                    </span>
                    <div className="item-actions">
                      <strong>x{item.quantity}</strong>
                      {['minor-potion', 'slime-gel'].includes(item.itemId) && (
                        <button
                          type="button"
                          className="mini-btn"
                          onClick={() => handleConsumeItem(item)}
                          disabled={consumingItemId === item.itemId}
                        >
                          {consumingItemId === item.itemId ? '사용중' : '사용'}
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {viewTab === 'equipment' && (
          <div className="inventory-box">
            <h3>장착 화면</h3>
            <div className="equip-grid">
              <div className="equip-box">
                <h4>무기 슬롯</h4>
                <p>{equippedRows.weapon ? equippedRows.weapon.itemName : '미장착'}</p>
                <p className="item-effect">{equippedRows.weapon ? formatItemBonus(equippedRows.weapon) : '-'}</p>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => handleUnequipSlot('weapon')}
                >
                  해제
                </button>
              </div>
              <div className="equip-box">
                <h4>방어구 슬롯</h4>
                <p>{equippedRows.armor ? equippedRows.armor.itemName : '미장착'}</p>
                <p className="item-effect">{equippedRows.armor ? formatItemBonus(equippedRows.armor) : '-'}</p>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => handleUnequipSlot('armor')}
                >
                  해제
                </button>
              </div>
              <div className="equip-box">
                <h4>장신구 슬롯</h4>
                <p>{equippedRows.accessory ? equippedRows.accessory.itemName : '미장착'}</p>
                <p className="item-effect">{equippedRows.accessory ? formatItemBonus(equippedRows.accessory) : '-'}</p>
                <button
                  type="button"
                  className="mini-btn"
                  onClick={() => handleUnequipSlot('accessory')}
                >
                  해제
                </button>
              </div>
            </div>
            {activeSetEffects.length > 0 && (
              <div className="set-box">
                {activeSetEffects.map((effect) => (
                  <p key={effect}>{effect}</p>
                ))}
              </div>
            )}
            <div className="segment-row">
              <button
                type="button"
                className={equipmentViewSlot === 'weapon' ? 'seg-active' : ''}
                onClick={() => setEquipmentViewSlot('weapon')}
              >
                무기
              </button>
              <button
                type="button"
                className={equipmentViewSlot === 'armor' ? 'seg-active' : ''}
                onClick={() => setEquipmentViewSlot('armor')}
              >
                방어구
              </button>
              <button
                type="button"
                className={equipmentViewSlot === 'accessory' ? 'seg-active' : ''}
                onClick={() => setEquipmentViewSlot('accessory')}
              >
                장신구
              </button>
            </div>
            <ul className="item-list">
              {selectedEquipCandidates.map((item) => (
                <li key={`equip-${equipmentViewSlot}-${item.itemId}-${item.userId}`} className={`rarity-${equipmentDefs[item.itemId].rarity}`}>
                  <span>
                    {equipmentDefs[item.itemId].icon} {item.itemName} {item.upgradeLevel > 0 ? `+${item.upgradeLevel}` : ''}
                    <small className="item-effect"> ({formatItemBonus(item)})</small>
                  </span>
                  <div className="item-actions">
                    <strong>x{item.quantity}</strong>
                    <button type="button" className="mini-btn" onClick={() => handleUpgradeItem(item)} disabled={upgradingItemId === item.itemId}>
                      {upgradingItemId === item.itemId ? '강화중' : `강화 ${calcItemUpgradeGoldCost(item.upgradeLevel)}G`}
                    </button>
                    <button type="button" className="mini-btn" onClick={() => handleToggleEquip(item)}>
                      {equipped[equipmentDefs[item.itemId].slot] === item.itemId ? '해제' : '장착'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="preset-box">
              <h4>프리셋</h4>
              <div className="preset-row">
                <input
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="예: 보스용 / 파밍용"
                  maxLength={40}
                />
                <button type="button" onClick={handleSavePreset} disabled={presetLoading}>
                  저장
                </button>
              </div>
              <ul className="preset-list">
                {presets.map((preset) => (
                  <li key={`${preset.userId}-${preset.presetName}`}>
                    <span>{preset.presetName}</span>
                    <button type="button" className="mini-btn" onClick={() => handleApplyPreset(preset.presetName)} disabled={presetLoading}>
                      적용
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {viewTab === 'quest' && dailyQuestList && (
          <div className="inventory-box">
            <h3>데일리 퀘스트 10개</h3>
            <p>{questSummaryLabel}</p>
            <ul className="item-list">
              {dailyQuestList.quests.map((quest) => (
                <li key={quest.questCode}>
                  <span>
                    {quest.title}
                    <small className="item-effect">
                      {' '}
                      ({quest.progress}/{quest.target}) / 보상 {quest.rewardGold}G {quest.rewardGem}Gem
                    </small>
                  </span>
                  <div className="item-actions">
                    <button
                      type="button"
                      className="mini-btn"
                      disabled={!quest.claimable || quest.claimed || questLoadingCode === quest.questCode}
                      onClick={() => handleClaimDailyQuest(quest.questCode)}
                    >
                      {quest.claimed ? '수령완료' : questLoadingCode === quest.questCode ? '수령중' : quest.claimable ? '수령' : '진행중'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {viewTab === 'companionRecruit' && (
          <div className="inventory-box">
            <h3>동료 뽑기 (Gem)</h3>
            <p>1회: 300 Gem / 10회: 2700 Gem (9회 가격)</p>
            <div className="segment-row">
              <button type="button" className={recruitingCount === 1 ? 'seg-active' : ''} onClick={() => setRecruitingCount(1)}>
                x1
              </button>
              <button type="button" className={recruitingCount === 10 ? 'seg-active' : ''} onClick={() => setRecruitingCount(10)}>
                x10
              </button>
              <button type="button" onClick={handleRecruitCompanion} disabled={recruiting || (wallet?.gem ?? 0) < recruitCost}>
                {recruiting ? '뽑는 중...' : `뽑기 (${recruitCost} Gem)`}
              </button>
            </div>
            <ul className="item-list">
              {companionMasters.slice(0, 20).map((row) => (
                <li key={row.companionId}>
                  <span>
                    {row.companionName} [{row.grade}] / {row.classId} / ATK {row.baseAttack} DEF {row.baseDefense} HP {row.baseHp} MP {row.baseMp}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {viewTab === 'companionManage' && (
          <div className="inventory-box">
            <h3>동료 설정 (최대 5명)</h3>
            <p>
              편성 보너스: ATK {companionPartyBonus?.bonusAttack ?? 0} / DEF {companionPartyBonus?.bonusDefense ?? 0} / HP{' '}
              {companionPartyBonus?.bonusHp ?? 0} / MP {companionPartyBonus?.bonusMp ?? 0}
            </p>
            <ul className="item-list">
              {sortedCompanionsForManage.map((row) => (
                <li key={`companion-manage-${row.id}`}>
                  <span>
                    {row.slotNo != null ? '✅ ' : ''}
                    {row.companionName} [{row.grade}] Lv.{row.level} / 복제 {row.copies} / 편성 {row.slotNo ?? '-'}
                    {row.slotNo != null && <strong className="slot-badge">S{row.slotNo}</strong>}
                  </span>
                  <div className="item-actions">
                    <label className="companion-check">
                      <input
                        type="checkbox"
                        checked={row.slotNo != null}
                        disabled={assigningCompanionId === row.id || (row.slotNo == null && activeCompanions.length >= 5)}
                        onChange={() => handleToggleCompanionAssign(row)}
                      />
                      <span>{row.slotNo != null ? `선택됨(S${row.slotNo})` : '선택'}</span>
                    </label>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {viewTab === 'companionFuse' && (
          <div className="inventory-box">
            <h3>동료 합성</h3>
            <ul className="item-list">
              {userCompanions.map((row) => {
                const need = resolveFuseNeed(row.level);
                const canFuse = row.copies >= need;
                return (
                  <li key={`companion-fuse-${row.id}`}>
                    <span>
                      {row.companionName} Lv.{row.level} / 보유 복제 {row.copies} / 필요 {need}
                    </span>
                    <div className="item-actions">
                      <button
                        type="button"
                        className="mini-btn"
                        disabled={!canFuse || fusingCompanionId === row.id}
                        onClick={() => handleFuseCompanion(row)}
                      >
                        {fusingCompanionId === row.id ? '합성중' : canFuse ? '합성' : '복제 부족'}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </section>

      {player && entered && characterStats && (
        <GameContainer
          key={`${player.id}-${gameSeed}`}
          playerId={player.id}
          nickname={player.nickname}
          classId={classId}
          startWave={currentWave}
          waveFxTick={waveFxTick}
          hidden={viewTab !== 'game'}
          battleSpeed={battleSpeed}
          waveLocked={waveLocked}
          equippedItemIds={equippedItemIds}
          onMonsterKill={handleMonsterKill}
          initialInventory={inventory.map((item) => ({
            itemId: item.itemId,
            itemName: item.itemName,
            quantity: item.quantity,
            upgradeLevel: item.upgradeLevel,
            attackBonus: item.attackBonus,
            defenseBonus: item.defenseBonus,
            hpBonus: item.hpBonus,
            mpBonus: item.mpBonus
          }))}
          activeCompanions={activeCompanions.map((row) => ({
            id: row.id,
            companionId: row.companionId,
            companionName: row.companionName,
            classId: normalizeClassId(row.classId),
            slotNo: row.slotNo
          }))}
          persistentStats={{
            attack: characterStats.attack,
            defense: characterStats.defense,
            maxHp: characterStats.maxHp,
            maxMp: characterStats.maxMp
          }}
        />
      )}

      {pendingWave !== null && (
        <section className="modal-backdrop">
          <div className="modal-card">
            <h3>웨이브 이동 확인</h3>
            <p>
              현재 Wave {currentWave}에서 Wave {pendingWave}(으)로 이동할까요?
            </p>
            <div className="modal-actions">
              <button type="button" onClick={confirmSelectWave} disabled={waveSwitching}>
                {waveSwitching ? '이동중...' : '확인'}
              </button>
              <button type="button" onClick={() => setPendingWave(null)} disabled={waveSwitching}>
                취소
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
