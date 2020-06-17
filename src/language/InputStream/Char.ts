export class Char extends String {
    static makeString(...args: Char[]) {
        return args.map(c => c.toString()).join('');
    }
    constructor(private value: string) {
        super(value);
    }

    isEmpty() {
        return !this.value;
    }

    isSymbol(sym: string) {
        return this.value === sym;
    }

    isNewLine() {
        return this.value === '\n' || this.value.charCodeAt(0) === 13;
    }
    isIdSymbol() {
        return /[A-z]/.test(this.value);
    }
    isWhitespace() {
        return this.value === ' ';
    }
    isDigit() {
        return /[0-9]/.test(this.value);
    }
    isMantisaSeperator() {
        return this.value === '.';
    }
    toString() {
        return this.value;
    }
}
