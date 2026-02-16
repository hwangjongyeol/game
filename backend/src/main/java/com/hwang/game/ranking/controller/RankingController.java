package com.hwang.game.ranking.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.ranking.dto.MyRankingResponse;
import com.hwang.game.ranking.dto.RankingEntryResponse;
import com.hwang.game.ranking.dto.UpdateRankingScoreRequest;
import com.hwang.game.ranking.service.RankingService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/v1/rankings")
public class RankingController {
    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping
    public ApiResponse<List<RankingEntryResponse>> getRankings(
            @RequestParam @NotBlank String seasonId,
            @RequestParam(defaultValue = "100") @Min(1) @Max(100) int limit
    ) {
        return ApiResponse.ok(rankingService.getTopRankings(seasonId, limit));
    }

    @GetMapping("/me")
    public ApiResponse<MyRankingResponse> getMyRanking(
            @RequestParam @NotBlank String seasonId,
            @RequestParam @NotNull Long userId
    ) {
        return ApiResponse.ok(rankingService.getMyRanking(seasonId, userId));
    }

    @PostMapping("/score")
    public ApiResponse<MyRankingResponse> addScore(@Valid @RequestBody UpdateRankingScoreRequest request) {
        return ApiResponse.ok(rankingService.addScore(request.seasonId(), request.userId(), request.scoreDelta()));
    }
}
