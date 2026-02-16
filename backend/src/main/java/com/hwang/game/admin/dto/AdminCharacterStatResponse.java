package com.hwang.game.admin.dto;

import com.hwang.game.character.entity.UserCharacterStatEntity;

public record AdminCharacterStatResponse(
        long userId,
        long attackValue,
        long defenseValue,
        long maxHpValue,
        long maxMpValue,
        int attackLevel,
        int defenseLevel,
        int hpLevel,
        int mpLevel
) {
    public static AdminCharacterStatResponse from(UserCharacterStatEntity entity) {
        return new AdminCharacterStatResponse(
                entity.getUserId(),
                entity.getAttackValue(),
                entity.getDefenseValue(),
                entity.getMaxHpValue(),
                entity.getMaxMpValue(),
                entity.getAttackLevel(),
                entity.getDefenseLevel(),
                entity.getHpLevel(),
                entity.getMpLevel()
        );
    }
}
