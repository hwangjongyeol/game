package com.hwang.game.dailyquest.service;

import com.hwang.game.common.exception.GameException;
import com.hwang.game.dailyquest.dto.DailyQuestEntryResponse;
import com.hwang.game.dailyquest.dto.DailyQuestListResponse;
import com.hwang.game.dailyquest.dto.DailyQuestStatusResponse;
import com.hwang.game.dailyquest.entity.DailyQuestProgressEntity;
import com.hwang.game.dailyquest.repository.DailyQuestProgressRepository;
import com.hwang.game.economy.model.CurrencyType;
import com.hwang.game.economy.service.EconomyService;
import com.hwang.game.player.service.PlayerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class DailyQuestService {
    private static final int TARGET_KILL_COUNT = 10;
    private static final long TARGET_GOLD_EARNED = 1000L;
    private static final int TARGET_UPGRADE_COUNT = 3;
    private static final long REWARD_GOLD = 400L;
    private static final long REWARD_GEM = 15L;

    private static final List<QuestTemplate> QUEST_TEMPLATES = List.of(
            new QuestTemplate("KILL_10", "몬스터 10마리 처치", ObjectiveType.KILL, 10, 120, 2),
            new QuestTemplate("KILL_30", "몬스터 30마리 처치", ObjectiveType.KILL, 30, 260, 4),
            new QuestTemplate("KILL_60", "몬스터 60마리 처치", ObjectiveType.KILL, 60, 520, 8),
            new QuestTemplate("KILL_100", "몬스터 100마리 처치", ObjectiveType.KILL, 100, 900, 14),
            new QuestTemplate("GOLD_1000", "골드 1,000 획득", ObjectiveType.GOLD, 1000, 180, 3),
            new QuestTemplate("GOLD_5000", "골드 5,000 획득", ObjectiveType.GOLD, 5000, 520, 7),
            new QuestTemplate("GOLD_12000", "골드 12,000 획득", ObjectiveType.GOLD, 12000, 1100, 14),
            new QuestTemplate("UPGRADE_1", "능력치 강화 1회", ObjectiveType.UPGRADE, 1, 100, 2),
            new QuestTemplate("UPGRADE_5", "능력치 강화 5회", ObjectiveType.UPGRADE, 5, 420, 6),
            new QuestTemplate("UPGRADE_12", "능력치 강화 12회", ObjectiveType.UPGRADE, 12, 900, 12)
    );

    private final DailyQuestProgressRepository dailyQuestProgressRepository;
    private final PlayerService playerService;
    private final EconomyService economyService;

    public DailyQuestService(
            DailyQuestProgressRepository dailyQuestProgressRepository,
            PlayerService playerService,
            EconomyService economyService
    ) {
        this.dailyQuestProgressRepository = dailyQuestProgressRepository;
        this.playerService = playerService;
        this.economyService = economyService;
    }

    @Transactional
    public DailyQuestStatusResponse getStatus(long userId) {
        playerService.getUserEntity(userId);
        DailyQuestProgressEntity row = findOrCreateToday(userId);
        return toLegacyResponse(row);
    }

    @Transactional
    public DailyQuestListResponse getQuestList(long userId) {
        playerService.getUserEntity(userId);
        DailyQuestProgressEntity row = findOrCreateToday(userId);
        List<DailyQuestEntryResponse> quests = buildQuestEntries(row);
        return new DailyQuestListResponse(
                row.getUserId(),
                row.getQuestDate(),
                row.getDungeonKillCount(),
                row.getGoldEarned(),
                row.getStatUpgradeCount(),
                quests
        );
    }

    @Transactional
    public DailyQuestStatusResponse addProgress(long userId, int dungeonKillDelta, long goldEarnedDelta, int statUpgradeDelta) {
        playerService.getUserEntity(userId);
        if (dungeonKillDelta <= 0 && goldEarnedDelta <= 0 && statUpgradeDelta <= 0) {
            throw new GameException("INVALID_DAILY_QUEST_PROGRESS", "At least one delta must be positive");
        }

        DailyQuestProgressEntity row = findOrCreateToday(userId);
        if (dungeonKillDelta > 0) {
            row.addKillCount(dungeonKillDelta);
        }
        if (goldEarnedDelta > 0) {
            row.addGoldEarned(goldEarnedDelta);
        }
        if (statUpgradeDelta > 0) {
            row.addStatUpgradeCount(statUpgradeDelta);
        }

        dailyQuestProgressRepository.save(row);
        return toLegacyResponse(row);
    }

    @Transactional
    public DailyQuestListResponse claimSingleQuest(long userId, String questCode) {
        playerService.getUserEntity(userId);
        DailyQuestProgressEntity row = findOrCreateToday(userId);

        int questIndex = findQuestIndex(questCode);
        QuestTemplate quest = QUEST_TEMPLATES.get(questIndex);

        if (row.isQuestClaimed(questIndex)) {
            throw new GameException("DAILY_QUEST_ALREADY_CLAIMED", "Quest reward already claimed");
        }

        long progress = resolveProgress(row, quest.objectiveType());
        if (progress < quest.target()) {
            throw new GameException("DAILY_QUEST_NOT_COMPLETED", "Daily quest target not reached");
        }

        economyService.earn(userId, CurrencyType.GOLD, quest.rewardGold(), "DAILY_QUEST", quest.questCode() + "-gold");
        economyService.earn(userId, CurrencyType.GEM, quest.rewardGem(), "DAILY_QUEST", quest.questCode() + "-gem");
        row.markQuestClaimed(questIndex);
        dailyQuestProgressRepository.save(row);
        return getQuestList(userId);
    }

    @Transactional
    public DailyQuestStatusResponse claimReward(long userId) {
        playerService.getUserEntity(userId);
        DailyQuestProgressEntity row = findOrCreateToday(userId);

        if (row.getRewardClaimedAt() != null) {
            throw new GameException("DAILY_QUEST_ALREADY_CLAIMED", "Daily quest reward already claimed");
        }

        boolean complete = row.getDungeonKillCount() >= TARGET_KILL_COUNT
                && row.getGoldEarned() >= TARGET_GOLD_EARNED
                && row.getStatUpgradeCount() >= TARGET_UPGRADE_COUNT;
        if (!complete) {
            throw new GameException("DAILY_QUEST_NOT_COMPLETED", "Daily quest target not reached");
        }

        economyService.earn(userId, CurrencyType.GOLD, REWARD_GOLD, "DAILY_QUEST", "daily-gold");
        economyService.earn(userId, CurrencyType.GEM, REWARD_GEM, "DAILY_QUEST", "daily-gem");
        row.markRewardClaimed();
        dailyQuestProgressRepository.save(row);
        return toLegacyResponse(row);
    }

    private List<DailyQuestEntryResponse> buildQuestEntries(DailyQuestProgressEntity row) {
        return QUEST_TEMPLATES.stream()
                .map(template -> {
                    int idx = findQuestIndex(template.questCode());
                    boolean claimed = row.isQuestClaimed(idx);
                    long progress = resolveProgress(row, template.objectiveType());
                    boolean claimable = progress >= template.target() && !claimed;
                    return new DailyQuestEntryResponse(
                            template.questCode(),
                            template.title(),
                            template.objectiveType().name(),
                            Math.min(progress, template.target()),
                            template.target(),
                            claimable,
                            claimed,
                            template.rewardGold(),
                            template.rewardGem()
                    );
                })
                .toList();
    }

    private long resolveProgress(DailyQuestProgressEntity row, ObjectiveType type) {
        return switch (type) {
            case KILL -> row.getDungeonKillCount();
            case GOLD -> row.getGoldEarned();
            case UPGRADE -> row.getStatUpgradeCount();
        };
    }

    private int findQuestIndex(String questCode) {
        String normalized = questCode == null ? "" : questCode.trim();
        for (int i = 0; i < QUEST_TEMPLATES.size(); i += 1) {
            if (QUEST_TEMPLATES.get(i).questCode().equalsIgnoreCase(normalized)) {
                return i;
            }
        }
        throw new GameException("DAILY_QUEST_NOT_FOUND", "Quest not found: " + questCode);
    }

    private DailyQuestStatusResponse toLegacyResponse(DailyQuestProgressEntity row) {
        return DailyQuestStatusResponse.from(
                row,
                TARGET_KILL_COUNT,
                TARGET_GOLD_EARNED,
                TARGET_UPGRADE_COUNT,
                REWARD_GOLD,
                REWARD_GEM
        );
    }

    private DailyQuestProgressEntity findOrCreateToday(long userId) {
        LocalDate today = LocalDate.now();
        return dailyQuestProgressRepository.findByUserIdAndQuestDate(userId, today)
                .orElseGet(() -> dailyQuestProgressRepository.save(new DailyQuestProgressEntity(userId, today)));
    }

    private enum ObjectiveType {
        KILL,
        GOLD,
        UPGRADE
    }

    private record QuestTemplate(
            String questCode,
            String title,
            ObjectiveType objectiveType,
            long target,
            long rewardGold,
            long rewardGem
    ) {
    }
}
