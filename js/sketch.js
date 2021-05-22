class Sketch extends Engine {
  preload() {
    this._cols = 2;
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

const easeInOut = (x) =>
  x < 0.5 ? 8 * Math.pow(x, 4) : 1 - Math.pow(-2 * x + 2, 4) / 2;

const find_neighbours = (x, y, size) => {
  let neighbours = [];

  if (x > 0) neighbours.push({ x: x - 1, y: y });
  if (x < size - 1) neighbours.push({ x: x + 1, y: y });

  if (y > 0) neighbours.push({ x: x, y: y - 1 });
  if (y < size - 1) neighbours.push({ x: x, y: y - 1 });

  return neighbours;
};