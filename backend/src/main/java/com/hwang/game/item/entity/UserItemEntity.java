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
@Table(name = "user_items")
public class UserItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "item_id", nullable = false, length = 80)
    private String itemId;

    @Column(name = "item_name", nullable = false, length = 120)
    private String itemName;

    @Column(nullable = false)
    private long quantity;

    @Column(name = "upgrade_level", nullable = false)
    private int upgradeLevel;

    @Column(name = "quality", nullable = false, length = 20)
    private String quality;

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

    protected UserItemEntity() {
    }

    public UserItemEntity(Long userId, String itemId, String itemName, long quantity) {
        this.userId = userId;
        this.itemId = itemId;
        this.itemName = itemName;
        this.quantity = quantity;
        this.upgradeLevel = 0;
        this.quality = "NORMAL";
        this.attackBonus = 0;
        this.defenseBonus = 0;
        this.hpBonus = 0;
        this.mpBonus = 0;
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

    public Long getUserId() {
        return userId;
    }

    public String getItemId() {
        return itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public long getQuantity() {
        return quantity;
    }

    public int getUpgradeLevel() {
        return upgradeLevel;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public String getQuality() {
        return quality;
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

    public void addQuantity(long amount) {
        this.quantity += amount;
    }

    public void subtractQuantity(long amount) {
        this.quantity -= amount;
    }

    public void increaseUpgradeLevel() {
        this.upgradeLevel += 1;
    }

    public void setEquipmentStats(String quality, int attackBonus, int defenseBonus, int hpBonus, int mpBonus) {
        this.quality = quality;
        this.attackBonus = attackBonus;
        this.defenseBonus = defenseBonus;
        this.hpBonus = hpBonus;
        this.mpBonus = mpBonus;
    }

    public void addEquipmentBonus(int attackDelta, int defenseDelta, int hpDelta, int mpDelta) {
        this.attackBonus += attackDelta;
        this.defenseBonus += defenseDelta;
        this.hpBonus += hpDelta;
        this.mpBonus += mpDelta;
    }

    public boolean hasAnyEquipmentBonus() {
        return attackBonus > 0 || defenseBonus > 0 || hpBonus > 0 || mpBonus > 0;
    }
}
