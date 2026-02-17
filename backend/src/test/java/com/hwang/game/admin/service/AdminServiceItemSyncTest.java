package com.hwang.game.admin.service;

import com.hwang.game.account.entity.AccountEntity;
import com.hwang.game.account.repository.AccountRepository;
import com.hwang.game.admin.dto.AdminItemMasterRequest;
import com.hwang.game.item.entity.ItemMasterEntity;
import com.hwang.game.item.entity.UserItemEntity;
import com.hwang.game.item.repository.ItemMasterRepository;
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

@SpringBootTest
@Transactional
class AdminServiceItemSyncTest {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private PlayerRepository playerRepository;

    @Autowired
    private ItemMasterRepository itemMasterRepository;

    @Autowired
    private UserItemRepository userItemRepository;

    @Autowired
    private CharacterClassMasterRepository characterClassMasterRepository;

    @Test
    void updateItemMaster_syncsUserItemsAndKeepsUpgradeDelta() {
        ensureClass("knight", "Knight");
        UserEntity user = createUser("sync-user");
        ItemMasterEntity master = createEquipmentMaster("test-sync-sword", "Old Sword", 10, 5, 20, 3, 2, 1, 4, 1);
        itemMasterRepository.save(master);

        UserItemEntity userItem = new UserItemEntity(user.getId(), master.getItemId(), master.getItemName(), 1);
        userItem.increaseUpgradeLevel();
        userItem.increaseUpgradeLevel();
        userItem.setEquipmentStats("RARE", 17, 8, 31, 6);
        userItemRepository.save(userItem);

        AdminItemMasterRequest request = new AdminItemMasterRequest(
                null,
                "New Sword",
                "EQUIPMENT",
                "weapon",
                "knight",
                "EPIC",
                20,
                8,
                30,
                7,
                150L,
                5,
                2,
                6,
                3,
                "",
                "updated",
                true
        );

        adminService.updateItemMaster(master.getItemId(), request);

        UserItemEntity saved = userItemRepository.findByUserIdAndItemId(user.getId(), master.getItemId()).orElseThrow();
        assertThat(saved.getItemName()).isEqualTo("New Sword");
        assertThat(saved.getQuality()).isEqualTo("EPIC");
        assertThat(saved.getAttackBonus()).isEqualTo(33);
        assertThat(saved.getDefenseBonus()).isEqualTo(13);
        assertThat(saved.getHpBonus()).isEqualTo(45);
        assertThat(saved.getMpBonus()).isEqualTo(14);
    }

    @Test
    void updateItemMaster_whenChangedToMaterial_clearsEquipmentStats() {
        ensureClass("knight", "Knight");
        UserEntity user = createUser("clear-user");
        ItemMasterEntity master = createEquipmentMaster("test-clear-sword", "Before Name", 12, 4, 18, 2, 3, 1, 2, 1);
        itemMasterRepository.save(master);

        UserItemEntity userItem = new UserItemEntity(user.getId(), master.getItemId(), master.getItemName(), 1);
        userItem.increaseUpgradeLevel();
        userItem.setEquipmentStats("RARE", 15, 5, 20, 3);
        userItemRepository.save(userItem);

        AdminItemMasterRequest request = new AdminItemMasterRequest(
                null,
                "Materialized",
                "MATERIAL",
                null,
                null,
                "COMMON",
                0,
                0,
                0,
                0,
                0L,
                0,
                0,
                0,
                0,
                "",
                "now material",
                true
        );

        adminService.updateItemMaster(master.getItemId(), request);

        UserItemEntity saved = userItemRepository.findByUserIdAndItemId(user.getId(), master.getItemId()).orElseThrow();
        assertThat(saved.getItemName()).isEqualTo("Materialized");
        assertThat(saved.getQuality()).isEqualTo("NORMAL");
        assertThat(saved.getAttackBonus()).isZero();
        assertThat(saved.getDefenseBonus()).isZero();
        assertThat(saved.getHpBonus()).isZero();
        assertThat(saved.getMpBonus()).isZero();
    }

    private UserEntity createUser(String suffix) {
        AccountEntity account = accountRepository.save(new AccountEntity("acc-" + suffix, "pw"));
        return playerRepository.save(new UserEntity("ext-" + suffix, account.getId(), "tester-" + suffix, "knight"));
    }

    private ItemMasterEntity createEquipmentMaster(
            String itemId,
            String itemName,
            int attackBonus,
            int defenseBonus,
            int hpBonus,
            int mpBonus,
            int upgradeAttackStep,
            int upgradeDefenseStep,
            int upgradeHpStep,
            int upgradeMpStep
    ) {
        ItemMasterEntity entity = new ItemMasterEntity(itemId, itemName, "EQUIPMENT");
        entity.setEquipSlot("weapon");
        entity.setRequiredClassId("knight");
        entity.setQuality("RARE");
        entity.setAttackBonus(attackBonus);
        entity.setDefenseBonus(defenseBonus);
        entity.setHpBonus(hpBonus);
        entity.setMpBonus(mpBonus);
        entity.setUpgradeGoldBase(100L);
        entity.setUpgradeAttackStep(upgradeAttackStep);
        entity.setUpgradeDefenseStep(upgradeDefenseStep);
        entity.setUpgradeHpStep(upgradeHpStep);
        entity.setUpgradeMpStep(upgradeMpStep);
        entity.setImageUrl("");
        entity.setDescription("test");
        entity.setActive(true);
        return entity;
    }

    private void ensureClass(String classId, String className) {
        if (characterClassMasterRepository.existsById(classId)) return;
        CharacterClassMasterEntity entity = new CharacterClassMasterEntity(classId, className);
        characterClassMasterRepository.save(entity);
    }
}
