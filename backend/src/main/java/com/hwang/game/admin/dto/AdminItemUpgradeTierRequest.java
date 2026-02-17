package com.hwang.game.admin.dto;

public record AdminItemUpgradeTierRequest(
        String itemId,
        Integer upgradeLevel,
        Long upgradeGoldCost,
        Integer attackBonus,
        Integer defenseBonus,
        Integer hpBonus,
        Integer mpBonus
) {
}
