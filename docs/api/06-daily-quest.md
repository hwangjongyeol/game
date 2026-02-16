# 06. Daily Quest API

## 1) 데일리 퀘스트 상태 조회
- `GET /api/v1/daily-quests/{userId}`

응답 주요 필드:
- `dungeonKillCount / targetKillCount`
- `goldEarned / targetGoldEarned`
- `statUpgradeCount / targetStatUpgradeCount`
- `claimable`, `claimed`

## 1-1) 데일리 퀘스트 목록 조회 (10개 단일 목표)
- `GET /api/v1/daily-quests/list/{userId}`

응답:
- `quests[]` 길이 10
- 각 퀘스트는 단일 목표만 가짐 (`KILL` 또는 `GOLD` 또는 `UPGRADE`)
- 필드: `questCode`, `title`, `progress`, `target`, `claimable`, `claimed`, `rewardGold`, `rewardGem`

## 2) 데일리 퀘스트 진행도 증가
- `POST /api/v1/daily-quests/progress`

요청:
```json
{
  "userId": 1,
  "dungeonKillDelta": 1,
  "goldEarnedDelta": 95,
  "statUpgradeDelta": 0
}
```

규칙:
- 3개 delta 중 최소 1개는 0보다 커야 함

## 3) 데일리 퀘스트 보상 수령
- `POST /api/v1/daily-quests/claim`

요청:
```json
{
  "userId": 1
}
```

목표(현재):
- 처치 10회
- 골드 획득 1000
- 강화 3회

보상(현재):
- Gold 400
- Gem 15

오류:
- 이미 수령: `DAILY_QUEST_ALREADY_CLAIMED`
- 미완료: `DAILY_QUEST_NOT_COMPLETED`

## 4) 개별 퀘스트 보상 수령
- `POST /api/v1/daily-quests/claim-one`

요청:
```json
{
  "userId": 1,
  "questCode": "KILL_10"
}
```

규칙:
- 각 퀘스트는 하루 1회만 수령 가능
- 완료한 퀘스트만 수령 가능
