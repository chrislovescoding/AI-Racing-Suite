  function preload() {
  f1Car = loadImage("f1Car.png");

  tileImages = [
    loadImage("Tiles/Chicane.png"),
    loadImage("Tiles/KickerLander.png"),
    loadImage("Tiles/Kicker.png"),
    loadImage("Tiles/SlippyTurn.png"),
    loadImage("Tiles/Straight.png"),
    loadImage("Tiles/Turn.png"),
  ];
}

function setup() {
  canvas = createCanvas(windowHeight, windowHeight);

  //disable right click
  canvas.elt.oncontextmenu = () => false;

  BACKGROUNDCOLOUR = color(64, 92, 177);
  TRACKCOLOUR = color(152, 174, 221);
  ERRORCOLOUR = color("#DC7C7C");

  menuButtonWidth = width / 1.5;
  menuButtonHeight = height / 5;

  centreForButtons = width / 2 - menuButtonWidth / 2;

  manualButton = new Button(
    width / 4 - width / 4.4,
    height / 4,
    width / 2.2,
    menuButtonHeight,
    "MANUAL",
    manual,
    width * (70 / 700)
  );
  autoButton = new Button(
    (3 * width) / 4 - width / 4.4,
    height / 4,
    width / 2.2,
    menuButtonHeight,
    "AUTO",
    auto
  );

  commentaryButton = new Button(
    centreForButtons,
    height / 2,
    menuButtonWidth,
    menuButtonHeight,
    "COMMENTARY",
    commentary,
    width / 11.5
  );

  quitButton = new Button(
    centreForButtons,
    height / 1.35,
    menuButtonWidth,
    menuButtonHeight,
    "QUIT",
    quit
  );

  backButtonWidth = width / 8;

  backButton = new Button(
    width - backButtonWidth * 1.1,
    backButtonWidth * 0.1,
    backButtonWidth,
    backButtonWidth,
    "<",
    back
  );

  homeButtons = [manualButton, autoButton, commentaryButton, quitButton];

  eventKeyButtons = [backButton];
  debugButtons = [];

  manualButtons = [backButton];

  autoButtons = [backButton];

  raceInformationButtons = [backButton];

  homeMenu = new HomeMenu(homeButtons);
  manualTrackDesigner = new Manual(manualButtons);
  autoTrackDesigner = new Auto(autoButtons);
  eventKeyMenu = new EventKeyMenu(eventKeyButtons);
  debugMenu = new DebugMenu(debugButtons);
  raceInformationMenu = new RaceInformationMenu(raceInformationButtons);

  menuStack = [homeMenu];

  frameRate(60);

  framerate = 0;

  error = "";
  showError = false;
  errorAliveTime = 0;
}

function draw() {
  background(BACKGROUNDCOLOUR);
  if (frameCount % 4 === 0) {
    framerate = frameRate();
  }

  if (menuStack[menuStack.length - 1] === autoTrackDesigner) {
    noSmooth();
  } else {
    smooth();
  }
  cursorState();

  menuStack[menuStack.length - 1].logic();

  // text(floor(framerate), 0, 20);
}

function manual() {
  menuStack.push(manualTrackDesigner);
  manualTrackDesigner.timeSinceActivated = 0;
}
function auto() {
  menuStack.push(autoTrackDesigner);
}
function commentary() {
  menuStack.push(eventKeyMenu);
}

function quit() {
  print("quit");
}

function back() {
  menuStack.pop();

  debugMenu.firstTime = true;

  eventKeyMenu.eventKeyInputBox.hide();
  debugMenu.debugScrollDiv.hide();
}

function cursorState() {
  for (let b of menuStack[menuStack.length - 1].buttons) {
    if (pointInRect(mouseX, mouseY, b.x, b.y, b.w, b.h)) {
      cursor(HAND);
      return;
    }
  }
  cursor(ARROW);
}

