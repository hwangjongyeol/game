# 09. Admin API

관리자 화면에서 게임 데이터를 조정하기 위한 API입니다.

## 1) 캐릭터 관리
- `GET /api/v1/admin/players`
- `PUT /api/v1/admin/players/{userId}`
- `DELETE /api/v1/admin/players/{userId}` (소프트 삭제)

## 2) 캐릭터 능력치 관리
- `GET /api/v1/admin/players/{userId}/stats`
- `PUT /api/v1/admin/players/{userId}/stats`

## 3) 장비 강제 설정
- `PUT /api/v1/admin/players/{userId}/equipment`

요청 예시:
```json
{
  "weaponItemId": "flame-sword",
  "armorItemId": "iron-helm",
  "accessoryItemId": "hunter-ring"
}
```

## 4) 아이템 마스터 관리
- `GET /api/v1/admin/items`
- `POST /api/v1/admin/items`
- `PUT /api/v1/admin/items/{itemId}`
- `DELETE /api/v1/admin/items/{itemId}` (비활성화)

주요 관리 필드:
- `attackBonus`, `defenseBonus`, `hpBonus`, `mpBonus`
- `upgradeGoldBase`, `upgradeAttackStep`, `upgradeDefenseStep`, `upgradeHpStep`, `upgradeMpStep`
- `requiredClassId` (`knight`/`mage`/`ranger`, null 가능)

## 5) 몬스터 마스터 관리
- `GET /api/v1/admin/monsters`
- `POST /api/v1/admin/monsters`
- `PUT /api/v1/admin/monsters/{monsterId}`
- `DELETE /api/v1/admin/monsters/{monsterId}` (비활성화)

## 6) 몬스터 드랍 테이블 관리
- `GET /api/v1/admin/monsters/{monsterId}/drops`
- `POST /api/v1/admin/monster-drops`
- `PUT /api/v1/admin/monster-drops/{dropId}`
- `DELETE /api/v1/admin/monster-drops/{dropId}`

## 7) 웨이브 설정 관리
- `GET /api/v1/admin/waves/{dungeonId}`
- `POST /api/v1/admin/waves`
- `PUT /api/v1/admin/waves/{waveSettingId}`
- `DELETE /api/v1/admin/waves/{waveSettingId}`

요청 예시:
```json
{
  "dungeonId": "dungeon1",
  "waveNo": 12,
  "monsterId": "skeleton-warrior",
  "monsterCount": 4,
  "hpMultiplier": 1.25,
  "mpMultiplier": 1.1,
  "attackMultiplier": 1.2,
  "defenseMultiplier": 1.15,
  "rewardGoldMultiplier": 1.3,
  "rewardGemMultiplier": 1.1,
  "active": true
}
```

## 8) 동료 마스터 관리
- `GET /api/v1/admin/companions/masters`
- `POST /api/v1/admin/companions/masters`
- `PUT /api/v1/admin/companions/masters/{companionId}`
- `DELETE /api/v1/admin/companions/masters/{companionId}` (비활성화)

요청 예시:
```json
{
  "companionId": "mage-s7",
  "companionName": "Arc Nova",
  "grade": "EPIC",
  "classId": "mage",
  "baseAttack": 24,
  "baseDefense": 7,
  "baseHp": 110,
  "baseMp": 56,
  "imageUrl": "/companions/mage-s7.png",
  "recruitWeight": 40,
  "active": true
}
```

## 9) 유저 동료 관리
- `GET /api/v1/admin/companions/users/{userId}`
- `PUT /api/v1/admin/companions/users/{userCompanionId}`

요청 예시:
```json
{
  "level": 3,
  "copies": 5,
  "slotNo": 2
}
```
