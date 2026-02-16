# 06. Codex 자동개발 워크플로

## 목표
- 기능 단위를 작은 반복으로 구현
- 문서 -> API -> 테스트 -> 배포까지 일관된 흐름 유지

## 권장 루프
1. 요구사항 명세: `docs/*.md` 업데이트
2. API 계약 정의: 요청/응답/에러코드 확정
3. 백엔드 구현: Controller -> Service -> Repository
4. 테스트 작성: 단위/통합 테스트
5. 프론트 연동: API mock -> 실제 API 교체
6. 검증: 로컬 실행/시나리오 테스트
7. 배포: dev -> staging -> prod

## Codex 프롬프트 템플릿
```text
[목표]
- 오프라인 보상 API 구현

[입력]
- docs/03-spring-boot-api-design.md
- docs/05-idle-growth-formula.md

[요구사항]
- POST /api/v1/rewards/offline/claim 구현
- 서버 시간 기준 계산
- idempotency key 지원
- 테스트 3개 이상 작성

[산출물]
- 코드 변경
- 테스트 결과
- 변경 파일 목록
```

## 브랜치 전략
- `main`: 운영 안정 버전
- `develop`: 통합 테스트 버전
- `feature/*`: 기능 개발

## 완료 기준 (DoD)
- API 성공/실패 케이스 테스트 통과
- 문서와 실제 구현이 일치
- 로그/에러코드가 운영 가능한 수준
