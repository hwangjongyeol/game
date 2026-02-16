package com.hwang.game.dungeon.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.dungeon.dto.DungeonProgressResponse;
import com.hwang.game.dungeon.dto.UpdateDungeonProgressRequest;
import com.hwang.game.dungeon.service.DungeonProgressService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dungeons")
public class DungeonProgressController {
    private final DungeonProgressService dungeonProgressService;

    public DungeonProgressController(DungeonProgressService dungeonProgressService) {
        this.dungeonProgressService = dungeonProgressService;
    }

    @GetMapping("/{dungeonId}/progress/{userId}")
    public ApiResponse<DungeonProgressResponse> getProgress(@PathVariable String dungeonId, @PathVariable long userId) {
        return ApiResponse.ok(dungeonProgressService.getProgress(dungeonId, userId));
    }

    @PostMapping("/{dungeonId}/progress")
    public ApiResponse<DungeonProgressResponse> updateProgress(
            @PathVariable String dungeonId,
            @Valid @RequestBody UpdateDungeonProgressRequest request
    ) {
        return ApiResponse.ok(
                dungeonProgressService.updateProgress(
                        dungeonId,
                        request.userId(),
                        request.currentWave(),
                        request.maxUnlockedWave()
                )
        );
    }
}
