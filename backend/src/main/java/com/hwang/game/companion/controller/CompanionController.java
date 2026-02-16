package com.hwang.game.companion.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.companion.dto.AssignCompanionRequest;
import com.hwang.game.companion.dto.CompanionMasterResponse;
import com.hwang.game.companion.dto.CompanionPartyBonusResponse;
import com.hwang.game.companion.dto.FuseCompanionRequest;
import com.hwang.game.companion.dto.RecruitCompanionRequest;
import com.hwang.game.companion.dto.UserCompanionResponse;
import com.hwang.game.companion.service.CompanionService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/companions")
public class CompanionController {
    private final CompanionService companionService;

    public CompanionController(CompanionService companionService) {
        this.companionService = companionService;
    }

    @GetMapping("/masters")
    public ApiResponse<List<CompanionMasterResponse>> getCompanionMasters() {
        return ApiResponse.ok(companionService.getCompanionMasters().stream().map(CompanionMasterResponse::from).toList());
    }

    @GetMapping("/{userId}")
    public ApiResponse<List<UserCompanionResponse>> getUserCompanions(@PathVariable long userId) {
        return ApiResponse.ok(companionService.getUserCompanions(userId));
    }

    @GetMapping("/{userId}/party")
    public ApiResponse<CompanionPartyBonusResponse> getPartyBonus(@PathVariable long userId) {
        return ApiResponse.ok(companionService.getPartyBonus(userId));
    }

    @PostMapping("/recruit")
    public ApiResponse<List<UserCompanionResponse>> recruit(@Valid @RequestBody RecruitCompanionRequest request) {
        return ApiResponse.ok(companionService.recruit(request.userId(), request.count()));
    }

    @PostMapping("/assign")
    public ApiResponse<List<UserCompanionResponse>> assign(@Valid @RequestBody AssignCompanionRequest request) {
        return ApiResponse.ok(companionService.assign(request.userId(), request.userCompanionId(), request.slotNo()));
    }

    @PostMapping("/fuse")
    public ApiResponse<UserCompanionResponse> fuse(@Valid @RequestBody FuseCompanionRequest request) {
        return ApiResponse.ok(companionService.fuse(request.userId(), request.userCompanionId()));
    }
}
