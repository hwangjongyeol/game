package com.hwang.game.item.dto;

import com.hwang.game.item.entity.ItemMasterEntity;

public record ItemMasterResponse(
        String itemId,
        String itemName,
        String itemType,
        String equipSlot,
        String requiredClassId,
        String quality,
        int attackBonus,
        int defenseBonus,
        int hpBonus,
        int mpBonus,
        long upgradeGoldBase,
        int upgradeAttackStep,
        int upgradeDefenseStep,
        int upgradeHpStep,
        int upgradeMpStep,
        String imageUrl,
        String description,
        boolean active
) {
    public static ItemMasterResponse from(ItemMasterEntity entity) {
        return new ItemMasterResponse(
                entity.getItemId(),
                entity.getItemName(),
                entity.getItemType(),
                entity.getEquipSlot(),
                entity.getRequiredClassId(),
                entity.getQuality(),
                entity.getAttackBonus(),
                entity.getDefenseBonus(),
                entity.getHpBonus(),
                entity.getMpBonus(),
                entity.getUpgradeGoldBase(),
                entity.getUpgradeAttackStep(),
                entity.getUpgradeDefenseStep(),
                entity.getUpgradeHpStep(),
                entity.getUpgradeMpStep(),
                entity.getImageUrl(),
                entity.getDescription(),
                entity.isActive()
        );
    }
}
