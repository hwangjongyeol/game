package com.hwang.game.admin.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "admin_balance_profiles")
public class BalanceProfileEntity {
    @Id
    @Column(name = "profile_id", nullable = false, length = 80)
    private String profileId;

    @Column(name = "profile_name", nullable = false, length = 120)
    private String profileName;

    @Column(name = "description", nullable = false, length = 255)
    private String description;

    @Column(name = "profile_json", nullable = false, columnDefinition = "LONGTEXT")
    private String profileJson;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected BalanceProfileEntity() {
    }

    public BalanceProfileEntity(String profileId, String profileName, String profileJson) {
        this.profileId = profileId;
        this.profileName = profileName;
        this.profileJson = profileJson;
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

    public String getProfileId() {
        return profileId;
    }

    public String getProfileName() {
        return profileName;
    }

    public String getDescription() {
        return description;
    }

    public String getProfileJson() {
        return profileJson;
    }

    public boolean isActive() {
        return active;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setProfileName(String profileName) {
        this.profileName = profileName;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setProfileJson(String profileJson) {
        this.profileJson = profileJson;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
