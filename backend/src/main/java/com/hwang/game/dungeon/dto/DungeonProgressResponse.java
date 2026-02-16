package com.hwang.game.dungeon.dto;

import com.hwang.game.dungeon.entity.UserDungeonProgressEntity;

public record DungeonProgressResponse(
        long userId,
        String dungeonId,
        int currentWave,
        int maxUnlockedWave
) {
    public static DungeonProgressResponse from(UserDungeonProgressEntity entity) {
        return new DungeonProgressResponse(
                entity.getUserId(),
                entity.getDungeonId(),
                entity.getCurrentWave(),
                entity.getMaxUnlockedWave()
        );
    }
}
