package com.hwang.game.item.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "item_masters")
public class ItemMasterEntity {
    @Id
    @Column(name = "item_id", nullable = false, length = 80)
    private String itemId;

    @Column(name = "item_name", nullable = false, length = 120)
    private String itemName;

    @Column(name = "item_type", nullable = false, length = 30)
    private String itemType;

    @Column(name = "equip_slot", length = 20)
    private String equipSlot;

    @Column(name = "required_class_id", length = 20)
    private String requiredClassId;

    @Column(nullable = false, length = 20)
    private String quality;

    @Column(name = "attack_bonus", nullable = false)
    private int attackBonus;

    @Column(name = "defense_bonus", nullable = false)
    private int defenseBonus;

    @Column(name = "hp_bonus", nullable = false)
    private int hpBonus;

    @Column(name = "mp_bonus", nullable = false)
    private int mpBonus;

    @Column(name = "upgrade_gold_base", nullable = false)
    private long upgradeGoldBase;

    @Column(name = "upgrade_attack_step", nullable = false)
    private int upgradeAttackStep;

    @Column(name = "upgrade_defense_step", nullable = false)
    private int upgradeDefenseStep;

    @Column(name = "upgrade_hp_step", nullable = false)
    private int upgradeHpStep;

    @Column(name = "upgrade_mp_step", nullable = false)
    private int upgradeMpStep;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected ItemMasterEntity() {
    }

    public ItemMasterEntity(String itemId, String itemName, String itemType) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemType = itemType;
        this.quality = "NORMAL";
        this.imageUrl = "";
        this.description = "";
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

    public String getItemId() {
        return itemId;
    }

    public String getItemName() {
        return itemName;
    }

    public String getItemType() {
        return itemType;
    }

    public String getEquipSlot() {
        return equipSlot;
    }

    public String getQuality() {
        return quality;
    }

    public String getRequiredClassId() {
        return requiredClassId;
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

    public long getUpgradeGoldBase() {
        return upgradeGoldBase;
    }

    public int getUpgradeAttackStep() {
        return upgradeAttackStep;
    }

    public int getUpgradeDefenseStep() {
        return upgradeDefenseStep;
    }

    public int getUpgradeHpStep() {
        return upgradeHpStep;
    }

    public int getUpgradeMpStep() {
        return upgradeMpStep;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public boolean isActive() {
        return active;
    }

    public void setItemName(String itemName) {
        this.itemName = itemName;
    }

    public void setItemType(String itemType) {
        this.itemType = itemType;
    }

    public void setEquipSlot(String equipSlot) {
        this.equipSlot = equipSlot;
    }

    public void setRequiredClassId(String requiredClassId) {
        this.requiredClassId = requiredClassId;
    }

    public void setQuality(String quality) {
        this.quality = quality;
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

    public void setUpgradeGoldBase(long upgradeGoldBase) {
        this.upgradeGoldBase = upgradeGoldBase;
    }

    public void setUpgradeAttackStep(int upgradeAttackStep) {
        this.upgradeAttackStep = upgradeAttackStep;
    }

    public void setUpgradeDefenseStep(int upgradeDefenseStep) {
        this.upgradeDefenseStep = upgradeDefenseStep;
    }

    public void setUpgradeHpStep(int upgradeHpStep) {
        this.upgradeHpStep = upgradeHpStep;
    }

    public void setUpgradeMpStep(int upgradeMpStep) {
        this.upgradeMpStep = upgradeMpStep;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
