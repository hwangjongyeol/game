package com.hwang.game.admin.controller;

import com.hwang.game.admin.dto.AdminCharacterStatResponse;
import com.hwang.game.admin.dto.AdminBalanceProfileRequest;
import com.hwang.game.admin.dto.AdminBalanceProfileResponse;
import com.hwang.game.admin.dto.AdminClassMasterRequest;
import com.hwang.game.admin.dto.AdminClassMasterResponse;
import com.hwang.game.admin.dto.AdminCompanionMasterRequest;
import com.hwang.game.admin.dto.AdminCompanionMasterResponse;
import com.hwang.game.admin.dto.AdminItemMasterRequest;
import com.hwang.game.admin.dto.AdminItemUpgradeTierRequest;
import com.hwang.game.admin.dto.AdminItemUpgradeTierResponse;
import com.hwang.game.admin.dto.AdminMonsterDropRequest;
import com.hwang.game.admin.dto.AdminMonsterDropResponse;
import com.hwang.game.admin.dto.AdminMonsterRequest;
import com.hwang.game.admin.dto.AdminMonsterResponse;
import com.hwang.game.admin.dto.AdminPlayerResponse;
import com.hwang.game.admin.dto.AdminUpdateCharacterStatRequest;
import com.hwang.game.admin.dto.AdminUpdateEquipmentRequest;
import com.hwang.game.admin.dto.AdminUpdatePlayerRequest;
import com.hwang.game.admin.dto.AdminUpdateUserCompanionRequest;
import com.hwang.game.admin.dto.AdminWaveGroupScalingRequest;
import com.hwang.game.admin.dto.AdminWaveGroupScalingResponse;
import com.hwang.game.admin.dto.AdminWaveSettingRequest;
import com.hwang.game.admin.dto.AdminWaveSettingResponse;
import com.hwang.game.admin.service.AdminService;
import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.companion.dto.UserCompanionResponse;
import com.hwang.game.item.dto.ItemMasterResponse;
import com.hwang.game.item.dto.UserEquipmentResponse;
import com.hwang.game.item.entity.UserEquipmentEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/players")
    public ApiResponse<List<AdminPlayerResponse>> getPlayers() {
        return ApiResponse.ok(adminService.getPlayers());
    }

    @GetMapping("/classes")
    public ApiResponse<List<AdminClassMasterResponse>> getClasses() {
        return ApiResponse.ok(adminService.getClassMasters());
    }

    @PostMapping("/classes")
    public ApiResponse<AdminClassMasterResponse> createClass(@RequestBody AdminClassMasterRequest request) {
        return ApiResponse.ok(adminService.createClassMaster(request));
    }

    @PutMapping("/classes/{classId}")
    public ApiResponse<AdminClassMasterResponse> updateClass(
            @PathVariable String classId,
            @RequestBody AdminClassMasterRequest request
    ) {
        return ApiResponse.ok(adminService.updateClassMaster(classId, request));
    }

    @DeleteMapping("/classes/{classId}")
    public ApiResponse<Void> deleteClass(@PathVariable String classId) {
        adminService.deleteClassMaster(classId);
        return ApiResponse.ok(null);
    }

    @PutMapping("/players/{userId}")
    public ApiResponse<AdminPlayerResponse> updatePlayer(@PathVariable long userId, @RequestBody AdminUpdatePlayerRequest request) {
        return ApiResponse.ok(adminService.updatePlayer(userId, request));
    }

    @DeleteMapping("/players/{userId}")
    public ApiResponse<Void> deletePlayer(@PathVariable long userId) {
        adminService.deletePlayer(userId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/players/{userId}/stats")
    public ApiResponse<AdminCharacterStatResponse> getCharacterStats(@PathVariable long userId) {
        return ApiResponse.ok(adminService.getCharacterStats(userId));
    }

    @PutMapping("/players/{userId}/stats")
    public ApiResponse<AdminCharacterStatResponse> updateCharacterStats(
            @PathVariable long userId,
            @RequestBody AdminUpdateCharacterStatRequest request
    ) {
        return ApiResponse.ok(adminService.updateCharacterStats(userId, request));
    }

    @PutMapping("/players/{userId}/equipment")
    public ApiResponse<UserEquipmentResponse> updateEquipment(
            @PathVariable long userId,
            @RequestBody AdminUpdateEquipmentRequest request
    ) {
        UserEquipmentEntity updated = adminService.updateEquipment(userId, request);
        return ApiResponse.ok(UserEquipmentResponse.from(updated));
    }

    @GetMapping("/items")
    public ApiResponse<List<ItemMasterResponse>> getItems() {
        return ApiResponse.ok(adminService.getItemMasters());
    }

    @GetMapping("/items/{itemId}/upgrade-tiers")
    public ApiResponse<List<AdminItemUpgradeTierResponse>> getItemUpgradeTiers(@PathVariable String itemId) {
        return ApiResponse.ok(adminService.getItemUpgradeTiers(itemId));
    }

    @PostMapping("/items")
    public ApiResponse<ItemMasterResponse> createItem(@RequestBody AdminItemMasterRequest request) {
        return ApiResponse.ok(adminService.createItemMaster(request));
    }

    @PutMapping("/items/{itemId}")
    public ApiResponse<ItemMasterResponse> updateItem(@PathVariable String itemId, @RequestBody AdminItemMasterRequest request) {
        return ApiResponse.ok(adminService.updateItemMaster(itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<Void> deleteItem(@PathVariable String itemId) {
        adminService.deleteItemMaster(itemId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/item-upgrade-tiers")
    public ApiResponse<AdminItemUpgradeTierResponse> createItemUpgradeTier(@RequestBody AdminItemUpgradeTierRequest request) {
        return ApiResponse.ok(adminService.createItemUpgradeTier(request));
    }

    @PutMapping("/item-upgrade-tiers/{tierId}")
    public ApiResponse<AdminItemUpgradeTierResponse> updateItemUpgradeTier(
            @PathVariable long tierId,
            @RequestBody AdminItemUpgradeTierRequest request
    ) {
        return ApiResponse.ok(adminService.updateItemUpgradeTier(tierId, request));
    }

    @DeleteMapping("/item-upgrade-tiers/{tierId}")
    public ApiResponse<Void> deleteItemUpgradeTier(@PathVariable long tierId) {
        adminService.deleteItemUpgradeTier(tierId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/monsters")
    public ApiResponse<List<AdminMonsterResponse>> getMonsters() {
        return ApiResponse.ok(adminService.getMonsterMasters().stream().map(AdminMonsterResponse::from).toList());
    }

    @PostMapping("/monsters")
    public ApiResponse<AdminMonsterResponse> createMonster(@RequestBody AdminMonsterRequest request) {
        return ApiResponse.ok(AdminMonsterResponse.from(adminService.createMonsterMaster(request)));
    }

    @PutMapping("/monsters/{monsterId}")
    public ApiResponse<AdminMonsterResponse> updateMonster(@PathVariable String monsterId, @RequestBody AdminMonsterRequest request) {
        return ApiResponse.ok(AdminMonsterResponse.from(adminService.updateMonsterMaster(monsterId, request)));
    }

    @DeleteMapping("/monsters/{monsterId}")
    public ApiResponse<Void> deleteMonster(@PathVariable String monsterId) {
        adminService.deleteMonsterMaster(monsterId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/monsters/{monsterId}/drops")
    public ApiResponse<List<AdminMonsterDropResponse>> getMonsterDrops(@PathVariable String monsterId) {
        return ApiResponse.ok(adminService.getMonsterDrops(monsterId).stream().map(AdminMonsterDropResponse::from).toList());
    }

    @PostMapping("/monster-drops")
    public ApiResponse<AdminMonsterDropResponse> createMonsterDrop(@RequestBody AdminMonsterDropRequest request) {
        return ApiResponse.ok(AdminMonsterDropResponse.from(adminService.createMonsterDrop(request)));
    }

    @PutMapping("/monster-drops/{dropId}")
    public ApiResponse<AdminMonsterDropResponse> updateMonsterDrop(
            @PathVariable long dropId,
            @RequestBody AdminMonsterDropRequest request
    ) {
        return ApiResponse.ok(AdminMonsterDropResponse.from(adminService.updateMonsterDrop(dropId, request)));
    }

    @DeleteMapping("/monster-drops/{dropId}")
    public ApiResponse<Void> deleteMonsterDrop(@PathVariable long dropId) {
        adminService.deleteMonsterDrop(dropId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/waves/{dungeonId}")
    public ApiResponse<List<AdminWaveSettingResponse>> getWaveSettings(@PathVariable String dungeonId) {
        return ApiResponse.ok(adminService.getWaveSettings(dungeonId).stream().map(AdminWaveSettingResponse::from).toList());
    }

    @PostMapping("/waves")
    public ApiResponse<AdminWaveSettingResponse> createWaveSetting(@RequestBody AdminWaveSettingRequest request) {
        return ApiResponse.ok(AdminWaveSettingResponse.from(adminService.createWaveSetting(request)));
    }

    @PutMapping("/waves/{waveSettingId}")
    public ApiResponse<AdminWaveSettingResponse> updateWaveSetting(
            @PathVariable long waveSettingId,
            @RequestBody AdminWaveSettingRequest request
    ) {
        return ApiResponse.ok(AdminWaveSettingResponse.from(adminService.updateWaveSetting(waveSettingId, request)));
    }

    @DeleteMapping("/waves/{waveSettingId}")
    public ApiResponse<Void> deleteWaveSetting(@PathVariable long waveSettingId) {
        adminService.deleteWaveSetting(waveSettingId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/wave-groups/{dungeonId}")
    public ApiResponse<List<AdminWaveGroupScalingResponse>> getWaveGroupScalings(@PathVariable String dungeonId) {
        return ApiResponse.ok(adminService.getWaveGroupScalings(dungeonId).stream().map(AdminWaveGroupScalingResponse::from).toList());
    }

    @PostMapping("/wave-groups")
    public ApiResponse<AdminWaveGroupScalingResponse> createWaveGroupScaling(@RequestBody AdminWaveGroupScalingRequest request) {
        return ApiResponse.ok(AdminWaveGroupScalingResponse.from(adminService.createWaveGroupScaling(request)));
    }

    @PutMapping("/wave-groups/{waveGroupScalingId}")
    public ApiResponse<AdminWaveGroupScalingResponse> updateWaveGroupScaling(
            @PathVariable long waveGroupScalingId,
            @RequestBody AdminWaveGroupScalingRequest request
    ) {
        return ApiResponse.ok(AdminWaveGroupScalingResponse.from(adminService.updateWaveGroupScaling(waveGroupScalingId, request)));
    }

    @DeleteMapping("/wave-groups/{waveGroupScalingId}")
    public ApiResponse<Void> deleteWaveGroupScaling(@PathVariable long waveGroupScalingId) {
        adminService.deleteWaveGroupScaling(waveGroupScalingId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/companions/masters")
    public ApiResponse<List<AdminCompanionMasterResponse>> getCompanionMasters() {
        return ApiResponse.ok(adminService.getCompanionMasters());
    }

    @GetMapping("/balance-profiles")
    public ApiResponse<List<AdminBalanceProfileResponse>> getBalanceProfiles() {
        return ApiResponse.ok(adminService.getBalanceProfiles());
    }

    @PostMapping("/balance-profiles")
    public ApiResponse<AdminBalanceProfileResponse> createBalanceProfile(@RequestBody AdminBalanceProfileRequest request) {
        return ApiResponse.ok(adminService.createBalanceProfile(request));
    }

    @PutMapping("/balance-profiles/{profileId}")
    public ApiResponse<AdminBalanceProfileResponse> updateBalanceProfile(
            @PathVariable String profileId,
            @RequestBody AdminBalanceProfileRequest request
    ) {
        return ApiResponse.ok(adminService.updateBalanceProfile(profileId, request));
    }

    @DeleteMapping("/balance-profiles/{profileId}")
    public ApiResponse<Void> deleteBalanceProfile(@PathVariable String profileId) {
        adminService.deleteBalanceProfile(profileId);
        return ApiResponse.ok(null);
    }

    @PostMapping("/companions/masters")
    public ApiResponse<AdminCompanionMasterResponse> createCompanionMaster(@RequestBody AdminCompanionMasterRequest request) {
        return ApiResponse.ok(adminService.createCompanionMaster(request));
    }

    @PutMapping("/companions/masters/{companionId}")
    public ApiResponse<AdminCompanionMasterResponse> updateCompanionMaster(
            @PathVariable String companionId,
            @RequestBody AdminCompanionMasterRequest request
    ) {
        return ApiResponse.ok(adminService.updateCompanionMaster(companionId, request));
    }

    @DeleteMapping("/companions/masters/{companionId}")
    public ApiResponse<Void> deleteCompanionMaster(@PathVariable String companionId) {
        adminService.deleteCompanionMaster(companionId);
        return ApiResponse.ok(null);
    }

    @GetMapping("/companions/users/{userId}")
    public ApiResponse<List<UserCompanionResponse>> getUserCompanions(@PathVariable long userId) {
        return ApiResponse.ok(adminService.getUserCompanions(userId));
    }

    @PutMapping("/companions/users/{userCompanionId}")
    public ApiResponse<UserCompanionResponse> updateUserCompanion(
            @PathVariable long userCompanionId,
            @RequestBody AdminUpdateUserCompanionRequest request
    ) {
        return ApiResponse.ok(adminService.updateUserCompanion(userCompanionId, request));
    }
}
