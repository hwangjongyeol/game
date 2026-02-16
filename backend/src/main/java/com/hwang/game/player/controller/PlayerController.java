package com.hwang.game.player.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.player.dto.CreatePlayerRequest;
import com.hwang.game.player.dto.PlayerResponse;
import com.hwang.game.player.service.PlayerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/players")
public class PlayerController {
    private final PlayerService playerService;

    public PlayerController(PlayerService playerService) {
        this.playerService = playerService;
    }

    @PostMapping
    public ApiResponse<PlayerResponse> createPlayer(@Valid @RequestBody CreatePlayerRequest request) {
        return ApiResponse.ok(PlayerResponse.from(playerService.createPlayer(request.accountId(), request.nickname(), request.classId())));
    }

    @GetMapping("/{id}")
    public ApiResponse<PlayerResponse> getPlayer(@PathVariable long id) {
        return ApiResponse.ok(PlayerResponse.from(playerService.getPlayer(id)));
    }

    @GetMapping
    public ApiResponse<List<PlayerResponse>> getPlayers() {
        List<PlayerResponse> players = playerService.getPlayers()
                .stream()
                .map(PlayerResponse::from)
                .toList();
        return ApiResponse.ok(players);
    }

    @GetMapping("/accounts/{accountId}")
    public ApiResponse<List<PlayerResponse>> getPlayersByAccount(@PathVariable long accountId) {
        List<PlayerResponse> players = playerService.getPlayersByAccount(accountId)
                .stream()
                .map(PlayerResponse::from)
                .toList();
        return ApiResponse.ok(players);
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePlayer(@PathVariable long id, @RequestParam long accountId) {
        playerService.softDeletePlayer(accountId, id);
        return ApiResponse.ok(null);
    }
}
