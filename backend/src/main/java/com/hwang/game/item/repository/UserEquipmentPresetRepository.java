package com.hwang.game.item.repository;

import com.hwang.game.item.entity.UserEquipmentPresetEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserEquipmentPresetRepository extends JpaRepository<UserEquipmentPresetEntity, Long> {
    List<UserEquipmentPresetEntity> findByUserIdOrderByPresetNameAsc(Long userId);

    Optional<UserEquipmentPresetEntity> findByUserIdAndPresetName(Long userId, String presetName);
}
