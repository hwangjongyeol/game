package com.hwang.game.admin.dto;

public record AdminBalanceProfileRequest(
        String profileId,
        String profileName,
        String description,
        String profileJson,
        Boolean active
) {
}
