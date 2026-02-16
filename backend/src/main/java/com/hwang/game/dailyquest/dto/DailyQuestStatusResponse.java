package com.hwang.game.dailyquest.dto;

import com.hwang.game.dailyquest.entity.DailyQuestProgressEntity;

import java.time.LocalDate;

public record DailyQuestStatusResponse(
        long userId,
        LocalDate questDate,
        int dungeonKillCount,
        int targetKillCount,
        long goldEarned,
        long targetGoldEarned,
        int statUpgradeCount,
        int targetStatUpgradeCount,
        boolean claimable,
        boolean claimed,
        long rewardGold,
        long rewardGem
) {
    public static DailyQuestStatusResponse from(
            DailyQuestProgressEntity entity,
            int targetKill,
            long targetGold,
            int targetUpgrade,
            long rewardGold,
            long rewardGem
    ) {
        boolean claimed = entity.getRewardClaimedAt() != null;
        boolean complete = entity.getDungeonKillCount() >= targetKill
                && entity.getGoldEarned() >= targetGold
                && entity.getStatUpgradeCount() >= targetUpgrade;
        boolean claimable = complete && !claimed;

        return new DailyQuestStatusResponse(
                entity.getUserId(),
                entity.getQuestDate(),
                entity.getDungeonKillCount(),
                targetKill,
                entity.getGoldEarned(),
                targetGold,
                entity.getStatUpgradeCount(),
                targetUpgrade,
                claimable,
                claimed,
                rewardGold,
                rewardGem
        );
    }
}
