package com.hwang.game.dungeon.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.dungeon.dto.WaveRuntimeConfigResponse;
import com.hwang.game.dungeon.service.WaveRuntimeService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/waves")
public class WaveRuntimeController {
    private final WaveRuntimeService waveRuntimeService;

    public WaveRuntimeController(WaveRuntimeService waveRuntimeService) {
        this.waveRuntimeService = waveRuntimeService;
    }

    @GetMapping("/runtime/{dungeonId}")
    public ApiResponse<WaveRuntimeConfigResponse> getWaveRuntimeConfig(@PathVariable String dungeonId) {
        return ApiResponse.ok(waveRuntimeService.getRuntimeConfig(dungeonId));
    }
}
