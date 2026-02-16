package com.hwang.game.ranking.dto;

public record MyRankingResponse(
        String seasonId,
        long userId,
        int rank,
        long score
) {
}
