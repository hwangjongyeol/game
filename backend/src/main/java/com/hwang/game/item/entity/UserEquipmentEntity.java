package com.hwang.game.item.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_equipment")
public class UserEquipmentEntity {
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(name = "weapon_item_id", length = 80)
    private String weaponItemId;

    @Column(name = "armor_item_id", length = 80)
    private String armorItemId;

    @Column(name = "accessory_item_id", length = 80)
    private String accessoryItemId;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UserEquipmentEntity() {
    }

    public UserEquipmentEntity(Long userId) {
        this.userId = userId;
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

    public String getWeaponItemId() {
        return weaponItemId;
    }

    public String getArmorItemId() {
        return armorItemId;
    }

    public String getAccessoryItemId() {
        return accessoryItemId;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setWeaponItemId(String weaponItemId) {
        this.weaponItemId = weaponItemId;
    }

    public void setArmorItemId(String armorItemId) {
        this.armorItemId = armorItemId;
    }

    public void setAccessoryItemId(String accessoryItemId) {
        this.accessoryItemId = accessoryItemId;
    }
}
