package com.hwang.game.admin.dto;

import com.hwang.game.item.entity.ItemUpgradeTierEntity;

public record AdminItemUpgradeTierResponse(
        long id,
        String itemId,
        int upgradeLevel,
        long upgradeGoldCost,
        int attackBonus,
        int defenseBonus,
        int hpBonus,
        int mpBonus
) {
    public static AdminItemUpgradeTierResponse from(ItemUpgradeTierEntity entity) {
        return new AdminItemUpgradeTierResponse(
                entity.getId(),
                entity.getItemId(),
                entity.getUpgradeLevel(),
                entity.getUpgradeGoldCost(),
                entity.getAttackBonus(),
                entity.getDefenseBonus(),
                entity.getHpBonus(),
                entity.getMpBonus()
        );
    }
}
