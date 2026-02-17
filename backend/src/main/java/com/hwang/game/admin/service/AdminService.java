package com.hwang.game.admin.service;

import com.hwang.game.admin.dto.AdminCharacterStatResponse;
import com.hwang.game.admin.dto.AdminBalanceProfileRequest;
import com.hwang.game.admin.dto.AdminBalanceProfileResponse;
import com.hwang.game.admin.dto.AdminClassMasterRequest;
import com.hwang.game.admin.dto.AdminClassMasterResponse;
import com.hwang.game.admin.dto.AdminCompanionMasterRequest;
import com.hwang.game.admin.dto.AdminCompanionMasterResponse;
import com.hwang.game.admin.dto.AdminItemMasterRequest;
import com.hwang.game.admin.dto.AdminItemUpgradeTierRequest;
import com.hwang.game.admin.dto.AdminItemUpgradeTierResponse;
import com.hwang.game.admin.dto.AdminMonsterDropRequest;
import com.hwang.game.admin.dto.AdminMonsterRequest;
import com.hwang.game.admin.dto.AdminPlayerResponse;
import com.hwang.game.admin.dto.AdminUpdateCharacterStatRequest;
import com.hwang.game.admin.dto.AdminUpdateEquipmentRequest;
import com.hwang.game.admin.dto.AdminUpdatePlayerRequest;
import com.hwang.game.admin.dto.AdminUpdateUserCompanionRequest;
import com.hwang.game.admin.dto.AdminWaveGroupScalingRequest;
import com.hwang.game.admin.dto.AdminWaveSettingRequest;
import com.hwang.game.admin.entity.BalanceProfileEntity;
import com.hwang.game.admin.entity.MonsterMasterEntity;
import com.hwang.game.admin.entity.WaveGroupScalingEntity;
import com.hwang.game.admin.entity.WaveSettingEntity;
import com.hwang.game.admin.repository.BalanceProfileRepository;
import com.hwang.game.admin.repository.MonsterMasterRepository;
import com.hwang.game.admin.repository.WaveGroupScalingRepository;
import com.hwang.game.admin.repository.WaveSettingRepository;
import com.hwang.game.character.entity.UserCharacterStatEntity;
import com.hwang.game.character.repository.UserCharacterStatRepository;
import com.hwang.game.common.exception.GameException;
import com.hwang.game.companion.dto.UserCompanionResponse;
import com.hwang.game.companion.entity.CompanionMasterEntity;
import com.hwang.game.companion.entity.UserCompanionEntity;
import com.hwang.game.companion.repository.CompanionMasterRepository;
import com.hwang.game.companion.repository.UserCompanionRepository;
import com.hwang.game.item.dto.ItemMasterResponse;
import com.hwang.game.item.entity.ItemMasterEntity;
import com.hwang.game.item.entity.MonsterDropTableEntity;
import com.hwang.game.item.entity.UserEquipmentEntity;
import com.hwang.game.item.entity.UserItemEntity;
import com.hwang.game.item.entity.ItemUpgradeTierEntity;
import com.hwang.game.item.repository.ItemMasterRepository;
import com.hwang.game.item.repository.ItemUpgradeTierRepository;
import com.hwang.game.item.repository.MonsterDropTableRepository;
import com.hwang.game.item.repository.UserEquipmentRepository;
import com.hwang.game.item.repository.UserItemRepository;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.entity.CharacterClassMasterEntity;
import com.hwang.game.player.repository.CharacterClassMasterRepository;
import com.hwang.game.player.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class AdminService {
    private static final int MAX_PATTERN_WAVE_NO = 100;
    private final BalanceProfileRepository balanceProfileRepository;
    private final PlayerRepository playerRepository;
    private final UserCharacterStatRepository userCharacterStatRepository;
    private final UserEquipmentRepository userEquipmentRepository;
    private final ItemMasterRepository itemMasterRepository;
    private final ItemUpgradeTierRepository itemUpgradeTierRepository;
    private final UserItemRepository userItemRepository;
    private final MonsterMasterRepository monsterMasterRepository;
    private final MonsterDropTableRepository monsterDropTableRepository;
    private final WaveSettingRepository waveSettingRepository;
    private final WaveGroupScalingRepository waveGroupScalingRepository;
    private final CompanionMasterRepository companionMasterRepository;
    private final UserCompanionRepository userCompanionRepository;
    private final CharacterClassMasterRepository characterClassMasterRepository;

    public AdminService(
            BalanceProfileRepository balanceProfileRepository,
            PlayerRepository playerRepository,
            UserCharacterStatRepository userCharacterStatRepository,
            UserEquipmentRepository userEquipmentRepository,
            ItemMasterRepository itemMasterRepository,
            ItemUpgradeTierRepository itemUpgradeTierRepository,
            UserItemRepository userItemRepository,
            MonsterMasterRepository monsterMasterRepository,
            MonsterDropTableRepository monsterDropTableRepository,
            WaveSettingRepository waveSettingRepository,
            WaveGroupScalingRepository waveGroupScalingRepository,
            CompanionMasterRepository companionMasterRepository,
            UserCompanionRepository userCompanionRepository,
            CharacterClassMasterRepository characterClassMasterRepository
    ) {
        this.balanceProfileRepository = balanceProfileRepository;
        this.playerRepository = playerRepository;
        this.userCharacterStatRepository = userCharacterStatRepository;
        this.userEquipmentRepository = userEquipmentRepository;
        this.itemMasterRepository = itemMasterRepository;
        this.itemUpgradeTierRepository = itemUpgradeTierRepository;
        this.userItemRepository = userItemRepository;
        this.monsterMasterRepository = monsterMasterRepository;
        this.monsterDropTableRepository = monsterDropTableRepository;
        this.waveSettingRepository = waveSettingRepository;
        this.waveGroupScalingRepository = waveGroupScalingRepository;
        this.companionMasterRepository = companionMasterRepository;
        this.userCompanionRepository = userCompanionRepository;
        this.characterClassMasterRepository = characterClassMasterRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminPlayerResponse> getPlayers() {
        return playerRepository.findAll().stream().map(AdminPlayerResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminClassMasterResponse> getClassMasters() {
        return characterClassMasterRepository.findAllByOrderByClassIdAsc().stream().map(AdminClassMasterResponse::from).toList();
    }

    @Transactional
    public AdminClassMasterResponse createClassMaster(AdminClassMasterRequest request) {
        String classId = normalizeRequiredId(request.classId(), "classId");
        if (characterClassMasterRepository.existsById(classId)) {
            throw new GameException("CLASS_ALREADY_EXISTS", "Class already exists: " + classId);
        }
        CharacterClassMasterEntity entity = new CharacterClassMasterEntity(classId, defaultString(request.className(), classId));
        applyClassMaster(request, entity);
        return AdminClassMasterResponse.from(characterClassMasterRepository.save(entity));
    }

    @Transactional
    public AdminClassMasterResponse updateClassMaster(String classId, AdminClassMasterRequest request) {
        String normalized = normalizeRequiredId(classId, "classId");
        CharacterClassMasterEntity entity = characterClassMasterRepository.findById(normalized)
                .orElseThrow(() -> new GameException("CLASS_NOT_FOUND", "Class not found: " + normalized));
        applyClassMaster(request, entity);
        return AdminClassMasterResponse.from(characterClassMasterRepository.save(entity));
    }

    @Transactional
    public void deleteClassMaster(String classId) {
        String normalized = normalizeRequiredId(classId, "classId");
        CharacterClassMasterEntity entity = characterClassMasterRepository.findById(normalized)
                .orElseThrow(() -> new GameException("CLASS_NOT_FOUND", "Class not found: " + normalized));
        entity.setActive(false);
        characterClassMasterRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<AdminBalanceProfileResponse> getBalanceProfiles() {
        return balanceProfileRepository.findAllByOrderByUpdatedAtDesc().stream().map(AdminBalanceProfileResponse::from).toList();
    }

    @Transactional
    public AdminBalanceProfileResponse createBalanceProfile(AdminBalanceProfileRequest request) {
        String profileId = normalizeRequiredId(request.profileId(), "profileId");
        if (balanceProfileRepository.existsById(profileId)) {
            throw new GameException("BALANCE_PROFILE_EXISTS", "Balance profile already exists: " + profileId);
        }
        validateJson(request.profileJson());
        BalanceProfileEntity entity = new BalanceProfileEntity(
                profileId,
                defaultString(request.profileName(), profileId),
                request.profileJson().trim()
        );
        entity.setDescription(defaultString(request.description(), ""));
        if (request.active() != null) {
            entity.setActive(request.active());
        }
        return AdminBalanceProfileResponse.from(balanceProfileRepository.save(entity));
    }

    @Transactional
    public AdminBalanceProfileResponse updateBalanceProfile(String profileId, AdminBalanceProfileRequest request) {
        String normalized = normalizeRequiredId(profileId, "profileId");
        BalanceProfileEntity entity = balanceProfileRepository.findById(normalized)
                .orElseThrow(() -> new GameException("BALANCE_PROFILE_NOT_FOUND", "Balance profile not found: " + normalized));
        if (request.profileName() != null) {
            entity.setProfileName(defaultString(request.profileName(), entity.getProfileName()));
        }
        if (request.description() != null) {
            entity.setDescription(defaultString(request.description(), ""));
        }
        if (request.profileJson() != null) {
            validateJson(request.profileJson());
            entity.setProfileJson(request.profileJson().trim());
        }
        if (request.active() != null) {
            entity.setActive(request.active());
        }
        return AdminBalanceProfileResponse.from(balanceProfileRepository.save(entity));
    }

    @Transactional
    public void deleteBalanceProfile(String profileId) {
        String normalized = normalizeRequiredId(profileId, "profileId");
        if (!balanceProfileRepository.existsById(normalized)) {
            throw new GameException("BALANCE_PROFILE_NOT_FOUND", "Balance profile not found: " + normalized);
        }
        balanceProfileRepository.deleteById(normalized);
    }

    @Transactional(readOnly = true)
    public String getRuntimeBalanceProfile() {
        Optional<BalanceProfileEntity> active = balanceProfileRepository.findFirstByActiveTrueOrderByUpdatedAtDesc();
        if (active.isEmpty()) {
            return "{}";
        }
        return active.get().getProfileJson();
    }

    @Transactional
    public AdminPlayerResponse updatePlayer(long userId, AdminUpdatePlayerRequest request) {
        UserEntity user = getUser(userId);
        if (request.nickname() != null && !request.nickname().isBlank()) {
            user.setNickname(request.nickname().trim());
        }
        if (request.classId() != null && !request.classId().isBlank()) {
            user.setClassId(normalizeClassOrNull(request.classId()));
        }
        if (request.level() != null) {
            user.setLevel(Math.max(1, request.level()));
        }
        if (request.exp() != null) {
            user.setExp(Math.max(0, request.exp()));
        }
        if (request.powerScore() != null) {
            user.setPowerScore(Math.max(0, request.powerScore()));
        }
        if (request.deleted() != null) {
            if (request.deleted()) {
                user.softDelete();
            } else {
                user.restore();
            }
        }
        return AdminPlayerResponse.from(playerRepository.save(user));
    }

    @Transactional
    public void deletePlayer(long userId) {
        UserEntity user = getUser(userId);
        user.softDelete();
        playerRepository.save(user);
    }

    @Transactional(readOnly = true)
    public AdminCharacterStatResponse getCharacterStats(long userId) {
        UserCharacterStatEntity entity = userCharacterStatRepository.findById(userId)
                .orElseThrow(() -> new GameException("CHARACTER_STATS_NOT_FOUND", "Character stats not found: " + userId));
        return AdminCharacterStatResponse.from(entity);
    }

    @Transactional
    public AdminCharacterStatResponse updateCharacterStats(long userId, AdminUpdateCharacterStatRequest request) {
        UserCharacterStatEntity entity = userCharacterStatRepository.findById(userId)
                .orElseGet(() -> userCharacterStatRepository.save(new UserCharacterStatEntity(userId)));

        if (request.attackValue() != null) entity.setAttackValue(Math.max(1, request.attackValue()));
        if (request.defenseValue() != null) entity.setDefenseValue(Math.max(0, request.defenseValue()));
        if (request.maxHpValue() != null) entity.setMaxHpValue(Math.max(1, request.maxHpValue()));
        if (request.maxMpValue() != null) entity.setMaxMpValue(Math.max(0, request.maxMpValue()));
        if (request.attackLevel() != null) entity.setAttackLevel(Math.max(1, request.attackLevel()));
        if (request.defenseLevel() != null) entity.setDefenseLevel(Math.max(1, request.defenseLevel()));
        if (request.hpLevel() != null) entity.setHpLevel(Math.max(1, request.hpLevel()));
        if (request.mpLevel() != null) entity.setMpLevel(Math.max(1, request.mpLevel()));

        return AdminCharacterStatResponse.from(userCharacterStatRepository.save(entity));
    }

    @Transactional
    public UserEquipmentEntity updateEquipment(long userId, AdminUpdateEquipmentRequest request) {
        getUser(userId);
        UserEquipmentEntity equipment = userEquipmentRepository.findById(userId)
                .orElseGet(() -> userEquipmentRepository.save(new UserEquipmentEntity(userId)));
        equipment.setWeaponItemId(normalizeNull(request.weaponItemId()));
        equipment.setArmorItemId(normalizeNull(request.armorItemId()));
        equipment.setAccessoryItemId(normalizeNull(request.accessoryItemId()));
        return userEquipmentRepository.save(equipment);
    }

    @Transactional(readOnly = true)
    public List<ItemMasterResponse> getItemMasters() {
        return itemMasterRepository.findAll().stream().map(ItemMasterResponse::from).toList();
    }

    @Transactional(readOnly = true)
    public List<AdminItemUpgradeTierResponse> getItemUpgradeTiers(String itemId) {
        String normalizedItemId = normalizeRequiredId(itemId, "itemId");
        return itemUpgradeTierRepository.findByItemIdOrderByUpgradeLevelAsc(normalizedItemId).stream()
                .map(AdminItemUpgradeTierResponse::from)
                .toList();
    }

    @Transactional
    public AdminItemUpgradeTierResponse createItemUpgradeTier(AdminItemUpgradeTierRequest request) {
        String itemId = normalizeRequiredId(request.itemId(), "itemId");
        int level = request.upgradeLevel() == null ? 0 : request.upgradeLevel();
        if (level <= 0) {
            throw new GameException("INVALID_UPGRADE_LEVEL", "upgradeLevel must be positive");
        }
        if (!itemMasterRepository.existsById(itemId)) {
            throw new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + itemId);
        }
        if (itemUpgradeTierRepository.existsByItemIdAndUpgradeLevel(itemId, level)) {
            throw new GameException("ITEM_UPGRADE_TIER_EXISTS", "Upgrade tier already exists: " + itemId + "@" + level);
        }

        ItemUpgradeTierEntity entity = new ItemUpgradeTierEntity(itemId, level);
        applyItemUpgradeTier(entity, request);
        ItemUpgradeTierEntity saved = itemUpgradeTierRepository.save(entity);
        resyncUserItemsForItem(saved.getItemId());
        return AdminItemUpgradeTierResponse.from(saved);
    }

    @Transactional
    public AdminItemUpgradeTierResponse updateItemUpgradeTier(long tierId, AdminItemUpgradeTierRequest request) {
        ItemUpgradeTierEntity entity = itemUpgradeTierRepository.findById(tierId)
                .orElseThrow(() -> new GameException("ITEM_UPGRADE_TIER_NOT_FOUND", "Upgrade tier not found: " + tierId));
        String beforeItemId = entity.getItemId();
        applyItemUpgradeTier(entity, request);
        ItemUpgradeTierEntity saved = itemUpgradeTierRepository.save(entity);
        resyncUserItemsForItem(beforeItemId);
        if (!beforeItemId.equals(saved.getItemId())) {
            resyncUserItemsForItem(saved.getItemId());
        }
        return AdminItemUpgradeTierResponse.from(saved);
    }

    @Transactional
    public void deleteItemUpgradeTier(long tierId) {
        ItemUpgradeTierEntity tier = itemUpgradeTierRepository.findById(tierId)
                .orElseThrow(() -> new GameException("ITEM_UPGRADE_TIER_NOT_FOUND", "Upgrade tier not found: " + tierId));
        itemUpgradeTierRepository.deleteById(tierId);
        resyncUserItemsForItem(tier.getItemId());
    }

    @Transactional
    public ItemMasterResponse createItemMaster(AdminItemMasterRequest request) {
        if (request.itemId() == null || request.itemId().isBlank()) {
            throw new GameException("INVALID_ITEM_ID", "itemId is required");
        }
        String itemId = request.itemId().trim().toLowerCase(Locale.ROOT);
        if (itemMasterRepository.existsById(itemId)) {
            throw new GameException("ITEM_ALREADY_EXISTS", "Item already exists: " + itemId);
        }
        ItemMasterEntity entity = new ItemMasterEntity(itemId, defaultString(request.itemName(), itemId), defaultString(request.itemType(), "MATERIAL"));
        applyItemMaster(request, entity);
        return ItemMasterResponse.from(itemMasterRepository.save(entity));
    }

    @Transactional
    public ItemMasterResponse updateItemMaster(String itemId, AdminItemMasterRequest request) {
        ItemMasterEntity entity = itemMasterRepository.findById(itemId.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + itemId));
        ItemMasterSnapshot before = ItemMasterSnapshot.from(entity);
        applyItemMaster(request, entity);
        ItemMasterEntity saved = itemMasterRepository.save(entity);
        syncUserItemsFromItemMaster(before, saved);
        return ItemMasterResponse.from(saved);
    }

    @Transactional
    public void deleteItemMaster(String itemId) {
        String normalized = itemId.toLowerCase(Locale.ROOT);
        ItemMasterEntity entity = itemMasterRepository.findById(normalized)
                .orElseThrow(() -> new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + normalized));
        entity.setActive(false);
        itemMasterRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<MonsterMasterEntity> getMonsterMasters() {
        return monsterMasterRepository.findAllByOrderByMonsterIdAsc();
    }

    @Transactional
    public MonsterMasterEntity createMonsterMaster(AdminMonsterRequest request) {
        if (request.monsterId() == null || request.monsterId().isBlank()) {
            throw new GameException("INVALID_MONSTER_ID", "monsterId is required");
        }
        String monsterId = request.monsterId().trim().toLowerCase(Locale.ROOT);
        if (monsterMasterRepository.existsById(monsterId)) {
            throw new GameException("MONSTER_ALREADY_EXISTS", "Monster already exists: " + monsterId);
        }
        MonsterMasterEntity entity = new MonsterMasterEntity(monsterId, defaultString(request.monsterName(), monsterId));
        applyMonster(request, entity);
        return monsterMasterRepository.save(entity);
    }

    @Transactional
    public MonsterMasterEntity updateMonsterMaster(String monsterId, AdminMonsterRequest request) {
        MonsterMasterEntity entity = monsterMasterRepository.findById(monsterId.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new GameException("MONSTER_NOT_FOUND", "Monster not found: " + monsterId));
        applyMonster(request, entity);
        return monsterMasterRepository.save(entity);
    }

    @Transactional
    public void deleteMonsterMaster(String monsterId) {
        MonsterMasterEntity entity = monsterMasterRepository.findById(monsterId.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new GameException("MONSTER_NOT_FOUND", "Monster not found: " + monsterId));
        entity.setActive(false);
        monsterMasterRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<MonsterDropTableEntity> getMonsterDrops(String monsterId) {
        return monsterDropTableRepository.findByMonsterIdOrderByDropChanceDesc(monsterId.toLowerCase(Locale.ROOT));
    }

    @Transactional
    public MonsterDropTableEntity createMonsterDrop(AdminMonsterDropRequest request) {
        if (request.monsterId() == null || request.monsterId().isBlank()) {
            throw new GameException("INVALID_MONSTER_ID", "monsterId is required");
        }
        if (request.itemId() == null || request.itemId().isBlank()) {
            throw new GameException("INVALID_ITEM_ID", "itemId is required");
        }
        String monsterId = request.monsterId().trim().toLowerCase(Locale.ROOT);
        String itemId = request.itemId().trim().toLowerCase(Locale.ROOT);

        if (!monsterMasterRepository.existsById(monsterId)) {
            throw new GameException("MONSTER_NOT_FOUND", "Monster not found: " + monsterId);
        }
        if (!itemMasterRepository.existsById(itemId)) {
            throw new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + itemId);
        }

        MonsterDropTableEntity entity = new MonsterDropTableEntity(monsterId, itemId);
        applyMonsterDrop(request, entity);
        return monsterDropTableRepository.save(entity);
    }

    @Transactional
    public MonsterDropTableEntity updateMonsterDrop(long dropId, AdminMonsterDropRequest request) {
        MonsterDropTableEntity entity = monsterDropTableRepository.findById(dropId)
                .orElseThrow(() -> new GameException("MONSTER_DROP_NOT_FOUND", "Monster drop not found: " + dropId));
        applyMonsterDrop(request, entity);
        return monsterDropTableRepository.save(entity);
    }

    @Transactional
    public void deleteMonsterDrop(long dropId) {
        if (!monsterDropTableRepository.existsById(dropId)) {
            throw new GameException("MONSTER_DROP_NOT_FOUND", "Monster drop not found: " + dropId);
        }
        monsterDropTableRepository.deleteById(dropId);
    }

    @Transactional(readOnly = true)
    public List<WaveSettingEntity> getWaveSettings(String dungeonId) {
        return waveSettingRepository.findByDungeonIdOrderByWaveNoAscSlotNoAsc(dungeonId.toLowerCase(Locale.ROOT));
    }

    @Transactional(readOnly = true)
    public List<WaveGroupScalingEntity> getWaveGroupScalings(String dungeonId) {
        return waveGroupScalingRepository.findByDungeonIdOrderByWaveGroupNoAsc(dungeonId.toLowerCase(Locale.ROOT));
    }

    @Transactional
    public WaveSettingEntity createWaveSetting(AdminWaveSettingRequest request) {
        if (request.dungeonId() == null || request.dungeonId().isBlank()) {
            throw new GameException("INVALID_DUNGEON_ID", "dungeonId is required");
        }
        if (request.waveNo() == null || request.waveNo() <= 0) {
            throw new GameException("INVALID_WAVE_NO", "waveNo must be positive");
        }
        if (request.waveNo() > MAX_PATTERN_WAVE_NO) {
            throw new GameException("INVALID_WAVE_NO", "waveNo must be between 1 and 100");
        }
        if (request.slotNo() == null || request.slotNo() <= 0) {
            throw new GameException("INVALID_SLOT_NO", "slotNo must be positive");
        }
        if (request.monsterId() == null || request.monsterId().isBlank()) {
            throw new GameException("INVALID_MONSTER_ID", "monsterId is required");
        }

        String dungeonId = request.dungeonId().trim().toLowerCase(Locale.ROOT);
        String monsterId = request.monsterId().trim().toLowerCase(Locale.ROOT);
        if (!monsterMasterRepository.existsById(monsterId)) {
            throw new GameException("MONSTER_NOT_FOUND", "Monster not found: " + monsterId);
        }

        WaveSettingEntity entity = new WaveSettingEntity(dungeonId, request.waveNo(), request.slotNo(), monsterId);
        applyWaveSetting(request, entity);
        return waveSettingRepository.save(entity);
    }

    @Transactional
    public WaveSettingEntity updateWaveSetting(long waveSettingId, AdminWaveSettingRequest request) {
        WaveSettingEntity entity = waveSettingRepository.findById(waveSettingId)
                .orElseThrow(() -> new GameException("WAVE_SETTING_NOT_FOUND", "Wave setting not found: " + waveSettingId));
        applyWaveSetting(request, entity);
        return waveSettingRepository.save(entity);
    }

    @Transactional
    public void deleteWaveSetting(long waveSettingId) {
        if (!waveSettingRepository.existsById(waveSettingId)) {
            throw new GameException("WAVE_SETTING_NOT_FOUND", "Wave setting not found: " + waveSettingId);
        }
        waveSettingRepository.deleteById(waveSettingId);
    }

    @Transactional
    public WaveGroupScalingEntity createWaveGroupScaling(AdminWaveGroupScalingRequest request) {
        if (request.dungeonId() == null || request.dungeonId().isBlank()) {
            throw new GameException("INVALID_DUNGEON_ID", "dungeonId is required");
        }
        if (request.waveGroupNo() == null || request.waveGroupNo() <= 0) {
            throw new GameException("INVALID_WAVE_GROUP_NO", "waveGroupNo must be positive");
        }
        WaveGroupScalingEntity entity = new WaveGroupScalingEntity(
                request.dungeonId().trim().toLowerCase(Locale.ROOT),
                request.waveGroupNo()
        );
        applyWaveGroupScaling(request, entity);
        return waveGroupScalingRepository.save(entity);
    }

    @Transactional
    public WaveGroupScalingEntity updateWaveGroupScaling(long waveGroupScalingId, AdminWaveGroupScalingRequest request) {
        WaveGroupScalingEntity entity = waveGroupScalingRepository.findById(waveGroupScalingId)
                .orElseThrow(() -> new GameException("WAVE_GROUP_SCALING_NOT_FOUND", "Wave group scaling not found: " + waveGroupScalingId));
        applyWaveGroupScaling(request, entity);
        return waveGroupScalingRepository.save(entity);
    }

    @Transactional
    public void deleteWaveGroupScaling(long waveGroupScalingId) {
        if (!waveGroupScalingRepository.existsById(waveGroupScalingId)) {
            throw new GameException("WAVE_GROUP_SCALING_NOT_FOUND", "Wave group scaling not found: " + waveGroupScalingId);
        }
        waveGroupScalingRepository.deleteById(waveGroupScalingId);
    }

    @Transactional(readOnly = true)
    public List<AdminCompanionMasterResponse> getCompanionMasters() {
        return companionMasterRepository.findAll().stream().map(AdminCompanionMasterResponse::from).toList();
    }

    @Transactional
    public AdminCompanionMasterResponse createCompanionMaster(AdminCompanionMasterRequest request) {
        if (request.companionId() == null || request.companionId().isBlank()) {
            throw new GameException("INVALID_COMPANION_ID", "companionId is required");
        }
        String companionId = request.companionId().trim().toLowerCase(Locale.ROOT);
        if (companionMasterRepository.existsById(companionId)) {
            throw new GameException("COMPANION_ALREADY_EXISTS", "Companion already exists: " + companionId);
        }
        CompanionMasterEntity entity = new CompanionMasterEntity(
                companionId,
                defaultString(request.companionName(), companionId),
                defaultString(request.grade(), "COMMON"),
                defaultString(normalizeClassOrNull(request.classId()), resolveDefaultClassId())
        );
        applyCompanionMaster(request, entity);
        return AdminCompanionMasterResponse.from(companionMasterRepository.save(entity));
    }

    @Transactional
    public AdminCompanionMasterResponse updateCompanionMaster(String companionId, AdminCompanionMasterRequest request) {
        CompanionMasterEntity entity = companionMasterRepository.findById(companionId.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new GameException("COMPANION_NOT_FOUND", "Companion not found: " + companionId));
        applyCompanionMaster(request, entity);
        return AdminCompanionMasterResponse.from(companionMasterRepository.save(entity));
    }

    @Transactional
    public void deleteCompanionMaster(String companionId) {
        CompanionMasterEntity entity = companionMasterRepository.findById(companionId.toLowerCase(Locale.ROOT))
                .orElseThrow(() -> new GameException("COMPANION_NOT_FOUND", "Companion not found: " + companionId));
        entity.setActive(false);
        companionMasterRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public List<UserCompanionResponse> getUserCompanions(long userId) {
        getUser(userId);
        List<UserCompanionEntity> rows = userCompanionRepository.findByUserIdOrderBySlotNoAscLevelDescIdAsc(userId);
        return rows.stream()
                .map(row -> UserCompanionResponse.from(
                        row,
                        companionMasterRepository.findById(row.getCompanionId()).orElse(null)
                ))
                .toList();
    }

    @Transactional
    public UserCompanionResponse updateUserCompanion(long userCompanionId, AdminUpdateUserCompanionRequest request) {
        UserCompanionEntity row = userCompanionRepository.findById(userCompanionId)
                .orElseThrow(() -> new GameException("USER_COMPANION_NOT_FOUND", "Companion not found: " + userCompanionId));

        if (request.level() != null) row.setLevel(Math.max(1, request.level()));
        if (request.copies() != null) row.setCopies(Math.max(0, request.copies()));
        if (request.slotNo() != null) {
            if (request.slotNo() < 0 || request.slotNo() > 5) {
                throw new GameException("INVALID_SLOT_NO", "slotNo must be 0~5 (0 means unassign)");
            }
            row.setSlotNo(request.slotNo() == 0 ? null : request.slotNo());
        }

        UserCompanionEntity saved = userCompanionRepository.save(row);
        return UserCompanionResponse.from(saved, companionMasterRepository.findById(saved.getCompanionId()).orElse(null));
    }

    private UserEntity getUser(long userId) {
        return playerRepository.findById(userId)
                .orElseThrow(() -> new GameException("PLAYER_NOT_FOUND", "Player not found: " + userId));
    }

    private void applyItemMaster(AdminItemMasterRequest request, ItemMasterEntity entity) {
        if (request.itemName() != null) entity.setItemName(request.itemName().trim());
        if (request.itemType() != null) entity.setItemType(request.itemType().trim().toUpperCase(Locale.ROOT));
        if (request.equipSlot() != null) entity.setEquipSlot(normalizeNull(request.equipSlot()));
        if (request.requiredClassId() != null) entity.setRequiredClassId(normalizeClassOrNull(request.requiredClassId()));
        if (request.quality() != null) entity.setQuality(request.quality().trim().toUpperCase(Locale.ROOT));
        if (request.attackBonus() != null) entity.setAttackBonus(request.attackBonus());
        if (request.defenseBonus() != null) entity.setDefenseBonus(request.defenseBonus());
        if (request.hpBonus() != null) entity.setHpBonus(request.hpBonus());
        if (request.mpBonus() != null) entity.setMpBonus(request.mpBonus());
        if (request.upgradeGoldBase() != null) entity.setUpgradeGoldBase(Math.max(0, request.upgradeGoldBase()));
        if (request.upgradeAttackStep() != null) entity.setUpgradeAttackStep(request.upgradeAttackStep());
        if (request.upgradeDefenseStep() != null) entity.setUpgradeDefenseStep(request.upgradeDefenseStep());
        if (request.upgradeHpStep() != null) entity.setUpgradeHpStep(request.upgradeHpStep());
        if (request.upgradeMpStep() != null) entity.setUpgradeMpStep(request.upgradeMpStep());
        if (request.imageUrl() != null) entity.setImageUrl(request.imageUrl().trim());
        if (request.description() != null) entity.setDescription(request.description().trim());
        if (request.active() != null) entity.setActive(request.active());
    }

    private void applyClassMaster(AdminClassMasterRequest request, CharacterClassMasterEntity entity) {
        if (request.className() != null) entity.setClassName(defaultString(request.className(), entity.getClassName()));
        if (request.baseAttack() != null) entity.setBaseAttack(Math.max(1, request.baseAttack()));
        if (request.baseDefense() != null) entity.setBaseDefense(Math.max(0, request.baseDefense()));
        if (request.baseHp() != null) entity.setBaseHp(Math.max(1, request.baseHp()));
        if (request.baseMp() != null) entity.setBaseMp(Math.max(1, request.baseMp()));
        if (request.renderProfileJson() != null) entity.setRenderProfileJson(normalizeJsonText(request.renderProfileJson()));
        if (request.active() != null) entity.setActive(request.active());
    }

    private void syncUserItemsFromItemMaster(ItemMasterSnapshot before, ItemMasterEntity current) {
        List<UserItemEntity> rows = userItemRepository.findByItemId(current.getItemId());
        if (rows.isEmpty()) {
            return;
        }

        boolean itemTypeWasEquipment = "EQUIPMENT".equalsIgnoreCase(before.itemType());
        boolean itemTypeIsEquipment = "EQUIPMENT".equalsIgnoreCase(current.getItemType());
        boolean changed = false;

        for (UserItemEntity row : rows) {
            if (!current.getItemName().equals(row.getItemName())) {
                row.setItemName(current.getItemName());
                changed = true;
            }

            if (itemTypeIsEquipment) {
                int level = Math.max(0, row.getUpgradeLevel());
                ItemLevelStats levelStats = resolveStatsByLevel(current, level);
                int bonusAttack = levelStats.attackBonus();
                int bonusDefense = levelStats.defenseBonus();
                int bonusHp = levelStats.hpBonus();
                int bonusMp = levelStats.mpBonus();

                if (itemTypeWasEquipment && levelStats.fromDefaultFormula()) {
                    bonusAttack += row.getAttackBonus() - (before.attackBonus() + (level * before.upgradeAttackStep()));
                    bonusDefense += row.getDefenseBonus() - (before.defenseBonus() + (level * before.upgradeDefenseStep()));
                    bonusHp += row.getHpBonus() - (before.hpBonus() + (level * before.upgradeHpStep()));
                    bonusMp += row.getMpBonus() - (before.mpBonus() + (level * before.upgradeMpStep()));
                }

                row.setEquipmentStats(
                        current.getQuality(),
                        Math.max(0, bonusAttack),
                        Math.max(0, bonusDefense),
                        Math.max(0, bonusHp),
                        Math.max(0, bonusMp)
                );
                changed = true;
            } else if (itemTypeWasEquipment && row.hasAnyEquipmentBonus()) {
                row.setEquipmentStats("NORMAL", 0, 0, 0, 0);
                changed = true;
            }
        }

        if (changed) {
            userItemRepository.saveAll(rows);
        }
    }

    private void resyncUserItemsForItem(String itemId) {
        ItemMasterEntity master = itemMasterRepository.findById(itemId)
                .orElseThrow(() -> new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + itemId));
        syncUserItemsFromItemMaster(ItemMasterSnapshot.from(master), master);
    }

    private void applyItemUpgradeTier(ItemUpgradeTierEntity entity, AdminItemUpgradeTierRequest request) {
        if (request.itemId() != null && !request.itemId().isBlank()) {
            String normalized = normalizeRequiredId(request.itemId(), "itemId");
            if (!itemMasterRepository.existsById(normalized)) {
                throw new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + normalized);
            }
            entity.setItemId(normalized);
        }
        if (request.upgradeLevel() != null) {
            entity.setUpgradeLevel(Math.max(1, request.upgradeLevel()));
        }
        if (request.upgradeGoldCost() != null) {
            entity.setUpgradeGoldCost(Math.max(0, request.upgradeGoldCost()));
        }
        if (request.attackBonus() != null) entity.setAttackBonus(Math.max(0, request.attackBonus()));
        if (request.defenseBonus() != null) entity.setDefenseBonus(Math.max(0, request.defenseBonus()));
        if (request.hpBonus() != null) entity.setHpBonus(Math.max(0, request.hpBonus()));
        if (request.mpBonus() != null) entity.setMpBonus(Math.max(0, request.mpBonus()));
    }

    private ItemLevelStats resolveStatsByLevel(ItemMasterEntity master, int level) {
        if (level > 0) {
            Optional<ItemUpgradeTierEntity> tier = itemUpgradeTierRepository.findByItemIdAndUpgradeLevel(master.getItemId(), level);
            if (tier.isPresent()) {
                ItemUpgradeTierEntity t = tier.get();
                return new ItemLevelStats(t.getAttackBonus(), t.getDefenseBonus(), t.getHpBonus(), t.getMpBonus(), false);
            }
        }

        return new ItemLevelStats(
                Math.max(0, master.getAttackBonus() + (level * master.getUpgradeAttackStep())),
                Math.max(0, master.getDefenseBonus() + (level * master.getUpgradeDefenseStep())),
                Math.max(0, master.getHpBonus() + (level * master.getUpgradeHpStep())),
                Math.max(0, master.getMpBonus() + (level * master.getUpgradeMpStep())),
                true
        );
    }

    private void applyMonster(AdminMonsterRequest request, MonsterMasterEntity entity) {
        if (request.monsterName() != null) entity.setMonsterName(request.monsterName().trim());
        if (request.maxHp() != null) entity.setMaxHp(Math.max(1, request.maxHp()));
        if (request.maxMp() != null) entity.setMaxMp(Math.max(0, request.maxMp()));
        if (request.attack() != null) entity.setAttack(Math.max(1, request.attack()));
        if (request.defense() != null) entity.setDefense(Math.max(0, request.defense()));
        if (request.rewardGold() != null) entity.setRewardGold(Math.max(0, request.rewardGold()));
        if (request.rewardGem() != null) entity.setRewardGem(Math.max(0, request.rewardGem()));
        if (request.rewardExp() != null) entity.setRewardExp(Math.max(0, request.rewardExp()));
        if (request.rewardScore() != null) entity.setRewardScore(Math.max(0, request.rewardScore()));
        if (request.spriteKey() != null) entity.setSpriteKey(request.spriteKey().trim());
        if (request.renderProfileJson() != null) entity.setRenderProfileJson(normalizeJsonText(request.renderProfileJson()));
        if (request.active() != null) entity.setActive(request.active());
    }

    private void applyMonsterDrop(AdminMonsterDropRequest request, MonsterDropTableEntity entity) {
        if (request.monsterId() != null && !request.monsterId().isBlank()) {
            String normalized = request.monsterId().trim().toLowerCase(Locale.ROOT);
            if (!monsterMasterRepository.existsById(normalized)) {
                throw new GameException("MONSTER_NOT_FOUND", "Monster not found: " + normalized);
            }
            entity.setMonsterId(normalized);
        }
        if (request.itemId() != null && !request.itemId().isBlank()) {
            String normalized = request.itemId().trim().toLowerCase(Locale.ROOT);
            if (!itemMasterRepository.existsById(normalized)) {
                throw new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + normalized);
            }
            entity.setItemId(normalized);
        }
        if (request.dropChance() != null) entity.setDropChance(request.dropChance());
        if (request.minQuantity() != null) entity.setMinQuantity(Math.max(1, request.minQuantity()));
        if (request.maxQuantity() != null) entity.setMaxQuantity(Math.max(1, request.maxQuantity()));
        if (request.equipmentDrop() != null) entity.setEquipmentDrop(request.equipmentDrop());
    }

    private void applyWaveSetting(AdminWaveSettingRequest request, WaveSettingEntity entity) {
        if (request.dungeonId() != null && !request.dungeonId().isBlank()) {
            entity.setDungeonId(request.dungeonId().trim().toLowerCase(Locale.ROOT));
        }
        if (request.waveNo() != null) {
            int waveNo = request.waveNo();
            if (waveNo <= 0 || waveNo > MAX_PATTERN_WAVE_NO) {
                throw new GameException("INVALID_WAVE_NO", "waveNo must be between 1 and 100");
            }
            entity.setWaveNo(waveNo);
        }
        if (request.slotNo() != null) entity.setSlotNo(Math.max(1, request.slotNo()));
        if (request.monsterId() != null && !request.monsterId().isBlank()) {
            String normalized = request.monsterId().trim().toLowerCase(Locale.ROOT);
            if (!monsterMasterRepository.existsById(normalized)) {
                throw new GameException("MONSTER_NOT_FOUND", "Monster not found: " + normalized);
            }
            entity.setMonsterId(normalized);
        }
        if (request.monsterCount() != null) entity.setMonsterCount(Math.max(1, request.monsterCount()));
        if (request.hpMultiplier() != null) entity.setHpMultiplier(request.hpMultiplier());
        if (request.mpMultiplier() != null) entity.setMpMultiplier(request.mpMultiplier());
        if (request.attackMultiplier() != null) entity.setAttackMultiplier(request.attackMultiplier());
        if (request.defenseMultiplier() != null) entity.setDefenseMultiplier(request.defenseMultiplier());
        if (request.rewardGoldMultiplier() != null) entity.setRewardGoldMultiplier(request.rewardGoldMultiplier());
        if (request.rewardGemMultiplier() != null) entity.setRewardGemMultiplier(request.rewardGemMultiplier());
        if (request.active() != null) entity.setActive(request.active());
    }

    private void applyWaveGroupScaling(AdminWaveGroupScalingRequest request, WaveGroupScalingEntity entity) {
        if (request.dungeonId() != null && !request.dungeonId().isBlank()) {
            entity.setDungeonId(request.dungeonId().trim().toLowerCase(Locale.ROOT));
        }
        if (request.waveGroupNo() != null) entity.setWaveGroupNo(Math.max(1, request.waveGroupNo()));
        if (request.hpMultiplier() != null) entity.setHpMultiplier(request.hpMultiplier());
        if (request.mpMultiplier() != null) entity.setMpMultiplier(request.mpMultiplier());
        if (request.attackMultiplier() != null) entity.setAttackMultiplier(request.attackMultiplier());
        if (request.defenseMultiplier() != null) entity.setDefenseMultiplier(request.defenseMultiplier());
        if (request.rewardGoldMultiplier() != null) entity.setRewardGoldMultiplier(request.rewardGoldMultiplier());
        if (request.rewardGemMultiplier() != null) entity.setRewardGemMultiplier(request.rewardGemMultiplier());
        if (request.backgroundImagePath() != null) entity.setBackgroundImagePath(normalizeNull(request.backgroundImagePath()));
        if (request.active() != null) entity.setActive(request.active());
    }

    private void applyCompanionMaster(AdminCompanionMasterRequest request, CompanionMasterEntity entity) {
        if (request.companionName() != null) entity.setCompanionName(request.companionName().trim());
        if (request.grade() != null) entity.setGrade(request.grade().trim().toUpperCase(Locale.ROOT));
        if (request.classId() != null) entity.setClassId(defaultString(normalizeClassOrNull(request.classId()), resolveDefaultClassId()));
        if (request.baseAttack() != null) entity.setBaseAttack(Math.max(0, request.baseAttack()));
        if (request.baseDefense() != null) entity.setBaseDefense(Math.max(0, request.baseDefense()));
        if (request.baseHp() != null) entity.setBaseHp(Math.max(0, request.baseHp()));
        if (request.baseMp() != null) entity.setBaseMp(Math.max(0, request.baseMp()));
        if (request.imageUrl() != null) entity.setImageUrl(request.imageUrl().trim());
        if (request.renderProfileJson() != null) entity.setRenderProfileJson(normalizeJsonText(request.renderProfileJson()));
        if (request.recruitWeight() != null) entity.setRecruitWeight(Math.max(1, request.recruitWeight()));
        if (request.active() != null) entity.setActive(request.active());
    }

    private String normalizeJsonText(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String normalizeNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed.toLowerCase(Locale.ROOT);
    }

    private String normalizeClassOrNull(String classId) {
        String normalized = normalizeNull(classId);
        if (normalized == null) {
            return null;
        }
        if (!characterClassMasterRepository.existsByClassIdAndActiveTrue(normalized)) {
            throw new GameException("INVALID_CLASS_ID", "Unknown classId: " + normalized);
        }
        return normalized;
    }

    private String resolveDefaultClassId() {
        return characterClassMasterRepository.findByActiveTrueOrderByClassIdAsc().stream()
                .findFirst()
                .map(CharacterClassMasterEntity::getClassId)
                .orElse("knight");
    }

    private String defaultString(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value.trim();
    }

    private String normalizeRequiredId(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new GameException("INVALID_" + fieldName.toUpperCase(Locale.ROOT), fieldName + " is required");
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private void validateJson(String rawJson) {
        if (rawJson == null || rawJson.isBlank()) {
            throw new GameException("INVALID_PROFILE_JSON", "profileJson is required");
        }
        String trimmed = rawJson.trim();
        boolean objectLike = trimmed.startsWith("{") && trimmed.endsWith("}");
        boolean arrayLike = trimmed.startsWith("[") && trimmed.endsWith("]");
        if (!objectLike && !arrayLike) {
            throw new GameException("INVALID_PROFILE_JSON", "profileJson must be valid JSON text");
        }
    }

    private record ItemMasterSnapshot(
            String itemType,
            int attackBonus,
            int defenseBonus,
            int hpBonus,
            int mpBonus,
            int upgradeAttackStep,
            int upgradeDefenseStep,
            int upgradeHpStep,
            int upgradeMpStep
    ) {
        private static ItemMasterSnapshot from(ItemMasterEntity entity) {
            return new ItemMasterSnapshot(
                    entity.getItemType(),
                    entity.getAttackBonus(),
                    entity.getDefenseBonus(),
                    entity.getHpBonus(),
                    entity.getMpBonus(),
                    entity.getUpgradeAttackStep(),
                    entity.getUpgradeDefenseStep(),
                    entity.getUpgradeHpStep(),
                    entity.getUpgradeMpStep()
            );
        }
    }

    private record ItemLevelStats(
            int attackBonus,
            int defenseBonus,
            int hpBonus,
            int mpBonus,
            boolean fromDefaultFormula
    ) {
    }
}
