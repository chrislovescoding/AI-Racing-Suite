class Cell {
  constructor(options, tile = null, collapsed = false) {
    this.tile = tile;
    this.collapsed = collapsed;

    this.options = options;
  }

  collapse() {
    this.tile = random(this.options);
    this.collapsed = true;
    this.options = [];
  }
  
  remake(){
    this.tile = null;
    this.collapsed = false;
    this.options = autoTrackDesigner.tiles;
  }
  
  noOptions(){
    return this.options.length === 0
  }
}
