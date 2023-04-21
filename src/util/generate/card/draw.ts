
import * as canvas from "canvas";

export default async function generateUserCard(username: string, avatarUrl: string, joinDate: string, kills: number, deaths: number) {

    // Create a new canvas instance
    const canvasInstance = canvas.createCanvas(600, 800);
    const ctx = canvasInstance.getContext('2d');

    // Load the user avatar image
    //const avatarImage = await fetch(avatarUrl).then(res => res.buffer());
    const avatar = await canvas.loadImage(avatarUrl);

    // Define gradient colors for the background
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, '#FACDE4');
    gradient.addColorStop(1, '#A6C1EE');

    // Draw the background gradient
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasInstance.width, canvasInstance.height);

    // Draw the user avatar image
    ctx.drawImage(avatar, 200, 100, 200, 400);

    // Set font properties for the username
    ctx.font = 'bold 48px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFF';

    // Draw the username
    ctx.fillText(username, 300, 80);

    // Set font properties for the user stats
    ctx.font = '36px sans-serif';
    ctx.textAlign = 'left';

    // Draw the user stats
    ctx.fillText(`Joined: ${joinDate}`, 50, 600);
    ctx.fillText(`Kills: ${kills}`, 50, 650);
    ctx.fillText(`Deaths: ${deaths}`, 50, 700);

    // Convert the canvas instance to a PNG buffer and return it
    const buffer = canvasInstance.toBuffer('image/png');
    return buffer;
}
