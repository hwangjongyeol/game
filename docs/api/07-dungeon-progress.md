# 07. Dungeon Progress API

## 1) 던전 진행도 조회
- `GET /api/v1/dungeons/{dungeonId}/progress/{userId}`

응답 주요 필드:
- `currentWave`: 재접속 후 시작 웨이브
- `maxUnlockedWave`: 선택 가능한 최대 웨이브

## 2) 던전 진행도 저장/변경
- `POST /api/v1/dungeons/{dungeonId}/progress`

요청:
```json
{
  "userId": 1,
  "currentWave": 7,
  "maxUnlockedWave": 10
}
```

규칙:
- `currentWave`는 최소 1
- 서버에서 `maxUnlockedWave`는 기존 값보다 작아지지 않음
- `currentWave`는 `1..maxUnlockedWave` 범위로 보정됨

현재 지원 던전:
- `dungeon1`
