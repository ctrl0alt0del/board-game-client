import { Either } from "./Either";

const _tryParseJSON = Either.try<string, any, SyntaxError>(JSON.parse);

export const tryParseJSON = <T>(input: string): Either<SyntaxError, T> => {
    return _tryParseJSON(input);
}