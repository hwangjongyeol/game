package com.hwang.game.dungeon.dto;

import java.math.BigDecimal;

public record WaveGroupScalingRuntimeResponse(
        int waveGroupNo,
        BigDecimal hpMultiplier,
        BigDecimal mpMultiplier,
        BigDecimal attackMultiplier,
        BigDecimal defenseMultiplier,
        BigDecimal rewardGoldMultiplier,
        BigDecimal rewardGemMultiplier,
        String backgroundImagePath
) {
}
