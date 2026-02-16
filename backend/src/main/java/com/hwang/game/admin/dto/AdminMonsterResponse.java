package com.hwang.game.admin.dto;

import com.hwang.game.admin.entity.MonsterMasterEntity;

public record AdminMonsterResponse(
        String monsterId,
        String monsterName,
        int maxHp,
        int maxMp,
        int attack,
        int defense,
        int rewardGold,
        int rewardGem,
        int rewardExp,
        int rewardScore,
        String spriteKey,
        boolean active
) {
    public static AdminMonsterResponse from(MonsterMasterEntity entity) {
        return new AdminMonsterResponse(
                entity.getMonsterId(),
                entity.getMonsterName(),
                entity.getMaxHp(),
                entity.getMaxMp(),
                entity.getAttack(),
                entity.getDefense(),
                entity.getRewardGold(),
                entity.getRewardGem(),
                entity.getRewardExp(),
                entity.getRewardScore(),
                entity.getSpriteKey(),
                entity.isActive()
        );
    }
}
