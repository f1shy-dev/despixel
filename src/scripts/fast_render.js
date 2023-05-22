import Jimp from "jimp/es";

$ = document.querySelector.bind(document);
const sleep = (m) => new Promise((r) => setTimeout(r, m));

$("#render").addEventListener("click", async () => {
  if ($("#file").files.length == 0) return alert("No file selected");
  $("#render").disabled = true;
  $(".render-overlay").style.display = "flex";
  if (window.Calc) Calc.destroy();

  window.Calc = Desmos.GraphingCalculator($(".desmos-container"), {
    showGrid: false,
    showXAxis: false,
    showYAxis: false,
    showTooltip: false,
    expressions: false,
    xAxisNumbers: false,
    yAxisNumbers: false,
  });

  const image = await readFileAsync($("#file").files[0]);
  let skin = await (await Jimp.read(image)).rotate(180);

  const os = { x: 0, y: 0 };
  const maxRes = parseInt($("#res").value) || 64;

  const height = skin.getHeight(),
    width = skin.getWidth();

  const hXwRatio = width / height;
  if (height > maxRes || width > maxRes)
    // mr * ratio = width
    skin = await await skin
      .resize(Math.round(maxRes * hXwRatio), maxRes)
      .flip(true, false);

  const longer =
    height > maxRes || width > maxRes
      ? maxRes
      : height > width
      ? height
      : width;

  Calc.setMathBounds({
    bottom: -5,
    left: -5,
    right: longer + 5,
    top: longer + 5,
  });

  const numOfPixels = maxRes * Math.round(maxRes * hXwRatio);

  [...Array(maxRes)].forEach((_, y) =>
    [...Array(Math.round(maxRes * hXwRatio))].forEach((_, x) => {
      const ic = Jimp.intToRGBA(skin.getPixelColor(x, y));
      if (ic.r == 0 && ic.g == 0 && ic.b == 0 && ic.a == 0) return;
      const yt = y + os.y,
        xt = x + os.x;

      Calc.setExpression({
        id: `d${xt}0${yt}`,
        latex: `${xt}<x<${xt + 1}\\left\\{${yt}<y<${yt + 1}\\right\\}`,
        color: `rgb(${ic.r},${ic.g},${ic.b})`,
        fillOpacity: 1,
        lineOpacity: 0,
        lineWidth: 0,
      });

      document.querySelector("#prog-p").innerHTML = `${Math.round(
        ((y * Math.round(maxRes * hXwRatio)) / numOfPixels) * 100
      )}%`;
    })
  );

  $("#render").disabled = false;
  $(".render-overlay").style.display = "none";
});

const readFileAsync = (f) =>
  new Promise((res, rej) => {
    let reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = rej;
    reader.readAsArrayBuffer(f);
  });
