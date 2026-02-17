-- 26. Seed render_profile_json for sprite-pack.png (7-character layout)
-- 전제: docs/sql/25_add_render_profile_json_columns.sql 적용 완료

-- 1) 클래스(주인공) 렌더 프로필
UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"warrior","block":{"col":0,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1]]}'
WHERE class_id = 'knight';

UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"mage","block":{"col":6,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]}'
WHERE class_id = 'mage';

UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"archer","block":{"col":9,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]}'
WHERE class_id = 'ranger';

-- 2) 몬스터 렌더 프로필
UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"slime","block":{"col":6,"row":2},"battleFrames":[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]}'
WHERE monster_id LIKE '%slime%';

UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"orc","block":{"col":6,"row":3},"battleFrames":[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0]]}'
WHERE monster_id LIKE '%orc%' OR monster_id LIKE '%goblin%' OR monster_id LIKE '%skeleton%';

UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"dragon","block":{"col":7,"row":5},"battleFrames":[[0,0],[2,0]]}'
WHERE monster_id LIKE '%dragon%';

-- 3) 동료 렌더 프로필(클래스 기준 기본값)
UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"warrior","block":{"col":0,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1]]}'
WHERE class_id = 'knight';

UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"mage","block":{"col":6,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]}'
WHERE class_id = 'mage';

UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"archer","block":{"col":9,"row":0},"battleFrames":[[0,0],[1,0],[2,0],[0,1],[1,1],[2,1]]}'
WHERE class_id = 'ranger';
