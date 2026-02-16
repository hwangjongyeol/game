package com.hwang.game.item.repository;

import com.hwang.game.item.entity.MonsterDropTableEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MonsterDropTableRepository extends JpaRepository<MonsterDropTableEntity, Long> {
    List<MonsterDropTableEntity> findByMonsterIdOrderByDropChanceDesc(String monsterId);
}
