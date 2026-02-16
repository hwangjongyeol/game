package com.hwang.game.character.dto;

import com.hwang.game.character.entity.UserCharacterStatEntity;

public record CharacterStatResponse(
        long userId,
        long attack,
        long defense,
        long maxHp,
        long maxMp,
        long companionBonusAttack,
        long companionBonusDefense,
        long companionBonusHp,
        long companionBonusMp,
        int attackLevel,
        int defenseLevel,
        int hpLevel,
        int mpLevel,
        long nextAttackGoldCost,
        long nextDefenseGoldCost,
        long nextHpGoldCost,
        long nextMpGoldCost
) {
    public static CharacterStatResponse from(UserCharacterStatEntity entity, long companionBonusAttack, long companionBonusDefense, long companionBonusHp, long companionBonusMp) {
        return new CharacterStatResponse(
                entity.getUserId(),
                entity.getAttackValue() + companionBonusAttack,
                entity.getDefenseValue() + companionBonusDefense,
                entity.getMaxHpValue() + companionBonusHp,
                entity.getMaxMpValue() + companionBonusMp,
                companionBonusAttack,
                companionBonusDefense,
                companionBonusHp,
                companionBonusMp,
                entity.getAttackLevel(),
                entity.getDefenseLevel(),
                entity.getHpLevel(),
                entity.getMpLevel(),
                100L + (entity.getAttackLevel() - 1L) * 40L,
                90L + (entity.getDefenseLevel() - 1L) * 35L,
                120L + (entity.getHpLevel() - 1L) * 45L,
                120L + (entity.getMpLevel() - 1L) * 45L
        );
    }
}
