package com.hwang.game.item.controller;

import com.hwang.game.common.response.ApiResponse;
import com.hwang.game.item.dto.ConsumeItemRequest;
import com.hwang.game.item.dto.LootItemsRequest;
import com.hwang.game.item.dto.ApplyEquipmentPresetRequest;
import com.hwang.game.item.dto.ItemMasterResponse;
import com.hwang.game.item.dto.MonsterDropResponse;
import com.hwang.game.item.dto.SaveEquipmentPresetRequest;
import com.hwang.game.item.dto.UpdateEquipmentRequest;
import com.hwang.game.item.dto.UpgradeItemRequest;
import com.hwang.game.item.dto.UserEquipmentResponse;
import com.hwang.game.item.dto.UserEquipmentPresetResponse;
import com.hwang.game.item.dto.UserItemResponse;
import com.hwang.game.item.service.ItemService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/items")
public class ItemController {
    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @PostMapping("/loot")
    public ApiResponse<List<UserItemResponse>> saveLoot(@Valid @RequestBody LootItemsRequest request) {
        List<UserItemResponse> items = itemService.saveLoot(request.userId(), request.items())
                .stream()
                .map(UserItemResponse::from)
                .toList();
        return ApiResponse.ok(items);
    }

    @GetMapping("/{userId}")
    public ApiResponse<List<UserItemResponse>> getItems(@PathVariable long userId) {
        List<UserItemResponse> items = itemService.getItems(userId)
                .stream()
                .map(UserItemResponse::from)
                .toList();
        return ApiResponse.ok(items);
    }

    @GetMapping("/catalog")
    public ApiResponse<List<ItemMasterResponse>> getItemCatalog() {
        return ApiResponse.ok(
                itemService.getItemCatalog()
                        .stream()
                        .map(ItemMasterResponse::from)
                        .toList()
        );
    }

    @GetMapping("/catalog/{itemId}")
    public ApiResponse<ItemMasterResponse> getItemMaster(@PathVariable String itemId) {
        return ApiResponse.ok(ItemMasterResponse.from(itemService.getItemMaster(itemId)));
    }

    @GetMapping("/drop-table/{monsterId}")
    public ApiResponse<List<MonsterDropResponse>> getMonsterDropTable(@PathVariable String monsterId) {
        return ApiResponse.ok(
                itemService.getMonsterDropTable(monsterId)
                        .stream()
                        .map(MonsterDropResponse::from)
                        .toList()
        );
    }

    @PostMapping("/consume")
    public ApiResponse<List<UserItemResponse>> consumeItem(@Valid @RequestBody ConsumeItemRequest request) {
        List<UserItemResponse> items = itemService.consumeItem(request.userId(), request.itemId(), request.quantity())
                .stream()
                .map(UserItemResponse::from)
                .toList();
        return ApiResponse.ok(items);
    }

    @GetMapping("/equipment/{userId}")
    public ApiResponse<UserEquipmentResponse> getEquipment(@PathVariable long userId) {
        return ApiResponse.ok(UserEquipmentResponse.from(itemService.getEquipment(userId)));
    }

    @PostMapping("/equipment")
    public ApiResponse<UserEquipmentResponse> updateEquipment(@Valid @RequestBody UpdateEquipmentRequest request) {
        return ApiResponse.ok(UserEquipmentResponse.from(itemService.updateEquipment(request.userId(), request.slot(), request.itemId())));
    }

    @PostMapping("/upgrade")
    public ApiResponse<UserItemResponse> upgradeItem(@Valid @RequestBody UpgradeItemRequest request) {
        return ApiResponse.ok(UserItemResponse.from(itemService.upgradeItem(request.userId(), request.itemId())));
    }

    @GetMapping("/equipment/presets/{userId}")
    public ApiResponse<List<UserEquipmentPresetResponse>> getEquipmentPresets(@PathVariable long userId) {
        return ApiResponse.ok(
                itemService.getEquipmentPresets(userId)
                        .stream()
                        .map(UserEquipmentPresetResponse::from)
                        .toList()
        );
    }

    @PostMapping("/equipment/presets")
    public ApiResponse<UserEquipmentPresetResponse> saveEquipmentPreset(@Valid @RequestBody SaveEquipmentPresetRequest request) {
        return ApiResponse.ok(UserEquipmentPresetResponse.from(itemService.saveEquipmentPreset(request.userId(), request.presetName())));
    }

    @PostMapping("/equipment/presets/apply")
    public ApiResponse<UserEquipmentResponse> applyEquipmentPreset(@Valid @RequestBody ApplyEquipmentPresetRequest request) {
        return ApiResponse.ok(UserEquipmentResponse.from(itemService.applyEquipmentPreset(request.userId(), request.presetName())));
    }
}
