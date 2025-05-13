function inSameSegment(n1, n2) {
  for (let i = 0; i < manualTrackDesigner.track.length; i++) {
    if (
      manualTrackDesigner.track[i].nodes.includes(n1) &&
      manualTrackDesigner.track[i].nodes.includes(n2)
    ) {
      return true;
    }
  }
  return false;
}

function setLineDash(list) {
  drawingContext.setLineDash(list);
}

function pointLineDistance(x1, y1, x2, y2, px, py) {
  let dx = x2 - x1;
  let dy = y2 - y1;
  let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  t = max(0, min(1, t));
  let lx = x1 + t * dx;
  let ly = y1 + t * dy;
  return dist(px, py, lx, ly);
}

function setPixel(x, y) {
  point(x, y);
}

function isSimilarColour(x, y, targetColor, threshold) {
  x = floor(x);
  y = floor(y);

  let index = (x + y * width) * 4;
  let r1 = pixels[index];
  let g1 = pixels[index + 1];
  let b1 = pixels[index + 2];

  let r2 = red(targetColor);
  let g2 = green(targetColor);
  let b2 = blue(targetColor);

  let similarRed = abs(r1 - r2) < threshold;
  let similarGreen = abs(g1 - g2) < threshold;
  let similarBlue = abs(b1 - b2) < threshold;

  return similarRed && similarGreen && similarBlue;
}

function separatingAxisTheorem(corners1, corners2) {
  for (let corners of [corners1, corners2]) {
    for (let i = 0; i < corners.length; i++) {
      let j = (i + 1) % corners.length;
      let dx = corners[j].x - corners[i].x;
      let dy = corners[j].y - corners[i].y;
      let normalX = dy;
      let normalY = -dx;

      let minA = Infinity;
      let maxA = -Infinity;
      for (let p of corners1) {
        let projection = normalX * p.x + normalY * p.y;
        minA = min(projection, minA);
        maxA = max(projection, maxA);
      }
      let minB = Infinity,
        maxB = -Infinity;
      for (let p of corners2) {
        let projection = normalX * p.x + normalY * p.y;
        minB = min(projection, minB);
        maxB = max(projection, maxB);
      }
      if (maxA < minB || maxB < minA) {
        return false;
      }
    }
  }
  return true;
}

function getFastestCars(cars, fraction) {
  carsCopy = cars.slice()
  carsCopy.sort((a, b) => b.fitness - a.fitness);
  let cutoff = floor(carsCopy.length * fraction);
  return carsCopy.slice(0, cutoff);
}

function replaceCar(car, fittestBrains) {
  if (manualTrackDesigner.cars.length >= 2 && car.type == "AI") {
    let parentBrains = selectRandomPair(fittestBrains);
    let childBrain = Brain.crossover(parentBrains[0][0], parentBrains[1][0]);
    Brain.mutate(childBrain, 0.1, 0.5);
    car.brain = childBrain;
  }

  let randomTrack = random(manualTrackDesigner.track);
  let randomNodeIndex = floor(random(randomTrack.nodes.length));
  let randomNode = randomTrack.nodes[randomNodeIndex];

  car.x = randomNode.x;
  car.y = randomNode.y;

  let A = createVector(randomNode.x, randomNode.y);
  let B = createVector(
    randomTrack.nodes[(randomNodeIndex + 1)%randomTrack.nodes.length].x,
    randomTrack.nodes[(randomNodeIndex + 1)%randomTrack.nodes.length].y
  );
  let AB = p5.Vector.sub(B, A);
  let carDVector = createVector(0, -1);
  let angle = p5.Vector.angleBetween(AB, carDVector);

  car.angle = angle;

  car.reset();
}

function selectRandomPair(array) {
  let i = floor(random(array.length));
  let j = floor(random(array.length - 1));
  if (j >= i) {
    j += 1;
  }
  return [array[i], array[j]];
}

//activation functions
function sigmoid(x) {
  return 1 / (1 + exp(-x));
}


