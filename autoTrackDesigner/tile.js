class Til {
  constructor(img, edges) {
    this.imag = img  
    this.edges = edges
    
    this.up = []
    this.right = []
    this.down = []
    this.left = []
  }
  
  rt(rotations) {
    const w = this.imag.width
    const h = this.imag.height
    
    const newImg = createGraphics(w,h)
    newImg.noSmooth();
    newImg.imageMode(CENTER)
    newImg.translate(w/2, h/2)
    newImg.rotate(HALF_PI*rotations)
    newImg.image(this.imag, 0,0)
    
    let newEdges = []
    const edgesLength = this.edges.length
    for (let i = 0; i < edgesLength; i++) {
      newEdges[(i + rotations) % edgesLength] = this.edges[i];
    }
    
    return new Til(newImg, newEdges)
  }
  
  show (x,y) {
    if (this.imag!==null){
      image(this.imag, x, y, autoTrackDesigner.tileWidth, autoTrackDesigner.tileWidth)
    }
  }
}