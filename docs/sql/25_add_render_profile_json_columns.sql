-- 25. Add render_profile_json for class/monster/companion masters
-- 목적: 캐릭터/동료/몬스터의 스프라이트 좌표/애니메이션 메타(JSON)를 DB로 관리

ALTER TABLE character_class_masters
    ADD COLUMN render_profile_json LONGTEXT NULL AFTER base_mp;

ALTER TABLE monster_masters
    ADD COLUMN render_profile_json LONGTEXT NULL AFTER sprite_key;

ALTER TABLE companion_masters
    ADD COLUMN render_profile_json LONGTEXT NULL AFTER image_url;

-- 기본 클래스 렌더 프로필
UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"warrior"}'
WHERE class_id = 'knight';

UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"mage"}'
WHERE class_id = 'mage';

UPDATE character_class_masters
SET render_profile_json = '{"spritePackKey":"archer"}'
WHERE class_id = 'ranger';

-- 기본 몬스터 렌더 프로필(현재 sprite-pack 기준)
UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"slime"}'
WHERE monster_id LIKE '%slime%';

UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"orc"}'
WHERE render_profile_json IS NULL AND (monster_id LIKE '%orc%' OR monster_id LIKE '%goblin%' OR monster_id LIKE '%skeleton%');

UPDATE monster_masters
SET render_profile_json = '{"spritePackKey":"dragon"}'
WHERE render_profile_json IS NULL AND monster_id LIKE '%dragon%';

-- 기본 동료 렌더 프로필(클래스 기반 fallback)
UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"warrior"}'
WHERE render_profile_json IS NULL AND class_id = 'knight';

UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"mage"}'
WHERE render_profile_json IS NULL AND class_id = 'mage';

UPDATE companion_masters
SET render_profile_json = '{"spritePackKey":"archer"}'
WHERE render_profile_json IS NULL AND class_id = 'ranger';
