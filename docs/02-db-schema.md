# 02. DB 스키마 (계정/유저/경제/랭킹/인벤토리/캐릭터스탯/데일리퀘스트/던전진행도/장착/프리셋/아이템마스터/몬스터/몬스터드랍/웨이브설정/동료)

> 최신 단일 스키마 SQL: `docs/sql/00_latest_schema.sql`

## 설계 원칙
- 플레이어 상태와 경제 트랜잭션을 분리
- 잔액(balance)은 조회 최적화, 변동 이력은 transaction으로 감사 가능
- 랭킹은 Redis를 실시간 소스로 사용하고 DB로 스냅샷 보관

## 핵심 테이블

### 1) `accounts`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 계정 ID |
| login_id | VARCHAR(50) | UK | 로그인 ID |
| password_hash | VARCHAR(100) | NOT NULL | 암호화 비밀번호 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 2) `account_social_links`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 링크 ID |
| account_id | BIGINT | FK(accounts.id) | 계정 |
| provider | VARCHAR(30) | NOT NULL | 연동 제공자 |
| provider_user_id | VARCHAR(100) | NOT NULL | 제공자 사용자 식별자 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 3) `users` (캐릭터)
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 내부 유저 ID |
| external_id | VARCHAR(100) | UK | 소셜/게스트 외부 식별자 |
| account_id | BIGINT | INDEX/FK(accounts.id) | 소유 계정 |
| nickname | VARCHAR(30) | INDEX | 표시명 |
| class_id | VARCHAR(20) | NOT NULL | 캐릭터 클래스 |
| level | INT | NOT NULL | 현재 레벨 |
| exp | BIGINT | NOT NULL | 누적 경험치 |
| power_score | BIGINT | NOT NULL | 전투력 지표 |
| last_logout_at | DATETIME | NULL | 마지막 오프라인 계산 기준 |
| is_deleted | TINYINT(1) | NOT NULL | 소프트 삭제 여부 |
| deleted_at | DATETIME | NULL | 소프트 삭제 시각 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 3-1) `character_class_masters`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| class_id | VARCHAR(20) | PK | 클래스 코드 |
| class_name | VARCHAR(60) | NOT NULL | 클래스 이름 |
| base_attack | INT | NOT NULL | 기본 공격 |
| base_defense | INT | NOT NULL | 기본 방어 |
| base_hp | INT | NOT NULL | 기본 HP |
| base_mp | INT | NOT NULL | 기본 MP |
| render_profile_json | LONGTEXT | NULL | 렌더/애니메이션 프로필 JSON |
| is_active | TINYINT(1) | INDEX | 사용 여부 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 4) `wallets`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| user_id | BIGINT | PK/FK(users.id) | 유저 |
| gold | BIGINT | NOT NULL | 골드 |
| gem | BIGINT | NOT NULL | 유료 재화 |
| energy | INT | NOT NULL | 행동력 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 5) `economy_transactions`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 트랜잭션 ID |
| user_id | BIGINT | INDEX/FK(users.id) | 유저 |
| currency_type | VARCHAR(20) | INDEX | GOLD/GEM/ENERGY |
| amount | BIGINT | NOT NULL | 증감 값 (+/-) |
| reason_code | VARCHAR(50) | INDEX | 보상/구매/소모 이유 |
| reference_id | VARCHAR(100) | NULL | 외부 연동 ID |
| balance_after | BIGINT | NOT NULL | 반영 후 잔액 |
| created_at | DATETIME | NOT NULL | 생성일 |

### 6) `ranking_snapshots`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 스냅샷 ID |
| season_id | VARCHAR(30) | INDEX | 시즌 식별자 |
| user_id | BIGINT | INDEX/FK(users.id) | 유저 |
| rank_no | INT | NOT NULL | 순위 |
| score | BIGINT | NOT NULL | 점수 |
| captured_at | DATETIME | NOT NULL | 수집시각 |

