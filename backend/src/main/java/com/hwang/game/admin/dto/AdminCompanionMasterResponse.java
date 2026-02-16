package com.hwang.game.admin.dto;

import com.hwang.game.companion.entity.CompanionMasterEntity;

public record AdminCompanionMasterResponse(
        String companionId,
        String companionName,
        String grade,
        String classId,
        int baseAttack,
        int baseDefense,
        int baseHp,
        int baseMp,
        String imageUrl,
        int recruitWeight,
        boolean active
) {
    public static AdminCompanionMasterResponse from(CompanionMasterEntity entity) {
        return new AdminCompanionMasterResponse(
                entity.getCompanionId(),
                entity.getCompanionName(),
                entity.getGrade(),
                entity.getClassId(),
                entity.getBaseAttack(),
                entity.getBaseDefense(),
                entity.getBaseHp(),
                entity.getBaseMp(),
                entity.getImageUrl(),
                entity.getRecruitWeight(),
                entity.isActive()
        );
    }
}
