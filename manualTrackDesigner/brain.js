class Brain {
  constructor(neuronCounts) {
    this.levels = [];
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(neuronCounts[i], neuronCounts[i + 1]));
    }
  }

  static feedForward(givenInputs, network) {
    let outputs = Level.feedForward(givenInputs, network.levels[0]);
    for (let i = 1; i < network.levels.length; i++) {
      outputs = Level.feedForward(outputs, network.levels[i]);
    }
    return outputs;
  }

  static mutate(network, mutationRate = 0.1, mutationAmount = 0.5) {
    network.levels.forEach((level) => {
      for (let i = 0; i < level.biases.length; i++) {
        if (random(1) < mutationRate) {
          let adjustment = random(-1,1) * mutationAmount;
          level.biases[i] += adjustment;
        }
      }
  
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          if (random() < mutationRate) {
            let adjustment = random(-1,1) * mutationAmount;
            level.weights[i][j] += adjustment;
          }
        }
      }
    });
  }

  static crossover(parentA, parentB) {
    let child = new Brain([
      parentA.levels[0].inputs.length,
      ...parentA.levels.map((level) => level.outputs.length),
    ]);

    for (let i = 0; i < parentA.levels.length; i++) {
      let cutoff = floor(random(parentA.levels[i].biases.length));

      for (let j = 0; j < parentA.levels[i].biases.length; j++) {
        if (j < cutoff) {
          child.levels[i].biases[j] = parentA.levels[i].biases[j];
        } else {
          child.levels[i].biases[j] = parentB.levels[i].biases[j];
        }
      }

      for (let j = 0; j < parentA.levels[i].weights.length; j++) {
        for (let k = 0; k < parentA.levels[i].weights[j].length; k++) {
          if (j < cutoff) {
            child.levels[i].weights[j][k] = parentA.levels[i].weights[j][k];
          } else {
            child.levels[i].weights[j][k] = parentB.levels[i].weights[j][k];
          }
        }
      }
    }

    return child;
  }
}

class Level {
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }

    Level._randomize(this);
  }

  static _randomize(level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = random(-1,1);
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = random(-1,1);
    }
  }

  static feedForward(givenInputs, level) {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0;
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }

      level.outputs[i] = sigmoid(sum + level.biases[i]);
    }

    return level.outputs;
  }
}
