package com.hwang.game.item.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record LootItemsRequest(
        @NotNull Long userId,
        @NotEmpty List<@Valid LootItemRequest> items
) {
}
