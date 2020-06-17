import { Injectable, InjectionToken, Inject } from "injection-js";
import { GameState } from "../../state/GameState.interface";
import fs = require('fs');
import { ExecutionQueue } from "../../utils/ExecutionQueue.model";
const FileSystem = fs.promises;

export const SaveSerializer = new InjectionToken<(gameState: GameState) => string>("SaveSerializer");
export const SaveUnserializer = new InjectionToken<(str: string) => GameState>('SaveUnserializer')

@Injectable()
export class SaveService {

    constructor(
        @Inject(SaveSerializer) private serializer: (gameState: GameState) => string,
        @Inject(SaveUnserializer) private unserializer: (str: string) => GameState
    ) {

    }

    private savesTaskQueue = new ExecutionQueue<GameState>(state => this._unsafeSave(state))

    save(gameState: GameState) {
        this.savesTaskQueue.enqueue(gameState)
    }

    private async _unsafeSave(gameState: GameState) {
        await this.ensureSaveFolderExists();
        console.log('Saving Game State:', gameState)
        return FileSystem.writeFile('public/saves/save.json', Buffer.from(this.serializer(gameState)));
    }

    async load(): Promise<GameState> {
        await this.ensureSaveFolderExists();
        try {
            const content = await (await fetch('/saves/save.json')).text();
            return this.unserializer(content.toString());
        } catch(err) {
            console.error(err)
            return undefined;
        }
    }

    private async ensureSaveFolderExists() {
        let exists = true;
        try {
            const stat = await FileSystem.stat('public/saves');
            exists = stat.isDirectory();
        } catch (err) {
            exists = false;
        }
        if (!exists) {
            return FileSystem.mkdir('public/saves');
        }
    }
}