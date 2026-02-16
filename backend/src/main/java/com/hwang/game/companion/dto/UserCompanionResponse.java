package com.hwang.game.companion.dto;

import com.hwang.game.companion.entity.CompanionMasterEntity;
import com.hwang.game.companion.entity.UserCompanionEntity;

public record UserCompanionResponse(
        long id,
        long userId,
        String companionId,
        String companionName,
        String grade,
        String classId,
        int level,
        int copies,
        Integer slotNo,
        long attack,
        long defense,
        long hp,
        long mp,
        String imageUrl
) {
    public static UserCompanionResponse from(UserCompanionEntity user, CompanionMasterEntity master) {
        long scale = Math.max(1, user.getLevel());
        return new UserCompanionResponse(
                user.getId(),
                user.getUserId(),
                user.getCompanionId(),
                master != null ? master.getCompanionName() : user.getCompanionId(),
                master != null ? master.getGrade() : "COMMON",
                master != null ? master.getClassId() : "knight",
                user.getLevel(),
                user.getCopies(),
                user.getSlotNo(),
                (master != null ? master.getBaseAttack() : 0L) * scale,
                (master != null ? master.getBaseDefense() : 0L) * scale,
                (master != null ? master.getBaseHp() : 0L) * scale,
                (master != null ? master.getBaseMp() : 0L) * scale,
                master != null ? master.getImageUrl() : ""
        );
    }
}
