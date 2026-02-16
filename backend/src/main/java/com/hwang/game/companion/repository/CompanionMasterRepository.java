package com.hwang.game.companion.repository;

import com.hwang.game.companion.entity.CompanionMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompanionMasterRepository extends JpaRepository<CompanionMasterEntity, String> {
    List<CompanionMasterEntity> findByActiveTrueOrderByCompanionIdAsc();
}
