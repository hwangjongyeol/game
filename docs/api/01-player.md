# 01. Player API

## 1) 플레이어 생성
- `POST /api/v1/players`

요청:
```json
{
  "accountId": 1,
  "nickname": "alpha",
  "classId": "knight"
}
```

응답:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "accountId": 1,
    "nickname": "alpha",
    "classId": "knight",
    "level": 1,
    "gold": 0
  },
  "error": null
}
```

## 2) 플레이어 단건 조회
- `GET /api/v1/players/{id}`

응답:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "accountId": 1,
    "nickname": "alpha",
    "classId": "knight",
    "level": 1,
    "gold": 0
  },
  "error": null
}
```

## 3) 플레이어 목록 조회
- `GET /api/v1/players`

응답:
```json
{
  "success": true,
  "data": [
    { "id": 1, "accountId": 1, "nickname": "alpha", "classId": "knight", "level": 1, "gold": 0 }
  ],
  "error": null
}
```

## 4) 계정별 캐릭터 목록 조회
- `GET /api/v1/players/accounts/{accountId}`

## 5) 캐릭터 소프트 삭제
- `DELETE /api/v1/players/{id}?accountId={accountId}`

규칙:
- `is_deleted = true`, `deleted_at = now()` 처리
- 삭제된 캐릭터는 기본 조회 목록에서 제외

## 비고
- `nickname`: 필수, 공백 불가, 최대 20자
- `classId`: 필수, `knight|mage|ranger`
- `accountId`: 필수, 계정 소유자 식별자
