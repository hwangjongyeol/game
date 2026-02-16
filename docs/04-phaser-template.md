# 04. Phaser 기본 게임 템플릿

## 목표
- React에서 Phaser 게임 인스턴스를 안전하게 mount/unmount
- 최소 Scene 2개(Boot, Main)로 확장 가능 구조 확보

## 디렉터리 제안
```text
frontend/
  src/
    game/
      EventBus.ts
      main.ts
      config.ts
      scenes/
        BootScene.ts
        MainScene.ts
      GameContainer.tsx
```

## `config.ts`
```ts
import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { MainScene } from './scenes/MainScene';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  parent: 'game-root',
  backgroundColor: '#1c2230',
  scene: [BootScene, MainScene],
  physics: { default: 'arcade', arcade: { debug: false } },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }
};
```

## `GameApp.tsx`
```tsx
import { useEffect } from 'react';
import Phaser from 'phaser';
import { gameConfig } from './config';

export default function GameApp() {
  useEffect(() => {
    const game = new Phaser.Game(gameConfig);
    return () => game.destroy(true);
  }, []);

  return <div id="game-root" style={{ width: '100%', height: '100vh' }} />;
}
```

## Scene 규칙
- BootScene: 리소스 preload + 초기 데이터 요청
- MainScene: 전투/성장 UI 렌더링
- 서버 동기화는 Scene 내부 직접 호출보다 별도 API 모듈 사용

## 현재 적용된 템플릿 포인트
- `EventBus` (`frontend/src/game/EventBus.ts`): Scene 준비 이벤트 전달
- `StartGame` (`frontend/src/game/main.ts`): Phaser 인스턴스 시작/재시작 단일 진입점
- `MainScene`에서 `current-scene-ready` 이벤트 발행

## rex-plugins 적용 방식
- `frontend/src/game/config.ts`에서 `phaser3-rex-plugins/templates/ui/ui-plugin.js`를 import하여 `rexUI` Scene Plugin으로 등록
- `frontend/src/game/scenes/MainScene.ts`에서 `rexUI`가 있을 때 `RexUI HUD Active` 라벨 렌더링
- 패키지: `phaser3-rex-plugins`
