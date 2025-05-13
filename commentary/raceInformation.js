class RaceInformationMenu extends Menu {
  constructor(buttons) {
    super(buttons);
    this.raceInfoJSON = {};
    this.raceInfoString = "";

    this.tableLeft = width * 0.05;
    this.tableTop = height * 0.2;
    this.tableWidth = width * 0.9;
    this.tableHeight = height * 0.66;

    this.tableRowStart = height * 0.3;

    this.eventNameRowHeight = height * 0.1;
    this.columnTitleRowHeight = height * 0.07;

    this.tableStrokeWeight = width * 0.005;

    this.columnNames = [
      "Name",
      "Position",
      "Car No",
      "Laps",
      "Absolute",
      "Best Lap",
      "Av Lap",
    ];

    this.textSizeCache = {};
  }

  logic() {
    push();
    textSize(width * (50 / 400) * 0.8);
    fill(TRACKCOLOUR);
    stroke(TRACKCOLOUR);
    strokeWeight(0);
    text("RACE INFO", width / 30, height / 9);
    pop();

    this.showTable();
    this.showButtons();

    if (showError) {
      //display error message on screen
      const lifeSpan = 75;
      errorAliveTime = showErrorMessage(error, errorAliveTime, lifeSpan);
    }
  }

  showTable() {
    if (Object.keys(this.raceInfoJSON).length > 0) {
      const noOfColumns = Object.keys(this.raceInfoJSON.racersData[0]).length;

      if (noOfColumns !== this.columnNames.length) {
        print("Error: mismatch between column lengths");
      }
      const noOfRows = this.raceInfoJSON.racersData.length;
      const columnWidth = this.tableWidth / noOfColumns;

      let totalRowSpacing =
        this.tableTop +
        this.tableHeight -
        (this.tableTop + this.columnTitleRowHeight);
      const rowHeight = totalRowSpacing / noOfRows;

      this.drawTableLines(
        this.tableLeft,
        this.tableLeft + this.tableWidth,
        this.tableRowStart,
        this.tableRowStart + this.tableHeight,
        noOfColumns,
        noOfRows
      );

      let eventName = this.raceInfoJSON.eventName;
      let txtSizeX = ((0.9 * width) / eventName.length) * 1.7;
      let txtSizeY = height * 0.08;

      textSize(txtSizeY);

      textSize(textWidth(eventName) >= 0.9 * width ? txtSizeX : txtSizeY);

      push();
      fill(TRACKCOLOUR);
      stroke(TRACKCOLOUR);
      //write event name
      drawTextInArea(
        eventName,
        this.tableLeft,
        this.tableTop,
        this.tableWidth,
        this.eventNameRowHeight
      );

      //write column titles
      for (let i = 0; i < noOfColumns; i++) {
        let columnTitle = this.columnNames[i];
        let columnLeft = this.tableLeft + i * columnWidth;

        drawTextInArea(
          columnTitle,
          columnLeft,
          this.tableRowStart,
          columnWidth,
          this.columnTitleRowHeight
        );

        for (let j = 0; j < noOfRows; j++) {
          let rowTitle = str(
            this.raceInfoJSON.racersData[j][
              Object.keys(this.raceInfoJSON.racersData[j])[i]
            ]
          );
          drawTextInArea(
            rowTitle,
            columnLeft,
            this.tableRowStart + this.columnTitleRowHeight + j * rowHeight,
            columnWidth,
            rowHeight
          );
        }
      }
      pop();
    } else {
      menuStack.pop();

      error = "No Data For This Event Key";
      showError = true;

      push();
      stroke(ERRORCOLOUR);
      fill(ERRORCOLOUR);
      textSize(width * 0.07);
      textAlign(CENTER, CENTER);
      text("No Data For This Event Key", width / 2, height / 2);
      pop();
    }
  }

  drawTableLines(startX, endX, startY, endY, noOfColumns, noOfRows) {
    let columnLineSpacing = (endX - startX) / noOfColumns;

    let totalRowSpacing = endY - (startY + this.columnTitleRowHeight);
    let rowLineSpacing = totalRowSpacing / noOfRows;

    push();
    rectMode(CENTER);
    stroke(TRACKCOLOUR);
    strokeWeight(this.tableStrokeWeight);
    noFill();
    rect(width / 2, height * 0.58, width / 1.1, height / 1.3, width * 0.01);
    line(startX, startY, endX, startY);
    line(
      startX,
      startY + this.columnTitleRowHeight,
      endX,
      startY + this.columnTitleRowHeight
    );

    //draw column lines
    for (let i = 1; i < noOfColumns; i++) {
      let x = startX + i * columnLineSpacing;
      line(x, startY, x, endY);
    }

    //draw row lines
    for (let i = 1; i < noOfRows; i++) {
      let y = startY + this.columnTitleRowHeight + i * rowLineSpacing;
      line(startX, y, endX, y);
    }
    pop();
  }
}
