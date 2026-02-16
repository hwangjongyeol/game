package com.hwang.game.player;

import com.hwang.game.account.repository.AccountRepository;
import com.hwang.game.character.repository.UserCharacterStatRepository;
import com.hwang.game.common.exception.GameException;
import com.hwang.game.economy.entity.WalletEntity;
import com.hwang.game.economy.repository.WalletRepository;
import com.hwang.game.player.entity.UserEntity;
import com.hwang.game.player.repository.PlayerRepository;
import com.hwang.game.player.service.PlayerService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.lang.reflect.Field;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PlayerServiceTest {

    @Mock
    private AccountRepository accountRepository;

    @Mock
    private PlayerRepository playerRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private UserCharacterStatRepository userCharacterStatRepository;

    @InjectMocks
    private PlayerService playerService;

    @Test
    void createPlayer_mapsWizardToMage() {
        when(accountRepository.existsById(10L)).thenReturn(true);
        when(playerRepository.countByAccountIdAndDeletedFalse(10L)).thenReturn(0L);
        when(playerRepository.save(any(UserEntity.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 1L));
        when(walletRepository.save(any(WalletEntity.class))).thenReturn(new WalletEntity(1L));

        var created = playerService.createPlayer(10L, "mage-user", "wizard");

        assertThat(created.classId()).isEqualTo("mage");
    }

    @Test
    void createPlayer_mapsKoreanMageToMage() {
        when(accountRepository.existsById(10L)).thenReturn(true);
        when(playerRepository.countByAccountIdAndDeletedFalse(10L)).thenReturn(0L);
        when(playerRepository.save(any(UserEntity.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 1L));
        when(walletRepository.save(any(WalletEntity.class))).thenReturn(new WalletEntity(1L));

        var created = playerService.createPlayer(10L, "mage-user-kr", "마법사");

        assertThat(created.classId()).isEqualTo("mage");
    }

    @Test
    void createPlayer_rejectsUnknownClassId() {
        when(accountRepository.existsById(10L)).thenReturn(true);
        when(playerRepository.countByAccountIdAndDeletedFalse(10L)).thenReturn(0L);

        assertThatThrownBy(() -> playerService.createPlayer(10L, "invalid-user", "summoner"))
                .isInstanceOf(GameException.class)
                .hasMessageContaining("Invalid classId");
    }

    @Test
    void createPlayer_normalizesUppercaseAndWhitespace() {
        when(accountRepository.existsById(10L)).thenReturn(true);
        when(playerRepository.countByAccountIdAndDeletedFalse(10L)).thenReturn(0L);
        when(playerRepository.save(any(UserEntity.class))).thenAnswer(invocation -> withId(invocation.getArgument(0), 1L));
        when(walletRepository.save(any(WalletEntity.class))).thenReturn(new WalletEntity(1L));

        playerService.createPlayer(10L, "spaced-user", "  MAGE ");

        ArgumentCaptor<UserEntity> captor = ArgumentCaptor.forClass(UserEntity.class);
        org.mockito.Mockito.verify(playerRepository).save(captor.capture());
        assertThat(captor.getValue().getClassId()).isEqualTo("mage");
    }

    @Test
    void createPlayer_rejectsWhenAccountNotFound() {
        when(accountRepository.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> playerService.createPlayer(999L, "no-account-user", "mage"))
                .isInstanceOf(GameException.class)
                .hasMessageContaining("Account not found");
    }

    @Test
    void createPlayer_rejectsWhenCharacterLimitExceeded() {
        when(accountRepository.existsById(10L)).thenReturn(true);
        when(playerRepository.countByAccountIdAndDeletedFalse(10L)).thenReturn(5L);

        assertThatThrownBy(() -> playerService.createPlayer(10L, "limit-user", "mage"))
                .isInstanceOf(GameException.class)
                .hasMessageContaining("up to 5 active characters");
    }

    private UserEntity withId(UserEntity entity, long id) {
        try {
            Field field = UserEntity.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(entity, id);
            return entity;
        } catch (ReflectiveOperationException e) {
            throw new RuntimeException(e);
        }
    }
}
