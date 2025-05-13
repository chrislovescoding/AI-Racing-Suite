class EventKeyMenu extends Menu {
  constructor(buttons) {
    super(buttons);

    this.eventKey = "not entered";

    let textInBox = "Enter event key here: ";

    this.eventKeyInputBox = createInput(textInBox);

    let inpt = this.eventKeyInputBox;
    let inputWidth = width / 2.1;
    let inputHeight = height / 15;

    inpt.size(inputWidth, inputHeight);

    inpt.position(width / 2 - inputWidth / 2, height / 1.8 - inputHeight / 2);

    inpt.style(
      "font-size: " +
        (30 / 746) * width +
        "px; background-color: transparent; border-style: none; color: " +
        TRACKCOLOUR +
        "; outline: none;"
    );

    inpt.elt.onfocus = function () {
      if (inpt.value() == textInBox) {
        inpt.value("");
      }
    };

    inpt.elt.onblur = function () {
      if (inpt.value() == "") {
        inpt.value(textInBox);
      }
    };

    let submitEventKeyButtonWidth = width / 8;

    this.submitEventKeyButton = new Button(
      width * 0.78,
      height * 0.7,
      submitEventKeyButtonWidth,
      submitEventKeyButtonWidth,
      ">",
      this.submitEventKey.bind(this)
    );

    this.buttons.push(this.submitEventKeyButton);

    this.eventKeyInputBox.hide();
  }

  logic() {
    this.showButtons();

    push();
    textSize(width * (50 / 400) * 0.8);
    fill(TRACKCOLOUR);
    stroke(TRACKCOLOUR);
    text("COMMENTARY", width / 30, height / 9);
    pop();

    push();
    //draw rect outline
    rectMode(CENTER);
    stroke(TRACKCOLOUR);
    strokeWeight(width / 50);
    noFill();
    rect(width / 2, height / 1.8, width / 1.1, height / 1.6, width / 20);
    pop();

    push();
    rectMode(CENTER);
    stroke(TRACKCOLOUR);
    strokeWeight(width / 50);
    noFill();
    //draw text box outline
    strokeWeight(width / 90);
    rect(width / 2, height / 1.8, width / 2, height / 15);
    pop();

    push();
    textAlign(CENTER);
    textSize(width / 10);
    stroke(TRACKCOLOUR);
    fill(TRACKCOLOUR);
    text("EVENT KEY", width / 2, height / 2.8);
    pop();

    push();
    textAlign(LEFT);
    textSize(width / 40);
    stroke(TRACKCOLOUR);
    fill(TRACKCOLOUR);
    text("Current event key: " + this.eventKey, width * 0.26, height * 0.63);
    pop();

    if (showError) {
      //display error message on screen
      const lifeSpan = 75;
      this.eventKeyInputBox.hide();
      errorAliveTime = showErrorMessage(error, errorAliveTime, lifeSpan);
    }

    //attempt to enter the event key
    if (key === "Enter" && keyIsPressed) {
      raceInformationMenu.raceInfoString = "";
      raceInformationMenu.raceInfoJSON = {};
      if (testValidEventKey(this.eventKeyInputBox.value())) {
        this.eventKey = this.eventKeyInputBox.value();
      } else {
        error = "";
        if (this.eventKeyInputBox.value().length != 5) {
          error += "Input needs to be of length 5 \n";
        }
        if (/\D+/.test(this.eventKeyInputBox.value())) {
          error += "Input needs to be all numbers";
        }

        showError = true;
      }
    }
  }

  submitEventKey() {
    if (this.eventKey != "not entered") {
      menuStack.push(debugMenu);
      debugMenu.startSession(this.eventKey);
    } else {
      error = "Enter a valid event key";
      showError = true;
    }
  }

  back() {
    if (this.subMenuStack.length > 1) {
      // commentaryMenu.ws.close();
      debugMenu.debugScrollDiv.hide();
      this.subMenuStack.pop();
    }
  }

  showButtons() {
    this.buttons.forEach(function (button) {
      button.show();
    });
    this.eventKeyInputBox.show();
  }
}
