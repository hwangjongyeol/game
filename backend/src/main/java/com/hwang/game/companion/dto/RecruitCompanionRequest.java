package com.hwang.game.companion.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record RecruitCompanionRequest(
        long userId,
        @Min(1) @Max(10) int count
) {
}
