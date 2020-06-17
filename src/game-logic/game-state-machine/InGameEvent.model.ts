import { MapFunction } from "../../utils/Functions.utils";

export type InGameEvent = MapFunction<()=>void, void>