package com.hwang.game.item.dto;

import com.hwang.game.item.entity.UserItemEntity;

import java.time.LocalDateTime;

public record UserItemResponse(
        long userId,
        String itemId,
        String itemName,
        long quantity,
        int upgradeLevel,
        String quality,
        int attackBonus,
        int defenseBonus,
        int hpBonus,
        int mpBonus,
        LocalDateTime updatedAt
) {
    public static UserItemResponse from(UserItemEntity entity) {
        return new UserItemResponse(
                entity.getUserId(),
                entity.getItemId(),
                entity.getItemName(),
                entity.getQuantity(),
                entity.getUpgradeLevel(),
                entity.getQuality(),
                entity.getAttackBonus(),
                entity.getDefenseBonus(),
                entity.getHpBonus(),
                entity.getMpBonus(),
                entity.getUpdatedAt()
        );
    }
}
