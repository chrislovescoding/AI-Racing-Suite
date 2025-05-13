class Sensor {
  constructor(car) {
    this.car = car;
    this.rayCount = 12;
    this.rayLength = 300;
    this.raySpread = (PI / 180) * 100;

    this.rays = [];
    this.readings = [];
    this.readingPos = [];
  }

  castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;

      const start = {
        x: this.car.x + this.car.w / 2,
        y: this.car.y + this.car.h / 2,
      };
      const end = {
        x: this.car.x - sin(rayAngle) * this.rayLength,
        y: this.car.y - cos(rayAngle) * this.rayLength,
      };
      this.rays.push([start, end]);
    }
  }

  getIntersectionOfRay(x1, y1, x2, y2, checkColor, step = 5) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    let distance = sqrt(dx * dx + dy * dy);
    let steps = distance / step;
    let xIncrement = dx / steps;
    let yIncrement = dy / steps;
    let intersections = [];
    
    const maxDistance = this.rayLength ** 2;

    for (let i = 0; i <= steps; i++) {
      let x = x1 + i * xIncrement;
      let y = y1 + i * yIncrement;

      if (isSimilarColour(x, y, checkColor, 30)) {
        let distance = (x - x1)**2 + (y - y1)**2
        let normalizedDistance = distance / maxDistance;
        
        this.readings.push(normalizedDistance);
        this.readingPos.push(createVector(x, y));
        return;
      }
    }
    this.readings.push(1);
  }

  update() {
    this.castRays();

    for (let ray of this.rays) {
      this.getIntersectionOfRay(
        ray[0].x,
        ray[0].y,
        ray[1].x,
        ray[1].y,
        TRACKCOLOUR
      );
    }

    // this.show();
  }

  show() {
    for (let r of this.readingPos) {
      noFill();
      circle(r.x, r.y, 20);
    }
  }
}
