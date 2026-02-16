package com.hwang.game.character.dto;

import com.hwang.game.character.model.CharacterStatType;
import jakarta.validation.constraints.NotNull;

public record UpgradeCharacterStatRequest(
        @NotNull Long userId,
        @NotNull CharacterStatType statType
) {
}
