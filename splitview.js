
exports.SplitView = SplitView;
function SplitView(options) {
  this.orientation = options.orientation || "left";
  this.el = options.el || document.createElement("div");

  this.size = options.size || 200;
  this.defaultSize = this.size;
  this.savedSize = 0;

  if (this.orientation === "left" || this.orientation === "right") {
    this.el.classList.add("splitview");
    this.el.classList.add("horizontal");
    this.horizontal = true;
  }
  else if (this.orientation === "top" || this.orientation === "bottom") {
    this.el.classList.add("splitview");
    this.el.classList.add("vertical");
    this.horizontal = false;
  }
  else {
    throw new Error("options.orientation must be one of 'left', 'right', 'top', or 'bottom'");
  }

  var sliderEl = document.createElement("div");
  this.el.appendChild(sliderEl);
  this.sliderEl = sliderEl;

  sliderEl.classList.add("slider");
  var position = null;
  var self = this;
  var isTouch;

  function onStart(evt) {
    if (position !== null) return;
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.touches) {
      evt = evt.touches[0];
      isTouch = true;
    }
    else {
      isTouch = false;
    }
    if (self.horizontal) {
      position = evt.clientX;
    }
    else {
      position = evt.clientY;
    }
    if (isTouch) {
      window.addEventListener("touchmove", onMove, true);
      window.addEventListener('touchend', onEnd, true);
    }
    else {
      window.addEventListener("mousemove", onMove, true);
      window.addEventListener('mouseup', onEnd, true);
    }
  }

  function onMove(evt) {
    evt.preventDefault();
    evt.stopPropagation();
    if (evt.touches) {
      evt = evt.touches[0];
    }
    var delta;
    if (self.horizontal) {
      delta = evt.clientX - position;
      position = evt.clientX;
      if (self.orientation === "left") {
        self.size += delta;
      }
      else {
        self.size -= delta;
      }
    }
    else {
      delta = evt.clientY - position;
      position = evt.clientY;
      if (self.orientation === "top") {
        self.size += delta;
      }
      else {
        self.size -= delta;
      }
    }
    if (self.savedSize) {
      self.savedSize = undefined;
    }

    self.resize();
  }

  function onEnd(evt) {
    if (isTouch) {
      window.removeEventListener("touchmove", onMove, true);
      window.removeEventListener('touchend', onEnd, true);
    }
    else {
      window.removeEventListener("mousemove", onMove, true);
      window.removeEventListener('mouseup', onEnd, true);
    }
    position = null;
    isTouch = null;
  }



  sliderEl.addEventListener("mousedown", onStart, true);
  sliderEl.addEventListener("touchstart", onStart, true);
}

function isNumber(value) {
  return typeof value === "number" && !isNaN(value);
}

SplitView.prototype.resize = function (width, height) {

  if (arguments.length === 0) {
    if (!isNumber(this.width) || !isNumber(this.height)) {
      return;
    }
    width = this.width;
    height = this.height;
  }
  else {
    if (!isNumber(width) || !isNumber(height)) {
      throw new TypeError("width and height must be numbers");
    }
    this.width = width;
    this.height = height;
  }

  this.el.style.width = width + "px";
  this.el.style.height = height + "px";

  if (this.horizontal) {
    if (this.size > this.width - 5) this.size = this.width - 5;
  }
  else {
    if (this.size > this.height - 5) this.size = this.height - 5;
  }
  if (this.size < 0) this.size = 0;

  this.sliderEl.style[this.orientation] = this.size + "px";
  if (this.side) {
    this.side.el.style[this.orientation] = 0;
    if (this.horizontal) {
      this.side.resize(this.size, height);
    }
    else {
      this.side.resize(width, this.size);
    }
  }
  if (this.main) {
    this.main.el.style[this.orientation] = (this.size + 5) + "px";
    if (this.horizontal) {
      this.main.resize(width - this.size - 5, height);
    }
    else {
      this.main.resize(width, height - this.size - 5);
    }
  }

};

SplitView.prototype.toggleSide = function () {
  if (this.size) {
    this.hideSide();
  }
  else {
    this.showSide();
  }
};

SplitView.prototype.hideSide = function () {
  this.savedSize = this.size;
  this.size = 0;
  this.resize();
};

SplitView.prototype.showSide = function () {
  if (this.savedSize) {
    this.size = this.savedSize;
    this.savedSize = 0;
  }
  else {
    this.size = this.defaultSize;
  }
  this.resize();
};

SplitView.prototype.addSide = function (obj) {
  if (this.side) {
    this.el.removeChild(this.side.el);
  }
  this.side = obj;
  this.el.appendChild(obj.el);
  this.resize();
};

SplitView.prototype.addMain = function (obj) {
  if (this.main) {
    this.el.removeChild(this.main.el);
  }
  this.main = obj;
  this.el.appendChild(obj.el);
  this.resize();
};
