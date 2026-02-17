package com.hwang.game.player.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.player.dto.CharacterClassResponse;
import com.hwang.game.player.service.PlayerService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/classes")
public class ClassController {
    private final PlayerService playerService;

    public ClassController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @GetMapping
    public ApiResponse<List<CharacterClassResponse>> getClasses() {
        return ApiResponse.ok(playerService.getActiveClasses().stream().map(CharacterClassResponse::from).toList());
    }
}
