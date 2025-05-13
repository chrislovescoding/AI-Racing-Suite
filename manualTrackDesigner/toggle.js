class Toggle {
  constructor(x, y, trackWidth = 80, trackHeight = 20, knobSize = 30) {
    this.isToggled = true;
    this.trackWidth = trackWidth;
    this.trackHeight = trackHeight;
    this.knobSize = knobSize;
    this.trackX = x;
    this.trackY = y;
    this.knobX = this.trackX + this.trackWidth - this.knobSize / 4;
    this.knobTargetX = this.knobX;
    this.knobY = this.trackY + this.trackHeight / 2;
    this.easing = 0.3;
  }

  show() {
    push();
    fill(64, 92, 177);
    stroke(152, 174, 221);
    strokeWeight(5);

    let dx = this.knobTargetX - this.knobX;
    if (abs(dx) > 1) {
      this.knobX += dx * this.easing;
    }

    rect(this.trackX, this.trackY, this.trackWidth, this.trackHeight, this.trackHeight / 2);
    ellipse(this.knobX, this.knobY, this.knobSize, this.knobSize);
    pop();
  }

  toggle() {
    if (mouseX > this.trackX && mouseX < this.trackX + this.trackWidth && mouseY > this.trackY && mouseY < this.trackY + this.trackHeight) {
      this.isToggled = !this.isToggled;
      this.knobTargetX = this.isToggled ? this.trackX + this.trackWidth - this.knobSize / 4 : this.trackX;
      return true;
    }
    return false;
  }
}
