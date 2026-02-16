package com.hwang.game.companion.repository;

import com.hwang.game.companion.entity.UserCompanionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserCompanionRepository extends JpaRepository<UserCompanionEntity, Long> {
    List<UserCompanionEntity> findByUserIdOrderBySlotNoAscLevelDescIdAsc(Long userId);

    Optional<UserCompanionEntity> findByUserIdAndCompanionId(Long userId, String companionId);

    Optional<UserCompanionEntity> findByUserIdAndSlotNo(Long userId, Integer slotNo);

    List<UserCompanionEntity> findByUserIdAndSlotNoIsNotNullOrderBySlotNoAsc(Long userId);
}
