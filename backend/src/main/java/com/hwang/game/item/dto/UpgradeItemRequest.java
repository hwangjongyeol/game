package com.hwang.game.item.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpgradeItemRequest(
        @NotNull Long userId,
        @NotBlank String itemId
) {
}
