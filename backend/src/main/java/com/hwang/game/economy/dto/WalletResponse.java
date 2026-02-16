package com.hwang.game.economy.dto;

import com.hwang.game.economy.entity.WalletEntity;

import java.time.LocalDateTime;

public record WalletResponse(
        long userId,
        long gold,
        long gem,
        int energy,
        LocalDateTime updatedAt
) {
    public static WalletResponse from(WalletEntity wallet) {
        return new WalletResponse(
                wallet.getUserId(),
                wallet.getGold(),
                wallet.getGem(),
                wallet.getEnergy(),
                wallet.getUpdatedAt()
        );
    }
}
