package com.hwang.game.character.service;

import com.hwang.game.character.dto.CharacterStatResponse;
import com.hwang.game.character.entity.UserCharacterStatEntity;
import com.hwang.game.character.model.CharacterStatType;
import com.hwang.game.character.repository.UserCharacterStatRepository;
import com.hwang.game.companion.dto.CompanionPartyBonusResponse;
import com.hwang.game.companion.service.CompanionService;
import com.hwang.game.dailyquest.service.DailyQuestService;
import com.hwang.game.economy.model.CurrencyType;
import com.hwang.game.economy.service.EconomyService;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.service.PlayerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CharacterService {
    private final UserCharacterStatRepository userCharacterStatRepository;
    private final PlayerService playerService;
    private final CompanionService companionService;
    private final EconomyService economyService;
    private final DailyQuestService dailyQuestService;

    public CharacterService(
            UserCharacterStatRepository userCharacterStatRepository,
            PlayerService playerService,
            CompanionService companionService,
            EconomyService economyService,
            DailyQuestService dailyQuestService
    ) {
        this.userCharacterStatRepository = userCharacterStatRepository;
        this.playerService = playerService;
        this.companionService = companionService;
        this.economyService = economyService;
        this.dailyQuestService = dailyQuestService;
    }

    @Transactional
    public CharacterStatResponse getCharacterStats(long userId) {
        UserEntity user = playerService.getUserEntity(userId);
        UserCharacterStatEntity entity = findOrCreate(user);
        CompanionPartyBonusResponse party = companionService.getPartyBonus(userId);
        return CharacterStatResponse.from(entity, party.bonusAttack(), party.bonusDefense(), party.bonusHp(), party.bonusMp());
    }

    @Transactional
    public CharacterStatResponse upgrade(long userId, CharacterStatType statType) {
        UserEntity user = playerService.getUserEntity(userId);
        UserCharacterStatEntity entity = findOrCreate(user);

        switch (statType) {
            case ATTACK -> {
                long cost = 100L + (entity.getAttackLevel() - 1L) * 40L;
                economyService.spend(userId, CurrencyType.GOLD, cost, "STAT_UPGRADE", "ATTACK");
                entity.upgradeAttack();
            }
            case DEFENSE -> {
                long cost = 90L + (entity.getDefenseLevel() - 1L) * 35L;
                economyService.spend(userId, CurrencyType.GOLD, cost, "STAT_UPGRADE", "DEFENSE");
                entity.upgradeDefense();
            }
            case MAX_HP -> {
                long cost = 120L + (entity.getHpLevel() - 1L) * 45L;
                economyService.spend(userId, CurrencyType.GOLD, cost, "STAT_UPGRADE", "MAX_HP");
                entity.upgradeHp();
            }
            case MAX_MP -> {
                long cost = 120L + (entity.getMpLevel() - 1L) * 45L;
                economyService.spend(userId, CurrencyType.GOLD, cost, "STAT_UPGRADE", "MAX_MP");
                entity.upgradeMp();
            }
        }

        UserCharacterStatEntity saved = userCharacterStatRepository.save(entity);
        dailyQuestService.addProgress(userId, 0, 0L, 1);
        CompanionPartyBonusResponse party = companionService.getPartyBonus(userId);
        return CharacterStatResponse.from(saved, party.bonusAttack(), party.bonusDefense(), party.bonusHp(), party.bonusMp());
    }

    private UserCharacterStatEntity findOrCreate(UserEntity user) {
        return userCharacterStatRepository.findById(user.getId())
                .orElseGet(() -> userCharacterStatRepository.save(newUserStat(user)));
    }

    private UserCharacterStatEntity newUserStat(UserEntity user) {
        UserCharacterStatEntity entity = new UserCharacterStatEntity(user.getId());
        switch (user.getClassId()) {
            case "knight" -> {
                entity.setAttackValue(26);
                entity.setDefenseValue(10);
                entity.setMaxHpValue(240);
                entity.setMaxMpValue(70);
            }
            case "mage" -> {
                entity.setAttackValue(30);
                entity.setDefenseValue(5);
                entity.setMaxHpValue(180);
                entity.setMaxMpValue(120);
            }
            case "ranger" -> {
                entity.setAttackValue(28);
                entity.setDefenseValue(7);
                entity.setMaxHpValue(210);
                entity.setMaxMpValue(90);
            }
            default -> {
            }
        }
        return entity;
    }
}
