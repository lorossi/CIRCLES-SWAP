class Circle {
  constructor(x, y, scl) {
    // starting position
    this._start_x = x;
    this._start_y = y;
    // circle grid size
    this._scl = scl;

    // spacing inside the grid
    this._border = 0.4;
    // trail length to add some movement
    this._trail_length = 30;

    // current and end position
    this._x = this._start_x;
    this._y = this._start_y;
    this._end_x = this._start_x;
    this._end_y = this._start_y;

    // old position, keep track for trailing
    this._old_pos = [new Point(this._x, this._y)];
    // offset for chromatic aberration
    this._dpos = [-1, 1, 0];
    // colors for chromatic aberration
    this._colors_mask = ["#FF00FF", "#00FFFF", "#FFFFFF"];
  }

  show(ctx) {
    // circle radius
    const r = (this._scl * (1 - this._border)) / 2;
    ctx.save();
    ctx.translate(this._scl / 2, this._scl / 2);
    ctx.globalCompositeOperation = "screen";
    for (let i = this._old_pos.length - 1; i >= 0; i--) {
      ctx.save();
      ctx.translate(
        this._old_pos[i].x * this._scl,
        this._old_pos[i].y * this._scl
      );
      for (let j = 0; j < this._colors_mask.length; j++) {
        ctx.save();
        ctx.translate(this._dpos[j], this._dpos[j]);
        ctx.beginPath();
        ctx.fillStyle = this._colors_mask[j];
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  move(percent) {
    // add pos in front
    this._old_pos.unshift(new Point(this._x, this._y));
    // remove last old pos if too long
    if (this._old_pos.length > this._trail_length) {
      this._old_pos = this._old_pos.splice(0, this._trail_length);
    }
    // move to new position, lerp between start and end
    this._x = this._start_x + percent * (this._end_x - this._start_x);
    this._y = this._start_y + percent * (this._end_y - this._start_y);
  }

  pair(other) {
    // pair two circles
    this._end_x = other.x;
    this._end_y = other.y;
  }

  resetPos() {
    // reset position so it won't move any more
    this._start_x = this._end_x;
    this._start_y = this._end_y;
    this._x = this._end_x;
    this._y = this._end_y;
  }

  get x() {
    return this._start_x;
  }

  get y() {
    return this._start_y;
  }
}
