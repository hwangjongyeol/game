# Admin FE/BE 구성

## Backend
- Admin 컨트롤러: `backend/src/main/java/com/hwang/game/admin/controller/AdminController.java`
- Admin 서비스: `backend/src/main/java/com/hwang/game/admin/service/AdminService.java`
- 엔티티:
  - `monster_masters` -> `backend/src/main/java/com/hwang/game/admin/entity/MonsterMasterEntity.java`
  - `wave_settings` -> `backend/src/main/java/com/hwang/game/admin/entity/WaveSettingEntity.java`

## Frontend
- 별도 프로젝트: `admin-frontend`
- UI 스택: `MUI(Material UI) + React Admin`
- 실행:
  - `cd admin-frontend`
  - `npm install`
  - `npm run dev`
- 기본 주소: `http://localhost:5174`

## DB 스키마 기준
- 최신 단일 스키마: `docs/sql/00_latest_schema.sql`
- (참고) `docs/sql/01~18`은 과거 단계별 마이그레이션 이력
