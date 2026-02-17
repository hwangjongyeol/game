package com.hwang.game.admin.dto;

import com.hwang.game.admin.entity.BalanceProfileEntity;

import java.time.LocalDateTime;

public record AdminBalanceProfileResponse(
        String profileId,
        String profileName,
        String description,
        String profileJson,
        boolean active,
        LocalDateTime updatedAt
) {
    public static AdminBalanceProfileResponse from(BalanceProfileEntity entity) {
        return new AdminBalanceProfileResponse(
                entity.getProfileId(),
                entity.getProfileName(),
                entity.getDescription(),
                entity.getProfileJson(),
                entity.isActive(),
                entity.getUpdatedAt()
        );
    }
}
