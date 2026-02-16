package com.hwang.game.companion.dto;

import java.util.List;

public record CompanionPartyBonusResponse(
        long userId,
        long bonusAttack,
        long bonusDefense,
        long bonusHp,
        long bonusMp,
        List<UserCompanionResponse> activeCompanions
) {
}
