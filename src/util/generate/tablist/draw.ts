import Canvas from 'canvas';
import { PlayerList } from '../../../..';

const draw = (names: PlayerList[]) => {
    return new Promise(async resolve => {
        let width = Math.ceil(names.length / 16) * 278;

        Canvas.registerFont("./assets/mc.otf", { family: "mc" });

        const canvas = Canvas.createCanvas(width + 2, 350);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.font = "16px mc";

        const loadPing = (ping: number) => {
            if (ping < 0) return "./assets/signal_0.png";
            if (ping <= 150) return "./assets/signal_5.png";
            if (ping <= 300) return "./assets/signal_4.png";
            if (ping <= 600) return "./assets/signal_3.png";
            if (ping <= 1000) return "./assets/signal_2.png";
            return "./assets/signal_1.png";
        }

        const drawBlock = async (x: number, z: number, name: string, ping: number, avatar: Canvas.Image) => {
            ctx.fillStyle = "#D3D3D3";
            ctx.globalAlpha = 1;
            ctx.fillRect(x + 2, z, 276, 20);
            ctx.globalAlpha = 1;
            ctx.fillStyle = "black";

            try {
                let AvatarImg = avatar??await Canvas.loadImage(`https://mc-heads.net/avatar/${name}/16`)
                ctx.drawImage(AvatarImg, x + 5, z + 2, 16, 16);
            } catch (error) {
                console.error(error)
            }

            const PingImg = await Canvas.loadImage(loadPing(ping))
            ctx.drawImage(PingImg, x + 259, z + 2, 16, 16);

            ctx.fillText(name, x + 23, z + 16);
        }

        const renderTab = (names: PlayerList[]) => {
            return new Promise(async resolve => {
                let z = 0;
                let x = 0;

                for (const name of names) {
                    if (z > 330) {
                        x = x + 278;
                        z = 0;
                    }
                    await drawBlock(x, z, name.name, name.ping, name.headurl);
                    z = z + 22;
                }
                resolve(true)
            })
        }

        await renderTab(names);

        const tablist = canvas.toDataURL("image/png")

        return resolve(tablist);
    })
}

export default draw;