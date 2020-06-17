
const getOrderForLevel = (lvl: number) => {
    return  lvl * 3 + 1;
}

export enum ObjectsRenderingOrder {
    TileOrder=getOrderForLevel(0),
    CharacterOrder = getOrderForLevel(1),
    Helpers = getOrderForLevel(2)
}

export enum GameAbilities{
    
}