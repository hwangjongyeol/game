# 05. Character API

## 1) 캐릭터 스탯 조회
- `GET /api/v1/characters/{userId}`

응답:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "attack": 20,
    "defense": 10,
    "maxHp": 200,
    "maxMp": 80,
    "attackLevel": 1,
    "defenseLevel": 1,
    "hpLevel": 1,
    "mpLevel": 1,
    "nextAttackGoldCost": 100,
    "nextDefenseGoldCost": 90,
    "nextHpGemCost": 5,
    "nextMpGemCost": 5
  },
  "error": null
}
```

## 2) 캐릭터 스탯 업그레이드
- `POST /api/v1/characters/upgrade`

요청:
```json
{
  "userId": 1,
  "statType": "ATTACK"
}
```

`statType`:
- `ATTACK` (Gold 사용)
- `DEFENSE` (Gold 사용)
- `MAX_HP` (Gem 사용)
- `MAX_MP` (Gem 사용)

응답: `CharacterStatResponse`

오류:
- 잔액 부족 시 `INSUFFICIENT_CURRENCY`
- 잘못된 입력은 `VALIDATION_ERROR`
