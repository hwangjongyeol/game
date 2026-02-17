package com.hwang.game.dungeon.dto;

import java.math.BigDecimal;

public record WaveRuntimeEntryResponse(
        int slotNo,
        String monsterId,
        int monsterCount,
        BigDecimal hpMultiplier,
        BigDecimal mpMultiplier,
        BigDecimal attackMultiplier,
        BigDecimal defenseMultiplier,
        BigDecimal rewardGoldMultiplier,
        BigDecimal rewardGemMultiplier
) {
}
