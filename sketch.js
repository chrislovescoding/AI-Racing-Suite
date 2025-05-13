// Keep f1Car global
let f1Car;
// Remove tileImages
// let tileImages;

// Keep canvas, BACKGROUNDCOLOUR, TRACKCOLOUR, ERRORCOLOUR
let canvas;
let BACKGROUNDCOLOUR, TRACKCOLOUR, ERRORCOLOUR;

// Remove menuButtonWidth, menuButtonHeight, centreForButtons

// Remove manualButton, autoButton, commentaryButton, quitButton (unless you want quit)
// let manualButton, autoButton, commentaryButton, quitButton;

// Keep backButtonWidth, backButton (or remove if you don't want a back button from the single page)
let backButtonWidth;
let backButton;

// Remove homeButtons, eventKeyButtons, debugButtons, autoButtons, raceInformationButtons
// Keep manualButtons
let manualButtons;

// Remove homeMenu, autoTrackDesigner, eventKeyMenu, debugMenu, raceInformationMenu
// Keep manualTrackDesigner
// let homeMenu;
let manualTrackDesigner;
// let autoTrackDesigner;
// let eventKeyMenu;
// let debugMenu;
// let raceInformationMenu;

// Keep menuStack
let menuStack;

// Keep framerate, error variables
let framerate;
let error;
let showError;
let errorAliveTime;


function preload() {
  f1Car = loadImage("f1Car.png");

  // Remove loading of tileImages
  // tileImages = [
  //   loadImage("Tiles/Chicane.png"),
  //   // ... and so on
  // ];
}

function setup() {
  canvas = createCanvas(windowHeight, windowHeight);
  canvas.elt.oncontextmenu = () => false;

  BACKGROUNDCOLOUR = color(64, 92, 177);
  TRACKCOLOUR = color(152, 174, 221);
  ERRORCOLOUR = color("#DC7C7C");

  // Remove definitions for home menu buttons

  backButtonWidth = width / 8;

  // If you want a back button on the manual page, keep this. 
  // Otherwise, remove it and remove it from manualButtons.
  // If kept, its function 'back()' needs to be considered:
  // what should "back" do if it's the only page?
  backButton = new Button(
    width - backButtonWidth * 1.1,
    backButtonWidth * 0.1,
    backButtonWidth,
    backButtonWidth,
    "<",
    back // 'back' function will need adjustment or removal
  );

  // manualButtons will now only contain the backButton (if kept)
  // and buttons defined within the Manual class itself (save/load).
  manualButtons = [backButton]; // Or manualButtons = []; if no back button

  // Initialize only manualTrackDesigner
  manualTrackDesigner = new Manual(manualButtons);

  // Start directly with the manualTrackDesigner
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

  // Remove the noSmooth() condition for autoTrackDesigner
  // if (menuStack[menuStack.length - 1] === autoTrackDesigner) {
  //   noSmooth();
  // } else {
  //   smooth();
  // }
  smooth(); // Or decide if you want smooth or noSmooth always

  cursorState();

  // This will always call manualTrackDesigner.logic()
  if (menuStack.length > 0) {
    menuStack[menuStack.length - 1].logic();
  }

  // text(floor(framerate), 0, 20);
}

// This function might not be needed if manual is the only page.
// If kept, it's fine.
function manual() {
  // If manualTrackDesigner is already the only item, pushing it again might be redundant
  // or could be used to "reset" it by re-triggering its activation.
  // For simplicity, if it's the only page, this function might not be called.
  if (menuStack[menuStack.length - 1] !== manualTrackDesigner) {
      menuStack.push(manualTrackDesigner);
  }
  manualTrackDesigner.timeSinceActivated = 0;
}

// Remove auto() and commentary()
/*
function auto() {
  menuStack.push(autoTrackDesigner);
}
function commentary() {
  menuStack.push(eventKeyMenu);
}
*/

// Remove or simplify quit()
function quit() {
  print("quit - No action in single page mode");
  // Or remove entirely if no quit button
}

// The 'back' function needs careful consideration.
// If manualTrackDesigner is the only state, popping it will leave menuStack empty.
function back() {
  if (menuStack.length > 1) { // This check prevents error if it's the only item
    menuStack.pop();
  } else {
    print("Cannot go back, this is the only page.");
    // Or implement a "reset manual designer" logic here
    // Or make the back button simply non-functional or not present
  }

  // Remove lines related to other menus
  // debugMenu.firstTime = true;
  // eventKeyMenu.eventKeyInputBox.hide();
  // debugMenu.debugScrollDiv.hide();
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

    // The logic for manualTrackDesigner can remain as is.
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
          mouseX > width - backButton.w || // Assumes backButton exists
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
    }
    // Remove the else if block for autoTrackDesigner
    /*
    else if (menuStack[menuStack.length - 1] === autoTrackDesigner) {
      // ... auto track designer click logic ...
    }
    */
  }
}

function mouseMoved() {
  // This is specific to manualTrackDesigner, so it's fine.
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

// These key handlers are fine as they directly reference manualTrackDesigner.cars[0]
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