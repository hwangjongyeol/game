package com.hwang.game.companion.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "user_companions",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_user_companion", columnNames = {"user_id", "companion_id"})
        }
)
public class UserCompanionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "companion_id", nullable = false, length = 40)
    private String companionId;

    @Column(nullable = false)
    private int level;

    @Column(nullable = false)
    private int copies;

    @Column(name = "slot_no")
    private Integer slotNo;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected UserCompanionEntity() {
    }

    public UserCompanionEntity(Long userId, String companionId) {
        this.userId = userId;
        this.companionId = companionId;
        this.level = 1;
        this.copies = 1;
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

    public Long getUserId() {
        return userId;
    }

    public String getCompanionId() {
        return companionId;
    }

    public int getLevel() {
        return level;
    }

    public int getCopies() {
        return copies;
    }

    public Integer getSlotNo() {
        return slotNo;
    }

    public void addCopies(int delta) {
        this.copies += delta;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public void setCopies(int copies) {
        this.copies = copies;
    }

    public void setSlotNo(Integer slotNo) {
        this.slotNo = slotNo;
    }
}
