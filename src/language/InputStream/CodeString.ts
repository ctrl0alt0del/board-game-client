import { Char } from "./Char";

export class CodeString extends String {
    getChar(index: number) {
        const charStr = this.charAt(index);
        return new Char(charStr);
    }
}
