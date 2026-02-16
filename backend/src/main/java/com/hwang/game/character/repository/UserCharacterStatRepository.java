package com.hwang.game.character.repository;

import com.hwang.game.character.entity.UserCharacterStatEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCharacterStatRepository extends JpaRepository<UserCharacterStatEntity, Long> {
}
