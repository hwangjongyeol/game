import {
  Admin,
  BooleanField,
  BooleanInput,
  Create,
  Datagrid,
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
  TextInput
} from 'react-admin';
import { dataProvider } from './dataProvider';

const classChoices = [
  { id: 'knight', name: 'knight' },
  { id: 'mage', name: 'mage' },
  { id: 'ranger', name: 'ranger' }
];

const AdminMenu = () => (
  <Menu>
    <Menu.ResourceItem name="players" />
    <Menu.ResourceItem name="items" />
    <Menu.ResourceItem name="monsters" />
    <Menu.ResourceItem name="monsterDrops" />
    <Menu.ResourceItem name="waves" />
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
      <SelectInput source="classId" choices={classChoices} />
      <NumberInput source="level" />
      <NumberInput source="exp" />
      <NumberInput source="powerScore" />
      <BooleanInput source="deleted" />
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
      <SelectInput source="requiredClassId" choices={classChoices} emptyText="(all class)" />
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
      <SelectInput source="requiredClassId" choices={classChoices} emptyText="(all class)" />
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
      <NumberInput source="waveNo" validate={requiredPositive('waveNo')} />
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
      <NumberInput source="waveNo" validate={requiredPositive('waveNo')} />
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
      <SelectInput source="classId" choices={classChoices} />
      <NumberInput source="baseAttack" validate={requiredNonNegative('baseAttack')} />
      <NumberInput source="baseDefense" validate={requiredNonNegative('baseDefense')} />
      <NumberInput source="baseHp" validate={requiredNonNegative('baseHp')} />
      <NumberInput source="baseMp" validate={requiredNonNegative('baseMp')} />
      <TextInput source="imageUrl" />
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
      <SelectInput source="classId" choices={classChoices} />
      <NumberInput source="baseAttack" validate={requiredNonNegative('baseAttack')} />
      <NumberInput source="baseDefense" validate={requiredNonNegative('baseDefense')} />
      <NumberInput source="baseHp" validate={requiredNonNegative('baseHp')} />
      <NumberInput source="baseMp" validate={requiredNonNegative('baseMp')} />
      <TextInput source="imageUrl" />
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
      <Resource name="items" options={{ label: '아이템' }} list={ItemsList} create={ItemsCreate} edit={ItemsEdit} />
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
