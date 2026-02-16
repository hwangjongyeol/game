package com.hwang.game.dailyquest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record DailyQuestClaimOneRequest(
        @NotNull Long userId,
        @NotBlank String questCode
) {
}
