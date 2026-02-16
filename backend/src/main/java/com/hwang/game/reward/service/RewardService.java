package com.hwang.game.reward.service;

import com.hwang.game.common.exception.GameException;
import com.hwang.game.economy.model.CurrencyType;
import com.hwang.game.economy.service.EconomyService;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.repository.PlayerRepository;
import com.hwang.game.reward.dto.OfflineRewardClaimResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
public class RewardService {
    private static final long OFFLINE_CAP_SECONDS = 28_800L;
    private static final double BASE_GOLD_PER_SEC = 0.2d;
    private static final double BASE_EXP_PER_SEC = 0.05d;

    private final PlayerRepository playerRepository;
    private final EconomyService economyService;

    public RewardService(PlayerRepository playerRepository, EconomyService economyService) {
        this.playerRepository = playerRepository;
        this.economyService = economyService;
    }

    @Transactional
    public OfflineRewardClaimResponse claimOfflineReward(long userId, Instant clientLastSeenAt) {
        UserEntity user = playerRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new GameException("PLAYER_NOT_FOUND", "Player not found. id=" + userId));

        Instant now = Instant.now();
        if (clientLastSeenAt.isAfter(now.plusSeconds(5))) {
            throw new GameException("INVALID_REWARD_CLAIM", "clientLastSeenAt must not be in the future");
        }

        Instant baseline = user.getLastLogoutAt() == null
                ? clientLastSeenAt
                : user.getLastLogoutAt().toInstant(ZoneOffset.UTC);

        if (baseline.isAfter(now)) {
            throw new GameException("INVALID_REWARD_CLAIM", "Invalid baseline timestamp");
        }

        long offlineSeconds = Math.max(0L, Duration.between(baseline, now).getSeconds());
        long effectiveSeconds = Math.min(offlineSeconds, OFFLINE_CAP_SECONDS);
        boolean capped = offlineSeconds > OFFLINE_CAP_SECONDS;

        double powerMultiplier = 1.0d + ((user.getLevel() - 1L) * 0.02d);
        long goldReward = (long) Math.floor(BASE_GOLD_PER_SEC * powerMultiplier * effectiveSeconds);
        long expReward = (long) Math.floor(BASE_EXP_PER_SEC * powerMultiplier * effectiveSeconds);

        if (goldReward > 0) {
            economyService.earn(userId, CurrencyType.GOLD, goldReward, "OFFLINE_REWARD", null);
        }

        user.setLastLogoutAt(LocalDateTime.ofInstant(now, ZoneOffset.UTC));
        playerRepository.save(user);

        return new OfflineRewardClaimResponse(userId, effectiveSeconds, goldReward, expReward, capped);
    }
}
