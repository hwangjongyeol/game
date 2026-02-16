package com.hwang.game.player.repository;

import com.hwang.game.player.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlayerRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByIdAndDeletedFalse(Long id);

    List<UserEntity> findAllByDeletedFalse();

    List<UserEntity> findAllByAccountIdAndDeletedFalse(Long accountId);

    long countByAccountIdAndDeletedFalse(Long accountId);
}
