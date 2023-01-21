import type { PlayerList } from '../../../../index.js';
import draw from './draw.js';

const generateTablist = async (players: PlayerList[]) => {
    let arr = [];
    for (const player of players) {
        let name = player.name;
        let ping = player.ping;
        arr.push(`${name}:${ping}`);
    }

    const tabListImage = await draw(arr.sort());
    return tabListImage;
};

export default generateTablist