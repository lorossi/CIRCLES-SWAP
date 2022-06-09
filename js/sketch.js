class Sketch extends Engine {
  preload() {
    this._size = 2;
    this._background_color = "rgb(15, 15, 15)";
    this._border = 0.2;
    this._step_duration = 60;
    this._steps = 2;
    this._max_tries = 5000;
    this._recording = true;
  }

  setup() {
    this._current_step = 0;
    const scl = (this.width * (1 - this._border)) / this._size;
    this._circles = [];
    for (let i = 0; i < this._size ** 2; i++) {
      const pos = xy_from_index(i, this._size);
      const new_circle = new Circle(pos.x, pos.y, scl);
      this._circles.push(new_circle);
    }

    // setup capturer
    if (this._recording) {
      this._capturer = new CCapture({ format: "png" });
    }
    this._capturer_started = false;
  }

  draw() {
    if (!this._capturer_started && this._recording) {
      this._capturer_started = true;
      this._capturer.start();
      console.log("%c Recording started", "color: green; font-size: 2rem");
    }

    const percent = easeInOut(
      (this.frameCount % this._step_duration) / this._step_duration
    );
    const border_size = (this.width * this._border) / 2;

    if (percent == 0) {
      // reset each circle source and destination
      this._circles.forEach((c) => c.resetPos());

      if (this._current_step < this._steps) {
        // update the current step
        this._current_step++;
        console.log(this._current_step);
        // array containing assigned position for each circle
        this._assigned_positions = new Array(this._size)
          .fill()
          .map((a) => new Array(this._size).fill());

        let tries = 0;
        while (tries < this._max_tries) {
          // brute force approach
          // if it fails, just try again until a minimum amount of swaps has been reached
          this._make_pairs();
          tries++;
        }
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

    if (this._recording) {
      if (
        this.frameCount <
        this._steps * this._step_duration + this._circles[0]._trail_length
      ) {
        this._capturer.capture(this._canvas);
      } else {
        this._recording = false;
        this._capturer.stop();
        this._capturer.save();
        console.log("%c Recording ended", "color: red; font-size: 2rem");
      }
    }
  }

  _make_pairs() {
    const rotation_dir = Math.random() > 0.5 ? -1 : 1; // rotation direction: 1 clockwise
    const start_x = Math.floor(Math.random() * (this._size - 1));
    const start_y = Math.floor(Math.random() * (this._size - 1));

    // displacement for each circle, relative to side
    // the rotation dir influences the next direction
    const dirs = [
      {
        x: rotation_dir,
        y: 0,
      },
      {
        x: rotation_dir,
        y: rotation_dir,
      },
      {
        x: 0,
        y: rotation_dir,
      },
      {
        x: 0,
        y: 0,
      },
    ];

    // max side dimension
    let max;
    if (rotation_dir == -1) {
      // top left
      max = Math.min(start_x, start_y, 2);
    } else {
      // bottom right
      max = Math.min(this._size - start_x, this._size - start_y, 2);
    }
    // max = 0 -> the rotation cannot happen in this direction. It's easier to just return false
    if (max == 0) return false;
    // actual side calculation
    const side = Math.floor(Math.random() * (max - 1)) + 1;
    // check if each of these circles has not been already paired
    for (let i = 0; i < 4; i++) {
      if (
        this._assigned_positions[start_x + dirs[i].x * side][
          start_y + dirs[i].y * side
        ]
      )
        return false;
    }

    // set new directions in the array
    if (rotation_dir == 1) {
      for (let i = 0; i < 4; i++) {
        const first_x = start_x + dirs[i].x * side;
        const first_y = start_y + dirs[i].y * side;
        const second_x = start_x + dirs[(i + 1) % 4].x * side;
        const second_y = start_y + dirs[(i + 1) % 4].y * side;

        this._assigned_positions[first_x][first_y] = {
          x: second_x,
          y: second_y,
        };
      }
    } else {
      for (let i = 3; i >= 0; i--) {
        let second_index = i - 1;
        if (second_index < 0) second_index = 3;

        const first_x = start_x + dirs[i].x * side;
        const first_y = start_y + dirs[i].y * side;
        const second_x = start_x + dirs[second_index].x * side;
        const second_y = start_y + dirs[second_index].y * side;

        this._assigned_positions[first_x][first_y] = {
          x: second_x,
          y: second_y,
        };
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
          const current = this._circles.find((c) => c.x == x && c.y == y);
          const next = this._circles.find(
            (c) =>
              c.x == this._assigned_positions[x][y].x &&
              c.y == this._assigned_positions[x][y].y
          );
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

const easeInOut = (x, n = 4) =>
  x < 0.5
    ? Math.pow(2, n - 1) * Math.pow(x, n)
    : 1 - Math.pow(-2 * x + 2, n) / 2;
