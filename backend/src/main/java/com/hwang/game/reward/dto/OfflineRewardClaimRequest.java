package com.hwang.game.reward.dto;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record OfflineRewardClaimRequest(
        @NotNull Long userId,
        @NotNull Instant clientLastSeenAt
) {
}
