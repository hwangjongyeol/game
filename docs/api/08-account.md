# 08. Account API

## 1) 계정 가입
- `POST /api/v1/accounts/signup`

요청:
```json
{
  "loginId": "test001",
  "password": "q1w2e3r4T%"
}
```

응답:
```json
{
  "success": true,
  "data": {
    "accountId": 1,
    "loginId": "test001"
  },
  "error": null
}
```

## 2) 계정 로그인
- `POST /api/v1/accounts/login`

요청:
```json
{
  "loginId": "test001",
  "password": "q1w2e3r4T%"
}
```

응답:
```json
{
  "success": true,
  "data": {
    "accountId": 1,
    "loginId": "test001"
  },
  "error": null
}
```
