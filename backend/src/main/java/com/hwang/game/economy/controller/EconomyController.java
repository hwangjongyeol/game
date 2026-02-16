package com.hwang.game.economy.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.economy.dto.EarnCurrencyRequest;
import com.hwang.game.economy.dto.SpendCurrencyRequest;
import com.hwang.game.economy.dto.WalletResponse;
import com.hwang.game.economy.service.EconomyService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class EconomyController {
    private final EconomyService economyService;

    public EconomyController(EconomyService economyService) {
        this.economyService = economyService;
    }

    @GetMapping("/wallets/{userId}")
    public ApiResponse<WalletResponse> getWallet(@PathVariable long userId) {
        return ApiResponse.ok(WalletResponse.from(economyService.getWallet(userId)));
    }

    @PostMapping("/economy/earn")
    public ApiResponse<WalletResponse> earn(@Valid @RequestBody EarnCurrencyRequest request) {
        return ApiResponse.ok(WalletResponse.from(
                economyService.earn(
                        request.userId(),
                        request.currencyType(),
                        request.amount(),
                        request.reasonCode(),
                        request.referenceId()
                )
        ));
    }

    @PostMapping("/economy/spend")
    public ApiResponse<WalletResponse> spend(@Valid @RequestBody SpendCurrencyRequest request) {
        return ApiResponse.ok(WalletResponse.from(
                economyService.spend(
                        request.userId(),
                        request.currencyType(),
                        request.amount(),
                        request.reasonCode(),
                        request.referenceId()
                )
        ));
    }
}
