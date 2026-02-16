package com.hwang.game.economy.dto;

import com.hwang.game.economy.model.CurrencyType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record EarnCurrencyRequest(
        @NotNull Long userId,
        @NotNull CurrencyType currencyType,
        @Min(1) long amount,
        @NotBlank String reasonCode,
        String referenceId
) {
}
