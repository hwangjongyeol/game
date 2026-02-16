package com.hwang.game.ranking.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "ranking_snapshots")
public class RankingSnapshotEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "season_id", nullable = false, length = 30)
    private String seasonId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "rank_no", nullable = false)
    private int rankNo;

    @Column(nullable = false)
    private long score;

    @Column(name = "captured_at", nullable = false)
    private LocalDateTime capturedAt;

    protected RankingSnapshotEntity() {
    }

    public RankingSnapshotEntity(String seasonId, Long userId, long score) {
        this.seasonId = seasonId;
        this.userId = userId;
        this.rankNo = 0;
        this.score = score;
    }

    @PrePersist
    void onCreate() {
        this.capturedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.capturedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getSeasonId() {
        return seasonId;
    }

    public Long getUserId() {
        return userId;
    }

    public int getRankNo() {
        return rankNo;
    }

    public long getScore() {
        return score;
    }

    public LocalDateTime getCapturedAt() {
        return capturedAt;
    }

    public void setRankNo(int rankNo) {
        this.rankNo = rankNo;
    }

    public void setScore(long score) {
        this.score = score;
    }
}
