package com.hwang.game.item.dto;

import com.hwang.game.item.entity.UserEquipmentPresetEntity;

import java.time.LocalDateTime;

public record UserEquipmentPresetResponse(
        long userId,
        String presetName,
        String weaponItemId,
        String armorItemId,
        String accessoryItemId,
        LocalDateTime updatedAt
) {
    public static UserEquipmentPresetResponse from(UserEquipmentPresetEntity entity) {
        return new UserEquipmentPresetResponse(
                entity.getUserId(),
                entity.getPresetName(),
                entity.getWeaponItemId(),
                entity.getArmorItemId(),
                entity.getAccessoryItemId(),
                entity.getUpdatedAt()
        );
    }
}
