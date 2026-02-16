package com.hwang.game.item.entity;

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
@Table(name = "monster_drop_tables")
public class MonsterDropTableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "monster_id", nullable = false, length = 80)
    private String monsterId;

    @Column(name = "item_id", nullable = false, length = 80)
    private String itemId;

    @Column(name = "drop_chance", nullable = false, precision = 6, scale = 5)
    private BigDecimal dropChance;

    @Column(name = "min_quantity", nullable = false)
    private int minQuantity;

    @Column(name = "max_quantity", nullable = false)
    private int maxQuantity;

    @Column(name = "is_equipment_drop", nullable = false)
    private boolean equipmentDrop;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected MonsterDropTableEntity() {
    }

    public MonsterDropTableEntity(String monsterId, String itemId) {
        this.monsterId = monsterId;
        this.itemId = itemId;
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

    public String getMonsterId() {
        return monsterId;
    }

    public String getItemId() {
        return itemId;
    }

    public BigDecimal getDropChance() {
        return dropChance;
    }

    public int getMinQuantity() {
        return minQuantity;
    }

    public int getMaxQuantity() {
        return maxQuantity;
    }

    public boolean isEquipmentDrop() {
        return equipmentDrop;
    }

    public void setMonsterId(String monsterId) {
        this.monsterId = monsterId;
    }

    public void setItemId(String itemId) {
        this.itemId = itemId;
    }

    public void setDropChance(BigDecimal dropChance) {
        this.dropChance = dropChance;
    }

    public void setMinQuantity(int minQuantity) {
        this.minQuantity = minQuantity;
    }

    public void setMaxQuantity(int maxQuantity) {
        this.maxQuantity = maxQuantity;
    }

    public void setEquipmentDrop(boolean equipmentDrop) {
        this.equipmentDrop = equipmentDrop;
    }
}
