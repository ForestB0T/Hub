import Canvas from "canvas";

export default async function fetchAvatar(name: string): Promise<Canvas.Image> {
    let img: Canvas.Image;
    try {
        img = await Canvas.loadImage(`https://mc-heads.net/avatar/${name}/16`);
        return img;
    } catch (err) {
        img = await Canvas.loadImage("https://mc-heads.net/avatar/steve/16")
        return img;
    }
}