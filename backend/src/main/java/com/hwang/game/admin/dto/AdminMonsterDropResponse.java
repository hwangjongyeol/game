package com.hwang.game.admin.dto;

import com.hwang.game.item.entity.MonsterDropTableEntity;

import java.math.BigDecimal;

public record AdminMonsterDropResponse(
        long id,
        String monsterId,
        String itemId,
        BigDecimal dropChance,
        int minQuantity,
        int maxQuantity,
        boolean equipmentDrop
) {
    public static AdminMonsterDropResponse from(MonsterDropTableEntity entity) {
        return new AdminMonsterDropResponse(
                entity.getId(),
                entity.getMonsterId(),
                entity.getItemId(),
                entity.getDropChance(),
                entity.getMinQuantity(),
                entity.getMaxQuantity(),
                entity.isEquipmentDrop()
        );
    }
}
