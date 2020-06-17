import { InputStream } from "../../InputStream/InputStream";
import { Token } from "../Token";
import { Stream } from "../../Stream.model";

export type TokenParser = (inputStream: Stream<String, any>) => Token | false