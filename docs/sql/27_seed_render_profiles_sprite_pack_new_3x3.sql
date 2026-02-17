-- 27. Seed render_profile_json for sprite-pack-new.png (3x3 block layout)
-- 전제:
--   - docs/sql/25_add_render_profile_json_columns.sql 적용 완료
--   - 현재 운영 파일: sprite-pack-new.png (1024x1536, 8x12)
-- 규칙:
--   - frame size: 128x128
--   - 1 character: 3x3 block
--   - battleFrames: [[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]
--   - deathFrames : [[0,2],[1,2],[2,2]]

-- 공통 프레임 JSON 템플릿(참고)
-- {"block":{"col":X,"row":Y},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}

-- 1) 클래스(주인공)
UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"warrior","block":{"col":0,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE class_id = 'knight';

UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"mage","block":{"col":0,"row":1},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE class_id = 'mage';

UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"archer","block":{"col":1,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE class_id = 'ranger';

-- 2) 몬스터(현재 코드 fallback과 동일 맵)
UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"slime","block":{"col":1,"row":1},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE monster_id LIKE '%slime%';

UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"orc","block":{"col":0,"row":2},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE monster_id LIKE '%orc%' OR monster_id LIKE '%goblin%' OR monster_id LIKE '%skeleton%';

UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"dragon","block":{"col":1,"row":2},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE monster_id LIKE '%dragon%';

-- 3) 동료(클래스 기준 기본값)
UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"warrior","block":{"col":0,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE class_id = 'knight';

UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"mage","block":{"col":0,"row":1},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE class_id = 'mage';

UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"archer","block":{"col":1,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]],"deathFrames":[[0,2],[1,2],[2,2]]}'
WHERE class_id = 'ranger';
