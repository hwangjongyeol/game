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

## 3-1) 클래스 마스터 관리
- `GET /api/v1/admin/classes`
- `POST /api/v1/admin/classes`
- `PUT /api/v1/admin/classes/{classId}`
- `DELETE /api/v1/admin/classes/{classId}` (비활성화)

주요 관리 필드:
- `renderProfileJson` (nullable JSON 문자열)
  - 예: `{"spritePackKey":"warrior"}` 또는 `{"block":{"col":0,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[3,0]]}`

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
- `GET /api/v1/admin/items/{itemId}/upgrade-tiers`
- `POST /api/v1/admin/item-upgrade-tiers`
- `PUT /api/v1/admin/item-upgrade-tiers/{tierId}`
- `DELETE /api/v1/admin/item-upgrade-tiers/{tierId}`

주요 관리 필드:
- `attackBonus`, `defenseBonus`, `hpBonus`, `mpBonus`
- `upgradeGoldBase`, `upgradeAttackStep`, `upgradeDefenseStep`, `upgradeHpStep`, `upgradeMpStep`
- `requiredClassId` (클래스 마스터 기준 classId, null 가능)

## 5) 몬스터 마스터 관리
- `GET /api/v1/admin/monsters`
- `POST /api/v1/admin/monsters`
- `PUT /api/v1/admin/monsters/{monsterId}`
- `DELETE /api/v1/admin/monsters/{monsterId}` (비활성화)

주요 관리 필드:
- `renderProfileJson` (nullable JSON 문자열)
  - 예: `{"spritePackKey":"slime"}` 또는 `{"block":{"col":8,"row":4}}`

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

설명:
- `waveNo`는 패턴 웨이브 번호(1~100)입니다. (`1-1 ~ 10-10`)
- `slotNo`는 같은 웨이브 내 몬스터 슬롯 번호입니다. (웨이브별 n종 몬스터 구성)
- 실전 웨이브가 `11-1`이면 `1-1` 패턴(`waveNo=1`)을 재사용합니다.

요청 예시:
```json
{
  "dungeonId": "dungeon1",
  "waveNo": 12,
  "slotNo": 1,
  "monsterId": "skeleton-warrior",
  "monsterCount": 2,
  "hpMultiplier": 1.25,
  "mpMultiplier": 1.1,
  "attackMultiplier": 1.2,
  "defenseMultiplier": 1.15,
  "rewardGoldMultiplier": 1.3,
  "rewardGemMultiplier": 1.1,
  "active": true
}
```

## 8) 웨이브 그룹(첫번째 숫자) 배수 관리
- `GET /api/v1/admin/wave-groups/{dungeonId}`
- `POST /api/v1/admin/wave-groups`
- `PUT /api/v1/admin/wave-groups/{waveGroupScalingId}`
- `DELETE /api/v1/admin/wave-groups/{waveGroupScalingId}`

요청 예시:
```json
{
  "dungeonId": "dungeon1",
  "waveGroupNo": 11,
  "hpMultiplier": 1.8,
  "mpMultiplier": 1.2,
  "attackMultiplier": 1.6,
  "defenseMultiplier": 1.4,
  "rewardGoldMultiplier": 1.5,
  "rewardGemMultiplier": 1.3,
  "backgroundImagePath": "/dungeons/dungeon-3.png",
  "active": true
}
```

## 9) 동료 마스터 관리
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
  "renderProfileJson": "{\"spritePackKey\":\"mage\"}",
  "recruitWeight": 40,
  "active": true
}
```

## 10) 유저 동료 관리
- `GET /api/v1/admin/companions/users/{userId}`
- `PUT /api/v1/admin/companions/users/{userCompanionId}`

## 밸런스 프로필
- `GET /api/v1/admin/balance-profiles`
- `POST /api/v1/admin/balance-profiles`
- `PUT /api/v1/admin/balance-profiles/{profileId}`
- `DELETE /api/v1/admin/balance-profiles/{profileId}`

## 런타임 밸런스 조회
- `GET /api/v1/balance/runtime`

## 공개 클래스 조회
- `GET /api/v1/classes`
- 응답 필드에 `renderProfileJson` 포함

## 공개 웨이브 런타임 조회
- `GET /api/v1/waves/runtime/{dungeonId}`
- 응답: 100개 패턴(`1-1~10-10`) + 웨이브 그룹 배수 목록
- 각 웨이브 엔트리에 `monsterRenderProfileJson` 포함

요청 예시:
```json
{
  "level": 3,
  "copies": 5,
  "slotNo": 2
}
```
