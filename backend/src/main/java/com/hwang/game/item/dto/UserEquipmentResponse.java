package com.hwang.game.item.dto;

import com.hwang.game.item.entity.UserEquipmentEntity;

import java.time.LocalDateTime;

public record UserEquipmentResponse(
        long userId,
        String weaponItemId,
        String armorItemId,
        String accessoryItemId,
        LocalDateTime updatedAt
) {
    public static UserEquipmentResponse from(UserEquipmentEntity entity) {
        return new UserEquipmentResponse(
                entity.getUserId(),
                entity.getWeaponItemId(),
                entity.getArmorItemId(),
                entity.getAccessoryItemId(),
                entity.getUpdatedAt()
        );
    }
}
