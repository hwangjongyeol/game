package com.hwang.game.admin.repository;

import com.hwang.game.admin.entity.BalanceProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BalanceProfileRepository extends JpaRepository<BalanceProfileEntity, String> {
    List<BalanceProfileEntity> findAllByOrderByUpdatedAtDesc();

    Optional<BalanceProfileEntity> findFirstByActiveTrueOrderByUpdatedAtDesc();
}
