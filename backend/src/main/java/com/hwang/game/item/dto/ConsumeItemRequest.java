package com.hwang.game.item.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ConsumeItemRequest(
        @NotNull Long userId,
        @NotBlank String itemId,
        @Min(1) long quantity
) {
}
