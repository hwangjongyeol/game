package com.hwang.game.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "monster_masters")
public class MonsterMasterEntity {
    @Id
    @Column(name = "monster_id", nullable = false, length = 80)
    private String monsterId;

    @Column(name = "monster_name", nullable = false, length = 120)
    private String monsterName;

    @Column(name = "max_hp", nullable = false)
    private int maxHp;

    @Column(name = "max_mp", nullable = false)
    private int maxMp;

    @Column(nullable = false)
    private int attack;

    @Column(nullable = false)
    private int defense;

    @Column(name = "reward_gold", nullable = false)
    private int rewardGold;

    @Column(name = "reward_gem", nullable = false)
    private int rewardGem;

    @Column(name = "reward_exp", nullable = false)
    private int rewardExp;

    @Column(name = "reward_score", nullable = false)
    private int rewardScore;

    @Column(name = "sprite_key", nullable = false, length = 50)
    private String spriteKey;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "render_profile_json", columnDefinition = "LONGTEXT")
    private String renderProfileJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected MonsterMasterEntity() {
    }

    public MonsterMasterEntity(String monsterId, String monsterName) {
        this.monsterId = monsterId;
        this.monsterName = monsterName;
        this.maxHp = 100;
        this.maxMp = 0;
        this.attack = 10;
        this.defense = 5;
        this.rewardGold = 10;
        this.rewardGem = 0;
        this.rewardExp = 10;
        this.rewardScore = 5;
        this.spriteKey = "monster";
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

    public String getMonsterId() {
        return monsterId;
    }

    public String getMonsterName() {
        return monsterName;
    }

    public int getMaxHp() {
        return maxHp;
    }

    public int getMaxMp() {
        return maxMp;
    }

    public int getAttack() {
        return attack;
    }

    public int getDefense() {
        return defense;
    }

    public int getRewardGold() {
        return rewardGold;
    }

    public int getRewardGem() {
        return rewardGem;
    }

    public int getRewardExp() {
        return rewardExp;
    }

    public int getRewardScore() {
        return rewardScore;
    }

    public String getSpriteKey() {
        return spriteKey;
    }

    public boolean isActive() {
        return active;
    }

    public String getRenderProfileJson() {
        return renderProfileJson;
    }

    public void setMonsterName(String monsterName) {
        this.monsterName = monsterName;
    }

    public void setMaxHp(int maxHp) {
        this.maxHp = maxHp;
    }

    public void setMaxMp(int maxMp) {
        this.maxMp = maxMp;
    }

    public void setAttack(int attack) {
        this.attack = attack;
    }

    public void setDefense(int defense) {
        this.defense = defense;
    }

    public void setRewardGold(int rewardGold) {
        this.rewardGold = rewardGold;
    }

    public void setRewardGem(int rewardGem) {
        this.rewardGem = rewardGem;
    }

    public void setRewardExp(int rewardExp) {
        this.rewardExp = rewardExp;
    }

    public void setRewardScore(int rewardScore) {
        this.rewardScore = rewardScore;
    }

    public void setSpriteKey(String spriteKey) {
        this.spriteKey = spriteKey;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setRenderProfileJson(String renderProfileJson) {
        this.renderProfileJson = renderProfileJson;
    }
}
