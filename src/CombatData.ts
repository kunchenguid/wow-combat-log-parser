/* eslint-disable no-fallthrough */
import _ from "lodash";
import { uniqueId } from "lodash";
import {
  ArenaMatchStart,
  ArenaMatchStartInfo,
} from "./actions/ArenaMatchStart";
import { ArenaMatchEnd, ArenaMatchEndInfo } from "./actions/ArenaMatchEnd";
import { CombatAction } from "./actions/CombatAction";
import { CombatantInfoAction } from "./actions/CombatantInfoAction";
import { CombatAdvancedAction } from "./actions/CombatAdvancedAction";
import { CombatHpUpdateAction } from "./actions/CombatHpUpdateAction";
import { CombatUnit, ICombatUnit } from "./CombatUnit";
import {
  CombatResult,
  CombatUnitClass,
  CombatUnitReaction,
  CombatUnitSpec,
  CombatUnitType,
  ICombatantMetadata,
  ILogLine,
  LogEvent,
} from "./types";
import { parseQuotedName } from "./utils";

export interface ICombatData {
  id: string;
  startTime: number;
  endTime: number;
  units: { [unitId: string]: ICombatUnit };
  playerTeamId: string;
  playerTeamRating: number;
  result: CombatResult;
  hasAdvancedLogging: boolean;
  rawLines: string[];
  linesNotParsedCount: number;
  startInfo: ArenaMatchStartInfo;
  endInfo: ArenaMatchEndInfo;
}

export interface IMalformedCombatData {
  id: string;
  startTime: number;
  rawLines: string[];
  linesNotParsedCount: number;
}

export class CombatData {
  public endInfo: ArenaMatchEndInfo | undefined = undefined;
  public startInfo: ArenaMatchStartInfo | undefined = undefined;
  public id: string = uniqueId("combat");
  public isWellFormed = false;
  public startTime = 0;
  public endTime = 0;
  public units: { [unitId: string]: CombatUnit } = {};
  public playerTeamId = "";
  public playerTeamRating = 0;
  public result: CombatResult = CombatResult.Unknown;
  public hasAdvancedLogging = false;
  public rawLines: string[] = [];
  public linesNotParsedCount = 0;

  private combatantMetadata: Map<string, ICombatantMetadata> = new Map<
    string,
    ICombatantMetadata
  >();

