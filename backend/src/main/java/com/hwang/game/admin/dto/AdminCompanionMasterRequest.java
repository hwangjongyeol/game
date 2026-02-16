package com.hwang.game.admin.dto;

public record AdminCompanionMasterRequest(
        String companionId,
        String companionName,
        String grade,
        String classId,
        Integer baseAttack,
        Integer baseDefense,
        Integer baseHp,
        Integer baseMp,
        String imageUrl,
        Integer recruitWeight,
        Boolean active
) {
}
