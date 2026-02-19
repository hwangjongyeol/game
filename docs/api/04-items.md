# 04. Item API

## 1) 아이템 카탈로그 조회
- `GET /api/v1/items/catalog`

응답:
- `ItemMasterResponse[]`
- 포함 필드:
  - `itemId`, `itemName`, `itemType`, `equipSlot`, `requiredClassId`
  - `quality`, `attackBonus`, `defenseBonus`, `hpBonus`, `mpBonus`
  - `upgradeGoldBase`, `upgradeAttackStep`, `upgradeDefenseStep`, `upgradeHpStep`, `upgradeMpStep`
  - `imageUrl`, `description`, `active`

## 2) 단일 아이템 마스터 조회
- `GET /api/v1/items/catalog/{itemId}`

## 3) 몬스터 드랍 테이블 조회
- `GET /api/v1/items/drop-table/{monsterId}`

응답:
- `MonsterDropResponse[]`
- 포함 필드:
  - `monsterId`, `itemId`, `dropChance`, `minQuantity`, `maxQuantity`, `equipmentDrop`

## 4) 드롭 아이템 적재
- `POST /api/v1/items/loot`

요청:
```json
{
  "userId": 1,
  "items": [
    { "itemId": "slime-gel", "itemName": "Slime Gel", "quantity": 1 },
    { "itemId": "minor-potion", "itemName": "Minor Potion", "quantity": 1 }
  ]
}
```

응답:
```json
{
  "success": true,
  "data": [
    {
      "userId": 1,
      "itemId": "slime-gel",
      "itemName": "Slime Gel",
      "quantity": 3,
      "updatedAt": "2026-02-14T18:35:00"
    }
  ],
  "error": null
}
```

규칙:
- 동일 `userId + itemId`는 수량 누적
- `quantity`는 1 이상
- `itemId`는 `item_masters`의 활성 아이템이어야 함

## 5) 인벤토리 조회
- `GET /api/v1/items/{userId}`

응답: `UserItemResponse[]`
 - `UserItemResponse` 필드:
   - `upgradeLevel`
   - `quality` (NORMAL/RARE/EPIC/LEGEND)
   - `attackBonus`, `defenseBonus`, `hpBonus`, `mpBonus`

## 6) 소모 아이템 사용
- `POST /api/v1/items/consume`

요청:
```json
{
  "userId": 1,
  "itemId": "minor-potion",
  "quantity": 1
}
```

규칙:
- `item_masters.item_type = CONSUMABLE`인 경우만 사용 가능
- 수량 부족 시 `INSUFFICIENT_ITEM_QUANTITY`

## 7) 장착 조회
- `GET /api/v1/items/equipment/{userId}`

응답 필드:
- `weaponItemId`
- `armorItemId`
- `accessoryItemId`

## 8) 장착 변경
- `POST /api/v1/items/equipment`

규칙:
- 아이템에 `requiredClassId`가 설정되어 있으면 해당 직업 캐릭터만 장착 가능
- 불일치 시 `ITEM_CLASS_RESTRICTED`

요청:
```json
{
  "userId": 1,
  "slot": "weapon",
  "itemId": "flame-sword"
}
```

## 9) 장비 아이템 강화
- `POST /api/v1/items/upgrade`

요청:
```json
{
  "userId": 1,
  "itemId": "flame-sword"
}
```

규칙:
- `item_masters.item_type = EQUIPMENT`인 아이템만 강화 가능
- 강화 비용(골드): `item_masters.upgrade_gold_base * (다음레벨^2)`
- 강화 시 `item_masters.upgrade_*_step` 값만큼 `user_items` 능력치 증가

## 10) 장착 프리셋 조회
- `GET /api/v1/items/equipment/presets/{userId}`

## 11) 장착 프리셋 저장
- `POST /api/v1/items/equipment/presets`

요청:
```json
{
  "userId": 1,
  "presetName": "보스용"
}
```

## 12) 장착 프리셋 적용
- `POST /api/v1/items/equipment/presets/apply`

요청:
```json
{
  "userId": 1,
  "presetName": "보스용"
}
```

규칙:
- 프리셋 적용 시 각 슬롯(weapon/armor/accessory)은 `POST /api/v1/items/equipment`와 동일한 서버 검증을 수행
- 검증 항목:
  - 활성 장비 아이템 여부 (`ITEM_NOT_EQUIPPABLE`)
  - 슬롯 일치 여부 (`EQUIP_SLOT_MISMATCH`)
  - 직업 제한 일치 여부 (`ITEM_CLASS_RESTRICTED`)
  - 소유/수량 유효성 (`ITEM_NOT_FOUND`, `INSUFFICIENT_ITEM_QUANTITY`)

장착 해제:
```json
{
  "userId": 1,
  "slot": "weapon",
  "itemId": null
}
```
