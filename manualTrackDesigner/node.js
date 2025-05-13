class Node {
  constructor(x, y, type, r=15) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.radius = r;
    this.highlighted = false;
  }

  show() {
    circle(this.x, this.y, this.radius * 2);
    
    if (this.highlighted) {
      push()
      strokeWeight(this.radius)
      point(this.x, this.y)
      pop()
    }
  }
}