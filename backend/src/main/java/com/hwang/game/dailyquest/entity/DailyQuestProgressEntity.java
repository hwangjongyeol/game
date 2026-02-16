package com.hwang.game.dailyquest.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "daily_quest_progress")
public class DailyQuestProgressEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "quest_date", nullable = false)
    private LocalDate questDate;

    @Column(name = "dungeon_kill_count", nullable = false)
    private int dungeonKillCount;

    @Column(name = "gold_earned", nullable = false)
    private long goldEarned;

    @Column(name = "stat_upgrade_count", nullable = false)
    private int statUpgradeCount;

    @Column(name = "claimed_mask", nullable = false)
    private long claimedMask;

    @Column(name = "reward_claimed_at")
    private LocalDateTime rewardClaimedAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected DailyQuestProgressEntity() {
    }

    public DailyQuestProgressEntity(Long userId, LocalDate questDate) {
        this.userId = userId;
        this.questDate = questDate;
        this.dungeonKillCount = 0;
        this.goldEarned = 0L;
        this.statUpgradeCount = 0;
        this.claimedMask = 0L;
    }

    @PrePersist
    void onCreate() {
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getUserId() {
        return userId;
    }

    public LocalDate getQuestDate() {
        return questDate;
    }

    public int getDungeonKillCount() {
        return dungeonKillCount;
    }

    public long getGoldEarned() {
        return goldEarned;
    }

    public int getStatUpgradeCount() {
        return statUpgradeCount;
    }

    public LocalDateTime getRewardClaimedAt() {
        return rewardClaimedAt;
    }

    public long getClaimedMask() {
        return claimedMask;
    }

    public void addKillCount(int delta) {
        this.dungeonKillCount += delta;
    }

    public void addGoldEarned(long delta) {
        this.goldEarned += delta;
    }

    public void addStatUpgradeCount(int delta) {
        this.statUpgradeCount += delta;
    }

    public void markRewardClaimed() {
        this.rewardClaimedAt = LocalDateTime.now();
    }

    public boolean isQuestClaimed(int questIndex) {
        return (claimedMask & (1L << questIndex)) != 0L;
    }

    public void markQuestClaimed(int questIndex) {
        this.claimedMask |= (1L << questIndex);
    }
}
