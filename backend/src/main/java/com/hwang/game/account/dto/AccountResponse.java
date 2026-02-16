package com.hwang.game.account.dto;

import com.hwang.game.account.entity.AccountEntity;

public record AccountResponse(
        long accountId,
        String loginId
) {
    public static AccountResponse from(AccountEntity account) {
        return new AccountResponse(account.getId(), account.getLoginId());
    }
}
