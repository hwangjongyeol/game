package com.hwang.game.player.dto;

import com.hwang.game.player.entity.CharacterClassMasterEntity;

public record CharacterClassResponse(
        String classId,
        String className,
        int baseAttack,
        int baseDefense,
        int baseHp,
        int baseMp,
        boolean active
) {
    public static CharacterClassResponse from(CharacterClassMasterEntity entity) {
        return new CharacterClassResponse(
                entity.getClassId(),
                entity.getClassName(),
                entity.getBaseAttack(),
                entity.getBaseDefense(),
                entity.getBaseHp(),
                entity.getBaseMp(),
                entity.isActive()
        );
    }
}
