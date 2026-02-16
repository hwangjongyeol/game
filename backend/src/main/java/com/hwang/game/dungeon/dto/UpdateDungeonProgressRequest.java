package com.hwang.game.dungeon.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record UpdateDungeonProgressRequest(
        @NotNull Long userId,
        @Min(1) int currentWave,
        @Min(1) int maxUnlockedWave
) {
}
