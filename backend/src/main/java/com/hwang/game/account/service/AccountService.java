package com.hwang.game.account.service;

import com.hwang.game.account.dto.AccountResponse;
import com.hwang.game.account.entity.AccountEntity;
import com.hwang.game.account.repository.AccountRepository;
import com.hwang.game.common.exception.GameException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AccountService {
    private final AccountRepository accountRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @Transactional
    public AccountResponse signUp(String loginId, String rawPassword) {
        if (accountRepository.existsByLoginId(loginId)) {
            throw new GameException("ACCOUNT_LOGIN_ID_ALREADY_EXISTS", "loginId already exists");
        }

        AccountEntity saved = accountRepository.save(new AccountEntity(loginId, passwordEncoder.encode(rawPassword)));
        return AccountResponse.from(saved);
    }

    @Transactional(readOnly = true)
    public AccountResponse login(String loginId, String rawPassword) {
        AccountEntity account = accountRepository.findByLoginId(loginId)
                .orElseThrow(() -> new GameException("INVALID_CREDENTIALS", "Invalid loginId or password"));

        if (!passwordEncoder.matches(rawPassword, account.getPasswordHash())) {
            throw new GameException("INVALID_CREDENTIALS", "Invalid loginId or password");
        }

        return AccountResponse.from(account);
    }

    @Transactional(readOnly = true)
    public AccountResponse getAccountResponse(long accountId) {
        return AccountResponse.from(getAccount(accountId));
    }

    @Transactional(readOnly = true)
    public AccountEntity getAccount(long accountId) {
        return accountRepository.findById(accountId)
                .orElseThrow(() -> new GameException("ACCOUNT_NOT_FOUND", "Account not found. id=" + accountId));
    }
}
