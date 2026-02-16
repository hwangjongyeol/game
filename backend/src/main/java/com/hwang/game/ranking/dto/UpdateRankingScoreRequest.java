package com.hwang.game.ranking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateRankingScoreRequest(
        @NotBlank String seasonId,
        @NotNull Long userId,
        long scoreDelta
) {
}
