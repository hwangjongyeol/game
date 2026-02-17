package com.hwang.game.item.repository;

import com.hwang.game.item.entity.ItemUpgradeTierEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemUpgradeTierRepository extends JpaRepository<ItemUpgradeTierEntity, Long> {
    List<ItemUpgradeTierEntity> findByItemIdOrderByUpgradeLevelAsc(String itemId);

    Optional<ItemUpgradeTierEntity> findByItemIdAndUpgradeLevel(String itemId, int upgradeLevel);

    boolean existsByItemIdAndUpgradeLevel(String itemId, int upgradeLevel);
}
