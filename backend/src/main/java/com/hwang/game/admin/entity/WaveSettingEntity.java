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
@Table(name = "wave_settings")
public class WaveSettingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "dungeon_id", nullable = false, length = 40)
    private String dungeonId;

    @Column(name = "wave_no", nullable = false)
    private int waveNo;

    @Column(name = "slot_no", nullable = false)
    private int slotNo;

    @Column(name = "monster_id", nullable = false, length = 80)
    private String monsterId;

    @Column(name = "monster_count", nullable = false)
    private int monsterCount;

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

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected WaveSettingEntity() {
    }

    public WaveSettingEntity(String dungeonId, int waveNo, int slotNo, String monsterId) {
        this.dungeonId = dungeonId;
        this.waveNo = waveNo;
        this.slotNo = slotNo;
        this.monsterId = monsterId;
        this.monsterCount = 1;
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

    public int getWaveNo() {
        return waveNo;
    }

    public String getMonsterId() {
        return monsterId;
    }

    public int getSlotNo() {
        return slotNo;
    }

    public int getMonsterCount() {
        return monsterCount;
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

    public boolean isActive() {
        return active;
    }

    public void setDungeonId(String dungeonId) {
        this.dungeonId = dungeonId;
    }

    public void setWaveNo(int waveNo) {
        this.waveNo = waveNo;
    }

    public void setSlotNo(int slotNo) {
        this.slotNo = slotNo;
    }

    public void setMonsterId(String monsterId) {
        this.monsterId = monsterId;
    }

    public void setMonsterCount(int monsterCount) {
        this.monsterCount = monsterCount;
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

    public void setActive(boolean active) {
        this.active = active;
    }
}
