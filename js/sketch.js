class Sketch extends Engine {
  preload() {
    this._size = 12; // number of circle in each row and column
    this._background_color = "rgb(15, 15, 15)";
    this._scl = 0.8; // scale of the canvas
    this._steps = 10; // number of steps in the animation
    this._trail_length = 40; // number of frames the circle will be visible
    this._step_duration = 60; // number of frames per step
    this._max_tries = 5000; // number of attempts to make a pair

    this._recording = true;
  }

  setup() {
    this._current_step = 0;
    this._circles = [];

    // calculate size of each circle and create them
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
    // percent easing
    const percent = easeInOut(
      (this.frameCount % this._step_duration) / this._step_duration
    );

    // if the current step has ended, start a new one
    if (percent == 0) {
      // reset each position
      this._circles.forEach((c) => c.resetDest());
      if (this._current_step < this._steps) {
        // make pairs
        this._current_step++;
        let tries = 0;
        // time escaped brute force
        while (tries < this._max_tries) {
          this._make_pairs();
          tries++;
        }
      }
    }

    // clear the canvas
    this.ctx.save();
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = this._background_color;
    this.ctx.fillRect(0, 0, this.width, this.height);

    // canvas scaling
    this.ctx.translate(this.width / 2, this.height / 2);
    this.ctx.scale(this._scl, this._scl);
    this.ctx.translate(-this.width / 2, -this.height / 2);

    // draw and update each circle
    this._circles.forEach((c) => {
      c.show(this.ctx);
      c.update(percent);
    });

    this.ctx.restore();

    // capture frame
    if (this._recording) {
      if (
        this._current_step < this._steps ||
        this._circles.some((c) => c.has_trail)
      ) {
        this._capturer.capture(this._canvas);
      } else {
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }
  }

  _make_pairs() {
    // steps in the rotation
    let rotation = [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
    ];

    // select a random starting position
    const start_x = Math.floor(Math.random() * (this._size - 1));
    const start_y = Math.floor(Math.random() * (this._size - 1));

    // invert the rotation
    if (Math.random() < 0.5)
      rotation = rotation.reverse().map(([x, y]) => [-y, x]);

    let attempt = [];

    // check if all positions are valid
    for (let i = 0; i < rotation.length; i++) {
      const x = start_x + rotation[i][0];
      const y = start_y + rotation[i][1];

      const next_x = start_x + rotation[(i + 1) % rotation.length][0];
      const next_y = start_y + rotation[(i + 1) % rotation.length][1];

      // check if the position is valid for the current step
      if (x < 0 || x >= this._size || y < 0 || y >= this._size) return false;
      if (
        next_x < 0 ||
        next_x >= this._size ||
        next_y < 0 ||
        next_y >= this._size
      )
        return false;

      // check if the position is already used
      const circle = this._circles.find((c) => c.x == x && c.y == y);
      const next_circle = this._circles.find(
        (c) => c.x == next_x && c.y == next_y
      );
      if (!circle || !next_circle) return false;
      if (circle.moving || next_circle.moving) return false;

      // place the circles in the array
      attempt.push([circle, next_circle]);
    }

    // if 4 circles are placed, make the pair
    if (attempt.length == 4) {
      for (let i = 0; i < 4; i++) {
        const current = attempt[i][0];
        const next = attempt[i][1];
        current.setDest(next);
      }
      return true;
    }

    return false;
  }
}

// get coordinates from an index
const xy_from_index = (i, width) => {
  const x = i % width;
  const y = parseInt(i / width);
  return { x: x, y: y };
};

// get index from coordinates
const xy_to_index = (x, y, width) => {
  return y * width + x;
};

// easing function
const easeInOut = (x, n = 3) =>
  x < 0.5
    ? Math.pow(2, n - 1) * Math.pow(x, n)
    : 1 - Math.pow(-2 * x + 2, n) / 2;
