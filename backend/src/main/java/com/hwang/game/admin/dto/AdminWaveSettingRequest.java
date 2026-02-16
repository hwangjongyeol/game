package com.hwang.game.admin.dto;

import java.math.BigDecimal;

public record AdminWaveSettingRequest(
        String dungeonId,
        Integer waveNo,
        String monsterId,
        Integer monsterCount,
        BigDecimal hpMultiplier,
        BigDecimal mpMultiplier,
        BigDecimal attackMultiplier,
        BigDecimal defenseMultiplier,
        BigDecimal rewardGoldMultiplier,
        BigDecimal rewardGemMultiplier,
        Boolean active
) {
}
