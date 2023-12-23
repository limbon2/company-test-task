import { DEVELOPER } from "../config/api";

export const appendDeveloper = <T>(params: T): T & { developer: string } => ({ ...params, developer: DEVELOPER });
