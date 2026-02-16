package com.hwang.game.companion.service;

import com.hwang.game.common.exception.GameException;
import com.hwang.game.companion.dto.CompanionPartyBonusResponse;
import com.hwang.game.companion.dto.UserCompanionResponse;
import com.hwang.game.companion.entity.CompanionMasterEntity;
import com.hwang.game.companion.entity.UserCompanionEntity;
import com.hwang.game.companion.repository.CompanionMasterRepository;
import com.hwang.game.companion.repository.UserCompanionRepository;
import com.hwang.game.economy.model.CurrencyType;
import com.hwang.game.economy.service.EconomyService;
import com.hwang.game.player.service.PlayerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class CompanionService {
    public static final int MAX_ACTIVE_COMPANIONS = 5;
    public static final long RECRUIT_COST_ONE = 300L;
    public static final long RECRUIT_COST_TEN = RECRUIT_COST_ONE * 9L;

    private static final List<Integer> FUSE_THRESHOLDS = List.of(1, 3, 5, 7, 10);

    private final CompanionMasterRepository companionMasterRepository;
    private final UserCompanionRepository userCompanionRepository;
    private final PlayerService playerService;
    private final EconomyService economyService;
    private final SecureRandom random = new SecureRandom();

    public CompanionService(
            CompanionMasterRepository companionMasterRepository,
            UserCompanionRepository userCompanionRepository,
            PlayerService playerService,
            EconomyService economyService
    ) {
        this.companionMasterRepository = companionMasterRepository;
        this.userCompanionRepository = userCompanionRepository;
        this.playerService = playerService;
        this.economyService = economyService;
    }

    @Transactional(readOnly = true)
    public List<CompanionMasterEntity> getCompanionMasters() {
        return companionMasterRepository.findByActiveTrueOrderByCompanionIdAsc();
    }

    @Transactional(readOnly = true)
    public List<UserCompanionResponse> getUserCompanions(long userId) {
        playerService.getUserEntity(userId);
        List<UserCompanionEntity> rows = userCompanionRepository.findByUserIdOrderBySlotNoAscLevelDescIdAsc(userId);
        Map<String, CompanionMasterEntity> masterMap = companionMasterRepository.findAllById(
                rows.stream().map(UserCompanionEntity::getCompanionId).distinct().toList()
        ).stream().collect(Collectors.toMap(CompanionMasterEntity::getCompanionId, Function.identity()));

        return rows.stream().map(row -> UserCompanionResponse.from(row, masterMap.get(row.getCompanionId()))).toList();
    }

    @Transactional(readOnly = true)
    public CompanionPartyBonusResponse getPartyBonus(long userId) {
        playerService.getUserEntity(userId);

        List<UserCompanionEntity> activeRows = userCompanionRepository.findByUserIdAndSlotNoIsNotNullOrderBySlotNoAsc(userId)
                .stream()
                .filter(row -> row.getSlotNo() != null && row.getSlotNo() >= 1 && row.getSlotNo() <= MAX_ACTIVE_COMPANIONS)
                .toList();

        Map<String, CompanionMasterEntity> masterMap = companionMasterRepository.findAllById(
                activeRows.stream().map(UserCompanionEntity::getCompanionId).distinct().toList()
        ).stream().collect(Collectors.toMap(CompanionMasterEntity::getCompanionId, Function.identity()));

        long atk = 0;
        long def = 0;
        long hp = 0;
        long mp = 0;
        List<UserCompanionResponse> active = new ArrayList<>();

        for (UserCompanionEntity row : activeRows) {
            CompanionMasterEntity master = masterMap.get(row.getCompanionId());
            UserCompanionResponse response = UserCompanionResponse.from(row, master);
            active.add(response);
            atk += response.attack();
            def += response.defense();
            hp += response.hp();
            mp += response.mp();
        }

        return new CompanionPartyBonusResponse(userId, atk, def, hp, mp, active);
    }

    @Transactional
    public List<UserCompanionResponse> recruit(long userId, int count) {
        playerService.getUserEntity(userId);
        if (count != 1 && count != 10) {
            throw new GameException("INVALID_RECRUIT_COUNT", "Recruit count must be 1 or 10");
        }

        long cost = count == 10 ? RECRUIT_COST_TEN : RECRUIT_COST_ONE;
        economyService.spend(userId, CurrencyType.GEM, cost, "COMPANION_RECRUIT", "x" + count);

        List<CompanionMasterEntity> pool = companionMasterRepository.findByActiveTrueOrderByCompanionIdAsc();
        if (pool.isEmpty()) {
            throw new GameException("COMPANION_POOL_EMPTY", "No active companion masters");
        }

        for (int i = 0; i < count; i += 1) {
            CompanionMasterEntity selected = rollWeightedCompanion(pool);
            UserCompanionEntity row = userCompanionRepository.findByUserIdAndCompanionId(userId, selected.getCompanionId())
                    .orElseGet(() -> new UserCompanionEntity(userId, selected.getCompanionId()));
            if (row.getId() != null) {
                row.addCopies(1);
            }
            userCompanionRepository.save(row);
        }

        return getUserCompanions(userId);
    }

    @Transactional
    public List<UserCompanionResponse> assign(long userId, long userCompanionId, Integer slotNo) {
        playerService.getUserEntity(userId);
        UserCompanionEntity row = userCompanionRepository.findById(userCompanionId)
                .orElseThrow(() -> new GameException("USER_COMPANION_NOT_FOUND", "Companion not found: " + userCompanionId));

        if (!row.getUserId().equals(userId)) {
            throw new GameException("USER_COMPANION_FORBIDDEN", "Companion does not belong to user");
        }

        if (slotNo == null) {
            row.setSlotNo(null);
            userCompanionRepository.save(row);
            return getUserCompanions(userId);
        }

        if (slotNo < 1 || slotNo > MAX_ACTIVE_COMPANIONS) {
            throw new GameException("INVALID_SLOT_NO", "slotNo must be between 1 and 5");
        }

        userCompanionRepository.findByUserIdAndSlotNo(userId, slotNo)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(row.getId())) {
                        existing.setSlotNo(null);
                        userCompanionRepository.save(existing);
                    }
                });

        row.setSlotNo(slotNo);
        userCompanionRepository.save(row);
        return getUserCompanions(userId);
    }

    @Transactional
    public UserCompanionResponse fuse(long userId, long userCompanionId) {
        playerService.getUserEntity(userId);
        UserCompanionEntity row = userCompanionRepository.findById(userCompanionId)
                .orElseThrow(() -> new GameException("USER_COMPANION_NOT_FOUND", "Companion not found: " + userCompanionId));

        if (!row.getUserId().equals(userId)) {
            throw new GameException("USER_COMPANION_FORBIDDEN", "Companion does not belong to user");
        }

        int threshold = resolveFuseThreshold(row.getLevel());
        if (row.getCopies() < threshold) {
            throw new GameException("INSUFFICIENT_COMPANION_COPIES", "Need copies: " + threshold);
        }

        row.setCopies(row.getCopies() - threshold);
        row.setLevel(row.getLevel() + 1);

        UserCompanionEntity saved = userCompanionRepository.save(row);
        CompanionMasterEntity master = companionMasterRepository.findById(saved.getCompanionId()).orElse(null);
        return UserCompanionResponse.from(saved, master);
    }

    private int resolveFuseThreshold(int level) {
        int idx = Math.min(FUSE_THRESHOLDS.size() - 1, Math.max(0, level - 1));
        return FUSE_THRESHOLDS.get(idx);
    }

    private CompanionMasterEntity rollWeightedCompanion(List<CompanionMasterEntity> pool) {
        int totalWeight = pool.stream().mapToInt(row -> Math.max(1, row.getRecruitWeight())).sum();
        int pick = random.nextInt(totalWeight);
        int acc = 0;
        for (CompanionMasterEntity row : pool) {
            acc += Math.max(1, row.getRecruitWeight());
            if (pick < acc) {
                return row;
            }
        }
        return pool.get(pool.size() - 1);
    }
}
