# 03. Ranking API

## 1) 랭킹 TOP 조회
- `GET /api/v1/rankings?seasonId={seasonId}&limit={n}`
- `limit`: 1~100

응답:
```json
{
  "success": true,
  "data": [
    { "rank": 1, "userId": 5, "score": 12000 },
    { "rank": 2, "userId": 1, "score": 11000 }
  ],
  "error": null
}
```

## 2) 내 랭킹 조회
- `GET /api/v1/rankings/me?seasonId={seasonId}&userId={userId}`

응답:
```json
{
  "success": true,
  "data": {
    "seasonId": "S1",
    "userId": 1,
    "rank": 2,
    "score": 11000
  },
  "error": null
}
```

## 3) 점수 반영
- `POST /api/v1/rankings/score`

요청:
```json
{
  "seasonId": "S1",
  "userId": 1,
  "scoreDelta": 150
}
```

응답: `MyRankingResponse`

던전 연동 예시:
- `seasonId`: `DUNGEON1`
- `scoreDelta`: 몬스터 난이도 기반 점수

오류:
- `scoreDelta == 0` 이면 `INVALID_RANKING_SCORE`
- 랭킹 없음/대상 없음은 `RANKING_SEASON_NOT_FOUND` 또는 `PLAYER_NOT_FOUND`
