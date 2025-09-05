import Canvas from 'canvas';
import { PlayerList } from '../../../..';
import { readdirSync } from 'fs';


const getRandomImagePath = () => {
    // get a random image ending in .png from ./assets/images
    const images = readdirSync('./assets/images').filter(file => file.endsWith('.png'));
    const randomImage = images[Math.floor(Math.random() * images.length)];
    return `./assets/images/${randomImage}`;
}

const draw = (names: PlayerList[]) => {

    const totalPlayers = names.length;
    const mc_server = names[0].server;

    return new Promise(async resolve => {
        const padding = 20;
        const blockWidth = 300;
        const blockHeight = 40; // Increased block height to accommodate larger text
        const maxRows = 21; // Increased by 2 rows
        const columns = 5;
        const width = 1920;
        const totalHeight = 1080;

        Canvas.registerFont("./assets/mc.otf", { family: "mc" });

        const canvas = Canvas.createCanvas(width, totalHeight);
        const ctx = canvas.getContext("2d");

        const background = await Canvas.loadImage(getRandomImagePath());
        ctx.drawImage(background, 0, 0, width, totalHeight);

        ctx.globalAlpha = 0.55; // Set opacity for the black layer
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, width, totalHeight);
        ctx.globalAlpha = 1; // Reset opacity

        ctx.fillStyle = "white";
        ctx.font = "35px mc"; // Updated font size for the text above the tablist

        // Add the text "Players: ${totalPlayers} | Server: ${mc_server}" in the middle above the tablist
        const playerText = `Players: ${totalPlayers}`;
        const serverLabelText = `Server: `;
        const serverNameText = mc_server;
        const separator = " | ";

        const playerTextWidth = ctx.measureText(playerText).width;
        const separatorWidth = ctx.measureText(separator).width;
        const serverLabelTextWidth = ctx.measureText(serverLabelText).width;
        const serverNameTextWidth = ctx.measureText(serverNameText).width;

        const totalTextWidth = playerTextWidth + separatorWidth + serverLabelTextWidth + serverNameTextWidth;

        const startX = (width - totalTextWidth) / 2;
        const startY = (totalHeight - (maxRows * (blockHeight + 1) - 1)) / 2 - 40; // Adjusted Y position to move text lower

        // Draw player count
        ctx.font = "bold 35px mc"; // Updated font size
        ctx.fillText(playerText, startX, startY);

        // Draw separator
        ctx.fillStyle = "red";
        ctx.font = "35px mc"; // Updated font size
        ctx.fillText(separator, startX + playerTextWidth, startY);

        // Draw server label
        ctx.fillStyle = "white";
        ctx.font = "bold 35px mc"; // Updated font size
        ctx.fillText(serverLabelText, startX + playerTextWidth + separatorWidth, startY);

        // Draw server name
        ctx.fillStyle = "cyan"; // Changed color to cyan blue
        ctx.font = "bold 35px mc"; // Updated font size
        ctx.fillText(serverNameText, startX + playerTextWidth + separatorWidth + serverLabelTextWidth, startY);

        const loadPing = (ping: number) => {
            if (ping < 0) return "./assets/signal_0.png";
            if (ping <= 150) return "./assets/signal_5.png";
            if (ping <= 300) return "./assets/signal_4.png";
            if (ping <= 600) return "./assets/signal_3.png";
            if (ping <= 1000) return "./assets/signal_2.png";
            return "./assets/signal_1.png";
        }

        const drawBlock = async (x: number, y: number, name: string, ping: number, avatar: Canvas.Image | null) => {
            ctx.fillStyle = "rgba(32, 32, 32, 0.61)"; // Lighter color for the block
            ctx.fillRect(x, y, blockWidth, blockHeight);

            try {
                const AvatarImg = avatar ?? await Canvas.loadImage(`https://mc-heads.net/avatar/${name??"steve"}/24`);
                ctx.drawImage(AvatarImg, x + 5, y + 8, 24, 24); // Adjusted Y position for avatar
            } catch (error) {
                console.error(error);
            }

            const PingImg = await Canvas.loadImage(loadPing(ping));
            ctx.drawImage(PingImg, x + 270, y + 8, 24, 24); // Adjusted Y position for ping image

            ctx.fillStyle = "white";
            ctx.font = "25px mc"; // Updated font size for tablist text
            ctx.fillText(name, x + 35, y + 28); // Adjusted Y position for text
        }

        const renderTab = (names: PlayerList[]) => {
            return new Promise(async resolve => {
                const totalTabWidth = columns * blockWidth + (columns - 1) * padding;
                const totalTabHeight = maxRows * (blockHeight + 1) - 1; // Adjusted for 1px gap

                let x = (width - totalTabWidth) / 2;
                let y = (totalHeight - totalTabHeight) / 2;

                for (let i = 0; i < 105; i++) { // Adjusted to accommodate the increased rows
                    const name = names[i] ? names[i].username : "";
                    const ping = names[i] ? names[i].latency : -1;
                    const avatar = names[i]?.headurl ?? null;

                    await drawBlock(x, y, name, ping, avatar);
                    y += blockHeight + 1; // Increment y by blockHeight + 1 for 1px gap

                    if ((i + 1) % maxRows === 0) {
                        x += blockWidth + padding;
                        y = (totalHeight - totalTabHeight) / 2;
                    }
                }

                resolve(true);
            });
        }

        await renderTab(names);

        // Add the text "https://forestbot.org/" underneath the tablist
        const footerText = "Tablist Generation By: forestbot.org";
        const footerTextWidth = ctx.measureText(footerText).width;
        const footerX = (width - footerTextWidth) / 2;
        const footerY = (totalHeight + (maxRows * (blockHeight + 1) - 1)) / 2 + 50; // Adjusted Y position for footer text

        ctx.fillStyle = "#00AA00"; // Darker green color for footer text
        ctx.font = "30px mc"; // Font size for footer text
        ctx.fillText(footerText, footerX, footerY);

        const tablist = canvas.toDataURL("image/png");

        return resolve(tablist);
    });
}

export default draw;
