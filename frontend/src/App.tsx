import { FormEvent, SyntheticEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography
} from '@mui/material';
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
  getClasses,
  getDailyQuestList,
  getDungeonProgress,
  getEquipment,
  getEquipmentPresets,
  getSessionAccount,
  logoutAccount,
  getItemCatalog,
  getPlayersByAccount,
  getRuntimeBalanceProfile,
  getWaveRuntimeConfig,
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
  WaveRuntimeConfigResponse,
  addDailyQuestProgress
} from './api/client';
import { setRuntimeBalanceProfile } from './game/balance/dbBalanceAdapter';
import GameContainer from './game/GameContainer';
import {
  EQUIPMENT_RARITY_SORT_WEIGHT,
  EQUIPMENT_UI_META,
  type EquipmentSlot,
  calcItemUpgradeGoldCost,
  calcSetBonus,
  describeActiveSetEffects
} from './game/balance/equipmentBalance';
import { CharacterClassId } from './game/types';

type ViewTab = 'game' | 'stats' | 'inventory' | 'equipment' | 'quest' | 'companionRecruit' | 'companionManage' | 'companionFuse';
type SortType = 'rarity' | 'name' | 'quantity';
type CompanionSlot = 1 | 2 | 3 | 4 | 5;

const viewTabMeta: Array<{ tab: ViewTab; label: string }> = [
  { tab: 'game', label: '게임' },
  { tab: 'stats', label: '능력치' },
  { tab: 'inventory', label: '인벤토리' },
  { tab: 'equipment', label: '장비' },
  { tab: 'quest', label: '퀘스트' },
  { tab: 'companionRecruit', label: '동료뽑기' },
  { tab: 'companionManage', label: '동료' },
  { tab: 'companionFuse', label: '동료합성' }
];

function fromEquipmentResponse(response: UserEquipmentResponse): Record<EquipmentSlot, string | null> {
  return {
    weapon: response.weaponItemId,
    armor: response.armorItemId,
    accessory: response.accessoryItemId
  };
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
  return (classId ?? '').trim().toLowerCase();
}

function lastPlayerStorageKey(accountId: number): string {
  return `autogame.lastPlayerId.${accountId}`;
}

