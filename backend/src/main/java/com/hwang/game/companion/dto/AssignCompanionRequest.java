package com.hwang.game.companion.dto;

public record AssignCompanionRequest(
        long userId,
        long userCompanionId,
        Integer slotNo
) {
}
