package com.hwang.game.economy.repository;

import com.hwang.game.economy.entity.WalletEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WalletRepository extends JpaRepository<WalletEntity, Long> {
}
