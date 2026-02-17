package com.hwang.game.admin.repository;

import com.hwang.game.admin.entity.WaveGroupScalingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaveGroupScalingRepository extends JpaRepository<WaveGroupScalingEntity, Long> {
    List<WaveGroupScalingEntity> findByDungeonIdOrderByWaveGroupNoAsc(String dungeonId);
}
