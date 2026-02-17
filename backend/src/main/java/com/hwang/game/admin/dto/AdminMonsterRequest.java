package com.hwang.game.admin.dto;

public record AdminMonsterRequest(
        String monsterId,
        String monsterName,
        Integer maxHp,
        Integer maxMp,
        Integer attack,
        Integer defense,
        Integer rewardGold,
        Integer rewardGem,
        Integer rewardExp,
        Integer rewardScore,
        String spriteKey,
        String renderProfileJson,
        Boolean active
) {
}
