function pointInRect(pointX, pointY, rectX, rectY, rectWidth, rectHeight) {
  return (
    pointX >= rectX &&
    pointX <= rectX + rectWidth &&
    pointY >= rectY &&
    pointY <= rectY + rectHeight
  );
}