### 7) `user_items`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | 아이템 row ID |
| user_id | BIGINT | INDEX/FK(users.id) | 유저 |
| item_id | VARCHAR(80) | UK(user_id,item_id) | 아이템 코드 |
| item_name | VARCHAR(120) | NOT NULL | 아이템 명 |
| quantity | BIGINT | NOT NULL | 수량 |
| upgrade_level | INT | NOT NULL | 강화 레벨 |
| quality | VARCHAR(20) | NOT NULL | 아이템 등급 (NORMAL/RARE/EPIC/LEGEND) |
| attack_bonus | INT | NOT NULL | 아이템 공격 보너스 |
| defense_bonus | INT | NOT NULL | 아이템 방어 보너스 |
| hp_bonus | INT | NOT NULL | 아이템 HP 보너스 |
| mp_bonus | INT | NOT NULL | 아이템 MP 보너스 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 8) `user_character_stats`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| user_id | BIGINT | PK/FK(users.id) | 유저 |
| attack_value | BIGINT | NOT NULL | 공격력 |
| defense_value | BIGINT | NOT NULL | 방어력 |
| max_hp_value | BIGINT | NOT NULL | 최대 HP |
| max_mp_value | BIGINT | NOT NULL | 최대 MP |
| attack_level | INT | NOT NULL | 공격 업그레이드 레벨 |
| defense_level | INT | NOT NULL | 방어 업그레이드 레벨 |
| hp_level | INT | NOT NULL | HP 업그레이드 레벨 |
| mp_level | INT | NOT NULL | MP 업그레이드 레벨 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 9) `daily_quest_progress`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | row ID |
| user_id | BIGINT | INDEX/FK(users.id) | 유저 |
| quest_date | DATE | UK(user_id,quest_date) | 퀘스트 날짜 |
| dungeon_kill_count | INT | NOT NULL | 처치 카운트 |
| gold_earned | BIGINT | NOT NULL | 골드 획득량 |
| stat_upgrade_count | INT | NOT NULL | 강화 횟수 |
| claimed_mask | BIGINT | NOT NULL | 퀘스트별 수령 비트마스크 |
| reward_claimed_at | DATETIME | NULL | 보상 수령 시각 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 10) `user_dungeon_progress`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | row ID |
| user_id | BIGINT | FK(users.id) | 유저 |
| dungeon_id | VARCHAR(40) | UK(user_id,dungeon_id) | 던전 식별자 |
| current_wave | INT | NOT NULL | 현재 시작 웨이브 |
| max_unlocked_wave | INT | NOT NULL | 최고 해금 웨이브 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 11) `user_equipment`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| user_id | BIGINT | PK/FK(users.id) | 유저 |
| weapon_item_id | VARCHAR(80) | NULL | 무기 슬롯 장착 아이템 |
| armor_item_id | VARCHAR(80) | NULL | 방어구 슬롯 장착 아이템 |
| accessory_item_id | VARCHAR(80) | NULL | 장신구 슬롯 장착 아이템 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 12) `user_equipment_presets`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | row ID |
| user_id | BIGINT | FK(users.id) | 유저 |
| preset_name | VARCHAR(40) | UK(user_id,preset_name) | 프리셋 이름 |
| weapon_item_id | VARCHAR(80) | NULL | 무기 슬롯 값 |
| armor_item_id | VARCHAR(80) | NULL | 방어구 슬롯 값 |
| accessory_item_id | VARCHAR(80) | NULL | 장신구 슬롯 값 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 13) `item_masters`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| item_id | VARCHAR(80) | PK | 아이템 코드 |
| item_name | VARCHAR(120) | NOT NULL | 아이템 이름 |
| item_type | VARCHAR(30) | INDEX | MATERIAL/CONSUMABLE/EQUIPMENT |
| equip_slot | VARCHAR(20) | NULL | 장착 슬롯(weapon/armor/accessory) |
| required_class_id | VARCHAR(20) | NULL | 직업 제한 (knight/mage/ranger) |
| quality | VARCHAR(20) | NOT NULL | NORMAL/RARE/EPIC/LEGEND |
| attack_bonus | INT | NOT NULL | 기본 공격 보너스 |
| defense_bonus | INT | NOT NULL | 기본 방어 보너스 |
| hp_bonus | INT | NOT NULL | 기본 HP 보너스 |
| mp_bonus | INT | NOT NULL | 기본 MP 보너스 |
| upgrade_gold_base | BIGINT | NOT NULL | 강화 비용 기본값 |
| upgrade_attack_step | INT | NOT NULL | 강화당 공격 증가 |
| upgrade_defense_step | INT | NOT NULL | 강화당 방어 증가 |
| upgrade_hp_step | INT | NOT NULL | 강화당 HP 증가 |
| upgrade_mp_step | INT | NOT NULL | 강화당 MP 증가 |
| image_url | VARCHAR(255) | NOT NULL | 아이템 이미지 경로 |
| description | VARCHAR(255) | NOT NULL | 설명 |
| is_active | TINYINT(1) | INDEX | 사용 여부 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 14) `monster_drop_tables`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | row ID |
| monster_id | VARCHAR(80) | INDEX | 몬스터 코드 |
| item_id | VARCHAR(80) | UK(monster_id,item_id), FK(item_masters.item_id) | 드랍 아이템 |
| drop_chance | DECIMAL(6,5) | NOT NULL | 드랍 확률 (0.0~1.0) |
| min_quantity | INT | NOT NULL | 최소 드랍 수량 |
| max_quantity | INT | NOT NULL | 최대 드랍 수량 |
| is_equipment_drop | TINYINT(1) | NOT NULL | 장비 드랍 여부 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 15) `monster_masters`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| monster_id | VARCHAR(80) | PK | 몬스터 코드 |
| monster_name | VARCHAR(120) | NOT NULL | 몬스터 이름 |
| max_hp | INT | NOT NULL | 기본 HP |
| max_mp | INT | NOT NULL | 기본 MP |
| attack | INT | NOT NULL | 기본 공격 |
| defense | INT | NOT NULL | 기본 방어 |
| reward_gold | INT | NOT NULL | 기본 골드 보상 |
| reward_gem | INT | NOT NULL | 기본 젬 보상 |
| reward_exp | INT | NOT NULL | 기본 경험치 보상 |
| reward_score | INT | NOT NULL | 기본 점수 보상 |
| sprite_key | VARCHAR(50) | NOT NULL | 스프라이트 키 |
| render_profile_json | LONGTEXT | NULL | 렌더/애니메이션 프로필 JSON |
| is_active | TINYINT(1) | INDEX | 사용 여부 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 16) `wave_settings`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | row ID |
| dungeon_id | VARCHAR(40) | UK(dungeon_id,wave_no) | 던전 ID |
| wave_no | INT | UK(dungeon_id,wave_no) | 웨이브 번호 |
| monster_id | VARCHAR(80) | FK(monster_masters.monster_id) | 출현 몬스터 |
| monster_count | INT | NOT NULL | 출현 수량 |
| hp_multiplier | DECIMAL(8,4) | NOT NULL | HP 배율 |
| mp_multiplier | DECIMAL(8,4) | NOT NULL | MP 배율 |
| attack_multiplier | DECIMAL(8,4) | NOT NULL | 공격 배율 |
| defense_multiplier | DECIMAL(8,4) | NOT NULL | 방어 배율 |
| reward_gold_multiplier | DECIMAL(8,4) | NOT NULL | 골드 보상 배율 |
| reward_gem_multiplier | DECIMAL(8,4) | NOT NULL | 젬 보상 배율 |
| is_active | TINYINT(1) | NOT NULL | 사용 여부 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 17) `companion_masters`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| companion_id | VARCHAR(40) | PK | 동료 코드 |
| companion_name | VARCHAR(80) | NOT NULL | 동료 이름 |
| grade | VARCHAR(20) | INDEX | 동료 등급 |
| class_id | VARCHAR(20) | INDEX | 동료 직업 |
| base_attack | INT | NOT NULL | 기본 공격 |
| base_defense | INT | NOT NULL | 기본 방어 |
| base_hp | INT | NOT NULL | 기본 HP |
| base_mp | INT | NOT NULL | 기본 MP |
| image_url | VARCHAR(255) | NOT NULL | 동료 이미지 경로 |
| render_profile_json | LONGTEXT | NULL | 렌더/애니메이션 프로필 JSON |
| recruit_weight | INT | NOT NULL | 뽑기 가중치 |
| is_active | TINYINT(1) | NOT NULL | 사용 여부 |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

