export class InputStreamCursor {
    constructor(private _position = 0, private _line = 0) {
    }
    get line() {
        return this._line + 1;
    }
    get position() {
        return this._position;
    }
    get column() {
        return this._line === 0 ? this._position : this._position % this._line;
    }
}
