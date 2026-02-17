package com.hwang.game.player.repository;

import com.hwang.game.player.entity.CharacterClassMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CharacterClassMasterRepository extends JpaRepository<CharacterClassMasterEntity, String> {
    List<CharacterClassMasterEntity> findByActiveTrueOrderByClassIdAsc();

    List<CharacterClassMasterEntity> findAllByOrderByClassIdAsc();

    boolean existsByClassIdAndActiveTrue(String classId);
}
