class Circle {
  constructor(x, y, scl) {
    this._start_x = x;
    this._start_y = y;
    this._scl = scl;

    this._border = 0.2;
    this._trail_length = 5;

    this._x = this._start_x;
    this._y = this._start_y;
    this._end_x = this._start_x;
    this._end_y = this._start_y;

    this._paired = false;
    this._has_to_move = false;
    this._old_pos = [new Point(this._x, this._y)];
  }

  show(ctx) {

    const r = this._scl * (1 - this._border) / 2;
    ctx.save();
    ctx.translate(this._scl / 2, this._scl / 2);

    for (let i = this._old_pos.length - 1; i >= 0; i--) {
      const channel = 100 + 130 * (1 - i / this._old_pos.length);

      ctx.save();
      ctx.translate(this._old_pos[i].x * this._scl, this._old_pos[i].y * this._scl);
      ctx.beginPath();
      ctx.fillStyle = `rgb(${channel}, ${channel}, ${channel})`;
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  move(percent) {
    this._old_pos.unshift(new Point(this._x, this._y));
    if (this._old_pos.length > this._trail_length) {
      this._old_pos = this._old_pos.splice(0, this._trail_length);
    }
    this._x = this._start_x + percent * (this._end_x - this._start_x);
    this._y = this._start_y + percent * (this._end_y - this._start_y);
  }

  pair(other) {
    this._end_x = other.x;
    this._end_y = other.y;
    this._paired = true;
  }

  resetPos() {
    this._start_x = this._end_x;
    this._start_y = this._end_y;
    this._x = this._end_x;
    this._y = this._end_y;
    this._paired = false;
  }

  get paired() {
    return this._paired;
  }

  get x() {
    return this._start_x;
  }

  get y() {
    return this._start_y;
  }

  get has_to_move() {
    return this._has_to_move;
  }

  set has_to_move(h) {
    this._has_to_move = h;
  }
}