### 18) `user_companions`
| 컬럼 | 타입 | 제약 | 설명 |
|---|---|---|---|
| id | BIGINT | PK | row ID |
| user_id | BIGINT | FK(users.id) | 유저 |
| companion_id | VARCHAR(40) | FK(companion_masters.companion_id) | 동료 코드 |
| level | INT | NOT NULL | 동료 레벨 |
| copies | INT | NOT NULL | 동료 복제본 수량 |
| slot_no | INT | NULL | 편성 슬롯(1~5) |
| created_at | DATETIME | NOT NULL | 생성일 |
| updated_at | DATETIME | NOT NULL | 수정일 |

## 인덱스 권장
- `users(nickname)`
- `users(account_id, is_deleted)`
- `economy_transactions(user_id, created_at DESC)`
- `economy_transactions(reason_code, created_at DESC)`
- `ranking_snapshots(season_id, rank_no)`
- `user_items(user_id)`
- `user_items(item_id)`
- `user_character_stats(attack_level)`
- `user_character_stats(defense_level)`
- `daily_quest_progress(quest_date)`
- `user_dungeon_progress(dungeon_id, current_wave)`
- `user_equipment(weapon_item_id)`
- `user_equipment(armor_item_id)`
- `user_equipment(accessory_item_id)`
- `user_equipment_presets(user_id)`
- `item_masters(item_type, is_active)`
- `monster_drop_tables(monster_id)`
- `monster_drop_tables(item_id)`
- `monster_masters(is_active)`
- `wave_settings(dungeon_id, wave_no)`
- `companion_masters(is_active)`
- `companion_masters(class_id, grade)`
- `user_companions(user_id, slot_no)`
- `user_companions(user_id, companion_id)`

## 관계
- `accounts 1:N users`
- `accounts 1:N account_social_links`
- `users 1:1 wallets`
- `users 1:N economy_transactions`
- `users 1:N ranking_snapshots`
- `users 1:N user_items`
- `users 1:1 user_character_stats`
- `users 1:N daily_quest_progress`
- `users 1:N user_dungeon_progress`
- `users 1:1 user_equipment`
- `users 1:N user_equipment_presets`
- `item_masters 1:N monster_drop_tables`
- `monster_masters 1:N monster_drop_tables`
- `monster_masters 1:N wave_settings`
- `companion_masters 1:N user_companions`
- `users 1:N user_companions`

## Redis 랭킹 키 규칙
- 실시간 점수: `rank:season:{seasonId}` (Sorted Set)
- 멤버: `{userId}`
- score: `power_score` 또는 시즌 규칙 점수

## 실행용 DDL
- 최신 단일 스키마 SQL: `docs/sql/00_latest_schema.sql`
- 과거 단계별 SQL(`docs/sql/01~18`)은 마이그레이션 이력 보관용
