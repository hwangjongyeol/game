package com.hwang.game.economy.model;

import java.time.LocalDateTime;

public record Wallet(
        long userId,
        long gold,
        long gem,
        int energy,
        LocalDateTime updatedAt
) {
    public static Wallet initial(long userId) {
        return new Wallet(userId, 0L, 0L, 100, LocalDateTime.now());
    }

    public Wallet withGold(long nextGold) {
        return new Wallet(userId, nextGold, gem, energy, LocalDateTime.now());
    }

    public Wallet withGem(long nextGem) {
        return new Wallet(userId, gold, nextGem, energy, LocalDateTime.now());
    }

    public Wallet withEnergy(int nextEnergy) {
        return new Wallet(userId, gold, gem, nextEnergy, LocalDateTime.now());
    }
}
