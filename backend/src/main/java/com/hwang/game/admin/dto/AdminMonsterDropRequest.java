package com.hwang.game.admin.dto;

import java.math.BigDecimal;

public record AdminMonsterDropRequest(
        String monsterId,
        String itemId,
        BigDecimal dropChance,
        Integer minQuantity,
        Integer maxQuantity,
        Boolean equipmentDrop
) {
}
