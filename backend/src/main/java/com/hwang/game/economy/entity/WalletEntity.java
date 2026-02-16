package com.hwang.game.economy.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "wallets")
public class WalletEntity {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private long gold;

    @Column(nullable = false)
    private long gem;

    @Column(nullable = false)
    private int energy;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected WalletEntity() {
    }

    public WalletEntity(Long userId) {
        this.userId = userId;
        this.gold = 500L;
        this.gem = 30L;
        this.energy = 100;
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

    public long getGold() {
        return gold;
    }

    public long getGem() {
        return gem;
    }

    public int getEnergy() {
        return energy;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setGold(long gold) {
        this.gold = gold;
    }

    public void setGem(long gem) {
        this.gem = gem;
    }

    public void setEnergy(int energy) {
        this.energy = energy;
    }
}
