package com.hwang.game.dailyquest.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record DailyQuestProgressRequest(
        @NotNull Long userId,
        @Min(0) int dungeonKillDelta,
        @Min(0) long goldEarnedDelta,
        @Min(0) int statUpgradeDelta
) {
}
