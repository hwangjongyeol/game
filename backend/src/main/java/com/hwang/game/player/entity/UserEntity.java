package com.hwang.game.player.entity;

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
@Table(name = "users")
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", nullable = false, unique = true, length = 100)
    private String externalId;

    @Column(name = "account_id", nullable = false)
    private Long accountId;

    @Column(nullable = false, length = 30)
    private String nickname;

    @Column(name = "class_id", nullable = false, length = 20)
    private String classId;

    @Column(nullable = false)
    private int level;

    @Column(nullable = false)
    private long exp;

    @Column(name = "power_score", nullable = false)
    private long powerScore;

    @Column(name = "last_logout_at")
    private LocalDateTime lastLogoutAt;

    @Column(name = "is_deleted", nullable = false)
    private boolean deleted;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UserEntity() {
    }

    public UserEntity(String externalId, Long accountId, String nickname, String classId) {
        this.externalId = externalId;
        this.accountId = accountId;
        this.nickname = nickname;
        this.classId = classId;
        this.level = 1;
        this.exp = 0L;
        this.powerScore = 0L;
        this.deleted = false;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public String getExternalId() {
        return externalId;
    }

    public Long getAccountId() {
        return accountId;
    }

    public String getNickname() {
        return nickname;
    }

    public String getClassId() {
        return classId;
    }

    public int getLevel() {
        return level;
    }

    public long getExp() {
        return exp;
    }

    public long getPowerScore() {
        return powerScore;
    }

    public LocalDateTime getLastLogoutAt() {
        return lastLogoutAt;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public void setLastLogoutAt(LocalDateTime lastLogoutAt) {
        this.lastLogoutAt = lastLogoutAt;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public void setClassId(String classId) {
        this.classId = classId;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public void setExp(long exp) {
        this.exp = exp;
    }

    public void setPowerScore(long powerScore) {
        this.powerScore = powerScore;
    }

    public void softDelete() {
        this.deleted = true;
        this.deletedAt = LocalDateTime.now();
    }

    public void restore() {
        this.deleted = false;
        this.deletedAt = null;
    }
}
