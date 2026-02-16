package com.hwang.game.dailyquest.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.dailyquest.dto.DailyQuestClaimRequest;
import com.hwang.game.dailyquest.dto.DailyQuestClaimOneRequest;
import com.hwang.game.dailyquest.dto.DailyQuestListResponse;
import com.hwang.game.dailyquest.dto.DailyQuestProgressRequest;
import com.hwang.game.dailyquest.dto.DailyQuestStatusResponse;
import com.hwang.game.dailyquest.service.DailyQuestService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/daily-quests")
public class DailyQuestController {
    private final DailyQuestService dailyQuestService;

    public DailyQuestController(DailyQuestService dailyQuestService) {
        this.dailyQuestService = dailyQuestService;
    }

    @GetMapping("/{userId}")
    public ApiResponse<DailyQuestStatusResponse> getStatus(@PathVariable long userId) {
        return ApiResponse.ok(dailyQuestService.getStatus(userId));
    }

    @GetMapping("/list/{userId}")
    public ApiResponse<DailyQuestListResponse> getQuestList(@PathVariable long userId) {
        return ApiResponse.ok(dailyQuestService.getQuestList(userId));
    }

    @PostMapping("/progress")
    public ApiResponse<DailyQuestStatusResponse> addProgress(@Valid @RequestBody DailyQuestProgressRequest request) {
        return ApiResponse.ok(dailyQuestService.addProgress(
                request.userId(),
                request.dungeonKillDelta(),
                request.goldEarnedDelta(),
                request.statUpgradeDelta()
        ));
    }

    @PostMapping("/claim")
    public ApiResponse<DailyQuestStatusResponse> claimReward(@Valid @RequestBody DailyQuestClaimRequest request) {
        return ApiResponse.ok(dailyQuestService.claimReward(request.userId()));
    }

    @PostMapping("/claim-one")
    public ApiResponse<DailyQuestListResponse> claimSingleQuest(@Valid @RequestBody DailyQuestClaimOneRequest request) {
        return ApiResponse.ok(dailyQuestService.claimSingleQuest(request.userId(), request.questCode()));
    }
}
