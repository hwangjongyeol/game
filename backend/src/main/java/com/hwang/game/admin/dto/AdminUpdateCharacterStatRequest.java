package com.hwang.game.admin.dto;

public record AdminUpdateCharacterStatRequest(
        Long attackValue,
        Long defenseValue,
        Long maxHpValue,
        Long maxMpValue,
        Integer attackLevel,
        Integer defenseLevel,
        Integer hpLevel,
        Integer mpLevel
) {
}
