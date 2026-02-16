package com.hwang.game.account.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank(message = "must not be blank")
        String loginId,
        @NotBlank(message = "must not be blank")
        String password
) {
}
