class Auto extends Menu {
  constructor(buttons) {
    super(buttons);
    
    this.gridWidth = 9;
    this.gridHeight = 4;

    this.zoom = 4;

    this.tileWidth = width / this.gridWidth;

    this.resetGrid();

    this.yOffset = 2 * this.tileWidth;
    this.xOffset = 0

    this.populateGrid = true;

    const remakeButtonWidth = width / 4;
    const remakeButtonHeight = height * 0.11;

    this.remakeButton = new Button(
      width - backButtonWidth * 2.1,
      height - backButtonWidth,
      remakeButtonWidth,
      remakeButtonHeight,
      "REDO",
      this.redo.bind(this),
      width * 0.07
    );

    this.changeGenerationStateButton = new Button(
      width - backButtonWidth * 3.2,
      height - backButtonWidth,
      remakeButtonHeight,
      remakeButtonHeight,
      "‖",
      this.changeGenerationState.bind(this),
      width * 0.1,
      width * (5 / 400),
      width * 0.025
    );

    this.saveButton = new Button(
      width - backButtonWidth * 4.3,
      height - backButtonWidth,
      remakeButtonHeight,
      remakeButtonHeight,
      "🖫",
      this.saveTrackAsImage.bind(this),
      width * 0.1,
      width * (5 / 400),
      width * 0.025
    );

    this.widthSlider = new Slider(
      width * 0.102,
      width * 0.95,
      width * 0.14,
      this.gridWidth,
      2,
      15,
      this.tryChangeWidth.bind(this),
      width * 0.02,
      true
    );

    this.heightSlider = new Slider(
      width * 0.35,
      width * 0.95,
      width * 0.14,
      this.gridHeight,
      2,
      8,
      this.tryChangeHeight.bind(this),
      width * 0.02,
      true
    );

    this.buttons.push(this.remakeButton);
    this.buttons.push(this.changeGenerationStateButton);
    this.buttons.push(this.saveButton);
  }

  tryChangeWidth() {
    this.gridWidth = this.widthSlider.value;
    this.changeTileSize()
    this.resetGrid();
  }

  tryChangeHeight() {
    this.gridHeight = this.heightSlider.value;
    this.changeTileSize()
    this.resetGrid();
  }

  logic() {
    this.updateEntropy();
    this.showGrid();

    if (this.populateGrid) {
      let randX = floor(random(this.gridWidth));
      let randY = floor(random(this.gridHeight));

      if (this.grid[randX][randY].options.length != 0) {
        this.grid[randX][randY].collapse();
      }
    }

    push();
    textSize(width * (50 / 400));
    fill(TRACKCOLOUR);
    stroke(TRACKCOLOUR);
    text("AUTO", width / 30, height / 8);

    textSize(width * 0.03);
    textAlign(CENTER);
    text("WIDTH", width * 0.1, height * 0.9);
    text("HEIGHT", width * 0.35, height * 0.9);
    pop();

    this.gridWidth = this.widthSlider.value;
    this.gridHeight = this.heightSlider.value;

    this.showButtons();
    this.widthSlider.show();
    this.heightSlider.show();
    this.widthSlider.tryMoveMarker();
    this.heightSlider.tryMoveMarker();
  }

