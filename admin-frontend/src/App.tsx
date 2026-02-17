import {
  Admin,
  Button,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
  DeleteButton,
  Edit,
  FunctionField,
  Layout,
  List,
  Menu,
  NumberField,
  NumberInput,
  Resource,
  SelectInput,
  SimpleForm,
  TextField,
  TextInput,
  useGetList,
  useNotify
} from 'react-admin';
import { dataProvider } from './dataProvider';

const AdminMenu = () => (
  <Menu>
    <Menu.ResourceItem name="players" />
    <Menu.ResourceItem name="classMasters" />
    <Menu.ResourceItem name="items" />
    <Menu.ResourceItem name="itemUpgradeTiers" />
    <Menu.ResourceItem name="monsters" />
    <Menu.ResourceItem name="monsterDrops" />
    <Menu.ResourceItem name="waves" />
    <Menu.ResourceItem name="waveGroups" />
    <Menu.ResourceItem name="balanceProfiles" />
    <Menu.ResourceItem name="companionMasters" />
    <Menu.ResourceItem name="userCompanions" />
  </Menu>
);

const AdminLayout = (props: any) => <Layout {...props} menu={AdminMenu} />;

const itemTypeChoices = [
  { id: 'MATERIAL', name: 'MATERIAL' },
  { id: 'CONSUMABLE', name: 'CONSUMABLE' },
  { id: 'EQUIPMENT', name: 'EQUIPMENT' }
];

const equipSlotChoices = [
  { id: 'weapon', name: 'weapon' },
  { id: 'armor', name: 'armor' },
  { id: 'accessory', name: 'accessory' }
];

const companionGradeChoices = [
  { id: 'COMMON', name: 'COMMON' },
  { id: 'RARE', name: 'RARE' },
  { id: 'EPIC', name: 'EPIC' },
  { id: 'LEGEND', name: 'LEGEND' }
];

const requiredPositive = (field: string) => (value: number) =>
  value == null || Number(value) <= 0 ? `${field} must be > 0` : undefined;

const requiredNonNegative = (field: string) => (value: number) =>
  value == null || Number(value) < 0 ? `${field} must be >= 0` : undefined;

const validateDropChance = (value: number) => {
  if (value == null) return 'dropChance is required';
  const n = Number(value);
  if (Number.isNaN(n) || n < 0 || n > 1) return 'dropChance must be between 0 and 1';
  return undefined;
};

const validateMinQuantity = (value: number, allValues: any) => {
  if (value == null || Number(value) < 1) return 'minQuantity must be >= 1';
  if (allValues?.maxQuantity != null && Number(value) > Number(allValues.maxQuantity)) {
    return 'minQuantity must be <= maxQuantity';
  }
  return undefined;
};

const validateMaxQuantity = (value: number, allValues: any) => {
  if (value == null || Number(value) < 1) return 'maxQuantity must be >= 1';
  if (allValues?.minQuantity != null && Number(value) < Number(allValues.minQuantity)) {
    return 'maxQuantity must be >= minQuantity';
  }
  return undefined;
};

const validateMultiplier = (field: string) => (value: number) => {
  if (value == null) return `${field} is required`;
  const n = Number(value);
  if (Number.isNaN(n) || n <= 0) return `${field} must be > 0`;
  return undefined;
};

const validatePatternWaveNo = (value: number) => {
  if (value == null || Number(value) < 1) return 'waveNo must be >= 1';
  if (Number(value) > 100) return 'waveNo must be <= 100 (1-1 ~ 10-10 패턴)';
  return undefined;
};

const validateJsonText = (value: string) => {
  if (!value || !value.trim()) return 'json is required';
  try {
    JSON.parse(value);
    return undefined;
  } catch {
    return 'invalid json';
  }
};

const validateJsonOrEmpty = (value: string) => {
  if (!value || !value.trim()) return undefined;
  try {
    JSON.parse(value);
    return undefined;
  } catch {
    return 'invalid json';
  }
};

const CopyJsonButton = ({ json }: { json: string }) => {
  const notify = useNotify();
  return (
    <Button
      label="copy"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(json);
          notify('json copied');
        } catch {
          notify('copy failed', { type: 'warning' });
        }
      }}
    />
  );
};

const ClassSelectInput = (props: any) => {
  const { data = [] } = useGetList('classMasters', {
    pagination: { page: 1, perPage: 200 },
    sort: { field: 'classId', order: 'ASC' },
    filter: {}
  });
  const choices = (data as any[]).map((row) => ({
    id: row.classId,
    name: row.className ? `${row.classId} (${row.className})` : row.classId
  }));
  return <SelectInput {...props} choices={choices} />;
};

