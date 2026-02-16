package com.hwang.game.admin.dto;

public record AdminUpdateUserCompanionRequest(
        Integer level,
        Integer copies,
        Integer slotNo
) {
}
