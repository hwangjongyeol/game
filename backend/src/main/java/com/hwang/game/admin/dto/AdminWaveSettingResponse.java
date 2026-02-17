package com.hwang.game.admin.dto;

import com.hwang.game.admin.entity.WaveSettingEntity;

import java.math.BigDecimal;

public record AdminWaveSettingResponse(
        long id,
        String dungeonId,
        int waveNo,
        int slotNo,
        String monsterId,
        int monsterCount,
        BigDecimal hpMultiplier,
        BigDecimal mpMultiplier,
        BigDecimal attackMultiplier,
        BigDecimal defenseMultiplier,
        BigDecimal rewardGoldMultiplier,
        BigDecimal rewardGemMultiplier,
        boolean active
) {
    public static AdminWaveSettingResponse from(WaveSettingEntity entity) {
        return new AdminWaveSettingResponse(
                entity.getId(),
                entity.getDungeonId(),
                entity.getWaveNo(),
                entity.getSlotNo(),
                entity.getMonsterId(),
                entity.getMonsterCount(),
                entity.getHpMultiplier(),
                entity.getMpMultiplier(),
                entity.getAttackMultiplier(),
                entity.getDefenseMultiplier(),
                entity.getRewardGoldMultiplier(),
                entity.getRewardGemMultiplier(),
                entity.isActive()
        );
    }
}
