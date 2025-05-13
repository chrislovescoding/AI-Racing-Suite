class Car {
  constructor(x, y, w, h, c, a, t = "AI") {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.colour = c;

    this.prevX = x;
    this.prevY = y;
    this.prevVelX = 0;
    this.prevVelY = 0;
    this.prevEmaX = 0;
    this.prevEmaY = 0;

    this.emaX = 0;
    this.emaY = 0;
    this.accelerationHistoryX = [];
    this.accelerationHistoryY = [];
    this.bufferSize = 5;

    this.speed = 0;
    this.acceleration = this.h * 2;
    this.maxSpeed = this.h * 18.8;
    this.friction = this.h * 0.00357;
    this.brakeDeceleration = this.h * 9;
    this.angle = a;
    this.turnSpeed = 0.05;

    this.mass = 798;

    this.reset();

    this.boundingBox = [];

    this.controls = new Controls(t);
    this.sensor = new Sensor(this);
    if (t == "AI") {
      this.brain = new Brain([this.sensor.rayCount, 20, 15, 4]);
    }
  }

  reset() {
    this.totalSpeed = 0;
    this.speed = 0
    this.averageSpeed = 0;
    this.timeAlive = 0;
    this.kill = false;
    this.distanceTravelled = 0;
    this.fitness = 0;
    this.checkPoints = [];
    this.checkPointBonus = 400;
    this.crashPenalty = -100;
    this.checkPointsPassed = 0;
    this.crashes = 0;
    this.lifeTime = 5000;
    this.damaged = false;
  }

  show(show) {
    if (show) {
      push();
      translate(this.x + this.w / 2, this.y + this.h / 2);
      rotate(-this.angle);
      imageMode(CENTER);
      image(f1Car, 0, 0, this.w, this.h);
      pop();
    }

    //draw Gs
    let GsPulled = this.calculateGs();
    line(this.x+this.w/2, this.y+this.h/2, this.x+this.w/2 + GsPulled.x, this.y+this.h/2 + GsPulled.y)
    

    //show bounding box
    //         const l = this.boundingBox.length
    //         for (let i = 0; i < l - 1; i++){
    //           line(this.boundingBox[i].x, this.boundingBox[i].y, this.boundingBox[i+1].x, this.boundingBox[i+1].y)
    //         }

    //         line(this.boundingBox[0].x, this.boundingBox[0].y, this.boundingBox[l-1].x, this.boundingBox[l-1].y)
    if (this.controls.type == "AI") {
      this.sensor.update();
    }
  }

  createBoundingBox() {
    const halfWidth = this.w / 2;
    const halfHeight = this.h / 2;

    const sinTheta = sin(-this.angle);
    const cosTheta = cos(-this.angle);

    const corners = [
      [-halfWidth, -halfHeight],
      [halfWidth, -halfHeight],
      [halfWidth, halfHeight],
      [-halfWidth, halfHeight],
    ];

    for (let i = 0; i < corners.length; i++) {
      let corner = corners[i];
      let dx = corner[0];
      let dy = corner[1];

      let rotatedX = dx * cosTheta - dy * sinTheta;
      let rotatedY = dx * sinTheta + dy * cosTheta;

      let absoluteX = this.x + halfWidth + rotatedX;
      let absoluteY = this.y + halfHeight + rotatedY;

      this.boundingBox[i] = createVector(absoluteX, absoluteY);
    }
  }

  update(cars) {
    this.prevX = this.x;
    this.prevY = this.y;

    if (frameCount % 50 === 0) {
      if (this.speed < 1 && this.controls.type == "AI") {
        replaceCar(this, manualTrackDesigner.fittestBrains);
      }
    }

    //REMOVE IN FINAL
    if (this.timeAlive > this.lifeTime) {
      replaceCar(this, manualTrackDesigner.fittestBrains);
    }

    if (!this.damaged) {
      this.move();
      if (frameCount % 10 === 0) {
        this.checkCheckPoints();
      }
      this.createBoundingBox();
      this.checkDamaged(manualTrackDesigner.cars);
    } else {
      if (this.controls.type == "AI") {
        manualTrackDesigner.fittestBrains.sort((a, b) => b[1] - a[1]);

        if (
          this.fitness >
          manualTrackDesigner.fittestBrains[
            manualTrackDesigner.fittestBrains.length - 1
          ][1]
        ) {
          manualTrackDesigner.fittestBrains[
            manualTrackDesigner.fittestBrains.length - 1
          ][0] = this.brain;
          manualTrackDesigner.fittestBrains[
            manualTrackDesigner.fittestBrains.length - 1
          ][1] = this.fitness;
          manualTrackDesigner.fittestBrains.sort((a, b) => b[1] - a[1]);
        }

        storeItem("fittestBrains", manualTrackDesigner.fittestBrains);

        replaceCar(this, manualTrackDesigner.fittestBrains);
      }
    }

    this.distanceTravelled += sqrt(
      (this.x - this.prevX) * (this.x - this.prevX) +
        (this.y - this.prevY) * (this.y - this.prevY)
    );

    if (this.controls.type == "AI") {
      if (this.sensor.readings.length > 0) {
        const outputs = Brain.feedForward(this.sensor.readings, this.brain);

        this.controls.forward = outputs[0];
        this.controls.brake = outputs[1];
        this.controls.left = outputs[2];
        this.controls.right = outputs[3];

        if (this.controls.forward > this.controls.brake) {
          this.controls.brake = 0;
        } else {
          this.controls.forward = 0;
        }
      }
    }

    this.totalSpeed += this.speed;
    this.averageSpeed = this.totalSpeed / this.timeAlive;

    this.timeAlive += 1;

    if (this.controls.type == "AI") {
      this.sensor.readings = [];
      this.sensor.readingPos = [];
    }
    this.fitness =
      this.distanceTravelled**2 +
      this.averageSpeed +
      this.checkPointsPassed * this.checkPointBonus +
      this.crashes * this.crashPenalty;

  }

  checkCheckPoints() {
    for (let c of this.checkPoints) {
      if (c != manualTrackDesigner.a.nodes[0]) {
        if (pow(c.x - this.x, 2) + pow(c.y - this.y, 2) < pow(c.radius, 2)) {
          this.checkPointsPassed += 1;
        }
      }
    }
  }

  checkDamaged(cars) {
    //track limits
    for (let p of this.boundingBox) {
      if (isSimilarColour(p.x, p.y, TRACKCOLOUR, 30)) {
        this.damaged = true;
        this.crashes += 1;
      }
    }

    if (this.x > width || this.x < 0 || this.y < 0 || this.y > height) {
      this.damaged = true;
    }

    //traffic
    // for (let otherCar of cars) {
    //   if (this == otherCar) {return;}
    //   if (separatingAxisTheorem(this.boundingBox, otherCar.boundingBox)) {
    //     this.damaged = true;
    //     otherCar.damaged = true;
    //     break;
    //   }
    // }
  }

  move() {
    const dt = deltaTime / 1000;
    const turnDeceleration = this.h * 0.5;

    this.speed += this.acceleration * dt * this.controls.forward;

    if (this.speed > 0) {
      this.speed -= this.brakeDeceleration * dt * this.controls.brake;
      this.speed -= this.friction * dt;
    }

    if (this.speed < 0 || abs(this.speed) < 0.01) {
      this.speed = 0;
    }
    
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    
    if (this.speed < -this.maxSpeed) {
      this.speed = -this.maxSpeed;
    }
    this.angle +=
      this.turnSpeed *
      (1 - abs(this.speed) / (2 * this.maxSpeed)) *
      this.controls.left;
    this.speed -= turnDeceleration * dt;

    this.angle -=
      this.turnSpeed *
      (1 - abs(this.speed) / (2 * this.maxSpeed)) *
      this.controls.right;
    this.speed -= turnDeceleration * dt;

    this.x -= sin(this.angle) * this.speed * dt;
    this.y -= cos(this.angle) * this.speed * dt;
  }

  calculateGs() {
    const dt = deltaTime / 1000;

    if (dt === 0) {
      return createVector(0, 0);
    }

    const dX = this.x - this.prevX;
    const dY = this.y - this.prevY;

    const velX = dX / dt;
    const velY = dY / dt;

    let accX = (velX - this.prevVelX) / dt;
    let accY = (velY - this.prevVelY) / dt;

    accX = constrain(accX, -this.acceleration, this.acceleration);
    accY = constrain(accY, -this.acceleration, this.acceleration);

    this.prevVelX = velX;
    this.prevVelY = velY;

    const smoothing = 2 / (this.bufferSize + 1);
    this.emaX = accX * smoothing + this.prevEmaX * (1 - smoothing);
    this.emaY = accY * smoothing + this.prevEmaY * (1 - smoothing);

    this.prevEmaX = this.emaX;
    this.prevEmaY = this.emaY;

    return createVector(-this.emaX, -this.emaY);
  }
}
