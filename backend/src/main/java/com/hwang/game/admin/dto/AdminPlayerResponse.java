package com.hwang.game.admin.dto;

import com.hwang.game.player.entity.UserEntity;

public record AdminPlayerResponse(
        long id,
        long accountId,
        String externalId,
        String nickname,
        String classId,
        int level,
        long exp,
        long powerScore,
        boolean deleted
) {
    public static AdminPlayerResponse from(UserEntity user) {
        return new AdminPlayerResponse(
                user.getId(),
                user.getAccountId(),
                user.getExternalId(),
                user.getNickname(),
                user.getClassId(),
                user.getLevel(),
                user.getExp(),
                user.getPowerScore(),
                user.isDeleted()
        );
    }
}
