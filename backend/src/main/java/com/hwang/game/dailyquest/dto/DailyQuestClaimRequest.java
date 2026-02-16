package com.hwang.game.dailyquest.dto;

import jakarta.validation.constraints.NotNull;

public record DailyQuestClaimRequest(
        @NotNull Long userId
) {
}
