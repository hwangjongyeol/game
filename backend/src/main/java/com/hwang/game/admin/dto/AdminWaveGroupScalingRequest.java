package com.hwang.game.admin.dto;

import java.math.BigDecimal;

public record AdminWaveGroupScalingRequest(
        String dungeonId,
        Integer waveGroupNo,
        BigDecimal hpMultiplier,
        BigDecimal mpMultiplier,
        BigDecimal attackMultiplier,
        BigDecimal defenseMultiplier,
        BigDecimal rewardGoldMultiplier,
        BigDecimal rewardGemMultiplier,
        String backgroundImagePath,
        Boolean active
) {
}
