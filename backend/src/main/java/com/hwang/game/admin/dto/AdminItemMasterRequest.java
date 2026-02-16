package com.hwang.game.admin.dto;

public record AdminItemMasterRequest(
        String itemId,
        String itemName,
        String itemType,
        String equipSlot,
        String requiredClassId,
        String quality,
        Integer attackBonus,
        Integer defenseBonus,
        Integer hpBonus,
        Integer mpBonus,
        Long upgradeGoldBase,
        Integer upgradeAttackStep,
        Integer upgradeDefenseStep,
        Integer upgradeHpStep,
        Integer upgradeMpStep,
        String imageUrl,
        String description,
        Boolean active
) {
}
