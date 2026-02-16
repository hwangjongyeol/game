package com.hwang.game.dailyquest.repository;

import com.hwang.game.dailyquest.entity.DailyQuestProgressEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyQuestProgressRepository extends JpaRepository<DailyQuestProgressEntity, Long> {
    Optional<DailyQuestProgressEntity> findByUserIdAndQuestDate(Long userId, LocalDate questDate);
}
