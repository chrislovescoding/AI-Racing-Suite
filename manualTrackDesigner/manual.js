showTheCars = true;
class Manual extends Menu {
  constructor(buttons) {
    super(buttons);

    this.timeSinceActivated = 0;
    this.timeDelay = 10;

    this.selectedNode = null;
    this.titleArea = height * 0.18;
    this.h = height;

    this.trackWidth = 60 * (width / 1100);

    this.a = new TrackSegment(
      [
        new Node(
          width * (551 / 1200),
          height * (358 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (230 / 1200),
          height * (592 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (531 / 1200),
          height * (729 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (850 / 1200),
          height * (531 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (1045 / 1200),
          height * (1004 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (211 / 1200),
          height * (1002 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (146 / 1200),
          height * (672 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (68 / 1200),
          height * (605 / 1200),
          1,
          this.trackWidth / 4
        ),
        new Node(
          width * (76 / 1200),
          height * (364 / 1200),
          1,
          this.trackWidth / 4
        ),
      ],
      this.trackWidth
    );

    let A = createVector(this.a.nodes[0].x, this.a.nodes[0].y);
    let B = createVector(this.a.nodes[1].x, this.a.nodes[1].y);
    let AB = p5.Vector.sub(B, A);
    let carDVector = createVector(0, -1);
    this.angle = p5.Vector.angleBetween(AB, carDVector);

    this.numOfCars = 115;

    this.cars = [];

    // this.cars.push(
    //   new Car(
    //     this.a.nodes[0].x,
    //     this.a.nodes[0].y,
    //     this.trackWidth / 8,
    //     (this.trackWidth / 8) * 2.6,
    //     color(34, 139, 34),
    //     this.angle,
    //     "HUMAN"
    //   )
    // );

    for (let i = 0; i < this.numOfCars; i++) {
      this.cars.push(
        new Car(
          this.a.nodes[0].x,
          this.a.nodes[0].y,
          this.trackWidth / 8,
          (this.trackWidth / 8) * 2.6,
          color(34, 139, 34),
          this.angle
        )
      );
    }

    this.fittestBrains = [];

    const noOfFittestCar = ceil(this.cars.length * 0.1) + 1;

    for (let i = 0; i < noOfFittestCar; i++) {
      this.fittestBrains.push([this.cars[i].brain, 0]);
    }

    this.track = [this.a];

    //create edit toggle switch
    this.editToggle = new Toggle(0.9 * width, 0.23 * height, 0.08 * height);

    this.edit = true;

    this.trackPixels = null;

    this.trackPixelGraphic = createGraphics(width, height);

    this.saveTrackButton = new Button(
      width * 0.898,
      height * 0.28,
      backButtonWidth * 0.7,
      backButtonWidth * 0.7,
      "🖫",
      this.saveTrack.bind(this),
      width * 0.07,
      width * 0.005,
      width * 0.025
    );

    this.loadTrackButton = new Button(
      width * 0.898,
      height * 0.4,
      backButtonWidth * 0.7,
      backButtonWidth * 0.7,
      "🗁",
      this.activateFileInput.bind(this),
      width * 0.05,
      width * 0.005,
      width * 0.025
    );

    this.trackFileInput = createFileInput(this.handleTrackFile.bind(this));
    this.trackFileInput.style("display", "none");

    this.buttons.push(this.saveTrackButton);
    this.buttons.push(this.loadTrackButton);
  }

  handleTrackFile(file) {
    if (file.subtype != "json") {
      print("wrong file type");
      return;
    }

    this.loadTrackFromFile(file);
    this.trackFileInput.value("");
  }

  activateFileInput() {
    this.trackFileInput.elt.click();
  }

  loadTrackFromFile(trackFile) {
    try {
      const track = trackFile.data[0];

      let nodes = [];

      for (let n of track.nodes) {
        nodes.push(new Node(n.x, n.y, n.type, n.radius));
      }

      this.track = [new TrackSegment(nodes, track.trackWidth, track.menu)];
    } catch (err) {
      print("error: " + err);
    }
  }

  saveTrack() {
    this.saveTrackAsImage();
    this.saveTrackAsJSON();
  }

  saveTrackAsImage() {
    const x = 0;
    const y = this.titleArea;
    const w = width;
    const h = height - this.titleArea;

    let trackImage = get(x, y, w, h);
    trackImage.save("manualTrack.png");
  }

  saveTrackAsJSON() {
    saveJSON(this.track, "manualTrack.json");
  }

  logic() {
    this.timeSinceActivated++;

    this.showButtons();

    push();
    textSize(width * (50 / 400));
    fill(TRACKCOLOUR);
    stroke(TRACKCOLOUR);
    text("MANUAL", width / 30, height / 8);
    pop();

    if (!mouseIsPressed || mouseButton == RIGHT) {
      this.selectedNode = null;
    }
    if (this.selectedNode != null) {
      this.selectedNode.x = mouseX;
      this.selectedNode.y = mouseY;

      if (this.selectedNode.x - this.selectedNode.radius < 0) {
        //CHECK LEFT
        this.selectedNode.x = this.selectedNode.radius;
      } else if (
        this.selectedNode.x + this.selectedNode.radius + backButton.w >
        width
      ) {
        //CHECK RIGHT
        this.selectedNode.x = width - this.selectedNode.radius - backButton.w;
      }
      if (this.selectedNode.y - this.selectedNode.radius < this.titleArea) {
        //CHECK UP
        this.selectedNode.y = this.selectedNode.radius + this.titleArea;
      } else if (this.selectedNode.y + this.selectedNode.radius > this.h) {
        //CHECK DOWN
        this.selectedNode.y = this.h - this.selectedNode.radius;
      }

      let A = createVector(this.a.nodes[0].x, this.a.nodes[0].y);
      let B = createVector(this.a.nodes[1].x, this.a.nodes[1].y);
      let AB = p5.Vector.sub(B, A);
      let carDVector = createVector(0, -1);
      this.angle = p5.Vector.angleBetween(AB, carDVector);
    }

    // DRAW
    this.drawTrack(this.track, this.edit);

    if (!this.edit) {
      this.updateCars(this.cars);
      this.showCars(this.cars);
      // stroke("black");
      // text(this.cars[0].controls.forward, width / 2, height / 2);
      // text(this.cars[0].controls.left, width / 2, height / 2 + 30);
      // text(this.cars[0].controls.right, width / 2, height / 2 + 60);
      // text(this.cars[0].controls.brake, width / 2, height / 2 + 90);
    }

    // getFastestCars(this.cars, 1 / this.numOfCars)[0].sensor.show();
    push();
    stroke(TRACKCOLOUR);
    fill(TRACKCOLOUR);
    textSize(36 * (width / 850));
    text("EDIT", 0.895 * width, 0.21 * height);
    pop();
    this.editToggle.show();
  }

  updateCars(cars) {
    for (let car of this.cars) {
      car.update(this.cars);
    }
  }

  showCars(cars) {
    for (let car of this.cars) {
      car.show(showTheCars);
    }
  }

  drawTrack(track, edit) {
    for (let segment of this.track) {
      segment.show(edit);
    }
  }

  insertNewNode() {
    let closestNodes = [-1, -1, Infinity];

    for (let segment of this.track) {
      for (let i = 0; i < segment.nodes.length - 1; i++) {
        let n1 = segment.nodes[i];
        let n2 = segment.nodes[i + 1];

        let distanceBetweenNodes = pointLineDistance(
          n1.x,
          n1.y,
          n2.x,
          n2.y,
          mouseX,
          mouseY
        );

        if (distanceBetweenNodes < closestNodes[2]) {
          closestNodes = [i, i + 1, distanceBetweenNodes, segment];
        }
      }
      let n1 = segment.nodes[0];
      let n2 = segment.nodes[segment.nodes.length - 1];

      let distanceBetweenNodes = pointLineDistance(
        n1.x,
        n1.y,
        n2.x,
        n2.y,
        mouseX,
        mouseY
      );

      if (distanceBetweenNodes < closestNodes[2]) {
        closestNodes = [
          0,
          segment.nodes.length - 1,
          distanceBetweenNodes,
          segment,
        ];
        splice(
          closestNodes[3].nodes,
          new Node(mouseX, mouseY, 1, this.trackWidth / 4),
          closestNodes[0]
        );
        return;
      }
    }

    splice(
      closestNodes[3].nodes,
      new Node(mouseX, mouseY, 1, this.trackWidth / 4),
      closestNodes[1]
    );
  }
}

function showAllCars() {
  showTheCars = !showTheCars;
}
