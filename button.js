class Button {
  constructor(
    x,
    y,
    w,
    h,
    label,
    funct,
    txtSize = width * (50 / 400),
    strkWeight = width * (5 / 400),
    cornerRadius = width * (20 / 400)
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.label = label;
    this.funct = funct;
    this.txtSize = txtSize;
    this.strkWeight = strkWeight;
    this.cornerRadius = cornerRadius
  }

  show() {
    push();
    textSize(this.txtSize);
    let textW = textWidth(this.label);
    let textH = textAscent() + textDescent();
    let textX = this.x + this.w / 2;
    let textY = this.y + this.h / 1.8;
    if (pointInRect(mouseX, mouseY, this.x, this.y, this.w, this.h)) {
      stroke(TRACKCOLOUR);
      fill(TRACKCOLOUR);
      push();
      strokeWeight(this.strkWeight);
      rect(this.x, this.y, this.w, this.h, this.cornerRadius);
      pop();
      stroke(BACKGROUNDCOLOUR);
      fill(BACKGROUNDCOLOUR);
      textAlign(CENTER, CENTER);
      text(this.label, textX, textY);
    } else {
      stroke(TRACKCOLOUR);
      fill(BACKGROUNDCOLOUR);
      push();
      strokeWeight(this.strkWeight);
      rect(this.x, this.y, this.w, this.h, this.cornerRadius);
      pop();
      stroke(TRACKCOLOUR);
      fill(TRACKCOLOUR);
      textAlign(CENTER, CENTER);
      text(this.label, textX, textY);
    }
    pop();
  }

  tryActivate() {
    if (pointInRect(mouseX, mouseY, this.x, this.y, this.w, this.h) && mouseIsPressed) {
      this.funct();
    }
  }
}