function toWaveLabel(wave: number): string {
  const group = Math.floor((Math.max(1, wave) - 1) / 10) + 1;
  const sub = ((Math.max(1, wave) - 1) % 10) + 1;
  return `${group}-${sub}`;
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
  const [classOptions, setClassOptions] = useState<Array<{ id: string; label: string }>>([
    { id: 'knight', label: 'Knight' },
    { id: 'mage', label: 'Mage' },
    { id: 'ranger', label: 'Ranger' }
  ]);
  const [classRenderProfileById, setClassRenderProfileById] = useState<Record<string, string | null>>({});
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
  const [waveRuntimeConfig, setWaveRuntimeConfig] = useState<WaveRuntimeConfigResponse | undefined>(undefined);
  const [gameSeed, setGameSeed] = useState(0);
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
  const classNameById = useMemo(
    () => Object.fromEntries(classOptions.map((item) => [item.id, item.label])),
    [classOptions]
  );

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
      setEntered(true);
      window.localStorage.setItem(lastPlayerStorageKey(account.accountId), String(created.id));
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
    let mounted = true;
    (async () => {
      try {
        const sessionAccount = await getSessionAccount();
        if (!mounted || !sessionAccount) return;
        setAccount(sessionAccount);
      } catch {
        // ignore session restore error
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!account) return;
    void handleLoadPlayers();
  }, [account]);

  useEffect(() => {
    if (!account) return;
    if (player) {
      setClassId(normalizeClassId(player.classId));
      return;
    }
    if (players.length <= 0) return;

    // 리로드 시 마지막 선택 캐릭터만 자동 복원하고, 없으면 선택 화면 유지
    const raw = window.localStorage.getItem(lastPlayerStorageKey(account.accountId));
    const preferredId = raw ? Number(raw) : Number.NaN;
    if (Number.isNaN(preferredId)) return;

    const restored = players.find((row) => row.id === preferredId);
    if (!restored) {
      window.localStorage.removeItem(lastPlayerStorageKey(account.accountId));
      return;
    }
    setPlayer(restored);
    setEntered(true);
    setClassId(normalizeClassId(restored.classId));
  }, [account, player, players]);

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

  const handleLogout = async () => {
    setError(null);
    try {
      await logoutAccount();
    } catch (e) {
      setError(e instanceof Error ? e.message : '로그아웃 실패');
    } finally {
      if (account) {
        window.localStorage.removeItem(lastPlayerStorageKey(account.accountId));
      }
      setAccount(null);
      setPlayers([]);
      setPlayer(null);
      setEntered(false);
      setViewTab('game');
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
        window.localStorage.removeItem(lastPlayerStorageKey(account.accountId));
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
    const [walletResponse, statResponse, questResponse, itemsResponse, progress, equipment, presetRows, itemCatalog, masters, companions, partyBonus, runtimeBalance, classes, waveRuntime] = await Promise.all([
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
      getCompanionPartyBonus(userId),
      getRuntimeBalanceProfile().catch(() => ({})),
      getClasses().catch(() => []),
      getWaveRuntimeConfig('dungeon1').catch(() => undefined)
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
    setRuntimeBalanceProfile(runtimeBalance);
    setWaveRuntimeConfig(waveRuntime);
    if (classes.length > 0) {
      setClassOptions(classes.map((row) => ({ id: normalizeClassId(row.classId), label: row.className || row.classId })));
      setClassRenderProfileById(
        Object.fromEntries(classes.map((row) => [normalizeClassId(row.classId), row.renderProfileJson ?? null]))
      );
    }
  }, []);

  useEffect(() => {
    if (!account) return;
    void getClasses()
      .then((classes) => {
        if (classes.length <= 0) return;
        const options = classes.map((row) => ({ id: normalizeClassId(row.classId), label: row.className || row.classId }));
        setClassOptions(options);
        setClassRenderProfileById(
          Object.fromEntries(classes.map((row) => [normalizeClassId(row.classId), row.renderProfileJson ?? null]))
        );
        if (!options.some((item) => item.id === classId)) {
          setClassId(options[0].id);
        }
      })
      .catch(() => {
        // keep fallback options
      });
  }, [account, classId]);

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

  const handleWaveSettingChange = (raw: string) => {
    if (raw === 'last') {
      setWaveLocked(false);
      if (currentWave !== maxUnlockedWave) {
        void handleSelectWave(maxUnlockedWave);
      }
      return;
    }
    const wave = Number(raw);
    if (Number.isNaN(wave) || wave < 1) return;
    setWaveLocked(true);
    if (wave !== currentWave) {
      void handleSelectWave(wave);
    }
  };

  const cycleBattleSpeed = () => {
    setBattleSpeed((prev) => {
      if (prev === 1) return 2;
      if (prev === 2) return 3;
      return 1;
    });
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
      arr.sort((a, b) => (EQUIPMENT_RARITY_SORT_WEIGHT[b.itemId] ?? 0) - (EQUIPMENT_RARITY_SORT_WEIGHT[a.itemId] ?? 0) || b.quantity - a.quantity);
    }
    return arr;
  }, [inventory, sortType]);

  const equippedItemIds = useMemo(
    () => Object.values(equipped).filter((itemId): itemId is string => Boolean(itemId)),
    [equipped]
  );

  const activeSetEffects = useMemo(() => {
    return describeActiveSetEffects(equippedItemIds);
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

    const setBonus = calcSetBonus(equippedItemIds);
    total.attack += setBonus.attack;
    total.defense += setBonus.defense;
    total.maxHp += setBonus.maxHp;
    total.maxMp += setBonus.maxMp;

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
      if (!EQUIPMENT_UI_META[item.itemId] || item.quantity <= 0) return false;
      const catalog = itemCatalogById[item.itemId];
      if (!catalog?.requiredClassId) return true;
      return normalizeClassId(catalog.requiredClassId) === playerClass;
    });
    return {
      weapon: rows.filter((item) => EQUIPMENT_UI_META[item.itemId].slot === 'weapon'),
      armor: rows.filter((item) => EQUIPMENT_UI_META[item.itemId].slot === 'armor'),
      accessory: rows.filter((item) => EQUIPMENT_UI_META[item.itemId].slot === 'accessory')
    };
  }, [sortedInventory, itemCatalogById, player?.classId]);

  const selectedEquipCandidates = useMemo(() => {
    if (equipmentViewSlot === 'weapon') return equipCandidates.weapon;
    if (equipmentViewSlot === 'armor') return equipCandidates.armor;
    return equipCandidates.accessory;
  }, [equipCandidates, equipmentViewSlot]);

  const currentPlayerClass = useMemo(() => normalizeClassId(player?.classId), [player?.classId]);
  const activeClassId = useMemo(
    () => normalizeClassId(player?.classId ?? classId),
    [player?.classId, classId]
  );

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
    const meta = EQUIPMENT_UI_META[item.itemId];
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
    if (!EQUIPMENT_UI_META[item.itemId]) return;
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

  const inBattleLayout = Boolean(player && entered);
  const overlayPanelVisible = inBattleLayout && viewTab !== 'game' && viewTab !== 'stats';

  return (
    <main className={`app-root rpg-shell ${inBattleLayout ? 'in-battle-layout' : ''} ${overlayPanelVisible ? 'overlay-panel-visible' : 'overlay-panel-hidden'}`}>
      <section className={`panel ${inBattleLayout ? 'floating-overlay-panel' : ''}`}>
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
              {classOptions.map((item) => (
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
                          setEntered(true);
                          if (account) {
                            window.localStorage.setItem(lastPlayerStorageKey(account.accountId), String(item.id));
                          }
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

        {viewTab === 'inventory' && (
          <div className="inventory-box">
            <h3>인벤토리</h3>
            <FormControl size="small" fullWidth>
              <InputLabel id="inventory-sort-label">정렬</InputLabel>
              <Select
                labelId="inventory-sort-label"
                value={sortType}
                label="정렬"
                onChange={(e) => setSortType(e.target.value as SortType)}
              >
                <MenuItem value="rarity">희귀도</MenuItem>
                <MenuItem value="quantity">수량</MenuItem>
                <MenuItem value="name">이름</MenuItem>
              </Select>
            </FormControl>
            {sortedInventory.length === 0 ? (
              <p>아이템 없음</p>
            ) : (
              <List sx={{ p: 0, display: 'grid', gap: 1 }}>
                {sortedInventory.map((item, idx) => (
                  <Card
                    key={`${item.itemId}-${item.userId}`}
                    variant="outlined"
                    className={EQUIPMENT_UI_META[item.itemId] ? `rarity-${EQUIPMENT_UI_META[item.itemId].rarity}` : ''}
                    sx={{ backgroundColor: '#131c31', animationDelay: `${Math.min(idx, 12) * 50}ms` }}
                    classes={{ root: 'ui-stagger-card' }}
                  >
                    <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip size="small" label={`x${item.quantity}`} />
                            {['minor-potion', 'slime-gel'].includes(item.itemId) && (
                              <Button
                                type="button"
                                size="small"
                                variant="contained"
                                onClick={() => handleConsumeItem(item)}
                                disabled={consumingItemId === item.itemId}
                              >
                                {consumingItemId === item.itemId ? '사용중' : '사용'}
                              </Button>
                            )}
                          </Stack>
                        }
                      >
                        <ListItemText
                          primary={`${EQUIPMENT_UI_META[item.itemId] ? `${EQUIPMENT_UI_META[item.itemId].icon} ` : ''}${item.itemName}${
                            item.upgradeLevel > 0 ? ` +${item.upgradeLevel}` : ''
                          }`}
                          secondary={
                            <>
                              {EQUIPMENT_UI_META[item.itemId] && (
                                <Typography component="span" variant="caption" sx={{ display: 'block', color: '#9fc2ff' }}>
                                  {formatItemBonus(item)}
                                </Typography>
                              )}
                              {itemCatalogById[item.itemId]?.requiredClassId && (
                                <Typography component="span" variant="caption" sx={{ color: '#9fc2ff' }}>
                                  직업: {classNameById[normalizeClassId(itemCatalogById[item.itemId].requiredClassId)] ?? normalizeClassId(itemCatalogById[item.itemId].requiredClassId)}
                                  {normalizeClassId(itemCatalogById[item.itemId].requiredClassId) !== currentPlayerClass && ' (장착 불가)'}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                    </CardContent>
                  </Card>
                ))}
              </List>
            )}
          </div>
        )}

        {viewTab === 'equipment' && (
          <div className="inventory-box">
            <h3>장착 화면</h3>
            <Stack spacing={1}>
              <Card variant="outlined" sx={{ backgroundColor: '#131c31' }}>
                <CardContent>
                  <Typography variant="subtitle2">무기 슬롯</Typography>
                  <Typography variant="body2">{equippedRows.weapon ? equippedRows.weapon.itemName : '미장착'}</Typography>
                  <Typography variant="caption" sx={{ color: '#9fc2ff' }}>
                    {equippedRows.weapon ? formatItemBonus(equippedRows.weapon) : '-'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button type="button" size="small" onClick={() => handleUnequipSlot('weapon')}>
                      해제
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ backgroundColor: '#131c31' }}>
                <CardContent>
                  <Typography variant="subtitle2">방어구 슬롯</Typography>
                  <Typography variant="body2">{equippedRows.armor ? equippedRows.armor.itemName : '미장착'}</Typography>
                  <Typography variant="caption" sx={{ color: '#9fc2ff' }}>
                    {equippedRows.armor ? formatItemBonus(equippedRows.armor) : '-'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button type="button" size="small" onClick={() => handleUnequipSlot('armor')}>
                      해제
                    </Button>
                  </Box>
                </CardContent>
              </Card>
              <Card variant="outlined" sx={{ backgroundColor: '#131c31' }}>
                <CardContent>
                  <Typography variant="subtitle2">장신구 슬롯</Typography>
                  <Typography variant="body2">{equippedRows.accessory ? equippedRows.accessory.itemName : '미장착'}</Typography>
                  <Typography variant="caption" sx={{ color: '#9fc2ff' }}>
                    {equippedRows.accessory ? formatItemBonus(equippedRows.accessory) : '-'}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Button type="button" size="small" onClick={() => handleUnequipSlot('accessory')}>
                      해제
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Stack>
            {activeSetEffects.length > 0 && (
              <div className="set-box">
                {activeSetEffects.map((effect) => (
                  <p key={effect}>{effect}</p>
                ))}
              </div>
            )}
            <ToggleButtonGroup
              color="primary"
              exclusive
              value={equipmentViewSlot}
              onChange={(_: SyntheticEvent, value: EquipmentSlot | null) => value && setEquipmentViewSlot(value)}
              fullWidth
            >
              <ToggleButton value="weapon">무기</ToggleButton>
              <ToggleButton value="armor">방어구</ToggleButton>
              <ToggleButton value="accessory">장신구</ToggleButton>
            </ToggleButtonGroup>
            <List sx={{ p: 0, display: 'grid', gap: 1 }}>
              {selectedEquipCandidates.map((item, idx) => (
                <Card
                  key={`equip-${equipmentViewSlot}-${item.itemId}-${item.userId}`}
                  variant="outlined"
                  className={`rarity-${EQUIPMENT_UI_META[item.itemId].rarity}`}
                  sx={{ backgroundColor: '#131c31', animationDelay: `${Math.min(idx, 12) * 50}ms` }}
                  classes={{ root: 'ui-stagger-card' }}
                >
                  <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip size="small" label={`x${item.quantity}`} />
                          <Button
                            type="button"
                            size="small"
                            variant="outlined"
                            onClick={() => handleUpgradeItem(item)}
                            disabled={upgradingItemId === item.itemId}
                          >
                            {upgradingItemId === item.itemId
                              ? '강화중'
                              : `강화 ${calcItemUpgradeGoldCost(item.upgradeLevel, itemCatalogById[item.itemId]?.upgradeGoldBase)}G`}
                          </Button>
                          <Button type="button" size="small" variant="contained" onClick={() => handleToggleEquip(item)}>
                            {equipped[EQUIPMENT_UI_META[item.itemId].slot] === item.itemId ? '해제' : '장착'}
                          </Button>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={`${EQUIPMENT_UI_META[item.itemId].icon} ${item.itemName} ${
                          item.upgradeLevel > 0 ? `+${item.upgradeLevel}` : ''
                        }`}
                        secondary={<Typography variant="caption" sx={{ color: '#9fc2ff' }}>{formatItemBonus(item)}</Typography>}
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
            <Divider flexItem sx={{ borderColor: '#2c3a56' }} />
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
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
              <Chip color="primary" label={questSummaryLabel} />
            </Stack>
            <List sx={{ p: 0, display: 'grid', gap: 1 }}>
              {dailyQuestList.quests.map((quest, idx) => (
                <Card
                  key={quest.questCode}
                  variant="outlined"
                  sx={{ backgroundColor: '#131c31', animationDelay: `${Math.min(idx, 12) * 45}ms` }}
                  classes={{ root: 'ui-stagger-card' }}
                >
                  <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Button
                          type="button"
                          size="small"
                          variant={quest.claimable && !quest.claimed ? 'contained' : 'outlined'}
                          disabled={!quest.claimable || quest.claimed || questLoadingCode === quest.questCode}
                          onClick={() => handleClaimDailyQuest(quest.questCode)}
                        >
                          {quest.claimed ? '수령완료' : questLoadingCode === quest.questCode ? '수령중' : quest.claimable ? '수령' : '진행중'}
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={quest.title}
                        secondary={
                          <Typography variant="caption" sx={{ color: '#9fc2ff' }}>
                            ({quest.progress}/{quest.target}) / 보상 {quest.rewardGold}G {quest.rewardGem}Gem
                          </Typography>
                        }
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          </div>
        )}

        {viewTab === 'companionRecruit' && (
          <div className="inventory-box">
            <h3>동료 뽑기 (Gem)</h3>
            <Typography variant="body2" sx={{ color: '#9fc2ff' }}>
              1회: 300 Gem / 10회: 2700 Gem (9회 가격)
            </Typography>
            <ToggleButtonGroup
              color="secondary"
              exclusive
              value={recruitingCount}
              onChange={(_: SyntheticEvent, value: 1 | 10 | null) => value && setRecruitingCount(value)}
              fullWidth
            >
              <ToggleButton value={1}>x1</ToggleButton>
              <ToggleButton value={10}>x10</ToggleButton>
            </ToggleButtonGroup>
            <Button type="button" variant="contained" onClick={handleRecruitCompanion} disabled={recruiting || (wallet?.gem ?? 0) < recruitCost}>
                {recruiting ? '뽑는 중...' : `뽑기 (${recruitCost} Gem)`}
            </Button>
            <List sx={{ p: 0, display: 'grid', gap: 1 }}>
              {companionMasters.slice(0, 20).map((row, idx) => (
                <Card
                  key={row.companionId}
                  variant="outlined"
                  sx={{ backgroundColor: '#131c31', animationDelay: `${Math.min(idx, 12) * 45}ms` }}
                  classes={{ root: 'ui-stagger-card' }}
                >
                  <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <ListItem disablePadding>
                      <ListItemText
                        primary={`${row.companionName} [${row.grade}]`}
                        secondary={
                          <Typography variant="caption" sx={{ color: '#9fc2ff' }}>
                            {row.classId} / ATK {row.baseAttack} DEF {row.baseDefense} HP {row.baseHp} MP {row.baseMp}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          </div>
        )}

        {viewTab === 'companionManage' && (
          <div className="inventory-box">
            <h3>동료 설정 (최대 5명)</h3>
            <Typography variant="body2" sx={{ color: '#9fc2ff' }}>
              편성 보너스: ATK {companionPartyBonus?.bonusAttack ?? 0} / DEF {companionPartyBonus?.bonusDefense ?? 0} / HP{' '}
              {companionPartyBonus?.bonusHp ?? 0} / MP {companionPartyBonus?.bonusMp ?? 0}
            </Typography>
            <List sx={{ p: 0, display: 'grid', gap: 1 }}>
              {sortedCompanionsForManage.map((row, idx) => (
                <Card
                  key={`companion-manage-${row.id}`}
                  variant="outlined"
                  sx={{ backgroundColor: '#131c31', animationDelay: `${Math.min(idx, 12) * 45}ms` }}
                  classes={{ root: 'ui-stagger-card' }}
                >
                  <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                    <ListItem
                      disablePadding
                      secondaryAction={
                        <Stack direction="row" spacing={1} alignItems="center">
                          {row.slotNo != null && <Chip size="small" color="primary" label={`S${row.slotNo}`} />}
                          <Checkbox
                            checked={row.slotNo != null}
                            disabled={assigningCompanionId === row.id || (row.slotNo == null && activeCompanions.length >= 5)}
                            onChange={() => handleToggleCompanionAssign(row)}
                          />
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={`${row.companionName} [${row.grade}]`}
                        secondary={
                          <Typography variant="caption" sx={{ color: '#9fc2ff' }}>
                            Lv.{row.level} / 복제 {row.copies} / 편성 {row.slotNo ?? '-'}
                          </Typography>
                        }
                      />
                    </ListItem>
                  </CardContent>
                </Card>
              ))}
            </List>
          </div>
        )}

        {viewTab === 'companionFuse' && (
          <div className="inventory-box">
            <h3>동료 합성</h3>
            <List sx={{ p: 0, display: 'grid', gap: 1 }}>
              {userCompanions.map((row, idx) => {
                const need = resolveFuseNeed(row.level);
                const canFuse = row.copies >= need;
                return (
                  <Card
                    key={`companion-fuse-${row.id}`}
                    variant="outlined"
                    sx={{ backgroundColor: '#131c31', animationDelay: `${Math.min(idx, 12) * 45}ms` }}
                    classes={{ root: 'ui-stagger-card' }}
                  >
                    <CardContent sx={{ p: 1.25, '&:last-child': { pb: 1.25 } }}>
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <Button
                        type="button"
                            size="small"
                            variant={canFuse ? 'contained' : 'outlined'}
                        disabled={!canFuse || fusingCompanionId === row.id}
                        onClick={() => handleFuseCompanion(row)}
                      >
                        {fusingCompanionId === row.id ? '합성중' : canFuse ? '합성' : '복제 부족'}
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={`${row.companionName} Lv.${row.level}`}
                          secondary={
                            <Typography variant="caption" sx={{ color: '#9fc2ff' }}>
                              보유 {row.copies} / 필요 {need}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </CardContent>
                  </Card>
                );
              })}
            </List>
          </div>
        )}

        {error && (
          <Paper sx={{ mt: 2, p: 1.2, border: '1px solid #8a2f2f', background: '#2a1216' }}>
            <Typography variant="body2" sx={{ color: '#ffb5b5' }}>
              {error}
            </Typography>
          </Paper>
        )}
      </section>

      {player && entered && characterStats && (
        <section className="battle-stage-wrap">
          <header className="battle-topbar">
            <div className="battle-top-left">
              <div className="battle-profile">
                <div>
                  <strong>{player.nickname}</strong>
                  <p>Lv.{Math.max(1, Math.floor((characterStats.attackLevel + characterStats.defenseLevel) / 2))} / Wave {currentWave}</p>
                </div>
              </div>
              <div className="battle-currency">
                <span>G {wallet?.gold ?? 0}</span>
                <span>M {wallet?.gem ?? 0}</span>
              </div>
              <div className="battle-wave-controls">
                <select value={waveLocked ? String(currentWave) : 'last'} onChange={(e) => handleWaveSettingChange(e.target.value)}>
                  <option value="last">마지막 Wave 진행</option>
                  {Array.from({ length: maxUnlockedWave }, (_, i) => i + 1).map((wave) => (
                    <option key={`top-wave-${wave}`} value={wave}>
                      Wave {toWaveLabel(wave)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          {viewTab === 'stats' && (
            <aside className="battle-stat-box">
              <div className="battle-stat-head">
                <strong>능력치</strong>
                <span>Gold {wallet?.gold ?? 0}</span>
              </div>
              <div className="battle-stat-multi">
                <button type="button" className={upgradeMultiplier === 1 ? 'active' : ''} onClick={() => setUpgradeMultiplier(1)}>
                  x1
                </button>
                <button type="button" className={upgradeMultiplier === 10 ? 'active' : ''} onClick={() => setUpgradeMultiplier(10)}>
                  x10
                </button>
                <button type="button" className={upgradeMultiplier === 100 ? 'active' : ''} onClick={() => setUpgradeMultiplier(100)}>
                  x100
                </button>
              </div>
              <div className="battle-stat-row">
                <p>ATK {characterStats.attack} (Lv.{characterStats.attackLevel})</p>
                <button type="button" onClick={() => handleUpgrade('ATTACK')} disabled={upgrading || !canUpgrade.attack}>
                  + ({upgradeCostPreview?.attack ?? characterStats.nextAttackGoldCost}G)
                </button>
              </div>
              <div className="battle-stat-row">
                <p>DEF {characterStats.defense} (Lv.{characterStats.defenseLevel})</p>
                <button type="button" onClick={() => handleUpgrade('DEFENSE')} disabled={upgrading || !canUpgrade.defense}>
                  + ({upgradeCostPreview?.defense ?? characterStats.nextDefenseGoldCost}G)
                </button>
              </div>
              <div className="battle-stat-row">
                <p>HP {characterStats.maxHp} (Lv.{characterStats.hpLevel})</p>
                <button type="button" onClick={() => handleUpgrade('MAX_HP')} disabled={upgrading || !canUpgrade.hp}>
                  + ({upgradeCostPreview?.hp ?? characterStats.nextHpGoldCost}G)
                </button>
              </div>
              <div className="battle-stat-row">
                <p>MP {characterStats.maxMp} (Lv.{characterStats.mpLevel})</p>
                <button type="button" onClick={() => handleUpgrade('MAX_MP')} disabled={upgrading || !canUpgrade.mp}>
                  + ({upgradeCostPreview?.mp ?? characterStats.nextMpGoldCost}G)
                </button>
              </div>
              {totalStatsPreview && (
                <div className="battle-stat-total">
                  총합 ATK {totalStatsPreview.attack} / DEF {totalStatsPreview.defense}
                  <br />
                  HP {totalStatsPreview.maxHp} / MP {totalStatsPreview.maxMp}
                </div>
              )}
            </aside>
          )}

          <GameContainer
            key={`${player.id}-${gameSeed}`}
            playerId={player.id}
            nickname={player.nickname}
            classId={activeClassId}
            classRenderProfileJson={classRenderProfileById[activeClassId] ?? null}
            startWave={currentWave}
            hidden={viewTab !== 'game' && viewTab !== 'stats'}
            battleSpeed={battleSpeed}
            waveLocked={waveLocked}
            equippedItemIds={equippedItemIds}
            waveRuntimeConfig={waveRuntimeConfig}
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
              slotNo: row.slotNo,
              renderProfileJson: row.renderProfileJson ?? null
            }))}
            persistentStats={{
              attack: characterStats.attack,
              defense: characterStats.defense,
              maxHp: characterStats.maxHp,
              maxMp: characterStats.maxMp
            }}
          />

          <button type="button" className="battle-speed-cycle" onClick={cycleBattleSpeed}>
            {battleSpeed}X
          </button>

          <footer className="battle-left-mini-menu">
            {viewTabMeta.map((tab) => (
              <button key={`bottom-${tab.tab}`} type="button" onClick={() => setViewTab(tab.tab)} className={viewTab === tab.tab ? 'active' : ''}>
                {tab.label}
              </button>
            ))}
            <button type="button" onClick={handleLogout}>
              로그아웃
            </button>
          </footer>
        </section>
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
