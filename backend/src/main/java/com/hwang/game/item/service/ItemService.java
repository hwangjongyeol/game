package com.hwang.game.item.service;

import com.hwang.game.common.exception.GameException;
import com.hwang.game.economy.model.CurrencyType;
import com.hwang.game.economy.service.EconomyService;
import com.hwang.game.item.dto.LootItemRequest;
import com.hwang.game.item.entity.ItemMasterEntity;
import com.hwang.game.item.entity.ItemUpgradeTierEntity;
import com.hwang.game.item.entity.MonsterDropTableEntity;
import com.hwang.game.item.entity.UserEquipmentEntity;
import com.hwang.game.item.entity.UserEquipmentPresetEntity;
import com.hwang.game.item.entity.UserItemEntity;
import com.hwang.game.item.repository.ItemMasterRepository;
import com.hwang.game.item.repository.ItemUpgradeTierRepository;
import com.hwang.game.item.repository.MonsterDropTableRepository;
import com.hwang.game.item.repository.UserEquipmentPresetRepository;
import com.hwang.game.item.repository.UserEquipmentRepository;
import com.hwang.game.item.repository.UserItemRepository;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.service.PlayerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ItemService {
    private static final Set<String> EQUIP_SLOTS = Set.of("weapon", "armor", "accessory");

    private final UserItemRepository userItemRepository;
    private final UserEquipmentRepository userEquipmentRepository;
    private final UserEquipmentPresetRepository userEquipmentPresetRepository;
    private final ItemMasterRepository itemMasterRepository;
    private final ItemUpgradeTierRepository itemUpgradeTierRepository;
    private final MonsterDropTableRepository monsterDropTableRepository;
    private final EconomyService economyService;
    private final PlayerService playerService;

    public ItemService(
            UserItemRepository userItemRepository,
            UserEquipmentRepository userEquipmentRepository,
            UserEquipmentPresetRepository userEquipmentPresetRepository,
            ItemMasterRepository itemMasterRepository,
            ItemUpgradeTierRepository itemUpgradeTierRepository,
            MonsterDropTableRepository monsterDropTableRepository,
            EconomyService economyService,
            PlayerService playerService
    ) {
        this.userItemRepository = userItemRepository;
        this.userEquipmentRepository = userEquipmentRepository;
        this.userEquipmentPresetRepository = userEquipmentPresetRepository;
        this.itemMasterRepository = itemMasterRepository;
        this.itemUpgradeTierRepository = itemUpgradeTierRepository;
        this.monsterDropTableRepository = monsterDropTableRepository;
        this.economyService = economyService;
        this.playerService = playerService;
    }

    @Transactional
    public List<UserItemEntity> saveLoot(long userId, List<LootItemRequest> items) {
        playerService.getUserEntity(userId);

        Map<String, ItemMasterEntity> itemMasterMap = itemMasterRepository.findAllById(
                        items.stream().map(i -> normalizeItemId(i.itemId())).distinct().toList()
                ).stream()
                .collect(Collectors.toMap(ItemMasterEntity::getItemId, Function.identity()));

        for (LootItemRequest item : items) {
            if (item.quantity() <= 0) {
                throw new GameException("INVALID_ITEM_QUANTITY", "quantity must be positive");
            }

            String normalizedItemId = normalizeItemId(item.itemId());
            ItemMasterEntity master = itemMasterMap.get(normalizedItemId);
            if (master == null || !master.isActive()) {
                throw new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + normalizedItemId);
            }

            UserItemEntity row = userItemRepository.findByUserIdAndItemId(userId, normalizedItemId)
                    .orElseGet(() -> new UserItemEntity(userId, normalizedItemId, master.getItemName(), 0));

            ensureEquipmentStatsInitialized(row, master);
            row.addQuantity(item.quantity());
            userItemRepository.save(row);
        }

        return userItemRepository.findByUserIdOrderByItemNameAsc(userId);
    }

    @Transactional(readOnly = true)
    public List<ItemMasterEntity> getItemCatalog() {
        return itemMasterRepository.findByActiveTrueOrderByItemTypeAscItemNameAsc();
    }

    @Transactional(readOnly = true)
    public ItemMasterEntity getItemMaster(String itemId) {
        return getItemMasterOrThrow(itemId);
    }

    @Transactional(readOnly = true)
    public List<MonsterDropTableEntity> getMonsterDropTable(String monsterId) {
        String normalizedMonsterId = monsterId.toLowerCase(Locale.ROOT).trim();
        return monsterDropTableRepository.findByMonsterIdOrderByDropChanceDesc(normalizedMonsterId);
    }

    @Transactional
    public List<UserItemEntity> getItems(long userId) {
        playerService.getUserEntity(userId);
        List<UserItemEntity> items = userItemRepository.findByUserIdOrderByItemNameAsc(userId);

        Map<String, ItemMasterEntity> itemMasterMap = itemMasterRepository.findAllById(
                        items.stream().map(UserItemEntity::getItemId).distinct().toList()
                ).stream()
                .collect(Collectors.toMap(ItemMasterEntity::getItemId, Function.identity()));

        boolean updated = false;
        for (UserItemEntity item : items) {
            ItemMasterEntity master = itemMasterMap.get(item.getItemId());
            if (master != null && ensureEquipmentStatsInitialized(item, master)) {
                updated = true;
            }
        }
        if (updated) {
            userItemRepository.saveAll(items);
        }
        return items;
    }

    @Transactional
    public List<UserItemEntity> consumeItem(long userId, String itemId, long quantity) {
        playerService.getUserEntity(userId);

        if (quantity <= 0) {
            throw new GameException("INVALID_ITEM_QUANTITY", "quantity must be positive");
        }

        ItemMasterEntity master = getItemMasterOrThrow(itemId);
        if (!"CONSUMABLE".equalsIgnoreCase(master.getItemType())) {
            throw new GameException("ITEM_NOT_CONSUMABLE", "Item is not consumable: " + master.getItemId());
        }

        UserItemEntity item = userItemRepository.findByUserIdAndItemId(userId, master.getItemId())
                .orElseThrow(() -> new GameException("ITEM_NOT_FOUND", "Item not found: " + master.getItemId()));

        if (item.getQuantity() < quantity) {
            throw new GameException("INSUFFICIENT_ITEM_QUANTITY", "Not enough item quantity");
        }

        item.subtractQuantity(quantity);
        userItemRepository.save(item);
        return userItemRepository.findByUserIdOrderByItemNameAsc(userId);
    }

    @Transactional
    public UserEquipmentEntity updateEquipment(long userId, String slot, String itemId) {
        UserEntity user = playerService.getUserEntity(userId);

        String normalizedSlot = slot.toLowerCase(Locale.ROOT);
        if (!EQUIP_SLOTS.contains(normalizedSlot)) {
            throw new GameException("INVALID_EQUIP_SLOT", "Unsupported slot: " + slot);
        }

        UserEquipmentEntity equipment = userEquipmentRepository.findById(userId)
                .orElseGet(() -> userEquipmentRepository.save(new UserEquipmentEntity(userId)));

        if (itemId == null || itemId.isBlank()) {
            setSlotItem(equipment, normalizedSlot, null);
            return userEquipmentRepository.save(equipment);
        }

        ItemMasterEntity master = getItemMasterOrThrow(itemId);
        if (!"EQUIPMENT".equalsIgnoreCase(master.getItemType())) {
            throw new GameException("ITEM_NOT_EQUIPPABLE", "Item is not equippable: " + master.getItemId());
        }
        if (master.getEquipSlot() == null || !master.getEquipSlot().equalsIgnoreCase(normalizedSlot)) {
            throw new GameException("EQUIP_SLOT_MISMATCH", "Item does not match slot");
        }
        if (master.getRequiredClassId() != null && !master.getRequiredClassId().isBlank()) {
            String requiredClass = normalizeClassId(master.getRequiredClassId());
            String playerClass = normalizeClassId(user.getClassId());
            if (!requiredClass.equals(playerClass)) {
                throw new GameException(
                        "ITEM_CLASS_RESTRICTED",
                        "This item can only be equipped by class: " + requiredClass
                );
            }
        }

        UserItemEntity userItem = userItemRepository.findByUserIdAndItemId(userId, master.getItemId())
                .orElseThrow(() -> new GameException("ITEM_NOT_FOUND", "Item not found: " + master.getItemId()));
        if (userItem.getQuantity() <= 0) {
            throw new GameException("INSUFFICIENT_ITEM_QUANTITY", "Not enough item quantity");
        }

        setSlotItem(equipment, normalizedSlot, master.getItemId());
        return userEquipmentRepository.save(equipment);
    }

    @Transactional(readOnly = true)
    public UserEquipmentEntity getEquipment(long userId) {
        playerService.getUserEntity(userId);
        return userEquipmentRepository.findById(userId).orElseGet(() -> new UserEquipmentEntity(userId));
    }

    @Transactional(readOnly = true)
    public List<UserEquipmentPresetEntity> getEquipmentPresets(long userId) {
        playerService.getUserEntity(userId);
        return userEquipmentPresetRepository.findByUserIdOrderByPresetNameAsc(userId);
    }

    @Transactional
    public UserEquipmentPresetEntity saveEquipmentPreset(long userId, String presetName) {
        playerService.getUserEntity(userId);

        String normalizedName = presetName.trim();
        if (normalizedName.isEmpty()) {
            throw new GameException("INVALID_PRESET_NAME", "presetName is required");
        }

        UserEquipmentEntity equipment = userEquipmentRepository.findById(userId)
                .orElseGet(() -> userEquipmentRepository.save(new UserEquipmentEntity(userId)));

        UserEquipmentPresetEntity preset = userEquipmentPresetRepository.findByUserIdAndPresetName(userId, normalizedName)
                .orElseGet(() -> new UserEquipmentPresetEntity(userId, normalizedName));

        preset.setPresetName(normalizedName);
        preset.setWeaponItemId(equipment.getWeaponItemId());
        preset.setArmorItemId(equipment.getArmorItemId());
        preset.setAccessoryItemId(equipment.getAccessoryItemId());
        return userEquipmentPresetRepository.save(preset);
    }

    @Transactional
    public UserEquipmentEntity applyEquipmentPreset(long userId, String presetName) {
        playerService.getUserEntity(userId);

        UserEquipmentPresetEntity preset = userEquipmentPresetRepository.findByUserIdAndPresetName(userId, presetName.trim())
                .orElseThrow(() -> new GameException("EQUIP_PRESET_NOT_FOUND", "Preset not found: " + presetName));

        UserEquipmentEntity equipment = userEquipmentRepository.findById(userId)
                .orElseGet(() -> userEquipmentRepository.save(new UserEquipmentEntity(userId)));

        validateOwnedOrNull(userId, preset.getWeaponItemId());
        validateOwnedOrNull(userId, preset.getArmorItemId());
        validateOwnedOrNull(userId, preset.getAccessoryItemId());

        equipment.setWeaponItemId(preset.getWeaponItemId());
        equipment.setArmorItemId(preset.getArmorItemId());
        equipment.setAccessoryItemId(preset.getAccessoryItemId());
        return userEquipmentRepository.save(equipment);
    }

    @Transactional
    public UserItemEntity upgradeItem(long userId, String itemId) {
        playerService.getUserEntity(userId);

        ItemMasterEntity master = getItemMasterOrThrow(itemId);
        if (!"EQUIPMENT".equalsIgnoreCase(master.getItemType())) {
            throw new GameException("ITEM_NOT_UPGRADABLE", "Item is not upgradable: " + master.getItemId());
        }

        UserItemEntity item = userItemRepository.findByUserIdAndItemId(userId, master.getItemId())
                .orElseThrow(() -> new GameException("ITEM_NOT_FOUND", "Item not found: " + master.getItemId()));
        if (item.getQuantity() <= 0) {
            throw new GameException("INSUFFICIENT_ITEM_QUANTITY", "Not enough item quantity");
        }

        ensureEquipmentStatsInitialized(item, master);

        int nextLevel = item.getUpgradeLevel() + 1;
        Optional<ItemUpgradeTierEntity> tier = itemUpgradeTierRepository.findByItemIdAndUpgradeLevel(master.getItemId(), nextLevel);
        long cost = tier.map(ItemUpgradeTierEntity::getUpgradeGoldCost)
                .orElseGet(() -> calcUpgradeGoldCost(item.getUpgradeLevel(), master.getUpgradeGoldBase()));
        economyService.spend(userId, CurrencyType.GOLD, cost, "ITEM_UPGRADE", master.getItemId() + "-lv" + nextLevel);

        if (tier.isPresent()) {
            ItemUpgradeTierEntity row = tier.get();
            item.setEquipmentStats(master.getQuality(), row.getAttackBonus(), row.getDefenseBonus(), row.getHpBonus(), row.getMpBonus());
        } else {
            item.addEquipmentBonus(
                    master.getUpgradeAttackStep(),
                    master.getUpgradeDefenseStep(),
                    master.getUpgradeHpStep(),
                    master.getUpgradeMpStep()
            );
        }
        item.increaseUpgradeLevel();
        return userItemRepository.save(item);
    }

    private void setSlotItem(UserEquipmentEntity equipment, String slot, String itemId) {
        switch (slot) {
            case "weapon" -> equipment.setWeaponItemId(itemId);
            case "armor" -> equipment.setArmorItemId(itemId);
            case "accessory" -> equipment.setAccessoryItemId(itemId);
            default -> throw new GameException("INVALID_EQUIP_SLOT", "Unsupported slot: " + slot);
        }
    }

    private void validateOwnedOrNull(long userId, String itemId) {
        if (itemId == null || itemId.isBlank()) {
            return;
        }
        UserItemEntity item = userItemRepository.findByUserIdAndItemId(userId, itemId)
                .orElseThrow(() -> new GameException("ITEM_NOT_FOUND", "Item not found: " + itemId));
        if (item.getQuantity() <= 0) {
            throw new GameException("INSUFFICIENT_ITEM_QUANTITY", "Not enough item quantity");
        }
    }

    private ItemMasterEntity getItemMasterOrThrow(String itemId) {
        String normalizedItemId = normalizeItemId(itemId);
        return itemMasterRepository.findById(normalizedItemId)
                .filter(ItemMasterEntity::isActive)
                .orElseThrow(() -> new GameException("ITEM_MASTER_NOT_FOUND", "Item master not found: " + normalizedItemId));
    }

    private String normalizeItemId(String itemId) {
        if (itemId == null || itemId.isBlank()) {
            throw new GameException("INVALID_ITEM_ID", "itemId is required");
        }
        return itemId.toLowerCase(Locale.ROOT).trim();
    }

    private String normalizeClassId(String classId) {
        if (classId == null || classId.isBlank()) {
            throw new GameException("INVALID_CLASS_ID", "classId is required");
        }
        String normalized = classId.trim().toLowerCase(Locale.ROOT);
        if (normalized.isBlank()) {
            throw new GameException("INVALID_CLASS_ID", "classId is required");
        }
        return normalized;
    }

    private long calcUpgradeGoldCost(int currentUpgradeLevel, long upgradeGoldBase) {
        long next = currentUpgradeLevel + 1L;
        long base = Math.max(1L, upgradeGoldBase);
        return base * next * next;
    }

    private boolean ensureEquipmentStatsInitialized(UserItemEntity item, ItemMasterEntity master) {
        if (!"EQUIPMENT".equalsIgnoreCase(master.getItemType())) {
            return false;
        }
        if (item.hasAnyEquipmentBonus()) {
            return false;
        }
        Optional<ItemUpgradeTierEntity> tier = itemUpgradeTierRepository.findByItemIdAndUpgradeLevel(master.getItemId(), item.getUpgradeLevel());
        if (tier.isPresent()) {
            ItemUpgradeTierEntity t = tier.get();
            item.setEquipmentStats(master.getQuality(), t.getAttackBonus(), t.getDefenseBonus(), t.getHpBonus(), t.getMpBonus());
            return true;
        }
        item.setEquipmentStats(
                master.getQuality(),
                Math.max(0, master.getAttackBonus() + (item.getUpgradeLevel() * master.getUpgradeAttackStep())),
                Math.max(0, master.getDefenseBonus() + (item.getUpgradeLevel() * master.getUpgradeDefenseStep())),
                Math.max(0, master.getHpBonus() + (item.getUpgradeLevel() * master.getUpgradeHpStep())),
                Math.max(0, master.getMpBonus() + (item.getUpgradeLevel() * master.getUpgradeMpStep()))
        );
        return true;
    }
}
