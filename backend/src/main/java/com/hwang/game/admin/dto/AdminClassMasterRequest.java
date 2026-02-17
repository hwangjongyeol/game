package com.hwang.game.admin.dto;

public record AdminClassMasterRequest(
        String classId,
        String className,
        Integer baseAttack,
        Integer baseDefense,
        Integer baseHp,
        Integer baseMp,
        Boolean active
) {
}
