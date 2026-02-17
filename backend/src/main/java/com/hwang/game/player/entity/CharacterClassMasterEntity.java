package com.hwang.game.player.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "character_class_masters")
public class CharacterClassMasterEntity {
    @Id
    @Column(name = "class_id", nullable = false, length = 20)
    private String classId;

    @Column(name = "class_name", nullable = false, length = 60)
    private String className;

    @Column(name = "base_attack", nullable = false)
    private int baseAttack;

    @Column(name = "base_defense", nullable = false)
    private int baseDefense;

    @Column(name = "base_hp", nullable = false)
    private int baseHp;

    @Column(name = "base_mp", nullable = false)
    private int baseMp;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "render_profile_json", columnDefinition = "LONGTEXT")
    private String renderProfileJson;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected CharacterClassMasterEntity() {
    }

    public CharacterClassMasterEntity(String classId, String className) {
        this.classId = classId;
        this.className = className;
        this.baseAttack = 20;
        this.baseDefense = 10;
        this.baseHp = 200;
        this.baseMp = 80;
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

    public String getClassId() {
        return classId;
    }

    public String getClassName() {
        return className;
    }

    public int getBaseAttack() {
        return baseAttack;
    }

    public int getBaseDefense() {
        return baseDefense;
    }

    public int getBaseHp() {
        return baseHp;
    }

    public int getBaseMp() {
        return baseMp;
    }

    public boolean isActive() {
        return active;
    }

    public String getRenderProfileJson() {
        return renderProfileJson;
    }

    public void setClassName(String className) {
        this.className = className;
    }

    public void setBaseAttack(int baseAttack) {
        this.baseAttack = baseAttack;
    }

    public void setBaseDefense(int baseDefense) {
        this.baseDefense = baseDefense;
    }

    public void setBaseHp(int baseHp) {
        this.baseHp = baseHp;
    }

    public void setBaseMp(int baseMp) {
        this.baseMp = baseMp;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setRenderProfileJson(String renderProfileJson) {
        this.renderProfileJson = renderProfileJson;
    }
}
