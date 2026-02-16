package com.hwang.game.admin.dto;

public record AdminUpdatePlayerRequest(
        String nickname,
        String classId,
        Integer level,
        Long exp,
        Long powerScore,
        Boolean deleted
) {
}
