package com.hwang.game.account.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SignUpRequest(
        @NotBlank(message = "must not be blank")
        @Size(min = 4, max = 50, message = "must be 4 to 50 characters")
        String loginId,
        @NotBlank(message = "must not be blank")
        @Size(min = 8, max = 100, message = "must be 8 to 100 characters")
        String password
) {
}
