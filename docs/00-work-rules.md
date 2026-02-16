# 00. Work Rules

## 시작 규칙
- 항상 `docs/` 하위 문서를 먼저 읽고 현재 상태를 파악한다.
- 구현 전 영향 범위(backend/frontend/db/docs)를 짧게 요약한다.

## 구현 규칙
- 기능 구현 시 문서와 코드를 함께 갱신한다.
- DB 스키마 변경이 있으면 반드시 `docs/sql/00_latest_schema.sql`을 최신 상태로 갱신한다.
- API 변경 시 `docs/api` 및 `docs/api/openapi.yaml`을 함께 갱신한다.

## 검증 규칙
- backend: `./gradlew test`
- frontend: `npm run build`
- 실패 시 원인과 조치 내용을 문서/응답에 남긴다.

## 완료 보고 규칙
- 변경 파일 목록
- 실행 필요한 SQL 목록
- 다음 단계 제안(선택지)
