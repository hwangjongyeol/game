package com.hwang.game.admin.repository;

import com.hwang.game.admin.entity.WaveSettingEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WaveSettingRepository extends JpaRepository<WaveSettingEntity, Long> {
    List<WaveSettingEntity> findByDungeonIdOrderByWaveNoAscSlotNoAsc(String dungeonId);
}
