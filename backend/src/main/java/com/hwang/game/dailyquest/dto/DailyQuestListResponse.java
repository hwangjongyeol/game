package com.hwang.game.dailyquest.dto;

import java.time.LocalDate;
import java.util.List;

public record DailyQuestListResponse(
        long userId,
        LocalDate questDate,
        int dungeonKillCount,
        long goldEarned,
        int statUpgradeCount,
        List<DailyQuestEntryResponse> quests
) {
}
