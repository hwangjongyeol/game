package com.hwang.game.dungeon.repository;

import com.hwang.game.dungeon.entity.UserDungeonProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserDungeonProgressRepository extends JpaRepository<UserDungeonProgressEntity, Long> {
    Optional<UserDungeonProgressEntity> findByUserIdAndDungeonId(Long userId, String dungeonId);
}
