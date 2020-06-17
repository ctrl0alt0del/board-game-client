import { CodeString } from "./CodeString";
import { InputStreamCursor } from "./InputStreamCursor";
import { Char } from "./Char";
import { Stream } from "../Stream.model";

export class InputStream extends Stream<Char, InputStreamCursor> {
    protected cursor = 0;
    protected line = 0;
    constructor(protected code: CodeString) {
        super();
    }
    read() {
        const output = this.code.getChar(this.cursor++);
        if(output.isNewLine()) {
            this.line++;
        }
        return output;
    }
    peek() {
        return this.code.getChar(this.cursor);
    }
    isEof() {
        return this.cursor === this.code.length;
    }
    getCursor() {
        return new InputStreamCursor(this.cursor, this.line);
    }

    setCursor(cursor: InputStreamCursor) {
        this.cursor = cursor.position;
        this.line = cursor.line;
    }
    move(distance: number) {
        for (let i = 0; i < distance; i++) {
            this.read();
        }
    }
    clone() {
        const clone = new InputStream(this.code);
        clone.cursor = this.cursor;
        clone.line = this.line;
        return clone;
    }
}