const PlayersList = () => (
  <List>
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="accountId" />
      <TextField source="nickname" />
      <TextField source="classId" />
      <NumberField source="level" />
      <NumberField source="powerScore" />
      <BooleanField source="deleted" />
    </Datagrid>
  </List>
);

const PlayersEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="nickname" />
      <ClassSelectInput source="classId" />
      <NumberInput source="level" />
      <NumberInput source="exp" />
      <NumberInput source="powerScore" />
      <BooleanInput source="deleted" />
    </SimpleForm>
  </Edit>
);

const ClassMastersList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="classId" />
      <TextField source="className" />
      <NumberField source="baseAttack" />
      <NumberField source="baseDefense" />
      <NumberField source="baseHp" />
      <NumberField source="baseMp" />
      <BooleanField source="active" />
    </Datagrid>
  </List>
);

const ClassMastersCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="classId" />
      <TextInput source="className" />
      <NumberInput source="baseAttack" validate={requiredPositive('baseAttack')} />
      <NumberInput source="baseDefense" validate={requiredNonNegative('baseDefense')} />
      <NumberInput source="baseHp" validate={requiredPositive('baseHp')} />
      <NumberInput source="baseMp" validate={requiredPositive('baseMp')} />
      <TextInput source="renderProfileJson" multiline minRows={8} fullWidth validate={validateJsonOrEmpty} />
      <BooleanInput source="active" defaultValue />
    </SimpleForm>
  </Create>
);

const ClassMastersEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="className" />
      <NumberInput source="baseAttack" validate={requiredPositive('baseAttack')} />
      <NumberInput source="baseDefense" validate={requiredNonNegative('baseDefense')} />
      <NumberInput source="baseHp" validate={requiredPositive('baseHp')} />
      <NumberInput source="baseMp" validate={requiredPositive('baseMp')} />
      <TextInput source="renderProfileJson" multiline minRows={8} fullWidth validate={validateJsonOrEmpty} />
      <BooleanInput source="active" />
    </SimpleForm>
  </Edit>
);

const ItemsList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="itemId" />
      <TextField source="itemName" />
      <TextField source="itemType" />
      <FunctionField
        label="requiredClassId"
        render={(record: any) => {
          const value = record?.requiredClassId;
          const style = {
            display: 'inline-block',
            padding: '2px 8px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700
          } as const;
          if (!value) return <span style={{ ...style, background: '#eceff1', color: '#37474f' }}>all</span>;
          if (value === 'knight') return <span style={{ ...style, background: '#ffebee', color: '#c62828' }}>knight</span>;
          if (value === 'mage') return <span style={{ ...style, background: '#e3f2fd', color: '#1565c0' }}>mage</span>;
          if (value === 'ranger') return <span style={{ ...style, background: '#e8f5e9', color: '#2e7d32' }}>ranger</span>;
          return <span style={{ ...style, background: '#f3e5f5', color: '#6a1b9a' }}>{value}</span>;
        }}
      />
      <TextField source="quality" />
      <NumberField source="attackBonus" />
      <NumberField source="defenseBonus" />
      <NumberField source="hpBonus" />
      <NumberField source="mpBonus" />
      <BooleanField source="active" />
    </Datagrid>
  </List>
);

const ItemsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="itemId" />
      <TextInput source="itemName" />
      <SelectInput source="itemType" choices={itemTypeChoices} />
      <SelectInput source="equipSlot" choices={equipSlotChoices} emptyText="(none)" />
      <ClassSelectInput source="requiredClassId" emptyText="(all class)" />
      <TextInput source="quality" />
      <NumberInput source="attackBonus" validate={requiredNonNegative('attackBonus')} />
      <NumberInput source="defenseBonus" validate={requiredNonNegative('defenseBonus')} />
      <NumberInput source="hpBonus" validate={requiredNonNegative('hpBonus')} />
      <NumberInput source="mpBonus" validate={requiredNonNegative('mpBonus')} />
      <NumberInput source="upgradeGoldBase" validate={requiredNonNegative('upgradeGoldBase')} />
      <NumberInput source="upgradeAttackStep" validate={requiredNonNegative('upgradeAttackStep')} />
      <NumberInput source="upgradeDefenseStep" validate={requiredNonNegative('upgradeDefenseStep')} />
      <NumberInput source="upgradeHpStep" validate={requiredNonNegative('upgradeHpStep')} />
      <NumberInput source="upgradeMpStep" validate={requiredNonNegative('upgradeMpStep')} />
      <TextInput source="imageUrl" />
      <TextInput source="description" />
      <BooleanInput source="active" defaultValue />
    </SimpleForm>
  </Create>
);

const ItemsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="itemName" />
      <SelectInput source="itemType" choices={itemTypeChoices} />
      <SelectInput source="equipSlot" choices={equipSlotChoices} emptyText="(none)" />
      <ClassSelectInput source="requiredClassId" emptyText="(all class)" />
      <TextInput source="quality" />
      <NumberInput source="attackBonus" validate={requiredNonNegative('attackBonus')} />
      <NumberInput source="defenseBonus" validate={requiredNonNegative('defenseBonus')} />
      <NumberInput source="hpBonus" validate={requiredNonNegative('hpBonus')} />
      <NumberInput source="mpBonus" validate={requiredNonNegative('mpBonus')} />
      <NumberInput source="upgradeGoldBase" validate={requiredNonNegative('upgradeGoldBase')} />
      <NumberInput source="upgradeAttackStep" validate={requiredNonNegative('upgradeAttackStep')} />
      <NumberInput source="upgradeDefenseStep" validate={requiredNonNegative('upgradeDefenseStep')} />
      <NumberInput source="upgradeHpStep" validate={requiredNonNegative('upgradeHpStep')} />
      <NumberInput source="upgradeMpStep" validate={requiredNonNegative('upgradeMpStep')} />
      <TextInput source="imageUrl" />
      <TextInput source="description" />
      <BooleanInput source="active" />
    </SimpleForm>
  </Edit>
);

const MonstersList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="monsterId" />
      <TextField source="monsterName" />
      <NumberField source="maxHp" />
      <NumberField source="maxMp" />
      <NumberField source="attack" />
      <NumberField source="defense" />
      <BooleanField source="active" />
    </Datagrid>
  </List>
);

const MonstersCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="monsterId" />
      <TextInput source="monsterName" />
      <NumberInput source="maxHp" />
      <NumberInput source="maxMp" />
      <NumberInput source="attack" />
      <NumberInput source="defense" />
      <NumberInput source="rewardGold" />
      <NumberInput source="rewardGem" />
      <NumberInput source="rewardExp" />
      <NumberInput source="rewardScore" />
      <TextInput source="spriteKey" />
      <TextInput source="renderProfileJson" multiline minRows={8} fullWidth validate={validateJsonOrEmpty} />
      <BooleanInput source="active" defaultValue />
    </SimpleForm>
  </Create>
);

const MonstersEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="monsterName" />
      <NumberInput source="maxHp" />
      <NumberInput source="maxMp" />
      <NumberInput source="attack" />
      <NumberInput source="defense" />
      <NumberInput source="rewardGold" />
      <NumberInput source="rewardGem" />
      <NumberInput source="rewardExp" />
      <NumberInput source="rewardScore" />
      <TextInput source="spriteKey" />
      <TextInput source="renderProfileJson" multiline minRows={8} fullWidth validate={validateJsonOrEmpty} />
      <BooleanInput source="active" />
    </SimpleForm>
  </Edit>
);

const MonsterDropsList = () => (
  <List
    filters={[<TextInput source="monsterId" />]}
    filterDefaultValues={{ monsterId: 'slime-green' }}
  >
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="monsterId" />
      <TextField source="itemId" />
      <NumberField source="dropChance" />
      <NumberField source="minQuantity" />
      <NumberField source="maxQuantity" />
      <BooleanField source="equipmentDrop" />
    </Datagrid>
  </List>
);

const MonsterDropsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="monsterId" defaultValue="slime-green" />
      <TextInput source="itemId" />
      <NumberInput source="dropChance" step={0.01} validate={validateDropChance} />
      <NumberInput source="minQuantity" defaultValue={1} validate={validateMinQuantity} />
      <NumberInput source="maxQuantity" defaultValue={1} validate={validateMaxQuantity} />
      <BooleanInput source="equipmentDrop" defaultValue={false} />
    </SimpleForm>
  </Create>
);

const MonsterDropsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="monsterId" />
      <TextInput source="itemId" />
      <NumberInput source="dropChance" step={0.01} validate={validateDropChance} />
      <NumberInput source="minQuantity" validate={validateMinQuantity} />
      <NumberInput source="maxQuantity" validate={validateMaxQuantity} />
      <BooleanInput source="equipmentDrop" />
    </SimpleForm>
  </Edit>
);

