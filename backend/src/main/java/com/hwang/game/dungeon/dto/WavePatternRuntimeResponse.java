package com.hwang.game.dungeon.dto;

import java.util.List;

public record WavePatternRuntimeResponse(
        int patternWaveNo,
        int patternGroupNo,
        int subWaveNo,
        List<WaveRuntimeEntryResponse> entries
) {
}
