package com.hwang.game.admin.service;

import com.hwang.game.admin.dto.AdminCharacterStatResponse;
import com.hwang.game.admin.dto.AdminCompanionMasterRequest;
import com.hwang.game.admin.dto.AdminCompanionMasterResponse;
import com.hwang.game.admin.dto.AdminItemMasterRequest;
import com.hwang.game.admin.dto.AdminMonsterDropRequest;
import com.hwang.game.admin.dto.AdminMonsterRequest;
import com.hwang.game.admin.dto.AdminPlayerResponse;
import com.hwang.game.admin.dto.AdminUpdateCharacterStatRequest;
import com.hwang.game.admin.dto.AdminUpdateEquipmentRequest;
import com.hwang.game.admin.dto.AdminUpdatePlayerRequest;
import com.hwang.game.admin.dto.AdminUpdateUserCompanionRequest;
import com.hwang.game.admin.dto.AdminWaveSettingRequest;
import com.hwang.game.admin.entity.MonsterMasterEntity;
import com.hwang.game.admin.entity.WaveSettingEntity;
import com.hwang.game.admin.repository.MonsterMasterRepository;
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
import com.hwang.game.item.repository.ItemMasterRepository;
import com.hwang.game.item.repository.MonsterDropTableRepository;
import com.hwang.game.item.repository.UserEquipmentRepository;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class AdminService {
    private final PlayerRepository playerRepository;
    private final UserCharacterStatRepository userCharacterStatRepository;
    private final UserEquipmentRepository userEquipmentRepository;
    private final ItemMasterRepository itemMasterRepository;
    private final MonsterMasterRepository monsterMasterRepository;
    private final MonsterDropTableRepository monsterDropTableRepository;
    private final WaveSettingRepository waveSettingRepository;
    private final CompanionMasterRepository companionMasterRepository;
    private final UserCompanionRepository userCompanionRepository;

    public AdminService(
            PlayerRepository playerRepository,
            UserCharacterStatRepository userCharacterStatRepository,
            UserEquipmentRepository userEquipmentRepository,
            ItemMasterRepository itemMasterRepository,
            MonsterMasterRepository monsterMasterRepository,
            MonsterDropTableRepository monsterDropTableRepository,
            WaveSettingRepository waveSettingRepository,
            CompanionMasterRepository companionMasterRepository,
            UserCompanionRepository userCompanionRepository
    ) {
        this.playerRepository = playerRepository;
        this.userCharacterStatRepository = userCharacterStatRepository;
        this.userEquipmentRepository = userEquipmentRepository;
        this.itemMasterRepository = itemMasterRepository;
        this.monsterMasterRepository = monsterMasterRepository;
        this.monsterDropTableRepository = monsterDropTableRepository;
        this.waveSettingRepository = waveSettingRepository;
        this.companionMasterRepository = companionMasterRepository;
        this.userCompanionRepository = userCompanionRepository;
    }

    @Transactional(readOnly = true)
    public List<AdminPlayerResponse> getPlayers() {
        return playerRepository.findAll().stream().map(AdminPlayerResponse::from).toList();
    }

    @Transactional
    public AdminPlayerResponse updatePlayer(long userId, AdminUpdatePlayerRequest request) {
        UserEntity user = getUser(userId);
        if (request.nickname() != null && !request.nickname().isBlank()) {
            user.setNickname(request.nickname().trim());
        }
        if (request.classId() != null && !request.classId().isBlank()) {
            user.setClassId(request.classId().trim().toLowerCase(Locale.ROOT));
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
        applyItemMaster(request, entity);
        return ItemMasterResponse.from(itemMasterRepository.save(entity));
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
        return waveSettingRepository.findByDungeonIdOrderByWaveNoAsc(dungeonId.toLowerCase(Locale.ROOT));
    }

    @Transactional
    public WaveSettingEntity createWaveSetting(AdminWaveSettingRequest request) {
        if (request.dungeonId() == null || request.dungeonId().isBlank()) {
            throw new GameException("INVALID_DUNGEON_ID", "dungeonId is required");
        }
        if (request.waveNo() == null || request.waveNo() <= 0) {
            throw new GameException("INVALID_WAVE_NO", "waveNo must be positive");
        }
        if (request.monsterId() == null || request.monsterId().isBlank()) {
            throw new GameException("INVALID_MONSTER_ID", "monsterId is required");
        }

        String dungeonId = request.dungeonId().trim().toLowerCase(Locale.ROOT);
        String monsterId = request.monsterId().trim().toLowerCase(Locale.ROOT);
        if (!monsterMasterRepository.existsById(monsterId)) {
            throw new GameException("MONSTER_NOT_FOUND", "Monster not found: " + monsterId);
        }

        WaveSettingEntity entity = new WaveSettingEntity(dungeonId, request.waveNo(), monsterId);
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
                defaultString(normalizeClassOrNull(request.classId()), "knight")
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
        if (request.waveNo() != null) entity.setWaveNo(Math.max(1, request.waveNo()));
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

    private void applyCompanionMaster(AdminCompanionMasterRequest request, CompanionMasterEntity entity) {
        if (request.companionName() != null) entity.setCompanionName(request.companionName().trim());
        if (request.grade() != null) entity.setGrade(request.grade().trim().toUpperCase(Locale.ROOT));
        if (request.classId() != null) entity.setClassId(defaultString(normalizeClassOrNull(request.classId()), "knight"));
        if (request.baseAttack() != null) entity.setBaseAttack(Math.max(0, request.baseAttack()));
        if (request.baseDefense() != null) entity.setBaseDefense(Math.max(0, request.baseDefense()));
        if (request.baseHp() != null) entity.setBaseHp(Math.max(0, request.baseHp()));
        if (request.baseMp() != null) entity.setBaseMp(Math.max(0, request.baseMp()));
        if (request.imageUrl() != null) entity.setImageUrl(request.imageUrl().trim());
        if (request.recruitWeight() != null) entity.setRecruitWeight(Math.max(1, request.recruitWeight()));
        if (request.active() != null) entity.setActive(request.active());
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
        return switch (normalized) {
            case "knight", "warrior", "fighter", "전사" -> "knight";
            case "mage", "wizard", "sorcerer", "마법사" -> "mage";
            case "ranger", "archer", "궁수" -> "ranger";
            default -> throw new GameException("INVALID_CLASS_ID", "Invalid classId. allowed: knight, mage, ranger");
        };
    }

    private String defaultString(String value, String defaultValue) {
        if (value == null || value.isBlank()) {
            return defaultValue;
        }
        return value.trim();
    }
}
