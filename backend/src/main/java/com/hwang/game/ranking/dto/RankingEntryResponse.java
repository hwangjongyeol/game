package com.hwang.game.ranking.dto;

import com.hwang.game.ranking.model.RankingEntry;

public record RankingEntryResponse(
        int rank,
        long userId,
        long score
) {
    public static RankingEntryResponse of(int rank, RankingEntry entry) {
        return new RankingEntryResponse(rank, entry.userId(), entry.score());
    }
}