const WavesList = () => (
  <List
    filters={[<TextInput source="dungeonId" />]}
    filterDefaultValues={{ dungeonId: 'dungeon1' }}
  >
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="dungeonId" />
      <NumberField source="waveNo" />
      <FunctionField
        label="waveLabel"
        render={(record: any) => `${Math.floor((Number(record.waveNo) - 1) / 10) + 1}-${((Number(record.waveNo) - 1) % 10) + 1}`}
      />
      <NumberField source="slotNo" />
      <TextField source="monsterId" />
      <NumberField source="monsterCount" />
      <NumberField source="hpMultiplier" />
      <NumberField source="attackMultiplier" />
      <BooleanField source="active" />
    </Datagrid>
  </List>
);

const WavesCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="dungeonId" defaultValue="dungeon1" />
      <NumberInput source="waveNo" validate={validatePatternWaveNo} />
      <NumberInput source="slotNo" defaultValue={1} validate={requiredPositive('slotNo')} />
      <TextInput source="monsterId" />
      <NumberInput source="monsterCount" defaultValue={1} validate={requiredPositive('monsterCount')} />
      <NumberInput source="hpMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('hpMultiplier')} />
      <NumberInput source="mpMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('mpMultiplier')} />
      <NumberInput source="attackMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('attackMultiplier')} />
      <NumberInput source="defenseMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('defenseMultiplier')} />
      <NumberInput source="rewardGoldMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('rewardGoldMultiplier')} />
      <NumberInput source="rewardGemMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('rewardGemMultiplier')} />
      <BooleanInput source="active" defaultValue />
    </SimpleForm>
  </Create>
);

const WavesEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="dungeonId" />
      <NumberInput source="waveNo" validate={validatePatternWaveNo} />
      <NumberInput source="slotNo" validate={requiredPositive('slotNo')} />
      <TextInput source="monsterId" />
      <NumberInput source="monsterCount" validate={requiredPositive('monsterCount')} />
      <NumberInput source="hpMultiplier" step={0.01} validate={validateMultiplier('hpMultiplier')} />
      <NumberInput source="mpMultiplier" step={0.01} validate={validateMultiplier('mpMultiplier')} />
      <NumberInput source="attackMultiplier" step={0.01} validate={validateMultiplier('attackMultiplier')} />
      <NumberInput source="defenseMultiplier" step={0.01} validate={validateMultiplier('defenseMultiplier')} />
      <NumberInput source="rewardGoldMultiplier" step={0.01} validate={validateMultiplier('rewardGoldMultiplier')} />
      <NumberInput source="rewardGemMultiplier" step={0.01} validate={validateMultiplier('rewardGemMultiplier')} />
      <BooleanInput source="active" />
    </SimpleForm>
  </Edit>
);

const WaveGroupsList = () => (
  <List
    filters={[<TextInput source="dungeonId" />]}
    filterDefaultValues={{ dungeonId: 'dungeon1' }}
  >
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="dungeonId" />
      <NumberField source="waveGroupNo" />
      <NumberField source="hpMultiplier" />
      <NumberField source="attackMultiplier" />
      <NumberField source="defenseMultiplier" />
      <TextField source="backgroundImagePath" />
      <BooleanField source="active" />
    </Datagrid>
  </List>
);

const WaveGroupsCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="dungeonId" defaultValue="dungeon1" />
      <NumberInput source="waveGroupNo" validate={requiredPositive('waveGroupNo')} />
      <NumberInput source="hpMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('hpMultiplier')} />
      <NumberInput source="mpMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('mpMultiplier')} />
      <NumberInput source="attackMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('attackMultiplier')} />
      <NumberInput source="defenseMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('defenseMultiplier')} />
      <NumberInput source="rewardGoldMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('rewardGoldMultiplier')} />
      <NumberInput source="rewardGemMultiplier" defaultValue={1} step={0.01} validate={validateMultiplier('rewardGemMultiplier')} />
      <TextInput source="backgroundImagePath" defaultValue="/dungeons/dungeon-1.png" />
      <BooleanInput source="active" defaultValue />
    </SimpleForm>
  </Create>
);

const WaveGroupsEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="dungeonId" />
      <NumberInput source="waveGroupNo" validate={requiredPositive('waveGroupNo')} />
      <NumberInput source="hpMultiplier" step={0.01} validate={validateMultiplier('hpMultiplier')} />
      <NumberInput source="mpMultiplier" step={0.01} validate={validateMultiplier('mpMultiplier')} />
      <NumberInput source="attackMultiplier" step={0.01} validate={validateMultiplier('attackMultiplier')} />
      <NumberInput source="defenseMultiplier" step={0.01} validate={validateMultiplier('defenseMultiplier')} />
      <NumberInput source="rewardGoldMultiplier" step={0.01} validate={validateMultiplier('rewardGoldMultiplier')} />
      <NumberInput source="rewardGemMultiplier" step={0.01} validate={validateMultiplier('rewardGemMultiplier')} />
      <TextInput source="backgroundImagePath" />
      <BooleanInput source="active" />
    </SimpleForm>
  </Edit>
);

const ItemUpgradeTiersList = () => (
  <List
    filters={[<TextInput source="itemId" />]}
    filterDefaultValues={{ itemId: 'flame-sword' }}
  >
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <TextField source="itemId" />
      <NumberField source="upgradeLevel" />
      <NumberField source="upgradeGoldCost" />
      <NumberField source="attackBonus" />
      <NumberField source="defenseBonus" />
      <NumberField source="hpBonus" />
      <NumberField source="mpBonus" />
    </Datagrid>
  </List>
);

const ItemUpgradeTiersCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="itemId" defaultValue="flame-sword" />
      <NumberInput source="upgradeLevel" validate={requiredPositive('upgradeLevel')} />
      <NumberInput source="upgradeGoldCost" validate={requiredNonNegative('upgradeGoldCost')} />
      <NumberInput source="attackBonus" validate={requiredNonNegative('attackBonus')} />
      <NumberInput source="defenseBonus" validate={requiredNonNegative('defenseBonus')} />
      <NumberInput source="hpBonus" validate={requiredNonNegative('hpBonus')} />
      <NumberInput source="mpBonus" validate={requiredNonNegative('mpBonus')} />
    </SimpleForm>
  </Create>
);

const ItemUpgradeTiersEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="itemId" />
      <NumberInput source="upgradeLevel" validate={requiredPositive('upgradeLevel')} />
      <NumberInput source="upgradeGoldCost" validate={requiredNonNegative('upgradeGoldCost')} />
      <NumberInput source="attackBonus" validate={requiredNonNegative('attackBonus')} />
      <NumberInput source="defenseBonus" validate={requiredNonNegative('defenseBonus')} />
      <NumberInput source="hpBonus" validate={requiredNonNegative('hpBonus')} />
      <NumberInput source="mpBonus" validate={requiredNonNegative('mpBonus')} />
    </SimpleForm>
  </Edit>
);

const BalanceProfilesList = () => (
  <List>
    <Datagrid rowClick="edit" bulkActionButtons={false}>
      <TextField source="profileId" />
      <TextField source="profileName" />
      <TextField source="description" />
      <FunctionField
        label="jsonBytes"
        render={(record: any) => {
          const size = new Blob([String(record?.json ?? '')]).size;
          return `${size.toLocaleString()} bytes`;
        }}
      />
      <TextField source="updatedAt" />
      <FunctionField
        label="copy"
        render={(record: any) => <CopyJsonButton json={String(record?.profileJson ?? '{}')} />}
      />
      <DeleteButton />
    </Datagrid>
  </List>
);

const BalanceProfilesCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="profileId" helperText="unique key (e.g. season-2026-02)" />
      <TextInput source="profileName" />
      <TextInput source="description" />
      <TextInput source="profileJson" multiline minRows={20} fullWidth validate={validateJsonText} />
      <BooleanInput source="active" defaultValue />
    </SimpleForm>
  </Create>
);

const BalanceProfilesEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="profileName" />
      <TextInput source="description" />
      <TextInput source="profileJson" multiline minRows={20} fullWidth validate={validateJsonText} />
      <BooleanInput source="active" />
    </SimpleForm>
  </Edit>
);

const CompanionMastersList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="companionId" />
      <TextField source="companionName" />
      <TextField source="grade" />
      <TextField source="classId" />
      <NumberField source="baseAttack" />
      <NumberField source="baseDefense" />
      <NumberField source="baseHp" />
      <NumberField source="baseMp" />
      <NumberField source="recruitWeight" />
      <BooleanField source="active" />
    </Datagrid>
  </List>
);

const CompanionMastersCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="companionId" />
      <TextInput source="companionName" />
      <SelectInput source="grade" choices={companionGradeChoices} />
      <ClassSelectInput source="classId" />
      <NumberInput source="baseAttack" validate={requiredNonNegative('baseAttack')} />
      <NumberInput source="baseDefense" validate={requiredNonNegative('baseDefense')} />
      <NumberInput source="baseHp" validate={requiredNonNegative('baseHp')} />
      <NumberInput source="baseMp" validate={requiredNonNegative('baseMp')} />
      <TextInput source="imageUrl" />
      <TextInput source="renderProfileJson" multiline minRows={8} fullWidth validate={validateJsonOrEmpty} />
      <NumberInput source="recruitWeight" validate={requiredPositive('recruitWeight')} />
      <BooleanInput source="active" defaultValue />
    </SimpleForm>
  </Create>
);

const CompanionMastersEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="companionName" />
      <SelectInput source="grade" choices={companionGradeChoices} />
      <ClassSelectInput source="classId" />
      <NumberInput source="baseAttack" validate={requiredNonNegative('baseAttack')} />
      <NumberInput source="baseDefense" validate={requiredNonNegative('baseDefense')} />
      <NumberInput source="baseHp" validate={requiredNonNegative('baseHp')} />
      <NumberInput source="baseMp" validate={requiredNonNegative('baseMp')} />
      <TextInput source="imageUrl" />
      <TextInput source="renderProfileJson" multiline minRows={8} fullWidth validate={validateJsonOrEmpty} />
      <NumberInput source="recruitWeight" validate={requiredPositive('recruitWeight')} />
      <BooleanInput source="active" />
    </SimpleForm>
  </Edit>
);

const UserCompanionsList = () => (
  <List
    filters={[<TextInput source="userId" />]}
    filterDefaultValues={{ userId: '1' }}
  >
    <Datagrid rowClick="edit">
      <NumberField source="id" />
      <NumberField source="userId" />
      <TextField source="companionId" />
      <TextField source="companionName" />
      <TextField source="grade" />
      <TextField source="classId" />
      <NumberField source="level" />
      <NumberField source="copies" />
      <NumberField source="slotNo" />
      <NumberField source="attack" />
      <NumberField source="defense" />
      <NumberField source="hp" />
      <NumberField source="mp" />
    </Datagrid>
  </List>
);

const UserCompanionsEdit = () => (
  <Edit>
    <SimpleForm>
      <NumberInput source="level" validate={requiredPositive('level')} />
      <NumberInput source="copies" validate={requiredPositive('copies')} />
      <NumberInput source="slotNo" />
    </SimpleForm>
  </Edit>
);

export default function App() {
  return (
    <Admin dataProvider={dataProvider} layout={AdminLayout}>
      <Resource name="players" options={{ label: '캐릭터' }} list={PlayersList} edit={PlayersEdit} />
      <Resource
        name="classMasters"
        options={{ label: '클래스' }}
        list={ClassMastersList}
        create={ClassMastersCreate}
        edit={ClassMastersEdit}
      />
      <Resource name="items" options={{ label: '아이템' }} list={ItemsList} create={ItemsCreate} edit={ItemsEdit} />
      <Resource
        name="itemUpgradeTiers"
        options={{ label: '장비강화티어' }}
        list={ItemUpgradeTiersList}
        create={ItemUpgradeTiersCreate}
        edit={ItemUpgradeTiersEdit}
      />
      <Resource name="monsters" options={{ label: '몬스터' }} list={MonstersList} create={MonstersCreate} edit={MonstersEdit} />
      <Resource
        name="monsterDrops"
        options={{ label: '몬스터 드랍' }}
        list={MonsterDropsList}
        create={MonsterDropsCreate}
        edit={MonsterDropsEdit}
      />
      <Resource name="waves" options={{ label: '웨이브' }} list={WavesList} create={WavesCreate} edit={WavesEdit} />
      <Resource
        name="waveGroups"
        options={{ label: '웨이브 배수' }}
        list={WaveGroupsList}
        create={WaveGroupsCreate}
        edit={WaveGroupsEdit}
      />
      <Resource
        name="balanceProfiles"
        options={{ label: '밸런스(1/2/3)' }}
        list={BalanceProfilesList}
        create={BalanceProfilesCreate}
        edit={BalanceProfilesEdit}
      />
      <Resource
        name="companionMasters"
        options={{ label: '동료 마스터' }}
        list={CompanionMastersList}
        create={CompanionMastersCreate}
        edit={CompanionMastersEdit}
      />
      <Resource name="userCompanions" options={{ label: '유저 동료' }} list={UserCompanionsList} edit={UserCompanionsEdit} />
    </Admin>
  );
}
