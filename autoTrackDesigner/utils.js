function make2DArray(cols, rows) {
  let arr = new Array(cols);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

  
function findIntersection(...arrays) {
  if (arrays.length === 0) return [];
  return arrays.reduce((acc, arr) => acc.filter(element => arr.indexOf(element) !== -1));
}
