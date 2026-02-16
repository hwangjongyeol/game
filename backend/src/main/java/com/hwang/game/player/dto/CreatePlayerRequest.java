package com.hwang.game.player.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePlayerRequest(
        @NotNull(message = "must not be null")
        Long accountId,
        @NotBlank(message = "must not be blank")
        @Size(max = 20, message = "must be 20 characters or fewer")
        String nickname,
        @NotBlank(message = "must not be blank")
        String classId
) {
}
