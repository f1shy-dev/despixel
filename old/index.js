const Jimp = require("jimp");
const { writeFileSync } = require("fs");

const os = { x: 0, y: 0 };
const out = [];

(async () => {
  const skin = await (await Jimp.read("input.png")).rotate(180);

  [...Array(skin.getHeight())].forEach((_, y) =>
    [...Array(skin.getWidth())].forEach((_, x) => {
      const ic = Jimp.intToRGBA(skin.getPixelColor(x + 1, y + 1));
      let color = `rgb(${ic.r}, ${ic.g}, ${ic.b})`;
      if (ic.r == 0 && ic.g == 0 && ic.b == 0 && ic.a == 0) return;
      const yt = y + os.y,
        xt = x + os.x;

      out.push({
        latex: `${xt}<x<${xt + 1}\\left\\{${yt}<y<${yt + 1}\\right\\}`,
        color,
      });
    })
  );

  const data = {
    pixels: out,
    height: skin.getHeight(),
    width: skin.getWidth(),
  };
  writeFileSync("pixelmap.json", JSON.stringify(data, null, 2));
  console.clear();
  console.log(`wrote ${out.length} instructions to file`);
})();
