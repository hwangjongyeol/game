package com.hwang.game.player.model;

public record Player(
        long id,
        long accountId,
        String nickname,
        String classId,
        long level,
        long gold
) {
}
