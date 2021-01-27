export enum LogEvent {
  SWING_MISSED = "SWING_MISSED",
  RANGE_MISSED = "RANGE_MISSED",
  SPELL_MISSED = "SPELL_MISSED",
  SPELL_PERIODIC_MISSED = "SPELL_PERIODIC_MISSED",
  DAMAGE_SHIELD_MISSED = "DAMAGE_SHIELD_MISSED",
  SPELL_CAST_SUCCESS = "SPELL_CAST_SUCCESS",
  SPELL_AURA_APPLIED = "SPELL_AURA_APPLIED",
  SPELL_AURA_REMOVED = "SPELL_AURA_REMOVED",
  SPELL_STOLEN = "SPELL_STOLEN",
  SPELL_INTERRUPT = "SPELL_INTERRUPT",
  SPELL_DISPEL = "SPELL_DISPEL",
  SPELL_DISPEL_FAILED = "SPELL_DISPEL_FAILED",
  SPELL_EXTRA_ATTACKS = "SPELL_EXTRA_ATTACKS",
  SPELL_AURA_APPLIED_DOSE = "SPELL_AURA_APPLIED_DOSE",
  SPELL_AURA_REMOVED_DOSE = "SPELL_AURA_REMOVED_DOSE",
  SPELL_AURA_REFRESH = "SPELL_AURA_REFRESH",
  SPELL_AURA_BROKEN = "SPELL_AURA_BROKEN",
  SPELL_AURA_BROKEN_SPELL = "SPELL_AURA_BROKEN_SPELL",
  SWING_DAMAGE = "SWING_DAMAGE",
  ENVIRONMENTAL_DAMAGE = "ENVIRONMENTAL_DAMAGE",
  RANGE_DAMAGE = "RANGE_DAMAGE",
  SPELL_DAMAGE = "SPELL_DAMAGE",
  SPELL_PERIODIC_DAMAGE = "SPELL_PERIODIC_DAMAGE",
  DAMAGE_SHIELD = "DAMAGE_SHIELD",
  SPELL_DRAIN = "SPELL_DRAIN",
  SPELL_PERIODIC_DRAIN = "SPELL_PERIODIC_DRAIN",
  SPELL_LEECH = "SPELL_LEECH",
  SPELL_PERIODIC_LEECH = "SPELL_PERIODIC_LEECH",
  SPELL_HEAL = "SPELL_HEAL",
  SPELL_PERIODIC_HEAL = "SPELL_PERIODIC_HEAL",
  SPELL_ENERGIZE = "SPELL_ENERGIZE",
  SPELL_PERIODIC_ENERGIZE = "SPELL_PERIODIC_ENERGIZE",
  DAMAGE_SPLIT = "DAMAGE_SPLIT",
  UNIT_DIED = "UNIT_DIED",
}

export enum CombatResult {
  Unknown,
  DrawGame,
  Lose,
  Win,
}

export interface ILogLine {
  id: string;
  timestamp: number;
  event: LogEvent;
  parameters: string[];
}

export enum CombatUnitReaction {
  Neutral,
  Friendly,
  Hostile,
}

export enum CombatUnitType {
  None,
  Player,
  Pet,
}

export enum CombatUnitClass {
  None,
  Warrior,
  Hunter,
  Shaman,
  Paladin,
  Warlock,
  Priest,
  Rogue,
  Mage,
  Druid,
  DeathKnight,
  DemonHunter,
  Monk,
}

export enum CombatUnitSpec {
  None = 0,
  DeathKnight_Blood = 250,
  DeathKnight_Frost = 251,
  DeathKnight_Unholy = 252,
  DemonHunter_Havoc = 577,
  DemonHunter_Vengeance = 581,
  Druid_Balance = 102,
  Druid_Feral = 103,
  Druid_Guardian = 104,
  Druid_Restoration = 105,
  Hunter_BeastMastery = 253,
  Hunter_Marksmanship = 254,
  Hunter_Survival = 255,
  Mage_Arcane = 62,
  Mage_Fire = 63,
  Mage_Frost = 64,
  Monk_BrewMaster = 268,
  Monk_Windwalker = 269,
  Monk_Mistweaver = 270,
  Paladin_Holy = 65,
  Paladin_Protection = 66,
  Paladin_Retribution = 70,
  Priest_Discipline = 256,
  Priest_Holy = 257,
  Priest_Shadow = 258,
  Rogue_Assassination = 259,
  Rogue_Outlaw = 260,
  Rogue_Subtlety = 261,
  Shaman_Elemental = 262,
  Shaman_Enhancement = 263,
  Shaman_Restoration = 264,
  Warlock_Affliction = 265,
  Warlock_Demonology = 266,
  Warlock_Destruction = 267,
  Warrior_Arms = 71,
  Warrior_Fury = 72,
  Warrior_Protection = 73,
}

export interface ICombatantMetadata {
  class: CombatUnitClass;
  spec: CombatUnitSpec;
}