package com.hwang.game.account.repository;

import com.hwang.game.account.entity.AccountEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AccountRepository extends JpaRepository<AccountEntity, Long> {
    boolean existsByLoginId(String loginId);

    Optional<AccountEntity> findByLoginId(String loginId);
}
