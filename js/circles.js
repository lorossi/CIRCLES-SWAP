class Circle {
  constructor(x, y, scl, trail_length) {
    // starting position
    this._start_x = x;
    this._start_y = y;
    // circle grid size
    this._scl = scl;

    // trail length to add some movement
    this._trail_length = trail_length;

    // spacing inside the grid
    this._border = 0.4;
    this._r = (this._scl * (1 - this._border)) / 2;

    // current and end position
    this._x = this._start_x;
    this._y = this._start_y;
    this._end_x = this._start_x;
    this._end_y = this._start_y;

    this._moving = false;

    // old position, keep track for trailing
    this._old_pos = [new Point(this._x, this._y)];
    // offset for chromatic aberration
    this._d_pos = [-1, 1, 0];
    // colors for chromatic aberration
    this._colours = ["#FF00FF", "#00FFFF", "#FFFFFF"];
  }

  show(ctx) {
    // circle radius
    ctx.save();
    ctx.translate(this._scl / 2, this._scl / 2);
    ctx.globalCompositeOperation = "screen";
    for (let i = this._old_pos.length - 1; i >= 0; i--) {
      ctx.save();
      ctx.translate(
        this._old_pos[i].x * this._scl,
        this._old_pos[i].y * this._scl
      );
      for (let j = 0; j < this._colours.length; j++) {
        ctx.save();
        ctx.translate(this._d_pos[j], this._d_pos[j]);
        ctx.beginPath();
        ctx.fillStyle = this._colours[j];
        ctx.arc(0, 0, this._r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore();
  }

  update(percent) {
    // add pos in front
    if (this._moving) this._old_pos.unshift(new Point(this._x, this._y));
    else if (this._old_pos.length > 1) this._old_pos.pop();

    // remove last old pos if too long
    if (this._old_pos.length > this._trail_length)
      this._old_pos = this._old_pos.splice(0, this._trail_length);

    // move to new position, linear interpolate between start and end
    this._x = this._start_x + percent * (this._end_x - this._start_x);
    this._y = this._start_y + percent * (this._end_y - this._start_y);

    if (percent >= 1) this.resetPos();
  }

  setDest(other) {
    // pair two circles
    this._end_x = other.x;
    this._end_y = other.y;
    this._moving = true;
  }

  resetPos() {
    this._start_x = this._end_x;
    this._start_y = this._end_y;

    this._moving = false;
  }

  get x() {
    return this._start_x;
  }

  get y() {
    return this._start_y;
  }

  get moving() {
    return this._moving;
  }

  get has_tail() {
    return this._old_pos.length > 1;
  }

  get ended() {
    return this._old_pos.length == 1;
  }

  get trail_length() {
    return this._old_pos.length - 1;
  }
}
