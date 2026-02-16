package com.hwang.game.character.controller;

import com.hwang.game.character.dto.CharacterStatResponse;
import com.hwang.game.character.dto.UpgradeCharacterStatRequest;
import com.hwang.game.character.service.CharacterService;
import com.hwang.game.common.response.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/characters")
public class CharacterController {
    private final CharacterService characterService;

    public CharacterController(CharacterService characterService) {
        this.characterService = characterService;
    }

    @GetMapping("/{userId}")
    public ApiResponse<CharacterStatResponse> getCharacterStats(@PathVariable long userId) {
        return ApiResponse.ok(characterService.getCharacterStats(userId));
    }

    @PostMapping("/upgrade")
    public ApiResponse<CharacterStatResponse> upgrade(@Valid @RequestBody UpgradeCharacterStatRequest request) {
        return ApiResponse.ok(characterService.upgrade(request.userId(), request.statType()));
    }
}
