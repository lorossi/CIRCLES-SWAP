class Sketch extends Engine {
  preload() {
    this._size = 6;
    this._background_color = "rgb(15, 15, 15)";
    this._border = 0.2;
    this._duration = 120;
    this._max_distance = 5;
    this._max_tries = 50000;
  }

  setup() {
    this._pairs = this._size ** 2 / 8;
    const scl = this.width * (1 - this._border) / this._size;
    this._circles = [];
    for (let i = 0; i < this._size ** 2; i++) {
      const pos = xy_from_index(i, this._size);
      const new_circle = new Circle(pos.x, pos.y, scl);
      this._circles.push(new_circle);
    }
  }

  draw() {
    const percent = easeInOut((this.frameCount % this._duration) / this._duration);
    const border_size = this.width * this._border / 2;

    if (percent == 0) {
      // reset each circle source and destination
      this._circles.forEach(c => c.resetPos());
      // array containing assigned position for each circle
      this._assigned_positions = new Array(this._size).fill().map(a => new Array(this._size).fill());

      let count = 0;
      let tries = 0;
      while (count < this._pairs && tries < this._max_tries) {
        // brute force approach
        // if it fails, just try again until a minimum amount of swaps has been reached
        if (this._make_pairs()) count++;
        tries++;
      }

      // set circles source and destination
      this._pair_circles();
    }

    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background_color;
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.translate(border_size, border_size);

    for (let i = 0; i < this._circles.length; i++) {
      this._circles[i].show(this.ctx);
      this._circles[i].move(percent);
    }

    this.ctx.restore();
  }

  _make_pairs() {
    const rotation_dir = random() > 0.5 ? -1 : 1; // rotation direction: 1 clockwise
    const start_x = random_int(this._size - 1);
    const start_y = random_int(this._size - 1);

    // displacement for each circle, relative to side
    // the rotation dir influences the next direction
    const dirs = [{
      x: rotation_dir,
      y: 0,
    }, {
      x: rotation_dir,
      y: rotation_dir,
    }, {
      x: 0,
      y: rotation_dir,
    }, {
      x: 0,
      y: 0,
    }];

    // max side dimension
    let max;
    if (rotation_dir == -1) {
      // top left
      max = Math.min(start_x, start_y, this._max_distance);
    } else {
      // bottom right
      max = Math.min(this._size - start_x, this._size - start_y, this._max_distance);
    }
    // max = 0 -> the rotation cannot happen in this direction. It's easier to just return false
    if (max == 0) return false;
    // actual side calculation
    const side = random_int(1, max);
    // check if each of these circles has not been already paired
    for (let i = 0; i < 4; i++) {
      if (this._assigned_positions[start_x + dirs[i].x * side][start_y + dirs[i].y * side]) return false;
    }

    // set new directions in the array
    if (rotation_dir == 1) {
      for (let i = 0; i < 4; i++) {
        const first_x = start_x + dirs[i].x * side;
        const first_y = start_y + dirs[i].y * side;
        const second_x = start_x + dirs[(i + 1) % 4].x * side;
        const second_y = start_y + dirs[(i + 1) % 4].y * side;

        this._assigned_positions[first_x][first_y] = { x: second_x, y: second_y };
      }
    } else {
      for (let i = 3; i >= 0; i--) {
        let second_index = i - 1;
        if (second_index < 0) second_index = 3;

        const first_x = start_x + dirs[i].x * side;
        const first_y = start_y + dirs[i].y * side;
        const second_x = start_x + dirs[second_index].x * side;
        const second_y = start_y + dirs[second_index].y * side;

        this._assigned_positions[first_x][first_y] = { x: second_x, y: second_y };
      }
    }
    // everything went right, return true
    return true;
  }

  _pair_circles() {
    // make actual pairs starting from the array
    for (let x = 0; x < this._size; x++) {
      for (let y = 0; y < this._size; y++) {
        if (this._assigned_positions[x][y]) {
          const current = this._circles.filter(c => c.x == x && c.y == y)[0];
          const next = this._circles.filter(c => c.x == this._assigned_positions[x][y].x && c.y == this._assigned_positions[x][y].y)[0];
          current.pair(next);
        }
      }
    }
  }
}

const xy_from_index = (i, width) => {
  const x = i % width;
  const y = parseInt(i / width);
  return { x: x, y: y };
};

const random = (a, b) => {
  if (a == undefined && b == undefined) return random(0, 1);
  else if (b == undefined) return random(0, a);
  else if (a != undefined && b != undefined) return Math.random() * (b - a) + a;
};

const random_int = (a, b) => {
  if (a == undefined && b == undefined) return random_int(0, 1);
  else if (b == undefined) return random_int(0, a);
  else if (a != undefined && b != undefined) return Math.floor(Math.random() * (b - a)) + a;
};

const easeInOut = (x) =>
  x < 0.5 ? 8 * Math.pow(x, 4) : 1 - Math.pow(-2 * x + 2, 4) / 2;

const find_neighbours = (x, y, size) => {
  let neighbours = [];
  // dir: 0, 1, 2, 3 -> right, bottom, left, top
  if (x > 0) neighbours.push({ x: x - 1, y: y, dir: 2 });
  if (x < size - 1) neighbours.push({ x: x + 1, y: y, dir: 0 });
  if (y > 0) neighbours.push({ x: x, y: y - 1, dir: 3 });
  if (y < size - 1) neighbours.push({ x: x, y: y + 1, dir: 1 });

  return neighbours;
};