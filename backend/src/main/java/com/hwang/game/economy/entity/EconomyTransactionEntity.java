package com.hwang.game.economy.entity;

import com.hwang.game.economy.model.CurrencyType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "economy_transactions")
public class EconomyTransactionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "currency_type", nullable = false, length = 20)
    private CurrencyType currencyType;

    @Column(nullable = false)
    private long amount;

    @Column(name = "reason_code", nullable = false, length = 50)
    private String reasonCode;

    @Column(name = "reference_id", length = 100)
    private String referenceId;

    @Column(name = "balance_after", nullable = false)
    private long balanceAfter;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    protected EconomyTransactionEntity() {
    }

    public EconomyTransactionEntity(
            Long userId,
            CurrencyType currencyType,
            long amount,
            String reasonCode,
            String referenceId,
            long balanceAfter
    ) {
        this.userId = userId;
        this.currencyType = currencyType;
        this.amount = amount;
        this.reasonCode = reasonCode;
        this.referenceId = referenceId;
        this.balanceAfter = balanceAfter;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public CurrencyType getCurrencyType() {
        return currencyType;
    }

    public long getAmount() {
        return amount;
    }

    public String getReasonCode() {
        return reasonCode;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public long getBalanceAfter() {
        return balanceAfter;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
