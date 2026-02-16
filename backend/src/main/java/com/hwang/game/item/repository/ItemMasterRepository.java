package com.hwang.game.item.repository;

import com.hwang.game.item.entity.ItemMasterEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemMasterRepository extends JpaRepository<ItemMasterEntity, String> {
    List<ItemMasterEntity> findByActiveTrueOrderByItemTypeAscItemNameAsc();
}
