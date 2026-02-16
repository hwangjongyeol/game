# 05. 방치형 성장 계산식

## 목표
- 접속 여부와 상관없이 예측 가능한 성장
- 무한 인플레이션 방지를 위해 완만한 기울기 적용

## 기본 파라미터
- `baseGoldPerSec`
- `baseExpPerSec`
- `powerMultiplier` (전투력 기반)
- `offlineCapSeconds` (예: 28,800초 = 8시간)

## 오프라인 보상
```text
effectiveSeconds = min(offlineSeconds, offlineCapSeconds)

goldReward = floor(baseGoldPerSec * powerMultiplier * effectiveSeconds)
expReward  = floor(baseExpPerSec  * powerMultiplier * effectiveSeconds)
```

## 레벨 업 경험치
```text
requiredExp(level) = floor(100 * level^1.35)
```

## 전투력 증가
```text
powerScore = floor(
  (attack * 1.2) +
  (defense * 1.0) +
  (hp * 0.2) +
  (critRate * 50)
)
```

## 밸런싱 가이드
- 초반(1~20레벨): 체감 성장 빠르게
- 중반(21~80레벨): 강화/장비 중요도 상승
- 후반(81+): 시즌/랭킹 경쟁 중심

## 악용 방지
- 클라이언트 시간이 아닌 서버 시간 기준
- 보상 수령은 idempotency key로 중복 방지
- 비정상 급증은 거래 로그 기반 탐지
