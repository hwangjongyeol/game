package com.hwang.game.economy.repository;

import com.hwang.game.economy.entity.EconomyTransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EconomyTransactionRepository extends JpaRepository<EconomyTransactionEntity, Long> {
    List<EconomyTransactionEntity> findByUserIdOrderByCreatedAtDesc(Long userId);
}
