package com.hwang.game.item.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SaveEquipmentPresetRequest(
        @NotNull Long userId,
        @NotBlank String presetName
) {
}
