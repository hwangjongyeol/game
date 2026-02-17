package com.hwang.game.admin.dto;

import com.hwang.game.player.entity.CharacterClassMasterEntity;

public record AdminClassMasterResponse(
        String classId,
        String className,
        int baseAttack,
        int baseDefense,
        int baseHp,
        int baseMp,
        boolean active
) {
    public static AdminClassMasterResponse from(CharacterClassMasterEntity entity) {
        return new AdminClassMasterResponse(
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
