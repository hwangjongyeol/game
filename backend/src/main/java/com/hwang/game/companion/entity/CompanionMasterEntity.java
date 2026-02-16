package com.hwang.game.companion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "companion_masters")
public class CompanionMasterEntity {
    @Id
    @Column(name = "companion_id", nullable = false, length = 40)
    private String companionId;

    @Column(name = "companion_name", nullable = false, length = 80)
    private String companionName;

    @Column(nullable = false, length = 20)
    private String grade;

    @Column(name = "class_id", nullable = false, length = 20)
    private String classId;

    @Column(name = "base_attack", nullable = false)
    private int baseAttack;

    @Column(name = "base_defense", nullable = false)
    private int baseDefense;

    @Column(name = "base_hp", nullable = false)
    private int baseHp;

    @Column(name = "base_mp", nullable = false)
    private int baseMp;

    @Column(name = "image_url", nullable = false, length = 255)
    private String imageUrl;

    @Column(name = "recruit_weight", nullable = false)
    private int recruitWeight;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected CompanionMasterEntity() {
    }

    public CompanionMasterEntity(String companionId, String companionName, String grade, String classId) {
        this.companionId = companionId;
        this.companionName = companionName;
        this.grade = grade;
        this.classId = classId;
        this.baseAttack = 5;
        this.baseDefense = 3;
        this.baseHp = 30;
        this.baseMp = 10;
        this.imageUrl = "";
        this.recruitWeight = 100;
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

    public String getCompanionId() {
        return companionId;
    }

    public String getCompanionName() {
        return companionName;
    }

    public String getGrade() {
        return grade;
    }

    public String getClassId() {
        return classId;
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

    public String getImageUrl() {
        return imageUrl;
    }

    public int getRecruitWeight() {
        return recruitWeight;
    }

    public boolean isActive() {
        return active;
    }

    public void setCompanionName(String companionName) {
        this.companionName = companionName;
    }

    public void setGrade(String grade) {
        this.grade = grade;
    }

    public void setClassId(String classId) {
        this.classId = classId;
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

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public void setRecruitWeight(int recruitWeight) {
        this.recruitWeight = recruitWeight;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
