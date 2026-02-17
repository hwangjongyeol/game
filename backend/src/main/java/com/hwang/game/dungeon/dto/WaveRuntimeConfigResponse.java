package com.hwang.game.dungeon.dto;

import java.util.List;

public record WaveRuntimeConfigResponse(
        String dungeonId,
        int patternGroupSize,
        int subWaveSize,
        List<WavePatternRuntimeResponse> patterns,
        List<WaveGroupScalingRuntimeResponse> waveGroupScalings
) {
}
