# 00. 공통 규격

## 요청/응답
- Content-Type: `application/json`
- 응답 포맷: `ApiResponse<T>`

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

```json
{
  "success": false,
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "userId must not be null"
  }
}
```

## HTTP 상태 코드
- `200 OK`: 정상 처리
- `400 Bad Request`: 입력 검증 실패/비즈니스 규칙 위반
- `500 Internal Server Error`: 처리 중 서버 오류

## 주요 에러 코드
- `VALIDATION_ERROR`
- `PLAYER_NOT_FOUND`
- `INSUFFICIENT_CURRENCY`
- `INVALID_ECONOMY_AMOUNT`
- `INVALID_REWARD_CLAIM`
- `RANKING_SEASON_NOT_FOUND`
- `INVALID_RANKING_SCORE`
- `INTERNAL_SERVER_ERROR`
