package com.hwang.game.account.controller;

import com.hwang.game.account.dto.AccountResponse;
import com.hwang.game.account.dto.LoginRequest;
import com.hwang.game.account.dto.SignUpRequest;
import com.hwang.game.account.service.AccountService;
import com.hwang.game.common.response.ApiResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {
    private static final String SESSION_ACCOUNT_ID = "session.accountId";

    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/signup")
    public ApiResponse<AccountResponse> signUp(@Valid @RequestBody SignUpRequest request, HttpSession session) {
        AccountResponse account = accountService.signUp(request.loginId(), request.password());
        session.setAttribute(SESSION_ACCOUNT_ID, account.accountId());
        return ApiResponse.ok(account);
    }

    @PostMapping("/login")
    public ApiResponse<AccountResponse> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        AccountResponse account = accountService.login(request.loginId(), request.password());
        session.setAttribute(SESSION_ACCOUNT_ID, account.accountId());
        return ApiResponse.ok(account);
    }

    @GetMapping("/session")
    public ApiResponse<AccountResponse> getSessionAccount(HttpSession session) {
        Object accountId = session.getAttribute(SESSION_ACCOUNT_ID);
        if (!(accountId instanceof Long id)) {
            return ApiResponse.ok(null);
        }
        return ApiResponse.ok(accountService.getAccountResponse(id));
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpSession session) {
        session.invalidate();
        return ApiResponse.ok(null);
    }
}
