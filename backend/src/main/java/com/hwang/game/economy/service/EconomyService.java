package com.hwang.game.economy.service;

import com.hwang.game.common.exception.GameException;
import com.hwang.game.economy.entity.EconomyTransactionEntity;
import com.hwang.game.economy.entity.WalletEntity;
import com.hwang.game.economy.model.CurrencyType;
import com.hwang.game.economy.repository.EconomyTransactionRepository;
import com.hwang.game.economy.repository.WalletRepository;
import com.hwang.game.player.service.PlayerService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EconomyService {
    private final WalletRepository walletRepository;
    private final EconomyTransactionRepository economyTransactionRepository;
    private final PlayerService playerService;

    public EconomyService(
            WalletRepository walletRepository,
            EconomyTransactionRepository economyTransactionRepository,
            PlayerService playerService
    ) {
        this.walletRepository = walletRepository;
        this.economyTransactionRepository = economyTransactionRepository;
        this.playerService = playerService;
    }

    @Transactional
    public WalletEntity getWallet(long userId) {
        playerService.getUserEntity(userId);
        return walletRepository.findById(userId).orElseGet(() -> walletRepository.save(new WalletEntity(userId)));
    }

    @Transactional
    public WalletEntity earn(long userId, CurrencyType currencyType, long amount, String reasonCode, String referenceId) {
        if (amount <= 0) {
            throw new GameException("INVALID_ECONOMY_AMOUNT", "amount must be positive");
        }

        playerService.getUserEntity(userId);
        WalletEntity wallet = walletRepository.findById(userId).orElseGet(() -> walletRepository.save(new WalletEntity(userId)));
        applyDelta(wallet, currencyType, amount);
        WalletEntity saved = walletRepository.save(wallet);

        saveTransaction(userId, currencyType, amount, reasonCode, referenceId, extractBalance(saved, currencyType));
        return saved;
    }

    @Transactional
    public WalletEntity spend(long userId, CurrencyType currencyType, long amount, String reasonCode, String referenceId) {
        if (amount <= 0) {
            throw new GameException("INVALID_ECONOMY_AMOUNT", "amount must be positive");
        }

        playerService.getUserEntity(userId);
        WalletEntity wallet = walletRepository.findById(userId).orElseGet(() -> walletRepository.save(new WalletEntity(userId)));
        long currentBalance = extractBalance(wallet, currencyType);
        if (currentBalance < amount) {
            throw new GameException("INSUFFICIENT_CURRENCY", "Not enough balance");
        }

        applyDelta(wallet, currencyType, -amount);
        WalletEntity saved = walletRepository.save(wallet);

        saveTransaction(userId, currencyType, -amount, reasonCode, referenceId, extractBalance(saved, currencyType));
        return saved;
    }

    private void applyDelta(WalletEntity wallet, CurrencyType currencyType, long delta) {
        switch (currencyType) {
            case GOLD -> wallet.setGold(wallet.getGold() + delta);
            case GEM -> wallet.setGem(wallet.getGem() + delta);
            case ENERGY -> {
                long nextEnergy = wallet.getEnergy() + delta;
                if (nextEnergy < 0 || nextEnergy > Integer.MAX_VALUE) {
                    throw new GameException("INVALID_ENERGY_BALANCE", "Invalid energy range");
                }
                wallet.setEnergy((int) nextEnergy);
            }
        }
    }

    private long extractBalance(WalletEntity wallet, CurrencyType currencyType) {
        return switch (currencyType) {
            case GOLD -> wallet.getGold();
            case GEM -> wallet.getGem();
            case ENERGY -> wallet.getEnergy();
        };
    }

    private void saveTransaction(
            long userId,
            CurrencyType currencyType,
            long amount,
            String reasonCode,
            String referenceId,
            long balanceAfter
    ) {
        economyTransactionRepository.save(
                new EconomyTransactionEntity(userId, currencyType, amount, reasonCode, referenceId, balanceAfter)
        );
    }
}
