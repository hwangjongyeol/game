# 02. Economy & Reward API

## 1) 지갑 조회
- `GET /api/v1/wallets/{userId}`

응답:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "gold": 100,
    "gem": 10,
    "energy": 95,
    "updatedAt": "2026-02-14T17:20:00"
  },
  "error": null
}
```

## 2) 재화 획득
- `POST /api/v1/economy/earn`

요청:
```json
{
  "userId": 1,
  "currencyType": "GOLD",
  "amount": 500,
  "reasonCode": "QUEST_REWARD",
  "referenceId": "quest-1001"
}
```

응답: `WalletResponse`

던전 연동 예시:
- `reasonCode`: `DUNGEON_CLEAR`
- `currencyType`: `GOLD`
- `referenceId`: `monsterId-timestamp`

## 3) 재화 소모
- `POST /api/v1/economy/spend`

요청:
```json
{
  "userId": 1,
  "currencyType": "GEM",
  "amount": 5,
  "reasonCode": "SHOP_PURCHASE",
  "referenceId": "pkg-2001"
}
```

응답: `WalletResponse`

오류:
- 잔액 부족 시 `INSUFFICIENT_CURRENCY`

## 4) 오프라인 보상 수령
- `POST /api/v1/rewards/offline/claim`

요청:
```json
{
  "userId": 1,
  "clientLastSeenAt": "2026-02-14T08:10:00Z"
}
```

응답:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "offlineSeconds": 3600,
    "goldReward": 720,
    "expReward": 180,
    "capped": false
  },
  "error": null
}
```

규칙:
- 서버 시간 기준 계산
- 최대 누적 시간 cap 적용
- 미래 시간 요청은 `INVALID_REWARD_CLAIM`
