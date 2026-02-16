package com.hwang.game.dungeon.service;

import com.hwang.game.common.exception.GameException;
import com.hwang.game.dungeon.dto.DungeonProgressResponse;
import com.hwang.game.dungeon.entity.UserDungeonProgressEntity;
import com.hwang.game.dungeon.repository.UserDungeonProgressRepository;
import com.hwang.game.player.service.PlayerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DungeonProgressService {
    private final UserDungeonProgressRepository userDungeonProgressRepository;
    private final PlayerService playerService;

    public DungeonProgressService(UserDungeonProgressRepository userDungeonProgressRepository, PlayerService playerService) {
        this.userDungeonProgressRepository = userDungeonProgressRepository;
        this.playerService = playerService;
    }

    @Transactional
    public DungeonProgressResponse getProgress(String dungeonId, long userId) {
        validateDungeonId(dungeonId);
        playerService.getUserEntity(userId);
        UserDungeonProgressEntity row = findOrCreate(userId, dungeonId);
        return DungeonProgressResponse.from(row);
    }

    @Transactional
    public DungeonProgressResponse updateProgress(String dungeonId, long userId, int currentWave, int maxUnlockedWave) {
        validateDungeonId(dungeonId);
        playerService.getUserEntity(userId);

        UserDungeonProgressEntity row = findOrCreate(userId, dungeonId);
        int safeMax = Math.max(row.getMaxUnlockedWave(), maxUnlockedWave);
        int safeCurrent = Math.max(1, Math.min(currentWave, safeMax));

        row.setMaxUnlockedWave(safeMax);
        row.setCurrentWave(safeCurrent);
        userDungeonProgressRepository.save(row);

        return DungeonProgressResponse.from(row);
    }

    private UserDungeonProgressEntity findOrCreate(long userId, String dungeonId) {
        return userDungeonProgressRepository.findByUserIdAndDungeonId(userId, dungeonId)
                .orElseGet(() -> userDungeonProgressRepository.save(new UserDungeonProgressEntity(userId, dungeonId)));
    }

    private void validateDungeonId(String dungeonId) {
        if (!"dungeon1".equalsIgnoreCase(dungeonId)) {
            throw new GameException("INVALID_DUNGEON_ID", "Unsupported dungeonId: " + dungeonId);
        }
    }
}
