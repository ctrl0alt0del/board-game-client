import { Stream } from "./Stream.model";

export abstract class StreamOperator<T, K, J> extends Stream<J, K> {
    constructor(readonly stream: Stream<T, K>) {
        super();
    }

    abstract read(): J;
    abstract clone(): Stream<J, K>;
    
    peek() {
        return this.clone().read();
    }

    isEof(){
        return this.stream.isEof();
    }

    getCursor(){
        return this.stream.getCursor();
    }
    setCursor(cursor: K) {
        return this.stream.setCursor(cursor);
    }
}

export const filterStream = <T, K>(stream: Stream<T, K>, predicate: (t: T) => boolean): Stream<T, K> => {
    return new class AnonimousFilterStream extends StreamOperator<T, K, T> {
        read() {
            let t = stream.read();
            if(!t) {
                return t;
            }
            while(!predicate(t)){
                t = stream.read()
            }
            return t;
        }
        clone() {
            return filterStream(stream.clone(), predicate);
        }
    }(stream);
}

export const mapStream = <In, Cursor, Out>(stream: Stream<In, Cursor>, mapFn: (i: In) => Out) => {
    return new class AnonimousMapStream extends StreamOperator<In, Cursor, Out> {
        read() {
            if(this.isEof()){
                return null;
            }
            return mapFn(this.stream.read());
        }
        clone(){
            return mapStream(stream, mapFn);
        }
    }(stream);
}