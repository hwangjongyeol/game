# 03. Spring Boot API 설계

## 패키지 구조
```text
com.hwang.game
  |- common
  |   |- response
  |   |- exception
  |- player
  |   |- controller
  |   |- service
  |   |- repository
  |   |- dto
  |- economy
  |- battle
  |- reward
  |- ranking
```

## 공통 규칙
- Base Path: `/api/v1`
- 응답 포맷: `ApiResponse<T>`
- Validation 실패: `400 VALIDATION_ERROR`
- 비즈니스 오류: `GameException(code, message)`

## 주요 엔드포인트

### Player
- `POST /api/v1/players`
- `GET /api/v1/players/{id}`
- `GET /api/v1/players`

### Economy
- `GET /api/v1/wallets/{userId}`
- `POST /api/v1/economy/earn`
- `POST /api/v1/economy/spend`

### Idle Reward
- `POST /api/v1/rewards/offline/claim`
  - 입력: `userId`, `clientLastSeenAt`
  - 처리: 서버 기준 마지막 로그아웃 시각과 비교 후 보상 산출

### PvP Simulation
- `POST /api/v1/pvp/simulate`
  - 입력: `attackerUserId`, `defenderUserId`, `seed(optional)`
  - 출력: 승패, 로그 요약, 점수 변화

### Ranking
- `GET /api/v1/rankings?seasonId={id}&limit=100`
- `GET /api/v1/rankings/me?seasonId={id}&userId={id}`
- `POST /api/v1/rankings/score`

### Item
- `POST /api/v1/items/loot`
- `GET /api/v1/items/{userId}`
- `GET /api/v1/items/catalog`
- `GET /api/v1/items/catalog/{itemId}`
- `GET /api/v1/items/drop-table/{monsterId}`
- `POST /api/v1/items/consume`
- `GET /api/v1/items/equipment/{userId}`
- `POST /api/v1/items/equipment`
- `POST /api/v1/items/upgrade`
- `GET /api/v1/items/equipment/presets/{userId}`
- `POST /api/v1/items/equipment/presets`
- `POST /api/v1/items/equipment/presets/apply`

### Companion
- `GET /api/v1/companions/masters`
- `GET /api/v1/companions/{userId}`
- `GET /api/v1/companions/{userId}/party`
- `POST /api/v1/companions/recruit`
- `POST /api/v1/companions/assign`
- `POST /api/v1/companions/fuse`

### Daily Quest
- `GET /api/v1/daily-quests/{userId}`
- `POST /api/v1/daily-quests/progress`
- `POST /api/v1/daily-quests/claim`

`/progress` 요청 필드:
- `dungeonKillDelta`
- `goldEarnedDelta`
- `statUpgradeDelta`

### Dungeon Progress
- `GET /api/v1/dungeons/{dungeonId}/progress/{userId}`
- `POST /api/v1/dungeons/{dungeonId}/progress`

### Admin
- `GET /api/v1/admin/players`
- `PUT /api/v1/admin/players/{userId}`
- `DELETE /api/v1/admin/players/{userId}`
- `GET /api/v1/admin/players/{userId}/stats`
- `PUT /api/v1/admin/players/{userId}/stats`
- `PUT /api/v1/admin/players/{userId}/equipment`
- `GET /api/v1/admin/items`
- `POST /api/v1/admin/items`
- `PUT /api/v1/admin/items/{itemId}`
- `DELETE /api/v1/admin/items/{itemId}`
- `GET /api/v1/admin/monsters`
- `POST /api/v1/admin/monsters`
- `PUT /api/v1/admin/monsters/{monsterId}`
- `DELETE /api/v1/admin/monsters/{monsterId}`
- `GET /api/v1/admin/monsters/{monsterId}/drops`
- `POST /api/v1/admin/monster-drops`
- `PUT /api/v1/admin/monster-drops/{dropId}`
- `DELETE /api/v1/admin/monster-drops/{dropId}`
- `GET /api/v1/admin/waves/{dungeonId}`
- `POST /api/v1/admin/waves`
- `PUT /api/v1/admin/waves/{waveSettingId}`
- `DELETE /api/v1/admin/waves/{waveSettingId}`
- `GET /api/v1/admin/companions/masters`
- `POST /api/v1/admin/companions/masters`
- `PUT /api/v1/admin/companions/masters/{companionId}`
- `DELETE /api/v1/admin/companions/masters/{companionId}`
- `GET /api/v1/admin/companions/users/{userId}`
- `PUT /api/v1/admin/companions/users/{userCompanionId}`

## 샘플 요청/응답

### POST `/api/v1/rewards/offline/claim`
```json
{
  "userId": 101,
  "clientLastSeenAt": "2026-02-14T08:10:00Z"
}
```

```json
{
  "success": true,
  "data": {
    "userId": 101,
    "offlineSeconds": 3600,
    "goldReward": 720,
    "expReward": 180,
    "capped": false
  },
  "error": null
}
```

## 에러 코드 제안
- `PLAYER_NOT_FOUND`
- `INSUFFICIENT_CURRENCY`
- `INVALID_REWARD_CLAIM`
- `PVP_TARGET_NOT_FOUND`
- `RANKING_SEASON_NOT_FOUND`
- `INTERNAL_SERVER_ERROR`

## 확장 포인트
- Repository 인터페이스 유지 후 JPA/Redis 구현 전환
- 도메인별 트랜잭션 분리 (`@Transactional`)
- OpenAPI(Swagger) 자동 문서화 추가
