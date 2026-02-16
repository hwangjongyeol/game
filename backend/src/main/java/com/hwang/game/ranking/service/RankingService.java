package com.hwang.game.ranking.service;

import com.hwang.game.common.exception.GameException;
import com.hwang.game.ranking.dto.MyRankingResponse;
import com.hwang.game.ranking.dto.RankingEntryResponse;
import com.hwang.game.ranking.entity.RankingSnapshotEntity;
import com.hwang.game.ranking.repository.RankingRepository;
import com.hwang.game.player.service.PlayerService;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class RankingService {
    private final RankingRepository rankingRepository;
    private final PlayerService playerService;

    public RankingService(RankingRepository rankingRepository, PlayerService playerService) {
        this.rankingRepository = rankingRepository;
        this.playerService = playerService;
    }

    @Transactional(readOnly = true)
    public List<RankingEntryResponse> getTopRankings(String seasonId, int limit) {
        int safeLimit = Math.max(1, Math.min(limit, 100));
        List<RankingSnapshotEntity> entries = rankingRepository.findBySeasonIdOrderByScoreDescUserIdAsc(
                seasonId,
                PageRequest.of(0, safeLimit)
        );

        ArrayList<RankingEntryResponse> responses = new ArrayList<>();
        int rank = 1;
        for (RankingSnapshotEntity entry : entries) {
            playerService.getUserEntity(entry.getUserId());
            responses.add(new RankingEntryResponse(rank, entry.getUserId(), entry.getScore()));
            rank++;
        }
        return responses;
    }

    @Transactional(readOnly = true)
    public MyRankingResponse getMyRanking(String seasonId, long userId) {
        playerService.getUserEntity(userId);
        RankingSnapshotEntity row = rankingRepository.findBySeasonIdAndUserId(seasonId, userId)
                .orElseThrow(() -> new GameException("RANKING_SEASON_NOT_FOUND", "Ranking not found"));

        int rank = (int) rankingRepository.countHigherRanked(seasonId, row.getScore(), userId) + 1;
        return new MyRankingResponse(seasonId, userId, rank, row.getScore());
    }

    @Transactional
    public MyRankingResponse addScore(String seasonId, long userId, long scoreDelta) {
        if (scoreDelta == 0) {
            throw new GameException("INVALID_RANKING_SCORE", "scoreDelta must not be zero");
        }

        playerService.getUserEntity(userId);

        RankingSnapshotEntity row = rankingRepository.findBySeasonIdAndUserId(seasonId, userId)
                .orElseGet(() -> new RankingSnapshotEntity(seasonId, userId, 0L));

        row.setScore(row.getScore() + scoreDelta);
        rankingRepository.save(row);

        int rank = (int) rankingRepository.countHigherRanked(seasonId, row.getScore(), userId) + 1;
        return new MyRankingResponse(seasonId, userId, rank, row.getScore());
    }
}
