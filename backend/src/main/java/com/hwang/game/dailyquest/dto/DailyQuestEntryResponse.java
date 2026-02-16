package com.hwang.game.dailyquest.dto;

public record DailyQuestEntryResponse(
        String questCode,
        String title,
        String objectiveType,
        long progress,
        long target,
        boolean claimable,
        boolean claimed,
        long rewardGold,
        long rewardGem
) {
}
