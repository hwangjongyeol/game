package com.hwang.game.account.controller;

import com.hwang.game.account.dto.AccountResponse;
import com.hwang.game.account.dto.LoginRequest;
import com.hwang.game.account.dto.SignUpRequest;
import com.hwang.game.account.service.AccountService;
import com.hwang.game.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/accounts")
public class AccountController {
    private final AccountService accountService;

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    @PostMapping("/signup")
    public ApiResponse<AccountResponse> signUp(@Valid @RequestBody SignUpRequest request) {
        return ApiResponse.ok(accountService.signUp(request.loginId(), request.password()));
    }

    @PostMapping("/login")
    public ApiResponse<AccountResponse> login(@Valid @RequestBody LoginRequest request) {
        return ApiResponse.ok(accountService.login(request.loginId(), request.password()));
    }
}