  resetGrid() {
    this.tiles = [
      new Til(tileImages[0], [0, 1, 0, 1]), //chicane1         i = 0
      new Til(tileImages[1], [1, 0, 1, 0]), //kickerlander1    i = 1
      new Til(tileImages[2], [1, 0, 1, 0]), //kicker1          i = 2
      new Til(tileImages[3], [1, 0, 0, 1]), //slippyturn1      i = 3
      new Til(tileImages[4], [1, 0, 1, 0]), //straight1        i = 4
      new Til(tileImages[5], [1, 0, 0, 1]), //turn1            i = 5
    ];

    this.tiles.push(
      this.tiles[0].rt(1), //chicane2        i = 6
      this.tiles[1].rt(1), //kickerlander2   i = 7
      this.tiles[2].rt(1), //kicker2         i = 8
      this.tiles[3].rt(1), //slippyturn2     i = 9
      this.tiles[4].rt(1), //straight2       i = 10
      this.tiles[5].rt(1), //turn2           i = 11
      this.tiles[0].rt(2), //chicane3        i = 12
      this.tiles[1].rt(2), //kickerlander3   i = 13
      this.tiles[2].rt(2), //kicker3         i = 14
      this.tiles[3].rt(2), //slippyturn3     i = 15
      this.tiles[4].rt(2), //straight3       i = 16
      this.tiles[5].rt(2), //turn3           i = 17
      this.tiles[0].rt(3), //chicane4        i = 18
      this.tiles[1].rt(3), //kickerlander4   i = 19
      this.tiles[2].rt(3), //kicker4         i = 20
      this.tiles[3].rt(3), //slippyturn4     i = 21
      this.tiles[4].rt(3), //straight4       i = 22
      this.tiles[5].rt(3) //turn4            i = 23
    );

    this.getTileNeighbours();

    this.grid = make2DArray(this.gridWidth, this.gridHeight);

    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridHeight; j++) {
        this.grid[i][j] = new Cell(this.tiles);
      }
    }

    this.topBorderTiles = [
      this.tiles[5],
      this.tiles[11],
      this.tiles[2],
      this.tiles[13],
      this.tiles[3],
      this.tiles[9],
      this.tiles[6],
      this.tiles[18],
      this.tiles[1],
      this.tiles[14],
      this.tiles[4],
      this.tiles[16],
    ];
    this.rightBorderTiles = [
      this.tiles[17],
      this.tiles[11],
      this.tiles[19],
      this.tiles[0],
      this.tiles[15],
      this.tiles[7],
      this.tiles[9],
      this.tiles[12],
      this.tiles[8],
      this.tiles[20],
      this.tiles[10],
      this.tiles[22],
    ];
    this.bottomBorderTiles = [
      this.tiles[17],
      this.tiles[23],
      this.tiles[13],
      this.tiles[2],
      this.tiles[15],
      this.tiles[21],
      this.tiles[18],
      this.tiles[6],
      this.tiles[14],
      this.tiles[1],
      this.tiles[16],
      this.tiles[4],
    ];
    this.leftBorderTiles = [
      this.tiles[5],
      this.tiles[23],
      this.tiles[7],
      this.tiles[19],
      this.tiles[3],
      this.tiles[21],
      this.tiles[0],
      this.tiles[12],
      this.tiles[8],
      this.tiles[20],
      this.tiles[10],
      this.tiles[22],
    ];

    this.updateEntropy();

    //collapse corner cells since they can only be corner pieces.

    this.grid[0][0].collapse();
    this.grid[this.gridWidth - 1][0].collapse();
    this.grid[0][this.gridHeight - 1].collapse();
    this.grid[this.gridWidth - 1][this.gridHeight - 1].collapse();
  }

  getTileNeighbours() {
    for (let tileA of this.tiles) {
      for (let tileB of this.tiles) {
        if (tileA.edges[0] == tileB.edges[2]) {
          tileA.up.push(tileB);
        }
        if (tileA.edges[2] == tileB.edges[0]) {
          tileA.down.push(tileB);
        }
        if (tileA.edges[3] == tileB.edges[1]) {
          tileA.left.push(tileB);
        }
        if (tileA.edges[1] == tileB.edges[3]) {
          tileA.right.push(tileB);
        }
      }
    }
  }

  updateEntropy() {
    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridHeight; j++) {
        let c = this.grid[i][j];

        if (!c.collapsed) {
          try {
            c.options = findIntersection(
              j - 1 >= 0
                ? this.grid[i][j - 1].collapsed
                  ? this.grid[i][j - 1].tile.down
                  : this.tiles
                : this.topBorderTiles,
              i + 1 <= this.gridWidth - 1
                ? this.grid[i + 1][j].collapsed
                  ? this.grid[i + 1][j].tile.left
                  : this.tiles
                : this.rightBorderTiles,
              j + 1 <= this.gridHeight - 1
                ? this.grid[i][j + 1].collapsed
                  ? this.grid[i][j + 1].tile.up
                  : this.tiles
                : this.bottomBorderTiles,
              i - 1 >= 0
                ? this.grid[i - 1][j].collapsed
                  ? this.grid[i - 1][j].tile.right
                  : this.tiles
                : this.leftBorderTiles
            );
          } catch (err) {
            print(
              i,
              j,
              j - 1 > 0,
              i + 1 <= this.gridWidth - 1,
              j + 1 <= this.gridHeight - 1,
              i - 1 > 0
            );
            print(err);
          }
        }
      }
    }
  }

  showGrid() {
    push();
    stroke(TRACKCOLOUR);
    noFill();
    for (let i = 0; i < this.gridWidth; i++) {
      for (let j = 0; j < this.gridHeight; j++) {
        const x = i * this.tileWidth+ this.xOffset;
        const y = j * this.tileWidth + this.yOffset;

        if (this.grid[i][j].collapsed) {
          this.grid[i][j].tile.show(x + 1, y + 1);
        } else {
          strokeWeight(5);
          rect(x + 1, y + 1, this.tileWidth, this.tileWidth);
        }
      }
    }
    pop();
  }

  redo() {
    this.resetGrid();
  }

  saveTrackAsImage() {
    const x = 0;
    const y = this.yOffset;
    const w = width;
    const h = this.gridHeight * this.tileWidth;

    let trackImage = get(x, y, w, h);
    trackImage.save("track.png");
  }
  
  changeTileSize() {
    if (width/this.gridWidth > (height-2*this.yOffset)/this.gridHeight) {
      this.tileWidth = (height-2*this.yOffset)/this.gridHeight
      this.xOffset = (width - this.tileWidth*this.gridWidth)/2
    } else {
      this.tileWidth = width/this.gridWidth
      this.xOffset = 0
    }
  }

  changeGenerationState() {
    this.populateGrid = !this.populateGrid;

    if (this.populateGrid) {
      this.changeGenerationStateButton.label = "ll";
    } else {
      this.changeGenerationStateButton.label = "⏵";
    }
  }
}
