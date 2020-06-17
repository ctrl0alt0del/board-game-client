import { Tile } from "./tiles/Tile";

export const AVAILABLE_TILES = [
    {
        name: '21 одинаковая с обеих сторон',
        back:  null
    },
    {
        name: '13',
        back: 'bad_back'
    },
    {
        name: '2',
        back: 'bad_back'
    },
    {
        name: '1',
        back: 'bad_back'
    },
    {
        name: '4',
        back: 'bad_back'
    },
    {
        name: '5',
        back: 'bad_back'
    },
    {
        name: '6',
        back: 'bad_back'
    },
    {
        name: '11',
        back: 'good_back'
    },
    {
        name: '12',
        back: 'good_back'
    },
    {
        name: '3',
        back: 'good_back'
    },
    {
        name: '14',
        back: 'good_back'
    },
    {
        name: '15',
        back: 'good_back'
    },
    {
        name: '16',
        back: 'good_back'
    },
    {
        name: '17',
        back: 'good_back'
    },
    {
        name: '18',
        back: 'good_back'
    },
    {
        name: '22 1',
        back: null
    },
    {
        name: '22 2',
        back: null
    },
    {
        name: '23 1',
        back: null
    },
    {
        name: '23 2',
        back: null
    },
    {
        name: '24 1',
        back: null
    },
    {
        name: '24 2',
        back: null
    },
    {
        name: '25 1',
        back: null
    },
    {
        name: '25 2',
        back: null
    },
    {
        name: '26 1',
        back: null
    },
    {
        name: '26 2',
        back: null
    },
    {
        name: '27 1',
        back: null
    },
    {
        name: '27 2',
        back: null
    }
]

export const getInteractorKeyForTile = (tile: Tile) => {
    return tile.id;
}