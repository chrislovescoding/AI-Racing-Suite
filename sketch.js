
let f1Car;

let canvas;
let BACKGROUNDCOLOUR, TRACKCOLOUR, ERRORCOLOUR;

let manualButtons;


let manualTrackDesigner;

let menuStack;

let framerate;
let error;
let showError;
let errorAliveTime;


function preload() {
  f1Car = loadImage("f1Car.png");

}

function setup() {
  canvas = createCanvas(windowHeight, windowHeight);
  canvas.elt.oncontextmenu = () => false;

  BACKGROUNDCOLOUR = color(64, 92, 177);
  TRACKCOLOUR = color(152, 174, 221);
  ERRORCOLOUR = color("#DC7C7C");

  manualButtons = [];

  manualTrackDesigner = new Manual(manualButtons);

  menuStack = [manualTrackDesigner];

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

  smooth();

  cursorState();

  if (menuStack.length > 0) {
    menuStack[menuStack.length - 1].logic();
  }
  if (menuStack.length > 0) {
    menuStack[menuStack.length - 1].logic();
  }

  // text(floor(framerate), 0, 20);
}

function manual() {
  if (menuStack[menuStack.length - 1] !== manualTrackDesigner) {
      menuStack.push(manualTrackDesigner);
  }
  manualTrackDesigner.timeSinceActivated = 0;
  if (menuStack[menuStack.length - 1] !== manualTrackDesigner) {
      menuStack.push(manualTrackDesigner);
  }
  manualTrackDesigner.timeSinceActivated = 0;
}

function cursorState() {
  if (menuStack.length > 0) {
    for (let b of menuStack[menuStack.length - 1].buttons) {
      if (pointInRect(mouseX, mouseY, b.x, b.y, b.w, b.h)) {
        cursor(HAND);
        return;
      }
    }
  }
  cursor(ARROW);
}

function mousePressed() {
  if (menuStack.length > 0) {
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
    }
  }
}

function mouseMoved() {
  if (menuStack.length > 0 && menuStack[menuStack.length - 1] === manualTrackDesigner) {
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
}

function keyPressed() {
  if (manualTrackDesigner && manualTrackDesigner.cars && manualTrackDesigner.cars.length > 0) {
    if (key == "W" || key == "w") {
      manualTrackDesigner.cars[0].controls.forward = 1;
    } else if (key == "A" || key == "a") {
      manualTrackDesigner.cars[0].controls.left = 1;
    } else if (key == "S" || key == "s") {
      manualTrackDesigner.cars[0].controls.brake = 1;
    } else if (key == "D" || key == "d") {
      manualTrackDesigner.cars[0].controls.right = 1;
    }
  }
}

function keyReleased() {
  if (manualTrackDesigner && manualTrackDesigner.cars && manualTrackDesigner.cars.length > 0) {
    if (key == "W" || key == "w") {
      manualTrackDesigner.cars[0].controls.forward = 0;
    } else if (key == "A" || key == "a") {
      manualTrackDesigner.cars[0].controls.left = 0;
    } else if (key == "S" || key == "s") {
      manualTrackDesigner.cars[0].controls.brake = 0;
    } else if (key == "D" || key == "d") {
      manualTrackDesigner.cars[0].controls.right = 0;
    }
  }
}