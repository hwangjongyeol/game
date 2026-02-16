package com.hwang.game.player.dto;

import com.hwang.game.player.model.Player;

public record PlayerResponse(
        long id,
        long accountId,
        String nickname,
        String classId,
        long level,
        long gold
) {
    public static PlayerResponse from(Player player) {
        return new PlayerResponse(player.id(), player.accountId(), player.nickname(), player.classId(), player.level(), player.gold());
    }
}