  public readLogLine(logLine: ILogLine) {
    if (this.startTime === 0) {
      this.startTime = logLine.timestamp;
    }
    this.endTime = logLine.timestamp;

    if (logLine.event === LogEvent.ARENA_MATCH_START) {
      const arenaStart = new ArenaMatchStart(logLine);
      this.startInfo = {
        timestamp: arenaStart.timestamp,
        zoneId: arenaStart.zoneId,
        item1: arenaStart.item1,
        bracket: arenaStart.bracket,
        isRanked: arenaStart.isRanked,
      };
    }
    if (logLine.event === LogEvent.ARENA_MATCH_END) {
      const arenaEnd = new ArenaMatchEnd(logLine);
      this.endInfo = {
        timestamp: arenaEnd.timestamp,
        winningTeamId: arenaEnd.winningTeamId,
        matchDurationInSeconds: arenaEnd.matchDurationInSeconds,
        team0MMR: arenaEnd.team0MMR,
        team1MMR: arenaEnd.team1MMR,
      };
    }

    if (logLine.parameters.length < 8) {
      return;
    }

    if (logLine.event === LogEvent.COMBATANT_INFO) {
      const infoAction = new CombatantInfoAction(logLine);
      const unitId: string = logLine.parameters[0].toString();
      const specId: string = logLine.parameters[23].toString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((<any>Object).values(CombatUnitSpec).indexOf(specId) >= 0) {
        const spec = specId as CombatUnitSpec;
        let unitClass = CombatUnitClass.None;
        switch (spec) {
          case CombatUnitSpec.DeathKnight_Blood:
          case CombatUnitSpec.DeathKnight_Frost:
          case CombatUnitSpec.DeathKnight_Unholy:
            unitClass = CombatUnitClass.DeathKnight;
            break;
          case CombatUnitSpec.DemonHunter_Havoc:
          case CombatUnitSpec.DemonHunter_Vengeance:
            unitClass = CombatUnitClass.DemonHunter;
            break;
          case CombatUnitSpec.Druid_Balance:
          case CombatUnitSpec.Druid_Feral:
          case CombatUnitSpec.Druid_Guardian:
          case CombatUnitSpec.Druid_Restoration:
            unitClass = CombatUnitClass.Druid;
            break;
          case CombatUnitSpec.Hunter_BeastMastery:
          case CombatUnitSpec.Hunter_Marksmanship:
          case CombatUnitSpec.Hunter_Survival:
            unitClass = CombatUnitClass.Hunter;
            break;
          case CombatUnitSpec.Mage_Arcane:
          case CombatUnitSpec.Mage_Fire:
          case CombatUnitSpec.Mage_Frost:
            unitClass = CombatUnitClass.Mage;
            break;
          case CombatUnitSpec.Monk_BrewMaster:
          case CombatUnitSpec.Monk_Windwalker:
          case CombatUnitSpec.Monk_Mistweaver:
            unitClass = CombatUnitClass.Monk;
            break;
          case CombatUnitSpec.Paladin_Holy:
          case CombatUnitSpec.Paladin_Protection:
          case CombatUnitSpec.Paladin_Retribution:
            unitClass = CombatUnitClass.Paladin;
            break;
          case CombatUnitSpec.Priest_Discipline:
          case CombatUnitSpec.Priest_Holy:
          case CombatUnitSpec.Priest_Shadow:
            unitClass = CombatUnitClass.Priest;
            break;
          case CombatUnitSpec.Rogue_Assassination:
          case CombatUnitSpec.Rogue_Outlaw:
          case CombatUnitSpec.Rogue_Subtlety:
            unitClass = CombatUnitClass.Rogue;
            break;
          case CombatUnitSpec.Shaman_Elemental:
          case CombatUnitSpec.Shaman_Enhancement:
          case CombatUnitSpec.Shaman_Restoration:
            unitClass = CombatUnitClass.Shaman;
            break;
          case CombatUnitSpec.Warlock_Affliction:
          case CombatUnitSpec.Warlock_Demonology:
          case CombatUnitSpec.Warlock_Destruction:
            unitClass = CombatUnitClass.Warlock;
            break;
          case CombatUnitSpec.Warrior_Arms:
          case CombatUnitSpec.Warrior_Fury:
          case CombatUnitSpec.Warrior_Protection:
            unitClass = CombatUnitClass.Warrior;
            break;
        }
        this.registerCombatant(unitId, {
          spec,
          class: unitClass,
          info: infoAction.info,
        });
      }
      return;
    }

    const srcGUID = logLine.parameters[0].toString();
    const srcName = parseQuotedName(logLine.parameters[1]);
    const srcFlag = logLine.parameters[2];

    const destGUID = logLine.parameters[4].toString();
    const destName = parseQuotedName(logLine.parameters[5]);
    const destFlag = logLine.parameters[6];

    if (!this.units[srcGUID]) {
      this.units[srcGUID] = new CombatUnit(srcGUID, srcName);
    }
    if (!this.units[destGUID]) {
      this.units[destGUID] = new CombatUnit(destGUID, destName);
    }

    const srcUnit = this.units[srcGUID];
    const destUnit = this.units[destGUID];
    if (!srcUnit || !destUnit) {
      throw new Error(
        "failed to parse source unit or dest unit from the log line"
      );
    }
    srcUnit.endTime = logLine.timestamp;
    destUnit.endTime = logLine.timestamp;

    srcUnit.proveType(this.getUnitType(srcFlag));
    destUnit.proveType(this.getUnitType(destFlag));

    srcUnit.proveReaction(this.getUnitReaction(srcFlag));
    destUnit.proveReaction(this.getUnitReaction(destFlag));

    switch (logLine.event) {
      case LogEvent.SWING_DAMAGE:
      case LogEvent.RANGE_DAMAGE:
      case LogEvent.SPELL_DAMAGE:
      case LogEvent.SPELL_PERIODIC_DAMAGE:
        {
          const damageAction = new CombatHpUpdateAction(logLine);
          if (srcGUID !== destGUID) {
            srcUnit.damageOut.push(damageAction);
          }
          destUnit.damageIn.push(damageAction);
          if (damageAction.advanced) {
            const advancedActor = this.units[damageAction.advancedActorId];
            advancedActor?.advancedActions.push(damageAction);
            this.hasAdvancedLogging = true;
          }
        }
        break;
      case LogEvent.SPELL_HEAL:
      case LogEvent.SPELL_PERIODIC_HEAL:
        {
          const healAction = new CombatHpUpdateAction(logLine);
          srcUnit.healOut.push(healAction);
          destUnit.healIn.push(healAction);
          if (healAction.advanced) {
            const advancedActor = this.units[healAction.advancedActorId];
            advancedActor?.advancedActions.push(healAction);
            this.hasAdvancedLogging = true;
          }
        }
        break;
      case LogEvent.SPELL_AURA_APPLIED:
      case LogEvent.SPELL_AURA_APPLIED_DOSE:
      case LogEvent.SPELL_AURA_REFRESH:
      case LogEvent.SPELL_AURA_REMOVED:
      case LogEvent.SPELL_AURA_REMOVED_DOSE:
      case LogEvent.SPELL_AURA_BROKEN:
      case LogEvent.SPELL_AURA_BROKEN_SPELL:
        {
          const auraEvent = new CombatAction(logLine);
          destUnit.auraEvents.push(auraEvent);
        }
        break;
      case LogEvent.SPELL_INTERRUPT:
      case LogEvent.SPELL_STOLEN:
      case LogEvent.SPELL_DISPEL:
      case LogEvent.SPELL_DISPEL_FAILED:
      case LogEvent.SPELL_EXTRA_ATTACKS:
        srcUnit.actionOut.push(logLine);
        destUnit.actionIn.push(logLine);
        break;
      case LogEvent.UNIT_DIED:
        destUnit.deathRecords.push(logLine);
        break;
      case LogEvent.SPELL_CAST_SUCCESS:
        {
          const advancedAction = new CombatAdvancedAction(logLine);
          if (advancedAction.advanced) {
            const advancedActor = this.units[advancedAction.advancedActorId];
            advancedActor?.advancedActions.push(advancedAction);
            this.hasAdvancedLogging = true;
          }
          srcUnit.spellCastEvents.push(advancedAction);
          srcUnit.actionOut.push(logLine);
          destUnit.actionIn.push(logLine);
        }
        break;
      case LogEvent.SPELL_CAST_START:
      case LogEvent.SPELL_CAST_FAILED:
        {
          const action = new CombatAction(logLine);
          srcUnit.spellCastEvents.push(action);
        }
        break;
    }
  }

