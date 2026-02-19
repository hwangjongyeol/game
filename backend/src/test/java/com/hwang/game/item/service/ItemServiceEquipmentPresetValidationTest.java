package com.hwang.game.item.service;

import com.hwang.game.account.entity.AccountEntity;
import com.hwang.game.account.repository.AccountRepository;
import com.hwang.game.common.exception.GameException;
import com.hwang.game.item.entity.ItemMasterEntity;
import com.hwang.game.item.entity.UserEquipmentEntity;
import com.hwang.game.item.entity.UserEquipmentPresetEntity;
import com.hwang.game.item.entity.UserItemEntity;
import com.hwang.game.item.repository.ItemMasterRepository;
import com.hwang.game.item.repository.UserEquipmentPresetRepository;
import com.hwang.game.item.repository.UserEquipmentRepository;
import com.hwang.game.item.repository.UserItemRepository;
import com.hwang.game.player.entity.CharacterClassMasterEntity;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.repository.CharacterClassMasterRepository;
import com.hwang.game.player.repository.PlayerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class ItemServiceEquipmentPresetValidationTest {

    @Autowired
    private ItemService itemService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private CharacterClassMasterRepository characterClassMasterRepository;

    @Autowired
    private ItemMasterRepository itemMasterRepository;

    @Autowired
    private UserItemRepository userItemRepository;

    @Autowired
    private UserEquipmentPresetRepository userEquipmentPresetRepository;

    @Autowired
    private UserEquipmentRepository userEquipmentRepository;

    @Test
    void applyEquipmentPreset_rejectsClassRestrictedItem() {
        ensureClass("knight", "Knight");
        ensureClass("mage", "Mage");
        UserEntity user = createUser("preset-class", "mage");

        ItemMasterEntity weapon = createEquipmentMaster("preset-knight-sword", "weapon", "knight");
        itemMasterRepository.save(weapon);
        userItemRepository.save(new UserItemEntity(user.getId(), weapon.getItemId(), weapon.getItemName(), 1));

        UserEquipmentPresetEntity preset = new UserEquipmentPresetEntity(user.getId(), "class-only");
        preset.setWeaponItemId(weapon.getItemId());
        userEquipmentPresetRepository.save(preset);

        assertThatThrownBy(() -> itemService.applyEquipmentPreset(user.getId(), "class-only"))
                .isInstanceOf(GameException.class)
                .extracting(ex -> ((GameException) ex).getCode())
                .isEqualTo("ITEM_CLASS_RESTRICTED");
    }

    @Test
    void applyEquipmentPreset_rejectsSlotMismatchItem() {
        ensureClass("knight", "Knight");
        UserEntity user = createUser("preset-slot", "knight");

        ItemMasterEntity weapon = createEquipmentMaster("preset-weapon-001", "weapon", "knight");
        itemMasterRepository.save(weapon);
        userItemRepository.save(new UserItemEntity(user.getId(), weapon.getItemId(), weapon.getItemName(), 1));

        UserEquipmentPresetEntity preset = new UserEquipmentPresetEntity(user.getId(), "bad-slot");
        preset.setArmorItemId(weapon.getItemId());
        userEquipmentPresetRepository.save(preset);

        assertThatThrownBy(() -> itemService.applyEquipmentPreset(user.getId(), "bad-slot"))
                .isInstanceOf(GameException.class)
                .extracting(ex -> ((GameException) ex).getCode())
                .isEqualTo("EQUIP_SLOT_MISMATCH");
    }

    @Test
    void applyEquipmentPreset_allowsValidPresetAndPersistsEquipment() {
        ensureClass("knight", "Knight");
        UserEntity user = createUser("preset-ok", "knight");

        ItemMasterEntity weapon = createEquipmentMaster("preset-weapon-002", "weapon", "knight");
        ItemMasterEntity armor = createEquipmentMaster("preset-armor-002", "armor", "knight");
        itemMasterRepository.save(weapon);
        itemMasterRepository.save(armor);
        userItemRepository.save(new UserItemEntity(user.getId(), weapon.getItemId(), weapon.getItemName(), 1));
        userItemRepository.save(new UserItemEntity(user.getId(), armor.getItemId(), armor.getItemName(), 1));

        UserEquipmentPresetEntity preset = new UserEquipmentPresetEntity(user.getId(), "valid");
        preset.setWeaponItemId(weapon.getItemId());
        preset.setArmorItemId(armor.getItemId());
        userEquipmentPresetRepository.save(preset);

        UserEquipmentEntity result = itemService.applyEquipmentPreset(user.getId(), "valid");

        assertThat(result.getWeaponItemId()).isEqualTo(weapon.getItemId());
        assertThat(result.getArmorItemId()).isEqualTo(armor.getItemId());
        assertThat(result.getAccessoryItemId()).isNull();
        assertThat(userEquipmentRepository.findById(user.getId())).isPresent();
    }

    private UserEntity createUser(String suffix, String classId) {
        AccountEntity account = accountRepository.save(new AccountEntity("acc-" + suffix, "pw"));
        return playerRepository.save(new UserEntity("ext-" + suffix, account.getId(), "tester-" + suffix, classId));
    }

    private ItemMasterEntity createEquipmentMaster(String itemId, String slot, String requiredClassId) {
        ItemMasterEntity entity = new ItemMasterEntity(itemId, itemId + "-name", "EQUIPMENT");
        entity.setEquipSlot(slot);
        entity.setRequiredClassId(requiredClassId);
        entity.setQuality("RARE");
        entity.setAttackBonus(10);
        entity.setDefenseBonus(5);
        entity.setHpBonus(20);
        entity.setMpBonus(3);
        entity.setUpgradeGoldBase(100L);
        entity.setUpgradeAttackStep(2);
        entity.setUpgradeDefenseStep(1);
        entity.setUpgradeHpStep(4);
        entity.setUpgradeMpStep(1);
        entity.setImageUrl("");
        entity.setDescription("test");
        entity.setActive(true);
        return entity;
    }

    private void ensureClass(String classId, String className) {
        if (characterClassMasterRepository.existsById(classId)) {
            return;
        }
        characterClassMasterRepository.save(new CharacterClassMasterEntity(classId, className));
    }
}
