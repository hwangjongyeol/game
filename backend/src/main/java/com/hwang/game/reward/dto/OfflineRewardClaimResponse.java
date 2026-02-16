package com.hwang.game.reward.dto;

public record OfflineRewardClaimResponse(
        long userId,
        long offlineSeconds,
        long goldReward,
        long expReward,
        boolean capped
) {
}
