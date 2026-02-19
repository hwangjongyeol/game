# AutoGame Documentation
### decs/README.md 보고 업무진행해죠. 항상 db, 문서, 진행사항, 진행할 항목 업데이트 필요)
이 폴더는 자동게임 프로젝트의 설계 기준 문서 모음입니다.

## 필요한 문서는 docs/ 하위에 만들고 계속 업데이트 해죠
## DB 경우는 필요시 sql 항상 업데이트 해죠(데미지, 캐릭터 종류, 체력 등등 신규 추가 필요한 필드 있으면 자동 업데이트)
## 필요한 진행사항 정보는 docs 추가 업데이트 해, 특히 진행사항은 업데이트 필수야

- docs/sql
- docs/기능목록.(예시)

## 문서 목록
- [00. 작업 규칙](./00-work-rules.md)
- [API 문서 인덱스](./api/README.md)
- [01. 전체 게임 아키텍처 다이어그램](./01-game-architecture.md)
- [02. DB 스키마 (유저/경제/랭킹)](./02-db-schema.md)
- [03. Spring Boot API 설계](./03-spring-boot-api-design.md)
- [04. Phaser 기본 게임 템플릿](./04-phaser-template.md)
- [05. 방치형 성장 계산식](./05-idle-growth-formula.md)
- [06. Codex 자동개발 워크플로](./06-codex-workflow.md)
- [07. AWS 이전 구조](./07-aws-migration-architecture.md)
- [08. 수익모델 (패스/광고/아이템)](./08-monetization-model.md)
- [09. Dungeon 1 전투 시스템](./09-dungeon1-combat-system.md)
- [10. 진행 현황](./10-progress-log.md)
- [어드민 관리 진행 현황](admin-workspace.md)

## DB 적용 기준 (최신)
- 단일 최신 스키마: `docs/sql/00_latest_schema.sql`
- 신규/빈 DB 기준 적용 예시:
```bash
mysql -u sysbatch -p sys_batch < docs/sql/00_latest_schema.sql
```
- 과거 `docs/sql/01~18` 파일은 마이그레이션 이력 보관용입니다.

## 문서 뷰어 (docs/index.html)
- 목적: `docs/*.md`, `docs/**/*.yaml` 문서를 브라우저에서 트리/본문 형태로 탐색
- 데이터 파일 생성:
```bash
python3 docs/assets/build-docs-data.py
```
- 로컬 확인:
  - `docs/index.html`을 브라우저에서 열면 됩니다.
  - 문서 갱신 후에는 `docs/assets/docs-data.js`를 다시 생성해야 최신 내용이 반영됩니다.
- 지원 기능:
  - 좌측 검색창에서 파일명/본문 통합 검색 + 파일명/본문 스니펫 카드 표시 + 검색어 하이라이트
  - 마크다운 코드블록 구문 하이라이트 (`json`, `yaml`, `sql`, `bash`, `js/ts`)
  - `api/README.md -> openapi.yaml` 같은 상대 링크를 뷰어 내부에서 바로 열기

## 작성 원칙
- 구현 가능한 수준으로 작성
- Spring Boot + React + Phaser 기준
- 초기 MVP에서 확장 가능한 구조 우선


##  다음 단계로 바로 이어서
1. 아이템 효과 서버 검증/영속화 정합성 강화
2. 웨이브 선택 히스토리/즐겨찾기 추가
3. 클래스별 액티브 스킬 연출(이펙트/사운드) 강화
4. 전투 HUD 경량화 및 클래스별 쿨다운/피격 연출 세분화
