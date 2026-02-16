package com.hwang.game.admin.repository;

import com.hwang.game.admin.entity.MonsterMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MonsterMasterRepository extends JpaRepository<MonsterMasterEntity, String> {
    List<MonsterMasterEntity> findAllByOrderByMonsterIdAsc();
}
