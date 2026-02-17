# 11. Sprite Pack 좌표 가이드 (`frontend/public/sprite-pack-new.png`)

## 시트 스펙
- 현재 운영 파일: `1024 x 1536` (`8열 x 12행`)
- 확장 목표 파일: `1536 x 3072` (`12열 x 24행`)
- 프레임 크기: `128 x 128` 고정
- 캐릭터 1종: `3 x 3 block` (총 9프레임)
- 배경: 완전 투명(alpha=0), 반투명 잔여 픽셀 금지

## block 사용 가능 범위 (3x3 단위)
- 8열 시트: `block.col 0~1`, `block.row 0~3`
- 12열 시트: `block.col 0~3`, `block.row 0~7`

현재 기본 매핑:
| 키 | block(col,row) |
|---|---|
| warrior | (0,0) |
| archer | (1,0) |
| mage | (0,1) |
| slime | (1,1) |
| orc | (0,2) |
| dragon | (1,2) |

## 픽셀 시작 좌표
- `startX = block.col * 3 * 128`
- `startY = block.row * 3 * 128`

## block 내부 로컬 프레임
```
[0,0] [1,0] [2,0]
[0,1] [1,1] [2,1]
[0,2] [1,2] [2,2]
```

- `battleFrames`
```json
[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]
```

- `deathFrames`
```json
[[0,2],[1,2],[2,2]]
```

## Phaser frame index 공식
- `globalCol = blockCol * 3 + localCol`
- `globalRow = blockRow * 3 + localRow`
- `frameIndex = globalRow * sheetColumns + globalCol`
- `sheetColumns = textureWidth / 128` (코드에서 자동 계산)

코드 위치:
- 로더: `frontend/src/game/scenes/BootScene.ts`
- 좌표/프레임 계산: `frontend/src/game/scenes/MainScene.ts`

## 확장 계획
- 현재 코드는 시트 너비를 읽어 `8열/12열`을 자동 전환
- `1536x3072` 교체 시 코드 수정 없이 12열 block 좌표 사용 가능
