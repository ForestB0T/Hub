import type { PlayerList } from '../../../../index.js';
import draw from './draw.js';

const generateTablist = async (players: PlayerList[]) => {

    const tabListImage = await draw(players);
    return tabListImage;
};

export default generateTablist