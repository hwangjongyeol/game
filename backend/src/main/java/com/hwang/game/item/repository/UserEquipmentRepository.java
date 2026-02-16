package com.hwang.game.item.repository;

import com.hwang.game.item.entity.UserEquipmentEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserEquipmentRepository extends JpaRepository<UserEquipmentEntity, Long> {
}
