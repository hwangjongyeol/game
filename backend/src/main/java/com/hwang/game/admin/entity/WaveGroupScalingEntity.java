package com.hwang.game.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wave_group_scalings")
public class WaveGroupScalingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dungeon_id", nullable = false, length = 40)
    private String dungeonId;

    @Column(name = "wave_group_no", nullable = false)
    private int waveGroupNo;

    @Column(name = "hp_multiplier", nullable = false, precision = 8, scale = 4)
    private BigDecimal hpMultiplier;

    @Column(name = "mp_multiplier", nullable = false, precision = 8, scale = 4)
    private BigDecimal mpMultiplier;

    @Column(name = "attack_multiplier", nullable = false, precision = 8, scale = 4)
    private BigDecimal attackMultiplier;

    @Column(name = "defense_multiplier", nullable = false, precision = 8, scale = 4)
    private BigDecimal defenseMultiplier;

    @Column(name = "reward_gold_multiplier", nullable = false, precision = 8, scale = 4)
    private BigDecimal rewardGoldMultiplier;

    @Column(name = "reward_gem_multiplier", nullable = false, precision = 8, scale = 4)
    private BigDecimal rewardGemMultiplier;

    @Column(name = "background_image_path", length = 255)
    private String backgroundImagePath;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected WaveGroupScalingEntity() {
    }

    public WaveGroupScalingEntity(String dungeonId, int waveGroupNo) {
        this.dungeonId = dungeonId;
        this.waveGroupNo = waveGroupNo;
        this.hpMultiplier = BigDecimal.ONE;
        this.mpMultiplier = BigDecimal.ONE;
        this.attackMultiplier = BigDecimal.ONE;
        this.defenseMultiplier = BigDecimal.ONE;
        this.rewardGoldMultiplier = BigDecimal.ONE;
        this.rewardGemMultiplier = BigDecimal.ONE;
        this.active = true;
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

    public String getDungeonId() {
        return dungeonId;
    }

    public int getWaveGroupNo() {
        return waveGroupNo;
    }

    public BigDecimal getHpMultiplier() {
        return hpMultiplier;
    }

    public BigDecimal getMpMultiplier() {
        return mpMultiplier;
    }

    public BigDecimal getAttackMultiplier() {
        return attackMultiplier;
    }

    public BigDecimal getDefenseMultiplier() {
        return defenseMultiplier;
    }

    public BigDecimal getRewardGoldMultiplier() {
        return rewardGoldMultiplier;
    }

    public BigDecimal getRewardGemMultiplier() {
        return rewardGemMultiplier;
    }

    public String getBackgroundImagePath() {
        return backgroundImagePath;
    }

    public boolean isActive() {
        return active;
    }

    public void setDungeonId(String dungeonId) {
        this.dungeonId = dungeonId;
    }

    public void setWaveGroupNo(int waveGroupNo) {
        this.waveGroupNo = waveGroupNo;
    }

    public void setHpMultiplier(BigDecimal hpMultiplier) {
        this.hpMultiplier = hpMultiplier;
    }

    public void setMpMultiplier(BigDecimal mpMultiplier) {
        this.mpMultiplier = mpMultiplier;
    }

    public void setAttackMultiplier(BigDecimal attackMultiplier) {
        this.attackMultiplier = attackMultiplier;
    }

    public void setDefenseMultiplier(BigDecimal defenseMultiplier) {
        this.defenseMultiplier = defenseMultiplier;
    }

    public void setRewardGoldMultiplier(BigDecimal rewardGoldMultiplier) {
        this.rewardGoldMultiplier = rewardGoldMultiplier;
    }

    public void setRewardGemMultiplier(BigDecimal rewardGemMultiplier) {
        this.rewardGemMultiplier = rewardGemMultiplier;
    }

    public void setBackgroundImagePath(String backgroundImagePath) {
        this.backgroundImagePath = backgroundImagePath;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
