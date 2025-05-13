function showErrorMessage(err, timeAlive, lifeSpan) {
  if (timeAlive < lifeSpan) {
    push();
    rectMode(CENTER);
    fill(TRACKCOLOUR);
    stroke(ERRORCOLOUR);
    strokeWeight(width * 0.01);
    rect(width / 2, height / 1.8, width * 0.6, height * 0.3, width * 0.01);
    textAlign(CENTER);
    textSize(width * 0.043);
    fill(ERRORCOLOUR);
    strokeWeight(0);
    text(err, width / 2, height / 1.8);
    pop();
  } else {
    showError = false;
    return 0;
  }

  let newTimeAlive = timeAlive + 1;

  return newTimeAlive;
}

function testValidEventKey(value) {
  return /^\d{5}$/.test(value);
}

function base64ToBlob(base64, type) {
  let binaryString = window.atob(base64);
  let len = binaryString.length;
  let bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new Blob([bytes], { type: type });
}

function drawTextInArea(txt, x, y, areaWidth, areaHeight) {
  const cacheKey = `${areaWidth}-${areaHeight}`;

  if (
    raceInformationMenu.textSizeCache[cacheKey] &&
    raceInformationMenu.textSizeCache[cacheKey][txt]
  ) {
    textSize(raceInformationMenu.textSizeCache[cacheKey][txt] * 0.8);
    textAlign(CENTER, CENTER);
    text(txt, x + areaWidth / 2, y + areaHeight / 2);
    return;
  }

  let minFontSize = 1;
  let maxFontSize = 64;
  let fontSize = maxFontSize;

  while (maxFontSize - minFontSize > 1) {
    textSize(fontSize);

    if (
      textWidth(txt) <= areaWidth &&
      textAscent() + textDescent() <= areaHeight
    ) {
      minFontSize = fontSize;
    } else {
      maxFontSize = fontSize;
    }

    fontSize = floor((minFontSize + maxFontSize) / 2);
  }

  if (!raceInformationMenu.textSizeCache[cacheKey]) {
    raceInformationMenu.textSizeCache[cacheKey] = {};
  }
  raceInformationMenu.textSizeCache[cacheKey][txt] = fontSize;

  textSize(fontSize * 0.8);
  textAlign(CENTER, CENTER);
  strokeWeight(0);
  text(txt, x + areaWidth / 2, y + areaHeight / 2);
}