package com.hwang.game.dungeon.entity;

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
@Table(name = "user_dungeon_progress")
public class UserDungeonProgressEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "dungeon_id", nullable = false, length = 40)
    private String dungeonId;

    @Column(name = "current_wave", nullable = false)
    private int currentWave;

    @Column(name = "max_unlocked_wave", nullable = false)
    private int maxUnlockedWave;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UserDungeonProgressEntity() {
    }

    public UserDungeonProgressEntity(Long userId, String dungeonId) {
        this.userId = userId;
        this.dungeonId = dungeonId;
        this.currentWave = 1;
        this.maxUnlockedWave = 1;
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

    public String getDungeonId() {
        return dungeonId;
    }

    public int getCurrentWave() {
        return currentWave;
    }

    public int getMaxUnlockedWave() {
        return maxUnlockedWave;
    }

    public void setCurrentWave(int currentWave) {
        this.currentWave = currentWave;
    }

    public void setMaxUnlockedWave(int maxUnlockedWave) {
        this.maxUnlockedWave = maxUnlockedWave;
    }
}
