package com.hwang.game.admin.dto;

public record AdminUpdateEquipmentRequest(
        String weaponItemId,
        String armorItemId,
        String accessoryItemId
) {
}
