package com.hwang.game.ranking.repository;

import com.hwang.game.ranking.entity.RankingSnapshotEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface RankingRepository extends JpaRepository<RankingSnapshotEntity, Long> {
    List<RankingSnapshotEntity> findBySeasonIdOrderByScoreDescUserIdAsc(String seasonId, Pageable pageable);

    Optional<RankingSnapshotEntity> findBySeasonIdAndUserId(String seasonId, Long userId);

    @Query("""
            select count(r)
            from RankingSnapshotEntity r
            where r.seasonId = :seasonId
              and (r.score > :score or (r.score = :score and r.userId < :userId))
            """)
    long countHigherRanked(
            @Param("seasonId") String seasonId,
            @Param("score") long score,
            @Param("userId") Long userId
    );
}
