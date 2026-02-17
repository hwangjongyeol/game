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
import com.hwang.game.player.repository.CharacterClassMasterRepository;
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
    private final CharacterClassMasterRepository characterClassMasterRepository;

    public CharacterService(
            UserCharacterStatRepository userCharacterStatRepository,
            PlayerService playerService,
            CompanionService companionService,
            EconomyService economyService,
            DailyQuestService dailyQuestService,
            CharacterClassMasterRepository characterClassMasterRepository
    ) {
        this.userCharacterStatRepository = userCharacterStatRepository;
        this.playerService = playerService;
        this.companionService = companionService;
        this.economyService = economyService;
        this.dailyQuestService = dailyQuestService;
        this.characterClassMasterRepository = characterClassMasterRepository;
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
        characterClassMasterRepository.findById(user.getClassId()).ifPresent(clazz -> {
            entity.setAttackValue(Math.max(1, clazz.getBaseAttack()));
            entity.setDefenseValue(Math.max(0, clazz.getBaseDefense()));
            entity.setMaxHpValue(Math.max(1, clazz.getBaseHp()));
            entity.setMaxMpValue(Math.max(1, clazz.getBaseMp()));
        });
        return entity;
    }
}
