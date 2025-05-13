class Slider {
  constructor(
    x,
    y,
    w,
    defaultVal,
    minVal,
    maxVal,
    changeStateFunc,
    smr = width * 0.02,
    snap = true
  ) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.defaultVal = defaultVal;
    this.minVal = minVal;
    this.maxVal = maxVal;

    this.snap = snap;

    this.value = this.defaultVal;

    this.sliderMarkerRad = smr;

    this.funct = changeStateFunc;

    this.sliderMarkerX =
      this.x - this.w / 2 + (this.value / (this.maxVal - this.minVal)) * this.w;
    this.sliderMarkerY = this.y;
  }

  show() {
    push();
    fill(TRACKCOLOUR);
    stroke(TRACKCOLOUR);
    strokeWeight(4);
    line(this.x - this.w / 2, this.y, this.x + this.w / 2, this.y);

    strokeWeight(3);
    fill(BACKGROUNDCOLOUR);

    if (this.snap) {
      let sliderMarkerPositionX =
        this.x -
        this.w / 2 +
        (this.value - 2) * (this.w / (this.maxVal - this.minVal));

      circle(
        sliderMarkerPositionX,
        this.sliderMarkerY,
        this.sliderMarkerRad * 2
      );
      fill(TRACKCOLOUR);
      textAlign(CENTER, CENTER);
      textSize(width * 0.026);
      strokeWeight(0);

      //have number in the centre of the slider marker
      text(this.value, sliderMarkerPositionX, this.sliderMarkerY);
    } else {
      circle(this.sliderMarkerX, this.sliderMarkerY, this.sliderMarkerRad * 2);
      fill(TRACKCOLOUR);
      textAlign(CENTER, CENTER);
      textSize(width * 0.026);
      strokeWeight(0);

      //have number in the centre of the slider marker
      text(this.value, this.sliderMarkerX, this.sliderMarkerY);
    }

    pop();
  }

  tryMoveMarker() {
    if (
      dist(mouseX, mouseY, this.sliderMarkerX, this.sliderMarkerY) <
        this.sliderMarkerRad * 1.5 &&
      mouseIsPressed
    ) {
      if (mouseX > this.x - this.w / 2 && mouseX < this.x + this.w / 2)
        this.sliderMarkerX = mouseX;
      this.value = round(
        this.maxVal -
          ((this.x + this.w / 2 - this.sliderMarkerX) / this.w) *
            (this.maxVal - this.minVal)
      );

      this.funct();
      // print(this.value)
    }
  }
}
