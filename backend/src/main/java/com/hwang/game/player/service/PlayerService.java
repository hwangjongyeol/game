package com.hwang.game.player.service;

import com.hwang.game.account.repository.AccountRepository;
import com.hwang.game.character.entity.UserCharacterStatEntity;
import com.hwang.game.character.repository.UserCharacterStatRepository;
import com.hwang.game.common.exception.GameException;
import com.hwang.game.economy.entity.WalletEntity;
import com.hwang.game.economy.repository.WalletRepository;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.model.Player;
import com.hwang.game.player.repository.PlayerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class PlayerService {
    private static final long MAX_CHARACTER_COUNT_PER_ACCOUNT = 5L;

    private final AccountRepository accountRepository;
    private final PlayerRepository playerRepository;
    private final WalletRepository walletRepository;
    private final UserCharacterStatRepository userCharacterStatRepository;

    public PlayerService(
            AccountRepository accountRepository,
            PlayerRepository playerRepository,
            WalletRepository walletRepository,
            UserCharacterStatRepository userCharacterStatRepository
    ) {
        this.accountRepository = accountRepository;
        this.playerRepository = playerRepository;
        this.walletRepository = walletRepository;
        this.userCharacterStatRepository = userCharacterStatRepository;
    }

    @Transactional
    public Player createPlayer(long accountId, String nickname, String classId) {
        if (!accountRepository.existsById(accountId)) {
            throw new GameException("ACCOUNT_NOT_FOUND", "Account not found. id=" + accountId);
        }

        long activeCharacterCount = playerRepository.countByAccountIdAndDeletedFalse(accountId);
        if (activeCharacterCount >= MAX_CHARACTER_COUNT_PER_ACCOUNT) {
            throw new GameException("CHARACTER_LIMIT_EXCEEDED", "Account can own up to 5 active characters");
        }

        UserEntity savedUser = playerRepository.save(new UserEntity(UUID.randomUUID().toString(), accountId, nickname, normalizeClassId(classId)));
        WalletEntity savedWallet = walletRepository.save(new WalletEntity(savedUser.getId()));
        userCharacterStatRepository.save(new UserCharacterStatEntity(savedUser.getId()));
        return toPlayer(savedUser, savedWallet.getGold());
    }

    @Transactional(readOnly = true)
    public Player getPlayer(long id) {
        UserEntity user = playerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new GameException("PLAYER_NOT_FOUND", "Player not found. id=" + id));
        long gold = walletRepository.findById(user.getId()).map(WalletEntity::getGold).orElse(0L);
        return toPlayer(user, gold);
    }

    @Transactional(readOnly = true)
    public List<Player> getPlayers() {
        return playerRepository.findAllByDeletedFalse().stream()
                .map(user -> {
                    long gold = walletRepository.findById(user.getId()).map(WalletEntity::getGold).orElse(0L);
                    return toPlayer(user, gold);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Player> getPlayersByAccount(long accountId) {
        return playerRepository.findAllByAccountIdAndDeletedFalse(accountId).stream()
                .map(user -> {
                    long gold = walletRepository.findById(user.getId()).map(WalletEntity::getGold).orElse(0L);
                    return toPlayer(user, gold);
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public UserEntity getUserEntity(long id) {
        return playerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new GameException("PLAYER_NOT_FOUND", "Player not found. id=" + id));
    }

    @Transactional
    public void softDeletePlayer(long accountId, long playerId) {
        UserEntity user = playerRepository.findByIdAndDeletedFalse(playerId)
                .orElseThrow(() -> new GameException("PLAYER_NOT_FOUND", "Player not found. id=" + playerId));

        if (!user.getAccountId().equals(accountId)) {
            throw new GameException("PLAYER_FORBIDDEN", "Character does not belong to account. accountId=" + accountId);
        }

        user.softDelete();
        playerRepository.save(user);
    }

    private Player toPlayer(UserEntity user, long gold) {
        return new Player(user.getId(), user.getAccountId(), user.getNickname(), normalizeClassId(user.getClassId()), user.getLevel(), gold);
    }

    private String normalizeClassId(String classId) {
        if (classId == null) {
            throw new GameException("INVALID_CLASS_ID", "Invalid classId. allowed: knight, mage, ranger");
        }

        String normalized = classId.trim().toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "knight", "warrior", "fighter", "전사" -> "knight";
            case "mage", "wizard", "sorcerer", "마법사" -> "mage";
            case "ranger", "archer", "궁수" -> "ranger";
            default -> throw new GameException("INVALID_CLASS_ID", "Invalid classId. allowed: knight, mage, ranger");
        };
    }
}