function mousePressed() {
  menuStack[menuStack.length - 1].buttons.forEach(function (button) {
    button.tryActivate();
  });

  if (menuStack[menuStack.length - 1] === manualTrackDesigner) {
    if (manualTrackDesigner.editToggle.toggle()) {
      manualTrackDesigner.edit = manualTrackDesigner.editToggle.isToggled;
      if (!manualTrackDesigner.editToggle.isToggled) {
        for (let segment of manualTrackDesigner.track) {
          segment.getTrackPixels = true;
        }

        for (let car of manualTrackDesigner.cars) {
          replaceCar(car, manualTrackDesigner.fittestBrains);
          car.checkPoints = manualTrackDesigner.a.nodes;
        }
      }
      return;
    }

    if (!manualTrackDesigner.editToggle.isToggled) {
      return;
    }

    if (
      manualTrackDesigner.timeSinceActivated > manualTrackDesigner.timeDelay
    ) {
      if (
        mouseX > width - backButton.w ||
        mouseY < manualTrackDesigner.titleArea
      ) {
        return;
      }
      for (let segment of manualTrackDesigner.track) {
        for (let i = 0; i < segment.nodes.length; i++) {
          let node = segment.nodes[i];
          if (
            (mouseX - node.x) * (mouseX - node.x) +
              (mouseY - node.y) * (mouseY - node.y) <
            node.radius * 1.5 * (node.radius * 1.5)
          ) {
            if (mouseButton == RIGHT && segment.nodes.length > 3) {
              segment.nodes.splice(i, 1);
            } else if (mouseButton == LEFT) {
              manualTrackDesigner.selectedNode = node;
            }
            return;
          }
        }
      }
      manualTrackDesigner.selectedNode = null;
    }

    if (
      mouseButton == LEFT &&
      manualTrackDesigner.timeSinceActivated > manualTrackDesigner.timeDelay
    ) {
      manualTrackDesigner.insertNewNode();
      return;
    }
  } else if (menuStack[menuStack.length - 1] === autoTrackDesigner) {
    if (
      mouseY < autoTrackDesigner.yOffset ||
      mouseY >
        autoTrackDesigner.yOffset +
          autoTrackDesigner.gridHeight * autoTrackDesigner.tileWidth
    ) {
      return;
    }

    let gridX = floor(
      (mouseX - autoTrackDesigner.xOffset) / autoTrackDesigner.tileWidth
    );
    let gridY = floor(
      (mouseY - autoTrackDesigner.yOffset) / autoTrackDesigner.tileWidth
    );

    let cellClicked;
    if (
      gridX >= 0 &&
      gridX < autoTrackDesigner.gridWidth &&
      gridY >= 0 &&
      gridY < autoTrackDesigner.gridHeight
    ) {
      cellClicked = autoTrackDesigner.grid[gridX][gridY];
    }

    // cellClicked =
    //   autoTrackDesigner.grid[floor(mouseX / autoTrackDesigner.tileWidth)][
    //     floor(
    //       (mouseY - autoTrackDesigner.yOffset) / autoTrackDesigner.tileWidth
    //     )
    //   ];

    if (mouseButton == LEFT && !cellClicked.noOptions()) {
      cellClicked.collapse();
    } else if (mouseButton == RIGHT) {
      cellClicked.remake();
    }
  }
}

function mouseMoved() {
  if (menuStack[menuStack.length - 1] !== manualTrackDesigner) {
    return;
  }

  for (let segment of manualTrackDesigner.track) {
    for (let node of segment.nodes) {
      node.highlighted = false;
    }
  }
  for (let segment of manualTrackDesigner.track) {
    for (let node of segment.nodes) {
      if (
        (mouseX - node.x) * (mouseX - node.x) +
          (mouseY - node.y) * (mouseY - node.y) <
        node.radius * 1.5 * (node.radius * 1.5)
      ) {
        node.highlighted = true;
        return;
      }
    }
  }
}

function keyPressed() {
  if (key == "W" || key == "w") {
    manualTrackDesigner.cars[0].controls.forward = 1;
    // keyStates.W = true;
  } else if (key == "A" || key == "a") {
    manualTrackDesigner.cars[0].controls.left = 1;
    // keyStates.A = true;
  } else if (key == "S" || key == "s") {
    manualTrackDesigner.cars[0].controls.brake = 1;
    // keyStates.S = true;
  } else if (key == "D" || key == "d") {
    manualTrackDesigner.cars[0].controls.right = 1;
    // keyStates.D = true;
  }

  //   if (keyCode == ENTER) {
  //   saveJSON(values, "trainingData");
  // }
}

function keyReleased() {
  if (key == "W" || key == "w") {
    manualTrackDesigner.cars[0].controls.forward = 0;
    // keyStates.W = false;
  } else if (key == "A" || key == "a") {
    manualTrackDesigner.cars[0].controls.left = 0;
    // keyStates.A = false;
  } else if (key == "S" || key == "s") {
    manualTrackDesigner.cars[0].controls.brake = 0;
    // keyStates.S = false;
  } else if (key == "D" || key == "d") {
    manualTrackDesigner.cars[0].controls.right = 0;
    // keyStates.D = false;
  }
}
