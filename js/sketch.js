class Sketch extends Engine {
  preload() {
    this._size = 12;
    this._background_color = "rgb(15, 15, 15)";
    this._scl = 0.8;
    this._steps = 10;
    this._trail_length = 30;
    this._step_duration = 60;
    this._max_tries = 5000;

    this._recording = true;
  }

  setup() {
    this._current_step = 0;
    this._circles = [];

    const scl = this.width / this._size;
    for (let i = 0; i < this._size ** 2; i++) {
      const pos = xy_from_index(i, this._size);
      const new_circle = new Circle(pos.x, pos.y, scl, this._trail_length);
      this._circles.push(new_circle);
    }

    // setup capturer
    if (this._recording) {
      this._capturer = new CCapture({ format: "png" });
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }
  }

  draw() {
    const percent = easeInOut(
      (this.frameCount % this._step_duration) / this._step_duration
    );

    if (percent == 0) {
      this._circles.forEach((c) => c.resetPos());
      if (this._current_step < this._steps) {
        this._current_step++;
        let tries = 0;
        while (tries < this._max_tries) {
          this._make_pairs();
          tries++;
        }
      }
    }
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background_color;
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    for (let i = 0; i < this._circles.length; i++) {
      this._circles[i].show(this.ctx);
      this._circles[i].update(percent);
    }

    this.ctx.restore();

    if (this._recording) {
      if (
        this._current_step < this._steps ||
        this._circles.some((c) => c.has_tail)
      ) {
        this._capturer.capture(this._canvas);
      } else {
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }

    console.log(
      this._current_step,
      this._circles.filter((c) => c.moving).length
    );
  }

  _make_pairs() {
    let rotation = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];

    const start_x = Math.floor(Math.random() * (this._size - 1));
    const start_y = Math.floor(Math.random() * (this._size - 1));

    if (Math.random() < 0.5)
      rotation = rotation.reverse().map(([x, y]) => [-y, x]);

    let attempt = [];

    for (let i = 0; i < rotation.length; i++) {
      const x = start_x + rotation[i][0];
      const y = start_y + rotation[i][1];

      const next_x = start_x + rotation[(i + 1) % rotation.length][0];
      const next_y = start_y + rotation[(i + 1) % rotation.length][1];

      if (x < 0 || x >= this._size || y < 0 || y >= this._size) return false;

      if (
        next_x < 0 ||
        next_x >= this._size ||
        next_y < 0 ||
        next_y >= this._size
      )
        return false;

      const circle = this._circles.find((c) => c.x == x && c.y == y);
      const next_circle = this._circles.find(
        (c) => c.x == next_x && c.y == next_y
      );

      if (!circle || !next_circle) return false;

      if (circle.moving || next_circle.moving) return false;

      attempt.push([circle, next_circle]);
    }

    if (attempt.length == 4) {
      for (let i = 0; i < 4; i++) {
        const current = attempt[i][0];
        const next = attempt[i][1];
        current.setDest(next);
      }
    }

    return true;
  }
}

const xy_from_index = (i, width) => {
  const x = i % width;
  const y = parseInt(i / width);
  return { x: x, y: y };
};

const xy_to_index = (x, y, width) => {
  return y * width + x;
};

const easeInOut = (x, n = 2) =>
  x < 0.5
    ? Math.pow(2, n - 1) * Math.pow(x, n)
    : 1 - Math.pow(-2 * x + 2, n) / 2;
