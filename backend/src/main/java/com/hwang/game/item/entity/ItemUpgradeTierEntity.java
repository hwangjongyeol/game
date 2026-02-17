package com.hwang.game.item.entity;

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
@Table(name = "item_upgrade_tiers")
public class ItemUpgradeTierEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "item_id", nullable = false, length = 80)
    private String itemId;

    @Column(name = "upgrade_level", nullable = false)
    private int upgradeLevel;

    @Column(name = "upgrade_gold_cost", nullable = false)
    private long upgradeGoldCost;

    @Column(name = "attack_bonus", nullable = false)
    private int attackBonus;

    @Column(name = "defense_bonus", nullable = false)
    private int defenseBonus;

    @Column(name = "hp_bonus", nullable = false)
    private int hpBonus;

    @Column(name = "mp_bonus", nullable = false)
    private int mpBonus;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected ItemUpgradeTierEntity() {
    }

    public ItemUpgradeTierEntity(String itemId, int upgradeLevel) {
        this.itemId = itemId;
        this.upgradeLevel = upgradeLevel;
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

    public String getItemId() {
        return itemId;
    }

    public int getUpgradeLevel() {
        return upgradeLevel;
    }

    public long getUpgradeGoldCost() {
        return upgradeGoldCost;
    }

    public int getAttackBonus() {
        return attackBonus;
    }

    public int getDefenseBonus() {
        return defenseBonus;
    }

    public int getHpBonus() {
        return hpBonus;
    }

    public int getMpBonus() {
        return mpBonus;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public void setUpgradeLevel(int upgradeLevel) {
        this.upgradeLevel = upgradeLevel;
    }

    public void setUpgradeGoldCost(long upgradeGoldCost) {
        this.upgradeGoldCost = upgradeGoldCost;
    }

    public void setAttackBonus(int attackBonus) {
        this.attackBonus = attackBonus;
    }

    public void setDefenseBonus(int defenseBonus) {
        this.defenseBonus = defenseBonus;
    }

    public void setHpBonus(int hpBonus) {
        this.hpBonus = hpBonus;
    }

    public void setMpBonus(int mpBonus) {
        this.mpBonus = mpBonus;
    }
}
