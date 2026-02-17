package com.hwang.game.balance.controller;

import com.hwang.game.admin.service.AdminService;
import com.hwang.game.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/balance")
public class BalanceController {
    private final AdminService adminService;

    public BalanceController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/runtime")
    public ApiResponse<String> getRuntimeBalance() {
        return ApiResponse.ok(adminService.getRuntimeBalanceProfile());
    }
}
