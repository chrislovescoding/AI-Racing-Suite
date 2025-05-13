class TrackSegment {
  constructor(nodes, trackWidth = 60) {
    this.trackWidth = trackWidth;
    this.nodes = nodes;
  }

  show(showNodes) {
    push();
    noFill();

    //road
    strokeJoin(ROUND);
    //     strokeWeight(this.trackWidth+5);
    //     stroke(color(255));

    //     beginShape();
    //     curveVertex(this.nodes[this.nodes.length - 1].x, this.nodes[this.nodes.length - 1].y);
    //     for (let node of this.nodes){
    //       curveVertex(node.x, node.y);
    //     }
    //     curveVertex(this.nodes[0].x, this.nodes[0].y);
    //     curveVertex(this.nodes[1].x, this.nodes[1].y);
    //     endShape();

    stroke(TRACKCOLOUR);
    strokeWeight(this.trackWidth);

    beginShape();
    curveVertex(
      this.nodes[this.nodes.length - 1].x,
      this.nodes[this.nodes.length - 1].y
    );
    for (let node of this.nodes) {
      curveVertex(node.x, node.y);
    }
    curveVertex(this.nodes[0].x, this.nodes[0].y);
    curveVertex(this.nodes[1].x, this.nodes[1].y);
    endShape();

    stroke(BACKGROUNDCOLOUR);
    strokeWeight(this.trackWidth / 1.2);

    beginShape();
    curveVertex(
      this.nodes[this.nodes.length - 1].x,
      this.nodes[this.nodes.length - 1].y
    );
    for (let node of this.nodes) {
      curveVertex(node.x, node.y);
    }
    curveVertex(this.nodes[0].x, this.nodes[0].y);
    curveVertex(this.nodes[1].x, this.nodes[1].y);
    endShape();

    // nodes
    if (showNodes) {
      stroke(TRACKCOLOUR);
      strokeWeight(this.trackWidth / 12);
      for (let node of this.nodes) {
        node.show();
      }
    } else {
      if (this.getTrackPixels) {
        loadPixels();
        manualTrackDesigner.trackPixels = pixels.slice();
        
        this.getTrackPixels = false;
      }
    }

    // //roadmarkings
    // setLineDash([this.trackWidth/20, this.trackWidth/5]);
    // stroke(255)
    // strokeWeight(1)
    // beginShape();
    // curveVertex(this.nodes[this.nodes.length - 1].x, this.nodes[this.nodes.length - 1].y);
    // for (let node of this.nodes){
    //   curveVertex(node.x, node.y);
    // }
    // curveVertex(this.nodes[0].x, this.nodes[0].y);
    // curveVertex(this.nodes[1].x, this.nodes[1].y);
    // endShape();
    pop();
  }
}
