package com.hwang.game.character.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_character_stats")
public class UserCharacterStatEntity {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "attack_value", nullable = false)
    private long attackValue;

    @Column(name = "defense_value", nullable = false)
    private long defenseValue;

    @Column(name = "max_hp_value", nullable = false)
    private long maxHpValue;

    @Column(name = "max_mp_value", nullable = false)
    private long maxMpValue;

    @Column(name = "attack_level", nullable = false)
    private int attackLevel;

    @Column(name = "defense_level", nullable = false)
    private int defenseLevel;

    @Column(name = "hp_level", nullable = false)
    private int hpLevel;

    @Column(name = "mp_level", nullable = false)
    private int mpLevel;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UserCharacterStatEntity() {
    }

    public UserCharacterStatEntity(Long userId) {
        this.userId = userId;
        this.attackValue = 20;
        this.defenseValue = 10;
        this.maxHpValue = 200;
        this.maxMpValue = 80;
        this.attackLevel = 1;
        this.defenseLevel = 1;
        this.hpLevel = 1;
        this.mpLevel = 1;
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

    public long getAttackValue() {
        return attackValue;
    }

    public long getDefenseValue() {
        return defenseValue;
    }

    public long getMaxHpValue() {
        return maxHpValue;
    }

    public long getMaxMpValue() {
        return maxMpValue;
    }

    public int getAttackLevel() {
        return attackLevel;
    }

    public int getDefenseLevel() {
        return defenseLevel;
    }

    public int getHpLevel() {
        return hpLevel;
    }

    public int getMpLevel() {
        return mpLevel;
    }

    public void upgradeAttack() {
        this.attackValue += 3;
        this.attackLevel += 1;
    }

    public void upgradeDefense() {
        this.defenseValue += 2;
        this.defenseLevel += 1;
    }

    public void upgradeHp() {
        this.maxHpValue += 20;
        this.hpLevel += 1;
    }

    public void upgradeMp() {
        this.maxMpValue += 10;
        this.mpLevel += 1;
    }

    public void setAttackValue(long attackValue) {
        this.attackValue = attackValue;
    }

    public void setDefenseValue(long defenseValue) {
        this.defenseValue = defenseValue;
    }

    public void setMaxHpValue(long maxHpValue) {
        this.maxHpValue = maxHpValue;
    }

    public void setMaxMpValue(long maxMpValue) {
        this.maxMpValue = maxMpValue;
    }

    public void setAttackLevel(int attackLevel) {
        this.attackLevel = attackLevel;
    }

    public void setDefenseLevel(int defenseLevel) {
        this.defenseLevel = defenseLevel;
    }

    public void setHpLevel(int hpLevel) {
        this.hpLevel = hpLevel;
    }

    public void setMpLevel(int mpLevel) {
        this.mpLevel = mpLevel;
    }
}
