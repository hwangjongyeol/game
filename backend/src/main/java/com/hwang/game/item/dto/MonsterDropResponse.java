package com.hwang.game.item.dto;

import com.hwang.game.item.entity.MonsterDropTableEntity;

import java.math.BigDecimal;

public record MonsterDropResponse(
        String monsterId,
        String itemId,
        BigDecimal dropChance,
        int minQuantity,
        int maxQuantity,
        boolean equipmentDrop
) {
    public static MonsterDropResponse from(MonsterDropTableEntity entity) {
        return new MonsterDropResponse(
                entity.getMonsterId(),
                entity.getItemId(),
                entity.getDropChance(),
                entity.getMinQuantity(),
                entity.getMaxQuantity(),
                entity.isEquipmentDrop()
        );
    }
}
