class Sketch extends Engine {
  preload() {
    this._cols = 10;
    this._background_color = "rgb(15, 15, 15)";
    this._border = 0.1;
    this._duration = 60;
  }

  setup() {
    const scl = this.width * (1 - this._border) / this._cols;
    this._circles = [];
    for (let i = 0; i < this._cols ** 2; i++) {
      const pos = xy_from_index(i, this._cols);
      const new_circle = new Circle(pos.x, pos.y, scl);
      this._circles.push(new_circle);
    }
  }

  draw() {
    const percent = easeInOut((this.frameCount % this._duration) / this._duration);
    const border_size = this.width * this._border / 2;

    if (percent == 0) {
      this._circles.forEach(c => c.resetPos());
      this._assigned_position = new Array(this._cols).fill().map(a => new Array(this._cols).fill());

      this._make_pairs();
      console.table(this._assigned_position);

      for (let x = 0; x < this._cols; x++) {
        for (let y = 0; y < this._cols; y++) {
          if (this._assigned_position[x][y]) {
            const current = this._circles.filter(c => c.x == x && c.y == y)[0];
            const next = this._circles.filter(c => c.x == this._assigned_position[x][y].x && c.y == this._assigned_position[x][y].y)[0];
            current.pair(next);
          }
        }
      }
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
    for (let i = 0; i < 1; i++) {
      const first = { x: random_int(this._cols - 1), y: random_int(this._cols - 1) };
      if (this._assigned_position[first.x][first.y]) continue;

      let dirs = [];
      if (first.x < this._cols - 1) dirs.push(0);
      if (first.y < this._cols - 1) dirs.push(1);
      if (first.x > 0) dirs.push(2);
      if (first.y > 0) dirs.push(3);
      shuffle_array(dirs);
      const current_dir = random_from_array(dirs);


      if (current_dir == 0) {
        // right
        const max = Math.min(this._cols - first.x, this._cols - first.y);
        const side = random_int(1, max);
        // clockwise
        this._assigned_position[first.x][first.y] = { x: first.x + side, y: first.y }; // right
        this._assigned_position[first.x + side][first.y] = { x: first.x + side, y: first.y + side }; // bottom-right
        this._assigned_position[first.x + side][first.y + side] = { x: first.x, y: first.y + side };// below
        this._assigned_position[first.x][first.y + side] = { x: first.x, y: first.y };
      } else if (current_dir == 1) {
        // bottom
        const max = Math.min(this._cols - first.x, this._cols - first.y);
        const side = random_int(1, max);
        // counter-clockwise
        this._assigned_position[first.x][first.y] = { x: first.x, y: first.y + side }; // below
        this._assigned_position[first.x][first.y + side] = { x: first.x + side, y: first.y + side }; // bottom-right
        this._assigned_position[first.x + side][first.y + side] = { x: first.x + side, y: first.y }; // right
        this._assigned_position[first.x + side][first.y] = { x: first.x, y: first.y };
      } else if (current_dir == 2) {
        // left
        const max = Math.min(first.x, first.y);
        const side = random_int(1, max);
        // clockwise
        this._assigned_position[first.x][first.y] = { x: first.x - side, y: first.y }; // left
        this._assigned_position[first.x - side][first.y] = { x: first.x - side, y: first.y - side }; // top-left
        this._assigned_position[first.x - side][first.y - side] = { x: first.x, y: first.y - side };// below
        this._assigned_position[first.x][first.y - side] = { x: first.x, y: first.y };
      } else if (current_dir == 3) {
        // top
        const max = Math.min(first.x, first.y);
        const side = random_int(1, max);
        // counter-clockwise
        this._assigned_position[first.x][first.y] = { x: first.x, y: first.y - side }; // top
        this._assigned_position[first.x][first.y - side] = { x: first.x - side, y: first.y - side }; // top-left
        this._assigned_position[first.x - side][first.y - side] = { x: first.x - side, y: first.y };// left
        this._assigned_position[first.x - side][first.y] = { x: first.x, y: first.y };
      }
    }
  }
}

const xy_from_index = (i, width) => {
  const x = i % width;
  const y = parseInt(i / width);
  return { x: x, y: y };
};

const shuffle_array = arr => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

const random_from_array = arr => {
  return arr[random_int(arr.length - 1)];
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