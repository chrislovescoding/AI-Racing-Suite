class HomeMenu extends Menu {
  constructor(buttons) {
    super(buttons);
  }

  logic() {
    push();
    textSize(width*0.19);
    fill(TRACKCOLOUR);
    stroke(TRACKCOLOUR);
    textAlign(CENTER, CENTER)
    text("RC TOOLS", width/2, height *0.1);
    pop();

    this.showButtons();
  }
}
