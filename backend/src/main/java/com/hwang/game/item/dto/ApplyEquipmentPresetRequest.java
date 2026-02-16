package com.hwang.game.item.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ApplyEquipmentPresetRequest(
        @NotNull Long userId,
        @NotBlank String presetName
) {
}
