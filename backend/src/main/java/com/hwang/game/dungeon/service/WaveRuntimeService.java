package com.hwang.game.dungeon.service;

import com.hwang.game.admin.entity.WaveGroupScalingEntity;
import com.hwang.game.admin.entity.MonsterMasterEntity;
import com.hwang.game.admin.entity.WaveSettingEntity;
import com.hwang.game.admin.repository.MonsterMasterRepository;
import com.hwang.game.admin.repository.WaveGroupScalingRepository;
import com.hwang.game.admin.repository.WaveSettingRepository;
import com.hwang.game.dungeon.dto.WaveGroupScalingRuntimeResponse;
import com.hwang.game.dungeon.dto.WavePatternRuntimeResponse;
import com.hwang.game.dungeon.dto.WaveRuntimeConfigResponse;
import com.hwang.game.dungeon.dto.WaveRuntimeEntryResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WaveRuntimeService {
    public static final int PATTERN_GROUP_SIZE = 10;
    public static final int SUB_WAVE_SIZE = 10;
    public static final int PATTERN_WAVE_COUNT = PATTERN_GROUP_SIZE * SUB_WAVE_SIZE;

    private final WaveSettingRepository waveSettingRepository;
    private final WaveGroupScalingRepository waveGroupScalingRepository;
    private final MonsterMasterRepository monsterMasterRepository;

    public WaveRuntimeService(
            WaveSettingRepository waveSettingRepository,
            WaveGroupScalingRepository waveGroupScalingRepository,
            MonsterMasterRepository monsterMasterRepository
    ) {
        this.waveSettingRepository = waveSettingRepository;
        this.waveGroupScalingRepository = waveGroupScalingRepository;
        this.monsterMasterRepository = monsterMasterRepository;
    }

    @Transactional(readOnly = true)
    public WaveRuntimeConfigResponse getRuntimeConfig(String dungeonId) {
        String normalizedDungeonId = dungeonId.toLowerCase(Locale.ROOT);
        List<WaveSettingEntity> waveRows = waveSettingRepository.findByDungeonIdOrderByWaveNoAscSlotNoAsc(normalizedDungeonId)
                .stream()
                .filter(WaveSettingEntity::isActive)
                .toList();
        Map<String, String> monsterRenderProfileById = monsterMasterRepository.findAllById(
                waveRows.stream().map(WaveSettingEntity::getMonsterId).distinct().toList()
        ).stream().collect(
                HashMap::new,
                (acc, monster) -> acc.put(monster.getMonsterId(), monster.getRenderProfileJson()),
                HashMap::putAll
        );

        Map<Integer, List<WaveRuntimeEntryResponse>> patternEntryMap = waveRows.stream()
                .collect(Collectors.groupingBy(
                        WaveSettingEntity::getWaveNo,
                        Collectors.mapping(
                                row -> new WaveRuntimeEntryResponse(
                                        row.getSlotNo(),
                                        row.getMonsterId(),
                                        monsterRenderProfileById.get(row.getMonsterId()),
                                        Math.max(1, row.getMonsterCount()),
                                        row.getHpMultiplier(),
                                        row.getMpMultiplier(),
                                        row.getAttackMultiplier(),
                                        row.getDefenseMultiplier(),
                                        row.getRewardGoldMultiplier(),
                                        row.getRewardGemMultiplier()
                                ),
                                Collectors.toList()
                        )
                ));

        List<WavePatternRuntimeResponse> patterns = java.util.stream.IntStream.rangeClosed(1, PATTERN_WAVE_COUNT)
                .mapToObj(patternWaveNo -> new WavePatternRuntimeResponse(
                        patternWaveNo,
                        ((patternWaveNo - 1) / SUB_WAVE_SIZE) + 1,
                        ((patternWaveNo - 1) % SUB_WAVE_SIZE) + 1,
                        patternEntryMap.getOrDefault(patternWaveNo, List.of())
                ))
                .toList();

        List<WaveGroupScalingRuntimeResponse> groupScalings = waveGroupScalingRepository
                .findByDungeonIdOrderByWaveGroupNoAsc(normalizedDungeonId)
                .stream()
                .filter(WaveGroupScalingEntity::isActive)
                .map(row -> new WaveGroupScalingRuntimeResponse(
                        row.getWaveGroupNo(),
                        row.getHpMultiplier(),
                        row.getMpMultiplier(),
                        row.getAttackMultiplier(),
                        row.getDefenseMultiplier(),
                        row.getRewardGoldMultiplier(),
                        row.getRewardGemMultiplier(),
                        row.getBackgroundImagePath()
                ))
                .toList();

        if (groupScalings.isEmpty()) {
            groupScalings = List.of(new WaveGroupScalingRuntimeResponse(
                    1,
                    BigDecimal.ONE,
                    BigDecimal.ONE,
                    BigDecimal.ONE,
                    BigDecimal.ONE,
                    BigDecimal.ONE,
                    BigDecimal.ONE,
                    null
            ));
        }

        return new WaveRuntimeConfigResponse(normalizedDungeonId, PATTERN_GROUP_SIZE, SUB_WAVE_SIZE, patterns, groupScalings);
    }
}