  public registerCombatant(id: string, combatantMetadata: ICombatantMetadata) {
    this.combatantMetadata.set(id, combatantMetadata);
  }

  public end(wasTimeout?: boolean) {
    _.forEach(this.units, unit => {
      unit.endActivity();
      if (this.combatantMetadata.has(unit.id)) {
        const metadata = this.combatantMetadata.get(unit.id);
        if (metadata) {
          unit.info = metadata?.info;
          if (unit.reaction === CombatUnitReaction.Friendly) {
            this.playerTeamId = metadata.info.teamId;
          }
        }
        unit.proveClass(metadata?.class || CombatUnitClass.None);
        unit.proveSpec(metadata?.spec || CombatUnitSpec.None);
      }
      unit.end();
    });

    // a valid arena combat should have at least two friendly units and two hostile units
    const playerUnits = Array.from(_.values(this.units)).filter(
      unit => unit.type === CombatUnitType.Player
    );
    const deadPlayerCount = playerUnits.filter(p => p.deathRecords.length > 0)
      .length;

    if (this.playerTeamId) {
      this.playerTeamRating =
        this.playerTeamId === "0"
          ? this.endInfo?.team0MMR || 0
          : this.endInfo?.team1MMR || 0;
    }

    if (this.endInfo) {
      if (this.endInfo.winningTeamId === this.playerTeamId) {
        this.result = CombatResult.Win;
      } else {
        this.result = CombatResult.Lose;
      }
    } else {
      this.result = CombatResult.Unknown;
    }

    if (
      playerUnits.length === this.combatantMetadata.size &&
      deadPlayerCount > 0 &&
      !wasTimeout &&
      this.startInfo &&
      this.endInfo &&
      deadPlayerCount < this.combatantMetadata.size &&
      (this.result === CombatResult.Win || this.result === CombatResult.Lose)
    ) {
      this.isWellFormed = true;
    }
  }

  private getUnitType(flag: number): CombatUnitType {
    // tslint:disable-next-line: no-bitwise
    const masked = flag & 0x0000fc00;
    switch (masked) {
      case 0x00001000:
        return CombatUnitType.Pet;
      case 0x00000400:
        return CombatUnitType.Player;
      default:
        return CombatUnitType.None;
    }
  }

  private getUnitReaction(flag: number): CombatUnitReaction {
    // tslint:disable-next-line: no-bitwise
    const masked = flag & 0x000000f0;
    switch (masked) {
      case 0x00000040:
        return CombatUnitReaction.Hostile;
      case 0x00000010:
        return CombatUnitReaction.Friendly;
      default:
        return CombatUnitReaction.Neutral;
    }
  }
}
