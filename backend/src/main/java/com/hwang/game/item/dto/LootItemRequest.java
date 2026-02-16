package com.hwang.game.item.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record LootItemRequest(
        @NotBlank String itemId,
        @NotBlank String itemName,
        @Min(1) long quantity
) {
}
