package com.hwang.game.account.repository;

import com.hwang.game.account.entity.AccountSocialLinkEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountSocialLinkRepository extends JpaRepository<AccountSocialLinkEntity, Long> {
}
