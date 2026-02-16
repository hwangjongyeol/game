package com.hwang.game.item.repository;

import com.hwang.game.item.entity.UserItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserItemRepository extends JpaRepository<UserItemEntity, Long> {
    List<UserItemEntity> findByUserIdOrderByItemNameAsc(Long userId);

    Optional<UserItemEntity> findByUserIdAndItemId(Long userId, String itemId);
}
