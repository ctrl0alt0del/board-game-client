import { Injectable } from "injection-js";
import { fromEvent, Observable } from 'rxjs';

@Injectable()
export class UIEventManager {
    private mouseMove$: Observable<MouseEvent>;
    private mouseDown$: Observable<MouseEvent>;
    private keyDown$: Observable<KeyboardEvent>;
    private keyUp$: Observable<KeyboardEvent>;
    private mouseWheel$: Observable<WheelEvent>;

    get mouseMove() {
        return this.mouseMove$;
    }
    get mouseDown() {
        return this.mouseDown$;
    }

    get keyDown(){
        return this.keyDown$;
    }

    get keyUp(){
        return this.keyUp$;
    }

    get mouseWheel() {
        return this.mouseWheel$;
    }
    
    constructor() {
        this.registerEventsListeners();
    }

    private registerEventsListeners() {
        this.mouseMove$ = fromEvent<MouseEvent>(document, 'mousemove');
        this.mouseDown$ = fromEvent<MouseEvent>(document, 'mousedown');
        this.keyDown$ = fromEvent<KeyboardEvent>(document, 'keydown');
        this.keyUp$ = fromEvent<KeyboardEvent>(document, 'keyup');
        this.mouseWheel$ = fromEvent<WheelEvent>(document, 'wheel');
    }
}