package com.hwang.game.economy.model;

import java.time.LocalDateTime;

public record EconomyTransaction(
        long id,
        long userId,
        CurrencyType currencyType,
        long amount,
        String reasonCode,
        String referenceId,
        long balanceAfter,
        LocalDateTime createdAt
) {
}
