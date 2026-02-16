package com.hwang.game.reward.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.reward.dto.OfflineRewardClaimRequest;
import com.hwang.game.reward.dto.OfflineRewardClaimResponse;
import com.hwang.game.reward.service.RewardService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/rewards")
public class RewardController {
    private final RewardService rewardService;

    public RewardController(RewardService rewardService) {
        this.rewardService = rewardService;
    }

    @PostMapping("/offline/claim")
    public ApiResponse<OfflineRewardClaimResponse> claimOfflineReward(
            @Valid @RequestBody OfflineRewardClaimRequest request
    ) {
        return ApiResponse.ok(rewardService.claimOfflineReward(request.userId(), request.clientLastSeenAt()));
    }
}
