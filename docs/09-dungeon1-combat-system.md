# 09. Dungeon 1 전투 시스템

## 범위
- Phaser 기준 던전1 실전투 루프
- 몬스터 웨이브 3종
- 캐릭터 클래스/스킬트리
- 전투 보상 API 연동

## 1) 몬스터 웨이브
- Wave 1: Green Slime
- Wave 2: Goblin Guard
- Wave 3: Skeleton Warrior
- 3종 처치 후 루프 카운트 증가하며 재시작
- 웨이브당 다중 몬스터 출현
  - `2 + floor((wave - 1) / 6)` 마리 (최대 6마리)
  - 같은 웨이브에서 몬스터를 연속 처치하면 다음 개체가 즉시 등장
  - 웨이브의 마지막 몬스터 처치 시에만 다음 웨이브로 진행
- 던전 테마 배경:
  - 10웨이브 단위로 `Dungeon 1..10` 배경 교체
  - Wave 100 이후 다시 `Dungeon 1`부터 순환

## 2) 캐릭터 클래스
- Knight: 고체력/방어
- Mage: 고MP/고화력
- Ranger: 균형형 + 높은 치명 확률
- 렌더링: 도형 기반 캐릭터 아바타(머리/몸통/무기) + 자동 이동/타격 모션
- 몬스터도 캐릭터형 아바타로 렌더링(몸통/머리/팔 모션)

## 3) 스킬트리
- 클래스별 2개 노드
- 레벨 조건 + 스킬포인트 소모
- 키 입력 `1`, `2`로 해금

## 4) 전투 규칙
- 기본 공격: 자동 (1.0초 주기)
- 클래스 액티브 스킬: 자동 (클래스별 쿨다운/효과, MP 소모)
- 몬스터 자동공격: 1.8초 주기
- 몬스터 스탯 스케일링:
  - 웨이브/던전 티어/같은 웨이브 내 등장 순서에 따라 HP/ATK/DEF 증가
  - 초기 웨이브 대비 후반 웨이브 체감 난이도 상승
- 웨이브 클리어 시: HP/MP 전량 회복 후 다음 웨이브 진입
- `Wave 고정` 모드:
  - 웨이브 클리어 후 다음 웨이브로 가지 않고 현재 웨이브 재전투
  - 클리어 시마다 HP/MP는 항상 전량 회복
- 사망 시: 현재 웨이브 유지, `R`로 같은 웨이브 재전투
- 속도 변경: UI 버튼 `X1 / X2 / X3` (재접속 후에도 마지막 속도 유지)

### 클래스별 액티브 스킬
- Knight `Shield Break`
  - 방어 관통(적 DEF 감소 적용) 단일 강타
- Mage `Arc Burst`
  - 첫 타격 + 에코 타격(추가타) 2연타
- Ranger `Rapid Shot`
  - 타격 피해 일부 흡혈(HP 회복)

## 5) 드롭/보상 처리
- 몬스터 처치 시
  - 골드/보석 보상
  - 경험치 획득
  - 드롭 테이블 확률 판정
  - 인벤토리 반영(클라이언트 상태 + 서버 동기화)

### 아이템 효과 (던전 내 즉시/패시브)
- `Slime Gel`: 즉시 HP 회복
- `Minor Potion`: 즉시 HP/MP 회복
- `Rusty Dagger`: 영구 ATK 증가
- `Goblin Coin`: 3개당 영구 DEF 증가
- `Bone Fragment`: 영구 MaxHP 증가
- `Ancient Core`: 영구 MaxMP/ATK 증가
- 재입장 시 `user_items` 인벤토리 수량 기반으로 패시브 효과 재적용

### 장착 시스템 (인벤토리 탭)
- 슬롯: `weapon`, `armor`, `accessory`
- 장착 가능 아이템:
  - `Flame Sword` (ATK +14)
  - `Rusty Dagger` (ATK +6)
  - `Iron Helm` (HP +70 / DEF +3)
  - `Guardian Charm` (DEF +5 / HP +20)
  - `Hunter Ring` (ATK +6 / MP +35)
- 장착/해제는 인벤토리 탭에서 즉시 전투 스탯에 반영
- 인벤토리 탭 진입/복귀 시 전투 씬은 초기화되지 않음(언마운트 방지)
- 장착 화면 별도 탭 제공 + 프리셋 저장/적용 지원
- 장비 강화(`+N`) 지원, 강화 비용: `150 * (다음레벨^2)` 골드

### 세트 효과
- Fortress Set (`Flame Sword`, `Iron Helm`, `Guardian Charm`)
  - 2세트: HP +80 / DEF +4
  - 3세트: HP +140 / ATK +10 / DEF +4
- Hunter Set (`Rusty Dagger`, `Hunter Ring`)
  - 2세트: ATK +8 / MP +30

### 드롭 분리 규칙
- 일반 드롭(`drops`): 재료/소모 아이템 위주
- 장비 드롭(`equipmentDrops`): 장착 아이템 전용 테이블
- 장비 드롭은 전투당 최대 1개 당첨

### 캐릭터/몬스터 이미지
- 실제 SVG 캐릭터 이미지 리소스 사용
  - 경로: `frontend/public/characters/`

## 6) API 연동
- 골드 반영: `POST /api/v1/economy/earn`
  - `reasonCode = DUNGEON_CLEAR`
- 랭킹 점수: `POST /api/v1/rankings/score`
  - `seasonId = DUNGEON1`
- 드롭 아이템 반영: `POST /api/v1/items/loot`
  - `items[] = { itemId, itemName, quantity }`
- 캐릭터 스탯 조회/업그레이드
  - `GET /api/v1/characters/{userId}`
  - `POST /api/v1/characters/upgrade`
  - UI에서 `X1 / X10 / X100` 배수 반복 업그레이드 지원
- 동료 시스템
  - `GET /api/v1/companions/masters`
  - `GET /api/v1/companions/{userId}`
  - `GET /api/v1/companions/{userId}/party`
  - `POST /api/v1/companions/recruit`
  - `POST /api/v1/companions/assign`
  - `POST /api/v1/companions/fuse`
  - 동료 설정 화면은 체크박스 기반 편성(최대 5명)이며, 체크된 동료는 목록 상단에 정렬

## 7) DB 영향
- 사용 테이블
  - `economy_transactions` (골드 보상 이력)
  - `ranking_snapshots` (던전 점수)
  - `user_items` (드롭 아이템 인벤토리)
  - `user_character_stats` (스탯 업그레이드)
  - `companion_masters` (동료 마스터)
  - `user_companions` (유저 동료 보유/편성)
