# SQL Guide

## 단일 최신 스키마
- 파일: `00_latest_schema.sql`
- 목적: 신규/빈 DB에 최신 스키마+기본 마스터 데이터를 한 번에 구성

실행 예시:
```bash
mysql -u sysbatch -p sys_batch < docs/sql/00_latest_schema.sql
```

## 이력 파일
- `01_init_schema.sql` ~ `18_add_companion_system.sql` 은 단계별 마이그레이션 이력입니다.
- 신규 세팅은 이력 파일 순차 실행 대신 `00_latest_schema.sql` 사용을 권장합니다.
