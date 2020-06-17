import { withDisplayable } from "../CalculationBreakdown.model";

export enum PrimaryStatistics {
    Strength,
    Perception,
    Endurance,
    Charisma,
    Intelligence,
    Agility,
    Luck
}

export enum Perks {
    None,
    Evil
}

export const primaryStatsToDisplayable = (stat: PrimaryStatistics): withDisplayable => ({displayable: {imageSrc: '', text: PrimaryStatistics[stat]}})

export const PrimaryStatisticsArray = [PrimaryStatistics.Strength, PrimaryStatistics.Perception, PrimaryStatistics.Endurance,
PrimaryStatistics.Charisma, PrimaryStatistics.Intelligence, PrimaryStatistics.Agility, PrimaryStatistics.Luck]

export const getPrimaryStatByLetter = (letter: string) => {
    return PrimaryStatisticsArray.find(value => PrimaryStatistics[value][0].toUpperCase() === letter.toUpperCase());
}