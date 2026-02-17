package com.hwang.game.admin.dto;

import com.hwang.game.admin.entity.WaveGroupScalingEntity;

import java.math.BigDecimal;

public record AdminWaveGroupScalingResponse(
        long id,
        String dungeonId,
        int waveGroupNo,
        BigDecimal hpMultiplier,
        BigDecimal mpMultiplier,
        BigDecimal attackMultiplier,
        BigDecimal defenseMultiplier,
        BigDecimal rewardGoldMultiplier,
        BigDecimal rewardGemMultiplier,
        String backgroundImagePath,
        boolean active
) {
    public static AdminWaveGroupScalingResponse from(WaveGroupScalingEntity entity) {
        return new AdminWaveGroupScalingResponse(
                entity.getId(),
                entity.getDungeonId(),
                entity.getWaveGroupNo(),
                entity.getHpMultiplier(),
                entity.getMpMultiplier(),
                entity.getAttackMultiplier(),
                entity.getDefenseMultiplier(),
                entity.getRewardGoldMultiplier(),
                entity.getRewardGemMultiplier(),
                entity.getBackgroundImagePath(),
                entity.isActive()
        );
    }
}
