require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"VRComponent":[function(require,module,exports){
"\nVRComponent class\n\nproperties\n- front (set: imagePath <string>, get: layer)\n- right\n- back\n- left\n- top\n- bottom\n- heading <number>\n- elevation <number>\n- tilt <number> readonly\n\n- orientationLayer <bool>\n- arrowKeys <bool>\n- lookAtLatestProjectedLayer <bool>\n\nmethods\n- projectLayer(layer) # heading and elevation are set as properties on the layer\n- hideEnviroment()\n\nevents\n- Events.OrientationDidChange, (data {heading, elevation, tilt})\n\n--------------------------------------------------------------------------------\n\nVRLayer class\n\nproperties\n- heading <number> (from 0 up to 360)\n- elevation <number> (from -90 down to 90 up)\n";
var KEYS, KEYSDOWN, SIDES, VRAnchorLayer,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

SIDES = ["north", "front", "east", "right", "south", "back", "west", "left", "top", "bottom"];

KEYS = {
  LeftArrow: 37,
  UpArrow: 38,
  RightArrow: 39,
  DownArrow: 40
};

KEYSDOWN = {
  left: false,
  up: false,
  right: false,
  down: false
};

Events.OrientationDidChange = "orientationdidchange";

VRAnchorLayer = (function(superClass) {
  extend(VRAnchorLayer, superClass);

  function VRAnchorLayer(layer, cubeSide) {
    VRAnchorLayer.__super__.constructor.call(this, void 0);
    this.width = 0;
    this.height = 0;
    this.clip = false;
    this.name = "anchor";
    this.cubeSide = cubeSide;
    this.layer = layer;
    layer.superLayer = this;
    layer.center();
    layer.on("change:orientation", (function(_this) {
      return function(newValue, layer) {
        return _this.updatePosition(layer);
      };
    })(this));
    this.updatePosition(layer);
    layer._context.on("layer:destroy", (function(_this) {
      return function(layer) {
        if (layer === _this.layer) {
          return _this.destroy();
        }
      };
    })(this));
  }

  VRAnchorLayer.prototype.updatePosition = function(layer) {
    var halfCubSide;
    halfCubSide = this.cubeSide / 2;
    return this.style["webkitTransform"] = "translateX(" + ((this.cubeSide - this.width) / 2) + "px) translateY(" + ((this.cubeSide - this.height) / 2) + "px) rotateZ(" + layer.heading + "deg) rotateX(" + (90 - layer.elevation) + "deg) translateZ(" + layer.distance + "px) rotateX(180deg)";
  };

  return VRAnchorLayer;

})(Layer);

exports.VRLayer = (function(superClass) {
  extend(VRLayer, superClass);

  function VRLayer(options) {
    if (options == null) {
      options = {};
    }
    options = _.defaults(options, {
      heading: 0,
      elevation: 0
    });
    VRLayer.__super__.constructor.call(this, options);
  }

  VRLayer.define("heading", {
    get: function() {
      return this._heading;
    },
    set: function(value) {
      var rest;
      if (value >= 360) {
        value = value % 360;
      } else if (value < 0) {
        rest = Math.abs(value) % 360;
        value = 360 - rest;
      }
      if (this._heading !== value) {
        this._heading = value;
        this.emit("change:heading", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  VRLayer.define("elevation", {
    get: function() {
      return this._elevation;
    },
    set: function(value) {
      value = Utils.clamp(value, -90, 90);
      if (value !== this._elevation) {
        this._elevation = value;
        this.emit("change:elevation", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  VRLayer.define("distance", {
    get: function() {
      return this._distance;
    },
    set: function(value) {
      if (value !== this._distance) {
        this._distance = value;
        this.emit("change:distance", value);
        return this.emit("change:orientation", value);
      }
    }
  });

  return VRLayer;

})(Layer);

exports.VRComponent = (function(superClass) {
  extend(VRComponent, superClass);

  function VRComponent(options) {
    if (options == null) {
      options = {};
    }
    this.addDesktopPanLayer = bind(this.addDesktopPanLayer, this);
    this.removeDesktopPanLayer = bind(this.removeDesktopPanLayer, this);
    this.deviceOrientationUpdate = bind(this.deviceOrientationUpdate, this);
    this.createCube = bind(this.createCube, this);
    options = _.defaults(options, {
      cubeSide: 3000,
      perspective: 1200,
      lookAtLatestProjectedLayer: false,
      width: Screen.width,
      height: Screen.height,
      orientationLayer: true,
      arrowKeys: true
    });
    VRComponent.__super__.constructor.call(this, options);
    this.perspective = options.perspective;
    this.backgroundColor = null;
    this.createCube(options.cubeSide);
    this.degToRad = Math.PI / 180;
    this.layersToKeepLevel = [];
    this.lookAtLatestProjectedLayer = options.lookAtLatestProjectedLayer;
    this.arrowKeys = options.arrowKeys;
    this._keys();
    this._heading = 0;
    this._elevation = 0;
    this._tilt = 0;
    this._headingOffset = 0;
    this._elevationOffset = 0;
    this._deviceHeading = 0;
    this._deviceElevation = 0;
    if (options.heading) {
      this.heading = options.heading;
    }
    if (options.elevation) {
      this.elevation = options.elevation;
    }
    this.orientationLayer = options.orientationLayer;
    this.desktopPan(0, 0);
    if (Utils.isMobile()) {
      window.addEventListener("deviceorientation", (function(_this) {
        return function(event) {
          return _this.orientationData = event;
        };
      })(this));
    }
    Framer.Loop.on("update", this.deviceOrientationUpdate);
    Framer.CurrentContext.on("reset", function() {
      return Framer.Loop.off("update", this.deviceOrientationUpdate);
    });
    this.on("change:frame", function() {
      return this.desktopPan(0, 0);
    });
  }

  VRComponent.prototype._keys = function() {
    document.addEventListener("keydown", (function(_this) {
      return function(event) {
        if (_this.arrowKeys) {
          switch (event.which) {
            case KEYS.UpArrow:
              KEYSDOWN.up = true;
              return event.preventDefault();
            case KEYS.DownArrow:
              KEYSDOWN.down = true;
              return event.preventDefault();
            case KEYS.LeftArrow:
              KEYSDOWN.left = true;
              return event.preventDefault();
            case KEYS.RightArrow:
              KEYSDOWN.right = true;
              return event.preventDefault();
          }
        }
      };
    })(this));
    document.addEventListener("keyup", (function(_this) {
      return function(event) {
        if (_this.arrowKeys) {
          switch (event.which) {
            case KEYS.UpArrow:
              KEYSDOWN.up = false;
              return event.preventDefault();
            case KEYS.DownArrow:
              KEYSDOWN.down = false;
              return event.preventDefault();
            case KEYS.LeftArrow:
              KEYSDOWN.left = false;
              return event.preventDefault();
            case KEYS.RightArrow:
              KEYSDOWN.right = false;
              return event.preventDefault();
          }
        }
      };
    })(this));
    return window.onblur = function() {
      KEYSDOWN.up = false;
      KEYSDOWN.down = false;
      KEYSDOWN.left = false;
      return KEYSDOWN.right = false;
    };
  };

  VRComponent.define("orientationLayer", {
    get: function() {
      return this.desktopOrientationLayer !== null && this.desktopOrientationLayer !== void 0;
    },
    set: function(value) {
      if (this.world !== void 0) {
        if (Utils.isDesktop()) {
          if (value === true) {
            return this.addDesktopPanLayer();
          } else if (value === false) {
            return this.removeDesktopPanLayer();
          }
        }
      }
    }
  });

  VRComponent.define("heading", {
    get: function() {
      var heading, rest;
      heading = this._heading + this._headingOffset;
      if (heading > 360) {
        heading = heading % 360;
      } else if (heading < 0) {
        rest = Math.abs(heading) % 360;
        heading = 360 - rest;
      }
      return heading;
    },
    set: function(value) {
      return this.lookAt(value, this._elevation);
    }
  });

  VRComponent.define("elevation", {
    get: function() {
      return this._elevation;
    },
    set: function(value) {
      return this.lookAt(this._heading, value);
    }
  });

  VRComponent.define("tilt", {
    get: function() {
      return this._tilt;
    },
    set: function(value) {
      throw "Tilt is readonly";
    }
  });

  SIDES.map(function(face) {
    return VRComponent.define(face, {
      get: function() {
        return this.layerFromFace(face);
      },
      set: function(value) {
        return this.setImage(face, value);
      }
    });
  });

  VRComponent.prototype.createCube = function(cubeSide) {
    var colors, halfCubSide, i, index, key, len, ref, ref1, results, side, sideNames;
    if (cubeSide == null) {
      cubeSide = this.cubeSide;
    }
    this.cubeSide = cubeSide;
    if ((ref = this.world) != null) {
      ref.destroy();
    }
    this.world = new Layer({
      name: "world",
      superLayer: this,
      width: cubeSide,
      height: cubeSide,
      backgroundColor: null,
      clip: false
    });
    this.world.style.webkitTransformStyle = "preserve-3d";
    this.world.center();
    halfCubSide = this.cubeSide / 2;
    this.side0 = new Layer;
    this.side0.style["webkitTransform"] = "rotateX(-90deg) translateZ(-" + halfCubSide + "px)";
    this.side1 = new Layer;
    this.side1.style["webkitTransform"] = "rotateY(-90deg) translateZ(-" + halfCubSide + "px) rotateZ(90deg)";
    this.side2 = new Layer;
    this.side2.style["webkitTransform"] = "rotateX(90deg) translateZ(-" + halfCubSide + "px) rotateZ(180deg)";
    this.side3 = new Layer;
    this.side3.style["webkitTransform"] = "rotateY(90deg) translateZ(-" + halfCubSide + "px) rotateZ(-90deg)";
    this.side4 = new Layer;
    this.side4.style["webkitTransform"] = "rotateY(-180deg) translateZ(-" + halfCubSide + "px) rotateZ(180deg)";
    this.side5 = new Layer;
    this.side5.style["webkitTransform"] = "translateZ(-" + halfCubSide + "px)";
    this.sides = [this.side0, this.side1, this.side2, this.side3, this.side4, this.side5];
    colors = ["#866ccc", "#28affa", "#2dd7aa", "#ffc22c", "#7ddd11", "#f95faa"];
    sideNames = ["front", "right", "back", "left", "top", "bottom"];
    index = 0;
    ref1 = this.sides;
    for (i = 0, len = ref1.length; i < len; i++) {
      side = ref1[i];
      side.name = sideNames[index];
      side.width = side.height = cubeSide;
      side.superLayer = this.world;
      side.html = sideNames[index];
      side.color = "white";
      side._backgroundColor = colors[index];
      side.backgroundColor = colors[index];
      side.style = {
        lineHeight: cubeSide + "px",
        textAlign: "center",
        fontSize: (cubeSide / 10) + "px",
        fontWeight: "100",
        fontFamily: "Helvetica Neue"
      };
      index++;
    }
    if (this.sideImages) {
      results = [];
      for (key in this.sideImages) {
        results.push(this.setImage(key, this.sideImages[key]));
      }
      return results;
    }
  };

  VRComponent.prototype.hideEnviroment = function() {
    var i, len, ref, results, side;
    ref = this.sides;
    results = [];
    for (i = 0, len = ref.length; i < len; i++) {
      side = ref[i];
      results.push(side.destroy());
    }
    return results;
  };

  VRComponent.prototype.layerFromFace = function(face) {
    var map;
    map = {
      north: this.side0,
      front: this.side0,
      east: this.side1,
      right: this.side1,
      south: this.side2,
      back: this.side2,
      west: this.side3,
      left: this.side3,
      top: this.side4,
      bottom: this.side5
    };
    return map[face];
  };

  VRComponent.prototype.setImage = function(face, imagePath) {
    var layer, ref;
    if (ref = !face, indexOf.call(SIDES, ref) >= 0) {
      throw Error("VRComponent setImage, wrong name for face: " + face + ", valid options: front, right, back, left, top, bottom, north, east, south, west");
    }
    if (!this.sideImages) {
      this.sideImages = {};
    }
    this.sideImages[face] = imagePath;
    layer = this.layerFromFace(face);
    if (imagePath) {
      if (layer != null) {
        layer.html = "";
      }
      return layer != null ? layer.image = imagePath : void 0;
    } else {
      if (layer != null) {
        layer.html = layer != null ? layer.name : void 0;
      }
      return layer != null ? layer.backgroundColor = layer != null ? layer._backgroundColor : void 0 : void 0;
    }
  };

  VRComponent.prototype.getImage = function(face) {
    var layer, ref;
    if (ref = !face, indexOf.call(SIDES, ref) >= 0) {
      throw Error("VRComponent getImage, wrong name for face: " + face + ", valid options: front, right, back, left, top, bottom, north, east, south, west");
    }
    layer = this.layerFromFace(face);
    if (layer) {
      return layer.image;
    }
  };

  VRComponent.prototype.projectLayer = function(insertLayer) {
    var anchor, distance, elevation, heading, rest;
    heading = insertLayer.heading;
    if (heading === void 0) {
      heading = 0;
    }
    elevation = insertLayer.elevation;
    if (elevation === void 0) {
      elevation = 0;
    }
    if (heading >= 360) {
      heading = value % 360;
    } else if (heading < 0) {
      rest = Math.abs(heading) % 360;
      heading = 360 - rest;
    }
    elevation = Utils.clamp(elevation, -90, 90);
    distance = insertLayer.distance;
    if (distance === void 0) {
      distance = 1200;
    }
    insertLayer.heading = heading;
    insertLayer.elevation = elevation;
    insertLayer.distance = distance;
    anchor = new VRAnchorLayer(insertLayer, this.cubeSide);
    anchor.superLayer = this.world;
    if (this.lookAtLatestProjectedLayer) {
      return this.lookAt(heading, elevation);
    }
  };

  VRComponent.prototype.deviceOrientationUpdate = function() {
    var alpha, beta, date, diff, gamma, halfCubSide, orientation, rotation, translationX, translationY, translationZ, x, xAngle, yAngle, zAngle;
    if (Utils.isDesktop()) {
      if (this.arrowKeys) {
        if (this._lastCallHorizontal === void 0) {
          this._lastCallHorizontal = 0;
          this._lastCallVertical = 0;
          this._accelerationHorizontal = 1;
          this._accelerationVertical = 1;
          this._goingUp = false;
          this._goingLeft = false;
        }
        date = new Date();
        x = .1;
        if (KEYSDOWN.up || KEYSDOWN.down) {
          diff = date - this._lastCallVertical;
          if (diff < 30) {
            if (this._accelerationVertical < 30) {
              this._accelerationVertical += 0.18;
            }
          }
          if (KEYSDOWN.up) {
            if (this._goingUp === false) {
              this._accelerationVertical = 1;
              this._goingUp = true;
            }
            this.desktopPan(0, 1 * this._accelerationVertical * x);
          } else {
            if (this._goingUp === true) {
              this._accelerationVertical = 1;
              this._goingUp = false;
            }
            this.desktopPan(0, -1 * this._accelerationVertical * x);
          }
          this._lastCallVertical = date;
        } else {
          this._accelerationVertical = 1;
        }
        if (KEYSDOWN.left || KEYSDOWN.right) {
          diff = date - this._lastCallHorizontal;
          if (diff < 30) {
            if (this._accelerationHorizontal < 25) {
              this._accelerationHorizontal += 0.18;
            }
          }
          if (KEYSDOWN.left) {
            if (this._goingLeft === false) {
              this._accelerationHorizontal = 1;
              this._goingLeft = true;
            }
            this.desktopPan(1 * this._accelerationHorizontal * x, 0);
          } else {
            if (this._goingLeft === true) {
              this._accelerationHorizontal = 1;
              this._goingLeft = false;
            }
            this.desktopPan(-1 * this._accelerationHorizontal * x, 0);
          }
          return this._lastCallHorizontal = date;
        } else {
          return this._accelerationHorizontal = 1;
        }
      }
    } else if (this.orientationData) {
      alpha = this.orientationData.alpha;
      beta = this.orientationData.beta;
      gamma = this.orientationData.gamma;
      if (alpha !== 0 && beta !== 0 && gamma !== 0) {
        this.directionParams(alpha, beta, gamma);
      }
      xAngle = beta;
      yAngle = -gamma;
      zAngle = alpha;
      halfCubSide = this.cubeSide / 2;
      orientation = "rotate(" + (window.orientation * -1) + "deg) ";
      translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
      translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
      translationZ = " translateZ(" + this.perspective + "px)";
      rotation = translationZ + translationX + translationY + orientation + (" rotateY(" + yAngle + "deg) rotateX(" + xAngle + "deg) rotateZ(" + zAngle + "deg)") + (" rotateZ(" + (-this._headingOffset) + "deg)");
      return this.world.style["webkitTransform"] = rotation;
    }
  };

  VRComponent.prototype.directionParams = function(alpha, beta, gamma) {
    var alphaRad, betaRad, cA, cB, cG, cH, diff, elevation, gammaRad, heading, orientationTiltOffset, sA, sB, sG, tilt, xrA, xrB, xrC, yrA, yrB, yrC, zrA, zrB, zrC;
    alphaRad = alpha * this.degToRad;
    betaRad = beta * this.degToRad;
    gammaRad = gamma * this.degToRad;
    cA = Math.cos(alphaRad);
    sA = Math.sin(alphaRad);
    cB = Math.cos(betaRad);
    sB = Math.sin(betaRad);
    cG = Math.cos(gammaRad);
    sG = Math.sin(gammaRad);
    xrA = -sA * sB * sG + cA * cG;
    xrB = cA * sB * sG + sA * cG;
    xrC = cB * sG;
    yrA = -sA * cB;
    yrB = cA * cB;
    yrC = -sB;
    zrA = -sA * sB * cG - cA * sG;
    zrB = cA * sB * cG - sA * sG;
    zrC = cB * cG;
    heading = Math.atan(zrA / zrB);
    if (zrB < 0) {
      heading += Math.PI;
    } else if (zrA < 0) {
      heading += 2 * Math.PI;
    }
    elevation = Math.PI / 2 - Math.acos(-zrC);
    cH = Math.sqrt(1 - (zrC * zrC));
    tilt = Math.acos(-xrC / cH) * Math.sign(yrC);
    heading *= 180 / Math.PI;
    elevation *= 180 / Math.PI;
    tilt *= 180 / Math.PI;
    this._heading = Math.round(heading * 1000) / 1000;
    this._elevation = Math.round(elevation * 1000) / 1000;
    tilt = Math.round(tilt * 1000) / 1000;
    orientationTiltOffset = (window.orientation * -1) + 90;
    tilt += orientationTiltOffset;
    if (tilt > 180) {
      diff = tilt - 180;
      tilt = -180 + diff;
    }
    this._tilt = tilt;
    this._deviceHeading = this._heading;
    this._deviceElevation = this._elevation;
    return this._emitOrientationDidChangeEvent();
  };

  VRComponent.prototype.removeDesktopPanLayer = function() {
    var ref;
    return (ref = this.desktopOrientationLayer) != null ? ref.destroy() : void 0;
  };

  VRComponent.prototype.addDesktopPanLayer = function() {
    var ref;
    if ((ref = this.desktopOrientationLayer) != null) {
      ref.destroy();
    }
    this.desktopOrientationLayer = new Layer({
      width: 100000,
      height: 10000,
      backgroundColor: null,
      superLayer: this,
      name: "desktopOrientationLayer"
    });
    this.desktopOrientationLayer.center();
    this.desktopOrientationLayer.draggable.enabled = true;
    this.prevDesktopDir = this.desktopOrientationLayer.x;
    this.prevDesktopHeight = this.desktopOrientationLayer.y;
    this.desktopOrientationLayer.on(Events.DragStart, (function(_this) {
      return function() {
        _this.prevDesktopDir = _this.desktopOrientationLayer.x;
        _this.prevDesktopHeight = _this.desktopOrientationLayer.y;
        return _this.desktopDraggableActive = true;
      };
    })(this));
    this.desktopOrientationLayer.on(Events.Move, (function(_this) {
      return function() {
        var deltaDir, deltaHeight, strength;
        if (_this.desktopDraggableActive) {
          strength = Utils.modulate(_this.perspective, [1200, 900], [22, 17.5]);
          deltaDir = (_this.desktopOrientationLayer.x - _this.prevDesktopDir) / strength;
          deltaHeight = (_this.desktopOrientationLayer.y - _this.prevDesktopHeight) / strength;
          _this.desktopPan(deltaDir, deltaHeight);
          _this.prevDesktopDir = _this.desktopOrientationLayer.x;
          return _this.prevDesktopHeight = _this.desktopOrientationLayer.y;
        }
      };
    })(this));
    return this.desktopOrientationLayer.on(Events.AnimationEnd, (function(_this) {
      return function() {
        var ref1;
        _this.desktopDraggableActive = false;
        return (ref1 = _this.desktopOrientationLayer) != null ? ref1.center() : void 0;
      };
    })(this));
  };

  VRComponent.prototype.desktopPan = function(deltaDir, deltaHeight) {
    var halfCubSide, rotation, translationX, translationY, translationZ;
    halfCubSide = this.cubeSide / 2;
    translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
    translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
    translationZ = " translateZ(" + this.perspective + "px)";
    this._heading -= deltaDir;
    if (this._heading > 360) {
      this._heading -= 360;
    } else if (this._heading < 0) {
      this._heading += 360;
    }
    this._elevation += deltaHeight;
    this._elevation = Utils.clamp(this._elevation, -90, 90);
    rotation = translationZ + translationX + translationY + (" rotateX(" + (this._elevation + 90) + "deg) rotateZ(" + (360 - this._heading) + "deg)") + (" rotateZ(" + (-this._headingOffset) + "deg)");
    this.world.style["webkitTransform"] = rotation;
    this._heading = Math.round(this._heading * 1000) / 1000;
    this._tilt = 0;
    return this._emitOrientationDidChangeEvent();
  };

  VRComponent.prototype.lookAt = function(heading, elevation) {
    var halfCubSide, ref, rotation, translationX, translationY, translationZ;
    halfCubSide = this.cubeSide / 2;
    translationX = "translateX(" + ((this.width / 2) - halfCubSide) + "px)";
    translationY = " translateY(" + ((this.height / 2) - halfCubSide) + "px)";
    translationZ = " translateZ(" + this.perspective + "px)";
    rotation = translationZ + translationX + translationY + (" rotateZ(" + this._tilt + "deg) rotateX(" + (elevation + 90) + "deg) rotateZ(" + (-heading) + "deg)");
    if ((ref = this.world) != null) {
      ref.style["webkitTransform"] = rotation;
    }
    this._heading = heading;
    this._elevation = elevation;
    if (Utils.isMobile()) {
      this._headingOffset = this._heading - this._deviceHeading;
    }
    this._elevationOffset = this._elevation - this._deviceElevation;
    heading = this._heading;
    if (heading < 0) {
      heading += 360;
    } else if (heading > 360) {
      heading -= 360;
    }
    return this.emit(Events.OrientationDidChange, {
      heading: heading,
      elevation: this._elevation,
      tilt: this._tilt
    });
  };

  VRComponent.prototype._emitOrientationDidChangeEvent = function() {
    return this.emit(Events.OrientationDidChange, {
      heading: this.heading,
      elevation: this._elevation,
      tilt: this._tilt
    });
  };

  return VRComponent;

})(Layer);


},{}],"audio":[function(require,module,exports){
var bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty;

exports.AudioPlayer = (function(superClass) {
  extend(AudioPlayer, superClass);

  function AudioPlayer(options) {
    if (options == null) {
      options = {};
    }
    this.getTimeLeft = bind(this.getTimeLeft, this);
    if (options.backgroundColor == null) {
      options.backgroundColor = "transparent";
    }
    this.player = document.createElement("audio");
    this.player.setAttribute("webkit-playsinline", "true");
    this.player.setAttribute("preload", "auto");
    this.player.style.width = "100%";
    this.player.style.height = "100%";
    this.player.on = this.player.addEventListener;
    this.player.off = this.player.removeEventListener;
    AudioPlayer.__super__.constructor.call(this, options);
    this.controls = new Layer({
      backgroundColor: "transparent",
      width: 80,
      height: 80,
      superLayer: this,
      name: "controls"
    });
    this.controls.showPlay = function() {
      return this.image = "images/play.png";
    };
    this.controls.showPause = function() {
      return this.image = "images/pause.png";
    };
    this.controls.showPlay();
    this.controls.center();
    this.timeStyle = {
      "font-size": "20px",
      "color": "#000"
    };
    this.on(Events.Click, function() {
      var currentTime, duration;
      currentTime = Math.round(this.player.currentTime);
      duration = Math.round(this.player.duration);
      if (this.player.paused) {
        this.player.play();
        this.controls.showPause();
        if (currentTime === duration) {
          this.player.currentTime = 0;
          return this.player.play();
        }
      } else {
        this.player.pause();
        return this.controls.showPlay();
      }
    });
    this.player.onplaying = (function(_this) {
      return function() {
        return _this.controls.showPause();
      };
    })(this);
    this.player.onended = (function(_this) {
      return function() {
        return _this.controls.showPlay();
      };
    })(this);
    this.player.formatTime = function() {
      var min, sec;
      sec = Math.floor(this.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : '0' + sec;
      return min + ":" + sec;
    };
    this.player.formatTimeLeft = function() {
      var min, sec;
      sec = Math.floor(this.duration) - Math.floor(this.currentTime);
      min = Math.floor(sec / 60);
      sec = Math.floor(sec % 60);
      sec = sec >= 10 ? sec : '0' + sec;
      return min + ":" + sec;
    };
    this.audio = options.audio;
    this._element.appendChild(this.player);
  }

  AudioPlayer.define("audio", {
    get: function() {
      return this.player.src;
    },
    set: function(audio) {
      this.player.src = audio;
      if (this.player.canPlayType("audio/mp3") === "") {
        throw Error("No supported audio file included.");
      }
    }
  });

  AudioPlayer.define("showProgress", {
    get: function() {
      return this._showProgress;
    },
    set: function(showProgress) {
      return this.setProgress(showProgress, false);
    }
  });

  AudioPlayer.define("showVolume", {
    get: function() {
      return this._showVolume;
    },
    set: function(showVolume) {
      return this.setVolume(showVolume, false);
    }
  });

  AudioPlayer.define("showTime", {
    get: function() {
      return this._showTime;
    },
    set: function(showTime) {
      return this.getTime(showTime, false);
    }
  });

  AudioPlayer.define("showTimeLeft", {
    get: function() {
      return this._showTimeLeft;
    },
    set: function(showTimeLeft) {
      return this.getTimeLeft(showTimeLeft, false);
    }
  });

  AudioPlayer.prototype._checkBoolean = function(property) {
    var ref, ref1;
    if (_.isString(property)) {
      if ((ref = property.toLowerCase()) === "1" || ref === "true") {
        property = true;
      } else if ((ref1 = property.toLowerCase()) === "0" || ref1 === "false") {
        property = false;
      } else {
        return;
      }
    }
    if (!_.isBoolean(property)) {

    }
  };

  AudioPlayer.prototype.getTime = function(showTime) {
    this._checkBoolean(showTime);
    this._showTime = showTime;
    if (showTime === true) {
      this.time = new Layer({
        backgroundColor: "transparent",
        name: "currentTime"
      });
      this.time.style = this.timeStyle;
      this.time.html = "0:00";
      return this.player.ontimeupdate = (function(_this) {
        return function() {
          return _this.time.html = _this.player.formatTime();
        };
      })(this);
    }
  };

  AudioPlayer.prototype.getTimeLeft = function(showTimeLeft) {
    this._checkBoolean(showTimeLeft);
    this._showTimeLeft = showTimeLeft;
    if (showTimeLeft === true) {
      this.timeLeft = new Layer({
        backgroundColor: "transparent",
        name: "timeLeft"
      });
      this.timeLeft.style = this.timeStyle;
      this.timeLeft.html = "-0:00";
      this.player.on("loadedmetadata", (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
        };
      })(this));
      return this.player.ontimeupdate = (function(_this) {
        return function() {
          return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
        };
      })(this);
    }
  };

  AudioPlayer.prototype.setProgress = function(showProgress) {
    var isMoving, wasPlaying;
    this._checkBoolean(showProgress);
    this._showProgress = showProgress;
    if (this._showProgress === true) {
      this.progressBar = new SliderComponent({
        width: 200,
        height: 6,
        backgroundColor: "#eee",
        knobSize: 20,
        value: 0,
        min: 0
      });
      this.player.oncanplay = (function(_this) {
        return function() {
          return _this.progressBar.max = Math.round(_this.player.duration);
        };
      })(this);
      this.progressBar.knob.draggable.momentum = false;
      wasPlaying = isMoving = false;
      if (!this.player.paused) {
        wasPlaying = true;
      }
      this.progressBar.on("change:value", (function(_this) {
        return function() {
          _this.player.currentTime = _this.progressBar.value;
          if (_this.time && _this.timeLeft) {
            _this.time.html = _this.player.formatTime();
            return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
          }
        };
      })(this));
      this.progressBar.knob.on(Events.DragMove, (function(_this) {
        return function() {
          return isMoving = true;
        };
      })(this));
      this.progressBar.knob.on(Events.DragEnd, (function(_this) {
        return function(event) {
          var currentTime, duration;
          currentTime = Math.round(_this.player.currentTime);
          duration = Math.round(_this.player.duration);
          if (wasPlaying && currentTime !== duration) {
            _this.player.play();
            _this.controls.showPause();
          }
          if (currentTime === duration) {
            _this.player.pause();
            _this.controls.showPlay();
          }
          return isMoving = false;
        };
      })(this));
      return this.player.ontimeupdate = (function(_this) {
        return function() {
          if (!isMoving) {
            _this.progressBar.knob.midX = _this.progressBar.pointForValue(_this.player.currentTime);
            _this.progressBar.knob.draggable.isMoving = false;
          }
          if (_this.time && _this.timeLeft) {
            _this.time.html = _this.player.formatTime();
            return _this.timeLeft.html = "-" + _this.player.formatTimeLeft();
          }
        };
      })(this);
    }
  };

  AudioPlayer.prototype.setVolume = function(showVolume) {
    var base;
    this._checkBoolean(showVolume);
    if ((base = this.player).volume == null) {
      base.volume = 0.75;
    }
    this.volumeBar = new SliderComponent({
      width: 200,
      height: 6,
      backgroundColor: "#eee",
      knobSize: 20,
      min: 0,
      max: 1,
      value: this.player.volume
    });
    this.volumeBar.knob.draggable.momentum = false;
    this.volumeBar.on("change:width", (function(_this) {
      return function() {
        return _this.volumeBar.value = _this.player.volume;
      };
    })(this));
    return this.volumeBar.on("change:value", (function(_this) {
      return function() {
        return _this.player.volume = _this.volumeBar.value;
      };
    })(this));
  };

  return AudioPlayer;

})(Layer);


},{}]},{},[])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnJhbWVyLm1vZHVsZXMuanMiLCJzb3VyY2VzIjpbIi4uL21vZHVsZXMvYXVkaW8uY29mZmVlIiwiLi4vbW9kdWxlcy9WUkNvbXBvbmVudC5jb2ZmZWUiLCJub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImNsYXNzIGV4cG9ydHMuQXVkaW9QbGF5ZXIgZXh0ZW5kcyBMYXllclxuXG5cdGNvbnN0cnVjdG9yOiAob3B0aW9ucz17fSkgLT5cblx0XHRvcHRpb25zLmJhY2tncm91bmRDb2xvciA/PSBcInRyYW5zcGFyZW50XCJcblxuXHRcdCMgRGVmaW5lIHBsYXllclxuXHRcdEBwbGF5ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYXVkaW9cIilcblx0XHRAcGxheWVyLnNldEF0dHJpYnV0ZShcIndlYmtpdC1wbGF5c2lubGluZVwiLCBcInRydWVcIilcblx0XHRAcGxheWVyLnNldEF0dHJpYnV0ZShcInByZWxvYWRcIiwgXCJhdXRvXCIpXG5cdFx0QHBsYXllci5zdHlsZS53aWR0aCA9IFwiMTAwJVwiXG5cdFx0QHBsYXllci5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIlxuXG5cdFx0QHBsYXllci5vbiA9IEBwbGF5ZXIuYWRkRXZlbnRMaXN0ZW5lclxuXHRcdEBwbGF5ZXIub2ZmID0gQHBsYXllci5yZW1vdmVFdmVudExpc3RlbmVyXG5cblx0XHRzdXBlciBvcHRpb25zXG5cblx0XHQjIERlZmluZSBiYXNpYyBjb250cm9sc1xuXHRcdEBjb250cm9scyA9IG5ldyBMYXllclxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdHdpZHRoOiA4MCwgaGVpZ2h0OiA4MCwgc3VwZXJMYXllcjogQFxuXHRcdFx0bmFtZTogXCJjb250cm9sc1wiXG5cblx0XHRAY29udHJvbHMuc2hvd1BsYXkgPSAtPiBAaW1hZ2UgPSBcImltYWdlcy9wbGF5LnBuZ1wiXG5cdFx0QGNvbnRyb2xzLnNob3dQYXVzZSA9IC0+IEBpbWFnZSA9IFwiaW1hZ2VzL3BhdXNlLnBuZ1wiXG5cdFx0QGNvbnRyb2xzLnNob3dQbGF5KClcblx0XHRAY29udHJvbHMuY2VudGVyKClcblxuXHRcdEB0aW1lU3R5bGUgPSB7IFwiZm9udC1zaXplXCI6IFwiMjBweFwiLCBcImNvbG9yXCI6IFwiIzAwMFwiIH1cblxuXHRcdCMgT24gY2xpY2tcblx0XHRAb24gRXZlbnRzLkNsaWNrLCAtPlxuXHRcdFx0Y3VycmVudFRpbWUgPSBNYXRoLnJvdW5kKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRkdXJhdGlvbiA9IE1hdGgucm91bmQoQHBsYXllci5kdXJhdGlvbilcblxuXHRcdFx0aWYgQHBsYXllci5wYXVzZWRcblx0XHRcdFx0QHBsYXllci5wbGF5KClcblx0XHRcdFx0QGNvbnRyb2xzLnNob3dQYXVzZSgpXG5cblx0XHRcdFx0aWYgY3VycmVudFRpbWUgaXMgZHVyYXRpb25cblx0XHRcdFx0XHRAcGxheWVyLmN1cnJlbnRUaW1lID0gMFxuXHRcdFx0XHRcdEBwbGF5ZXIucGxheSgpXG5cdFx0XHRlbHNlXG5cdFx0XHRcdEBwbGF5ZXIucGF1c2UoKVxuXHRcdFx0XHRAY29udHJvbHMuc2hvd1BsYXkoKVxuXG5cdFx0IyBPbiBlbmQsIHN3aXRjaCB0byBwbGF5IGJ1dHRvblxuXHRcdEBwbGF5ZXIub25wbGF5aW5nID0gPT4gQGNvbnRyb2xzLnNob3dQYXVzZSgpXG5cdFx0QHBsYXllci5vbmVuZGVkID0gPT4gQGNvbnRyb2xzLnNob3dQbGF5KClcblxuXHRcdCMgVXRpbHNcblx0XHRAcGxheWVyLmZvcm1hdFRpbWUgPSAtPlxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihAY3VycmVudFRpbWUpXG5cdFx0XHRtaW4gPSBNYXRoLmZsb29yKHNlYyAvIDYwKVxuXHRcdFx0c2VjID0gTWF0aC5mbG9vcihzZWMgJSA2MClcblx0XHRcdHNlYyA9IGlmIHNlYyA+PSAxMCB0aGVuIHNlYyBlbHNlICcwJyArIHNlY1xuXHRcdFx0cmV0dXJuIFwiI3ttaW59OiN7c2VjfVwiXG5cblx0XHRAcGxheWVyLmZvcm1hdFRpbWVMZWZ0ID0gLT5cblx0XHRcdHNlYyA9IE1hdGguZmxvb3IoQGR1cmF0aW9uKSAtIE1hdGguZmxvb3IoQGN1cnJlbnRUaW1lKVxuXHRcdFx0bWluID0gTWF0aC5mbG9vcihzZWMgLyA2MClcblx0XHRcdHNlYyA9IE1hdGguZmxvb3Ioc2VjICUgNjApXG5cdFx0XHRzZWMgPSBpZiBzZWMgPj0gMTAgdGhlbiBzZWMgZWxzZSAnMCcgKyBzZWNcblx0XHRcdHJldHVybiBcIiN7bWlufToje3NlY31cIlxuXG5cdFx0QGF1ZGlvID0gb3B0aW9ucy5hdWRpb1xuXHRcdEBfZWxlbWVudC5hcHBlbmRDaGlsZChAcGxheWVyKVxuXG5cdEBkZWZpbmUgXCJhdWRpb1wiLFxuXHRcdGdldDogLT4gQHBsYXllci5zcmNcblx0XHRzZXQ6IChhdWRpbykgLT5cblx0XHRcdEBwbGF5ZXIuc3JjID0gYXVkaW9cblx0XHRcdGlmIEBwbGF5ZXIuY2FuUGxheVR5cGUoXCJhdWRpby9tcDNcIikgPT0gXCJcIlxuXHRcdFx0XHR0aHJvdyBFcnJvciBcIk5vIHN1cHBvcnRlZCBhdWRpbyBmaWxlIGluY2x1ZGVkLlwiXG5cblx0QGRlZmluZSBcInNob3dQcm9ncmVzc1wiLFxuXHRcdGdldDogLT4gQF9zaG93UHJvZ3Jlc3Ncblx0XHRzZXQ6IChzaG93UHJvZ3Jlc3MpIC0+IEBzZXRQcm9ncmVzcyhzaG93UHJvZ3Jlc3MsIGZhbHNlKVxuXG5cdEBkZWZpbmUgXCJzaG93Vm9sdW1lXCIsXG5cdFx0Z2V0OiAtPiBAX3Nob3dWb2x1bWVcblx0XHRzZXQ6IChzaG93Vm9sdW1lKSAtPiBAc2V0Vm9sdW1lKHNob3dWb2x1bWUsIGZhbHNlKVxuXG5cdEBkZWZpbmUgXCJzaG93VGltZVwiLFxuXHRcdGdldDogLT4gQF9zaG93VGltZVxuXHRcdHNldDogKHNob3dUaW1lKSAtPiBAZ2V0VGltZShzaG93VGltZSwgZmFsc2UpXG5cblx0QGRlZmluZSBcInNob3dUaW1lTGVmdFwiLFxuXHRcdGdldDogLT4gQF9zaG93VGltZUxlZnRcblx0XHRzZXQ6IChzaG93VGltZUxlZnQpIC0+IEBnZXRUaW1lTGVmdChzaG93VGltZUxlZnQsIGZhbHNlKVxuXG5cdCMgQ2hlY2tzIGEgcHJvcGVydHksIHJldHVybnMgXCJ0cnVlXCIgb3IgXCJmYWxzZVwiXG5cdF9jaGVja0Jvb2xlYW46IChwcm9wZXJ0eSkgLT5cblx0XHRpZiBfLmlzU3RyaW5nKHByb3BlcnR5KVxuXHRcdFx0aWYgcHJvcGVydHkudG9Mb3dlckNhc2UoKSBpbiBbXCIxXCIsIFwidHJ1ZVwiXVxuXHRcdFx0XHRwcm9wZXJ0eSA9IHRydWVcblx0XHRcdGVsc2UgaWYgcHJvcGVydHkudG9Mb3dlckNhc2UoKSBpbiBbXCIwXCIsIFwiZmFsc2VcIl1cblx0XHRcdFx0cHJvcGVydHkgPSBmYWxzZVxuXHRcdFx0ZWxzZVxuXHRcdFx0XHRyZXR1cm5cblx0XHRpZiBub3QgXy5pc0Jvb2xlYW4ocHJvcGVydHkpIHRoZW4gcmV0dXJuXG5cblx0Z2V0VGltZTogKHNob3dUaW1lKSAtPlxuXHRcdEBfY2hlY2tCb29sZWFuKHNob3dUaW1lKVxuXHRcdEBfc2hvd1RpbWUgPSBzaG93VGltZVxuXG5cdFx0aWYgc2hvd1RpbWUgaXMgdHJ1ZVxuXHRcdFx0QHRpbWUgPSBuZXcgTGF5ZXJcblx0XHRcdFx0YmFja2dyb3VuZENvbG9yOiBcInRyYW5zcGFyZW50XCJcblx0XHRcdFx0bmFtZTogXCJjdXJyZW50VGltZVwiXG5cblx0XHRcdEB0aW1lLnN0eWxlID0gQHRpbWVTdHlsZVxuXHRcdFx0QHRpbWUuaHRtbCA9IFwiMDowMFwiXG5cblx0XHRcdEBwbGF5ZXIub250aW1ldXBkYXRlID0gPT5cblx0XHRcdFx0QHRpbWUuaHRtbCA9IEBwbGF5ZXIuZm9ybWF0VGltZSgpXG5cblx0Z2V0VGltZUxlZnQ6IChzaG93VGltZUxlZnQpID0+XG5cdFx0QF9jaGVja0Jvb2xlYW4oc2hvd1RpbWVMZWZ0KVxuXHRcdEBfc2hvd1RpbWVMZWZ0ID0gc2hvd1RpbWVMZWZ0XG5cblx0XHRpZiBzaG93VGltZUxlZnQgaXMgdHJ1ZVxuXHRcdFx0QHRpbWVMZWZ0ID0gbmV3IExheWVyXG5cdFx0XHRcdGJhY2tncm91bmRDb2xvcjogXCJ0cmFuc3BhcmVudFwiXG5cdFx0XHRcdG5hbWU6IFwidGltZUxlZnRcIlxuXG5cdFx0XHRAdGltZUxlZnQuc3R5bGUgPSBAdGltZVN0eWxlXG5cblx0XHRcdCMgU2V0IHRpbWVMZWZ0XG5cdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLTA6MDBcIlxuXHRcdFx0QHBsYXllci5vbiBcImxvYWRlZG1ldGFkYXRhXCIsID0+XG5cdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRcdFx0QHBsYXllci5vbnRpbWV1cGRhdGUgPSA9PlxuXHRcdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHBsYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0c2V0UHJvZ3Jlc3M6IChzaG93UHJvZ3Jlc3MpIC0+XG5cdFx0QF9jaGVja0Jvb2xlYW4oc2hvd1Byb2dyZXNzKVxuXG5cdFx0IyBTZXQgYXJndW1lbnQgKHNob3dQcm9ncmVzcyBpcyBlaXRoZXIgdHJ1ZSBvciBmYWxzZSlcblx0XHRAX3Nob3dQcm9ncmVzcyA9IHNob3dQcm9ncmVzc1xuXG5cdFx0aWYgQF9zaG93UHJvZ3Jlc3MgaXMgdHJ1ZVxuXG5cdFx0XHQjIENyZWF0ZSBQcm9ncmVzcyBCYXIgKyBEZWZhdWx0c1xuXHRcdFx0QHByb2dyZXNzQmFyID0gbmV3IFNsaWRlckNvbXBvbmVudFxuXHRcdFx0XHR3aWR0aDogMjAwLCBoZWlnaHQ6IDYsIGJhY2tncm91bmRDb2xvcjogXCIjZWVlXCJcblx0XHRcdFx0a25vYlNpemU6IDIwLCB2YWx1ZTogMCwgbWluOiAwXG5cblx0XHRcdEBwbGF5ZXIub25jYW5wbGF5ID0gPT4gQHByb2dyZXNzQmFyLm1heCA9IE1hdGgucm91bmQoQHBsYXllci5kdXJhdGlvbilcblx0XHRcdEBwcm9ncmVzc0Jhci5rbm9iLmRyYWdnYWJsZS5tb21lbnR1bSA9IGZhbHNlXG5cblx0XHRcdCMgQ2hlY2sgaWYgdGhlIHBsYXllciB3YXMgcGxheWluZ1xuXHRcdFx0d2FzUGxheWluZyA9IGlzTW92aW5nID0gZmFsc2Vcblx0XHRcdHVubGVzcyBAcGxheWVyLnBhdXNlZCB0aGVuIHdhc1BsYXlpbmcgPSB0cnVlXG5cblx0XHRcdEBwcm9ncmVzc0Jhci5vbiBcImNoYW5nZTp2YWx1ZVwiLCA9PlxuXHRcdFx0XHRAcGxheWVyLmN1cnJlbnRUaW1lID0gQHByb2dyZXNzQmFyLnZhbHVlXG5cblx0XHRcdFx0aWYgQHRpbWUgYW5kIEB0aW1lTGVmdFxuXHRcdFx0XHRcdEB0aW1lLmh0bWwgPSBAcGxheWVyLmZvcm1hdFRpbWUoKVxuXHRcdFx0XHRcdEB0aW1lTGVmdC5odG1sID0gXCItXCIgKyBAcGxheWVyLmZvcm1hdFRpbWVMZWZ0KClcblxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2Iub24gRXZlbnRzLkRyYWdNb3ZlLCA9PiBpc01vdmluZyA9IHRydWVcblxuXHRcdFx0QHByb2dyZXNzQmFyLmtub2Iub24gRXZlbnRzLkRyYWdFbmQsIChldmVudCkgPT5cblx0XHRcdFx0Y3VycmVudFRpbWUgPSBNYXRoLnJvdW5kKEBwbGF5ZXIuY3VycmVudFRpbWUpXG5cdFx0XHRcdGR1cmF0aW9uID0gTWF0aC5yb3VuZChAcGxheWVyLmR1cmF0aW9uKVxuXG5cdFx0XHRcdGlmIHdhc1BsYXlpbmcgYW5kIGN1cnJlbnRUaW1lIGlzbnQgZHVyYXRpb25cblx0XHRcdFx0XHRAcGxheWVyLnBsYXkoKVxuXHRcdFx0XHRcdEBjb250cm9scy5zaG93UGF1c2UoKVxuXG5cdFx0XHRcdGlmIGN1cnJlbnRUaW1lIGlzIGR1cmF0aW9uXG5cdFx0XHRcdFx0QHBsYXllci5wYXVzZSgpXG5cdFx0XHRcdFx0QGNvbnRyb2xzLnNob3dQbGF5KClcblxuXHRcdFx0XHRyZXR1cm4gaXNNb3ZpbmcgPSBmYWxzZVxuXG5cdFx0XHQjIFVwZGF0ZSBQcm9ncmVzc1xuXHRcdFx0QHBsYXllci5vbnRpbWV1cGRhdGUgPSA9PlxuXHRcdFx0XHR1bmxlc3MgaXNNb3Zpbmdcblx0XHRcdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5taWRYID0gQHByb2dyZXNzQmFyLnBvaW50Rm9yVmFsdWUoQHBsYXllci5jdXJyZW50VGltZSlcblx0XHRcdFx0XHRAcHJvZ3Jlc3NCYXIua25vYi5kcmFnZ2FibGUuaXNNb3ZpbmcgPSBmYWxzZVxuXG5cdFx0XHRcdGlmIEB0aW1lIGFuZCBAdGltZUxlZnRcblx0XHRcdFx0XHRAdGltZS5odG1sID0gQHBsYXllci5mb3JtYXRUaW1lKClcblx0XHRcdFx0XHRAdGltZUxlZnQuaHRtbCA9IFwiLVwiICsgQHBsYXllci5mb3JtYXRUaW1lTGVmdCgpXG5cblx0c2V0Vm9sdW1lOiAoc2hvd1ZvbHVtZSkgLT5cblx0XHRAX2NoZWNrQm9vbGVhbihzaG93Vm9sdW1lKVxuXG5cdFx0IyBTZXQgZGVmYXVsdCB0byA3NSVcblx0XHRAcGxheWVyLnZvbHVtZSA/PSAwLjc1XG5cblx0XHRAdm9sdW1lQmFyID0gbmV3IFNsaWRlckNvbXBvbmVudFxuXHRcdFx0d2lkdGg6IDIwMCwgaGVpZ2h0OiA2XG5cdFx0XHRiYWNrZ3JvdW5kQ29sb3I6IFwiI2VlZVwiXG5cdFx0XHRrbm9iU2l6ZTogMjBcblx0XHRcdG1pbjogMCwgbWF4OiAxXG5cdFx0XHR2YWx1ZTogQHBsYXllci52b2x1bWVcblxuXHRcdEB2b2x1bWVCYXIua25vYi5kcmFnZ2FibGUubW9tZW50dW0gPSBmYWxzZVxuXG5cdFx0QHZvbHVtZUJhci5vbiBcImNoYW5nZTp3aWR0aFwiLCA9PlxuXHRcdFx0QHZvbHVtZUJhci52YWx1ZSA9IEBwbGF5ZXIudm9sdW1lXG5cblx0XHRAdm9sdW1lQmFyLm9uIFwiY2hhbmdlOnZhbHVlXCIsID0+XG5cdFx0XHRAcGxheWVyLnZvbHVtZSA9IEB2b2x1bWVCYXIudmFsdWVcbiIsIlwiXCJcIlxuXG5WUkNvbXBvbmVudCBjbGFzc1xuXG5wcm9wZXJ0aWVzXG4tIGZyb250IChzZXQ6IGltYWdlUGF0aCA8c3RyaW5nPiwgZ2V0OiBsYXllcilcbi0gcmlnaHRcbi0gYmFja1xuLSBsZWZ0XG4tIHRvcFxuLSBib3R0b21cbi0gaGVhZGluZyA8bnVtYmVyPlxuLSBlbGV2YXRpb24gPG51bWJlcj5cbi0gdGlsdCA8bnVtYmVyPiByZWFkb25seVxuXG4tIG9yaWVudGF0aW9uTGF5ZXIgPGJvb2w+XG4tIGFycm93S2V5cyA8Ym9vbD5cbi0gbG9va0F0TGF0ZXN0UHJvamVjdGVkTGF5ZXIgPGJvb2w+XG5cbm1ldGhvZHNcbi0gcHJvamVjdExheWVyKGxheWVyKSAjIGhlYWRpbmcgYW5kIGVsZXZhdGlvbiBhcmUgc2V0IGFzIHByb3BlcnRpZXMgb24gdGhlIGxheWVyXG4tIGhpZGVFbnZpcm9tZW50KClcblxuZXZlbnRzXG4tIEV2ZW50cy5PcmllbnRhdGlvbkRpZENoYW5nZSwgKGRhdGEge2hlYWRpbmcsIGVsZXZhdGlvbiwgdGlsdH0pXG5cbi0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblZSTGF5ZXIgY2xhc3NcblxucHJvcGVydGllc1xuLSBoZWFkaW5nIDxudW1iZXI+IChmcm9tIDAgdXAgdG8gMzYwKVxuLSBlbGV2YXRpb24gPG51bWJlcj4gKGZyb20gLTkwIGRvd24gdG8gOTAgdXApXG5cblwiXCJcIlxuXG5TSURFUyA9IFtcblx0XCJub3J0aFwiLCBcblx0XCJmcm9udFwiLCBcblx0XCJlYXN0XCIsXG5cdFwicmlnaHRcIiwgXG5cdFwic291dGhcIiwgXG5cdFwiYmFja1wiLCBcblx0XCJ3ZXN0XCIsIFxuXHRcImxlZnRcIiwgXG5cdFwidG9wXCIsIFxuXHRcImJvdHRvbVwiLCBcbl1cblxuS0VZUyA9IHtcblx0TGVmdEFycm93OiAzN1xuXHRVcEFycm93OiAzOFxuXHRSaWdodEFycm93OiAzOVxuXHREb3duQXJyb3c6IDQwXG59XG5cbktFWVNET1dOID0ge1xuXHRsZWZ0OiBmYWxzZVxuXHR1cDogZmFsc2Vcblx0cmlnaHQ6IGZhbHNlXG5cdGRvd246IGZhbHNlXG59XG5cbkV2ZW50cy5PcmllbnRhdGlvbkRpZENoYW5nZSA9IFwib3JpZW50YXRpb25kaWRjaGFuZ2VcIlxuXG5jbGFzcyBWUkFuY2hvckxheWVyIGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKGxheWVyLCBjdWJlU2lkZSkgLT5cblx0XHRzdXBlciB1bmRlZmluZWRcblx0XHRAd2lkdGggPSAwXG5cdFx0QGhlaWdodCA9IDBcblx0XHRAY2xpcCA9IGZhbHNlXG5cdFx0QG5hbWUgPSBcImFuY2hvclwiXG5cdFx0QGN1YmVTaWRlID0gY3ViZVNpZGVcblxuXHRcdEBsYXllciA9IGxheWVyXG5cdFx0bGF5ZXIuc3VwZXJMYXllciA9IEBcblx0XHRsYXllci5jZW50ZXIoKVxuXG5cdFx0bGF5ZXIub24gXCJjaGFuZ2U6b3JpZW50YXRpb25cIiwgKG5ld1ZhbHVlLCBsYXllcikgPT5cblx0XHRcdEB1cGRhdGVQb3NpdGlvbihsYXllcilcblx0XHRAdXBkYXRlUG9zaXRpb24obGF5ZXIpXG5cblx0XHRsYXllci5fY29udGV4dC5vbiBcImxheWVyOmRlc3Ryb3lcIiwgKGxheWVyKSA9PlxuXHRcdFx0aWYgbGF5ZXIgPT0gQGxheWVyXG5cdFx0XHRcdEBkZXN0cm95KClcblxuXHR1cGRhdGVQb3NpdGlvbjogKGxheWVyKSAtPlxuXHRcdGhhbGZDdWJTaWRlID0gQGN1YmVTaWRlLzJcblx0XHRAc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInRyYW5zbGF0ZVgoI3soQGN1YmVTaWRlIC0gQHdpZHRoKS8yfXB4KSB0cmFuc2xhdGVZKCN7KEBjdWJlU2lkZSAtIEBoZWlnaHQpLzJ9cHgpIHJvdGF0ZVooI3tsYXllci5oZWFkaW5nfWRlZykgcm90YXRlWCgjezkwLWxheWVyLmVsZXZhdGlvbn1kZWcpIHRyYW5zbGF0ZVooI3tsYXllci5kaXN0YW5jZX1weCkgcm90YXRlWCgxODBkZWcpXCJcblxuY2xhc3MgZXhwb3J0cy5WUkxheWVyIGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblx0XHRvcHRpb25zID0gXy5kZWZhdWx0cyBvcHRpb25zLFxuXHRcdFx0aGVhZGluZzogMFxuXHRcdFx0ZWxldmF0aW9uOiAwXG5cdFx0c3VwZXIgb3B0aW9uc1xuXG5cdEBkZWZpbmUgXCJoZWFkaW5nXCIsXG5cdFx0Z2V0OiAtPiBAX2hlYWRpbmdcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdGlmIHZhbHVlID49IDM2MFxuXHRcdFx0XHR2YWx1ZSA9IHZhbHVlICUgMzYwXG5cdFx0XHRlbHNlIGlmIHZhbHVlIDwgMFxuXHRcdFx0XHRyZXN0ID0gTWF0aC5hYnModmFsdWUpICUgMzYwXG5cdFx0XHRcdHZhbHVlID0gMzYwIC0gcmVzdFxuXHRcdFx0aWYgQF9oZWFkaW5nICE9IHZhbHVlXG5cdFx0XHRcdEBfaGVhZGluZyA9IHZhbHVlXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOmhlYWRpbmdcIiwgdmFsdWUpXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOm9yaWVudGF0aW9uXCIsIHZhbHVlKVxuXG5cdEBkZWZpbmUgXCJlbGV2YXRpb25cIixcblx0XHRnZXQ6IC0+IEBfZWxldmF0aW9uXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHR2YWx1ZSA9IFV0aWxzLmNsYW1wKHZhbHVlLCAtOTAsIDkwKVxuXHRcdFx0aWYgdmFsdWUgIT0gQF9lbGV2YXRpb25cblx0XHRcdFx0QF9lbGV2YXRpb24gPSB2YWx1ZVxuXHRcdFx0XHRAZW1pdChcImNoYW5nZTplbGV2YXRpb25cIiwgdmFsdWUpXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOm9yaWVudGF0aW9uXCIsIHZhbHVlKVxuXG5cdEBkZWZpbmUgXCJkaXN0YW5jZVwiLFxuXHRcdGdldDogLT4gQF9kaXN0YW5jZVxuXHRcdHNldDogKHZhbHVlKSAtPlxuXHRcdFx0aWYgdmFsdWUgIT0gQF9kaXN0YW5jZVxuXHRcdFx0XHRAX2Rpc3RhbmNlID0gdmFsdWVcblx0XHRcdFx0QGVtaXQoXCJjaGFuZ2U6ZGlzdGFuY2VcIiwgdmFsdWUpXG5cdFx0XHRcdEBlbWl0KFwiY2hhbmdlOm9yaWVudGF0aW9uXCIsIHZhbHVlKVxuXG5jbGFzcyBleHBvcnRzLlZSQ29tcG9uZW50IGV4dGVuZHMgTGF5ZXJcblxuXHRjb25zdHJ1Y3RvcjogKG9wdGlvbnMgPSB7fSkgLT5cblx0XHRvcHRpb25zID0gXy5kZWZhdWx0cyBvcHRpb25zLFxuXHRcdFx0Y3ViZVNpZGU6IDMwMDBcblx0XHRcdHBlcnNwZWN0aXZlOiAxMjAwXG5cdFx0XHRsb29rQXRMYXRlc3RQcm9qZWN0ZWRMYXllcjogZmFsc2Vcblx0XHRcdHdpZHRoOiBTY3JlZW4ud2lkdGhcblx0XHRcdGhlaWdodDogU2NyZWVuLmhlaWdodFxuXHRcdFx0b3JpZW50YXRpb25MYXllcjogdHJ1ZVxuXHRcdFx0YXJyb3dLZXlzOiB0cnVlXG5cdFx0c3VwZXIgb3B0aW9uc1xuXHRcdEBwZXJzcGVjdGl2ZSA9IG9wdGlvbnMucGVyc3BlY3RpdmVcblx0XHRAYmFja2dyb3VuZENvbG9yID0gbnVsbFxuXHRcdEBjcmVhdGVDdWJlKG9wdGlvbnMuY3ViZVNpZGUpXG5cdFx0QGRlZ1RvUmFkID0gTWF0aC5QSSAvIDE4MFxuXHRcdEBsYXllcnNUb0tlZXBMZXZlbCA9IFtdXG5cdFx0QGxvb2tBdExhdGVzdFByb2plY3RlZExheWVyID0gb3B0aW9ucy5sb29rQXRMYXRlc3RQcm9qZWN0ZWRMYXllclxuXHRcdEBhcnJvd0tleXMgPSBvcHRpb25zLmFycm93S2V5c1xuXHRcdEBfa2V5cygpXG5cblx0XHRAX2hlYWRpbmcgPSAwXG5cdFx0QF9lbGV2YXRpb24gPSAwXG5cdFx0QF90aWx0ID0gMFxuXG5cdFx0QF9oZWFkaW5nT2Zmc2V0ID0gMFxuXHRcdEBfZWxldmF0aW9uT2Zmc2V0ID0gMFxuXHRcdEBfZGV2aWNlSGVhZGluZyA9IDBcblx0XHRAX2RldmljZUVsZXZhdGlvbiA9IDBcblxuXHRcdGlmIG9wdGlvbnMuaGVhZGluZ1xuXHRcdFx0QGhlYWRpbmcgPSBvcHRpb25zLmhlYWRpbmdcblx0XHRpZiBvcHRpb25zLmVsZXZhdGlvblxuXHRcdFx0QGVsZXZhdGlvbiA9IG9wdGlvbnMuZWxldmF0aW9uXG5cblx0XHRAb3JpZW50YXRpb25MYXllciA9IG9wdGlvbnMub3JpZW50YXRpb25MYXllclxuXG5cdFx0QGRlc2t0b3BQYW4oMCwgMClcblxuXHRcdCMgdGlsdGluZyBhbmQgcGFubmluZ1xuXHRcdGlmIFV0aWxzLmlzTW9iaWxlKClcblx0XHRcdHdpbmRvdy5hZGRFdmVudExpc3RlbmVyIFwiZGV2aWNlb3JpZW50YXRpb25cIiwgKGV2ZW50KSA9PlxuXHRcdFx0XHRAb3JpZW50YXRpb25EYXRhID0gZXZlbnRcblxuXHRcdEZyYW1lci5Mb29wLm9uKFwidXBkYXRlXCIsIEBkZXZpY2VPcmllbnRhdGlvblVwZGF0ZSlcblxuXHRcdCMgTWFrZSBzdXJlIHdlIHJlbW92ZSB0aGUgdXBkYXRlIGZyb20gdGhlIGxvb3Agd2hlbiB3ZSBkZXN0cm95IHRoZSBjb250ZXh0XG5cdFx0RnJhbWVyLkN1cnJlbnRDb250ZXh0Lm9uIFwicmVzZXRcIiwgLT5cblx0XHRcdEZyYW1lci5Mb29wLm9mZihcInVwZGF0ZVwiLCBAZGV2aWNlT3JpZW50YXRpb25VcGRhdGUpXG5cblx0XHRAb24gXCJjaGFuZ2U6ZnJhbWVcIiwgLT5cblx0XHRcdEBkZXNrdG9wUGFuKDAsMClcblxuXG5cdF9rZXlzOiAtPlxuXHRcdGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIgXCJrZXlkb3duXCIsIChldmVudCkgPT5cblx0XHRcdGlmIEBhcnJvd0tleXNcblx0XHRcdFx0c3dpdGNoIGV2ZW50LndoaWNoXG5cdFx0XHRcdFx0d2hlbiBLRVlTLlVwQXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLnVwID0gdHJ1ZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5Eb3duQXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLmRvd24gPSB0cnVlXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cdFx0XHRcdFx0d2hlbiBLRVlTLkxlZnRBcnJvd1xuXHRcdFx0XHRcdFx0S0VZU0RPV04ubGVmdCA9IHRydWVcblx0XHRcdFx0XHRcdGV2ZW50LnByZXZlbnREZWZhdWx0KClcblx0XHRcdFx0XHR3aGVuIEtFWVMuUmlnaHRBcnJvd1xuXHRcdFx0XHRcdFx0S0VZU0RPV04ucmlnaHQgPSB0cnVlXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHRkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyIFwia2V5dXBcIiwgKGV2ZW50KSA9PlxuXHRcdFx0aWYgQGFycm93S2V5c1xuXHRcdFx0XHRzd2l0Y2ggZXZlbnQud2hpY2hcblx0XHRcdFx0XHR3aGVuIEtFWVMuVXBBcnJvd1xuXHRcdFx0XHRcdFx0S0VZU0RPV04udXAgPSBmYWxzZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5Eb3duQXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLmRvd24gPSBmYWxzZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5MZWZ0QXJyb3dcblx0XHRcdFx0XHRcdEtFWVNET1dOLmxlZnQgPSBmYWxzZVxuXHRcdFx0XHRcdFx0ZXZlbnQucHJldmVudERlZmF1bHQoKVxuXHRcdFx0XHRcdHdoZW4gS0VZUy5SaWdodEFycm93XG5cdFx0XHRcdFx0XHRLRVlTRE9XTi5yaWdodCA9IGZhbHNlXG5cdFx0XHRcdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpXG5cblx0XHR3aW5kb3cub25ibHVyID0gLT5cblx0XHRcdEtFWVNET1dOLnVwID0gZmFsc2Vcblx0XHRcdEtFWVNET1dOLmRvd24gPSBmYWxzZVxuXHRcdFx0S0VZU0RPV04ubGVmdCA9IGZhbHNlXG5cdFx0XHRLRVlTRE9XTi5yaWdodCA9IGZhbHNlXG5cblx0QGRlZmluZSBcIm9yaWVudGF0aW9uTGF5ZXJcIixcblx0XHRnZXQ6IC0+IHJldHVybiBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIgIT0gbnVsbCAmJiBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIgIT0gdW5kZWZpbmVkXG5cdFx0c2V0OiAodmFsdWUpIC0+XG5cdFx0XHRpZiBAd29ybGQgIT0gdW5kZWZpbmVkXG5cdFx0XHRcdGlmIFV0aWxzLmlzRGVza3RvcCgpXG5cdFx0XHRcdFx0aWYgdmFsdWUgPT0gdHJ1ZVxuXHRcdFx0XHRcdFx0QGFkZERlc2t0b3BQYW5MYXllcigpXG5cdFx0XHRcdFx0ZWxzZSBpZiB2YWx1ZSA9PSBmYWxzZVxuXHRcdFx0XHRcdFx0QHJlbW92ZURlc2t0b3BQYW5MYXllcigpXG5cblx0QGRlZmluZSBcImhlYWRpbmdcIixcblx0XHRnZXQ6IC0+XG5cdFx0XHRoZWFkaW5nID0gQF9oZWFkaW5nICsgQF9oZWFkaW5nT2Zmc2V0XG5cdFx0XHRpZiBoZWFkaW5nID4gMzYwXG5cdFx0XHRcdGhlYWRpbmcgPSBoZWFkaW5nICUgMzYwXG5cdFx0XHRlbHNlIGlmIGhlYWRpbmcgPCAwXG5cdFx0XHRcdHJlc3QgPSBNYXRoLmFicyhoZWFkaW5nKSAlIDM2MFxuXHRcdFx0XHRoZWFkaW5nID0gMzYwIC0gcmVzdFxuXHRcdFx0cmV0dXJuIGhlYWRpbmdcblx0XHRzZXQ6ICh2YWx1ZSkgLT5cblx0XHRcdEBsb29rQXQodmFsdWUsIEBfZWxldmF0aW9uKVxuXG5cdEBkZWZpbmUgXCJlbGV2YXRpb25cIixcblx0XHRnZXQ6IC0+IEBfZWxldmF0aW9uXG5cdFx0c2V0OiAodmFsdWUpIC0+IEBsb29rQXQoQF9oZWFkaW5nLCB2YWx1ZSlcblxuXHRAZGVmaW5lIFwidGlsdFwiLFxuXHRcdGdldDogLT4gQF90aWx0XG5cdFx0c2V0OiAodmFsdWUpIC0+IHRocm93IFwiVGlsdCBpcyByZWFkb25seVwiXG5cblx0U0lERVMubWFwIChmYWNlKSA9PlxuXHRcdEBkZWZpbmUgZmFjZSxcblx0XHRcdGdldDogLT4gQGxheWVyRnJvbUZhY2UoZmFjZSkgIyBAZ2V0SW1hZ2UoZmFjZSlcblx0XHRcdHNldDogKHZhbHVlKSAtPiBAc2V0SW1hZ2UoZmFjZSwgdmFsdWUpXG5cblx0Y3JlYXRlQ3ViZTogKGN1YmVTaWRlID0gQGN1YmVTaWRlKSA9PlxuXHRcdEBjdWJlU2lkZSA9IGN1YmVTaWRlXG5cblx0XHRAd29ybGQ/LmRlc3Ryb3koKVxuXHRcdEB3b3JsZCA9IG5ldyBMYXllclxuXHRcdFx0bmFtZTogXCJ3b3JsZFwiXG5cdFx0XHRzdXBlckxheWVyOiBAXG5cdFx0XHR3aWR0aDogY3ViZVNpZGUsIGhlaWdodDogY3ViZVNpZGVcblx0XHRcdGJhY2tncm91bmRDb2xvcjogbnVsbFxuXHRcdFx0Y2xpcDogZmFsc2Vcblx0XHRAd29ybGQuc3R5bGUud2Via2l0VHJhbnNmb3JtU3R5bGUgPSBcInByZXNlcnZlLTNkXCJcblx0XHRAd29ybGQuY2VudGVyKClcblxuXHRcdGhhbGZDdWJTaWRlID0gQGN1YmVTaWRlLzJcblxuXHRcdEBzaWRlMCA9IG5ldyBMYXllclxuXHRcdEBzaWRlMC5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IFwicm90YXRlWCgtOTBkZWcpIHRyYW5zbGF0ZVooLSN7aGFsZkN1YlNpZGV9cHgpXCJcblx0XHRAc2lkZTEgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTEuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInJvdGF0ZVkoLTkwZGVnKSB0cmFuc2xhdGVaKC0je2hhbGZDdWJTaWRlfXB4KSByb3RhdGVaKDkwZGVnKVwiXG5cdFx0QHNpZGUyID0gbmV3IExheWVyXG5cdFx0QHNpZGUyLnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gXCJyb3RhdGVYKDkwZGVnKSB0cmFuc2xhdGVaKC0je2hhbGZDdWJTaWRlfXB4KSByb3RhdGVaKDE4MGRlZylcIlxuXHRcdEBzaWRlMyA9IG5ldyBMYXllclxuXHRcdEBzaWRlMy5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IFwicm90YXRlWSg5MGRlZykgdHJhbnNsYXRlWigtI3toYWxmQ3ViU2lkZX1weCkgcm90YXRlWigtOTBkZWcpXCJcblx0XHRAc2lkZTQgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTQuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInJvdGF0ZVkoLTE4MGRlZykgdHJhbnNsYXRlWigtI3toYWxmQ3ViU2lkZX1weCkgcm90YXRlWigxODBkZWcpXCJcblx0XHRAc2lkZTUgPSBuZXcgTGF5ZXJcblx0XHRAc2lkZTUuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSBcInRyYW5zbGF0ZVooLSN7aGFsZkN1YlNpZGV9cHgpXCJcblxuXHRcdEBzaWRlcyA9IFtAc2lkZTAsIEBzaWRlMSwgQHNpZGUyLCBAc2lkZTMsIEBzaWRlNCwgQHNpZGU1XVxuXHRcdGNvbG9ycyA9IFtcIiM4NjZjY2NcIiwgXCIjMjhhZmZhXCIsIFwiIzJkZDdhYVwiLCBcIiNmZmMyMmNcIiwgXCIjN2RkZDExXCIsIFwiI2Y5NWZhYVwiXVxuXHRcdHNpZGVOYW1lcyA9IFtcImZyb250XCIsIFwicmlnaHRcIiwgXCJiYWNrXCIsIFwibGVmdFwiLCBcInRvcFwiLCBcImJvdHRvbVwiXVxuXG5cdFx0aW5kZXggPSAwXG5cdFx0Zm9yIHNpZGUgaW4gQHNpZGVzXG5cdFx0XHRzaWRlLm5hbWUgPSBzaWRlTmFtZXNbaW5kZXhdXG5cdFx0XHRzaWRlLndpZHRoID0gc2lkZS5oZWlnaHQgPSBjdWJlU2lkZVxuXHRcdFx0c2lkZS5zdXBlckxheWVyID0gQHdvcmxkXG5cdFx0XHRzaWRlLmh0bWwgPSBzaWRlTmFtZXNbaW5kZXhdXG5cdFx0XHRzaWRlLmNvbG9yID0gXCJ3aGl0ZVwiXG5cdFx0XHRzaWRlLl9iYWNrZ3JvdW5kQ29sb3IgPSBjb2xvcnNbaW5kZXhdXG5cdFx0XHRzaWRlLmJhY2tncm91bmRDb2xvciA9IGNvbG9yc1tpbmRleF1cblx0XHRcdHNpZGUuc3R5bGUgPVxuXHRcdFx0XHRsaW5lSGVpZ2h0OiBcIiN7Y3ViZVNpZGV9cHhcIlxuXHRcdFx0XHR0ZXh0QWxpZ246IFwiY2VudGVyXCJcblx0XHRcdFx0Zm9udFNpemU6IFwiI3tjdWJlU2lkZSAvIDEwfXB4XCJcblx0XHRcdFx0Zm9udFdlaWdodDogXCIxMDBcIlxuXHRcdFx0XHRmb250RmFtaWx5OiBcIkhlbHZldGljYSBOZXVlXCJcblx0XHRcdGluZGV4KytcblxuXHRcdGlmIEBzaWRlSW1hZ2VzXG5cdFx0XHRmb3Iga2V5IG9mIEBzaWRlSW1hZ2VzXG5cdFx0XHRcdEBzZXRJbWFnZSBrZXksIEBzaWRlSW1hZ2VzW2tleV1cblxuXHRoaWRlRW52aXJvbWVudDogLT5cblx0XHRmb3Igc2lkZSBpbiBAc2lkZXNcblx0XHRcdHNpZGUuZGVzdHJveSgpXG5cblx0bGF5ZXJGcm9tRmFjZTogKGZhY2UpIC0+XG5cdFx0bWFwID1cblx0XHRcdG5vcnRoOiBAc2lkZTBcblx0XHRcdGZyb250OiBAc2lkZTBcblx0XHRcdGVhc3Q6ICBAc2lkZTFcblx0XHRcdHJpZ2h0OiBAc2lkZTFcblx0XHRcdHNvdXRoOiBAc2lkZTJcblx0XHRcdGJhY2s6ICBAc2lkZTJcblx0XHRcdHdlc3Q6ICBAc2lkZTNcblx0XHRcdGxlZnQ6ICBAc2lkZTNcblx0XHRcdHRvcDogICBAc2lkZTRcblx0XHRcdGJvdHRvbTpAc2lkZTVcblx0XHRyZXR1cm4gbWFwW2ZhY2VdXG5cblx0c2V0SW1hZ2U6IChmYWNlLCBpbWFnZVBhdGgpIC0+XG5cdFx0XG5cdFx0aWYgbm90IGZhY2UgaW4gU0lERVNcblx0XHRcdHRocm93IEVycm9yIFwiVlJDb21wb25lbnQgc2V0SW1hZ2UsIHdyb25nIG5hbWUgZm9yIGZhY2U6IFwiICsgZmFjZSArIFwiLCB2YWxpZCBvcHRpb25zOiBmcm9udCwgcmlnaHQsIGJhY2ssIGxlZnQsIHRvcCwgYm90dG9tLCBub3J0aCwgZWFzdCwgc291dGgsIHdlc3RcIlxuXG5cdFx0aWYgbm90IEBzaWRlSW1hZ2VzXG5cdFx0XHRAc2lkZUltYWdlcyA9IHt9XG5cdFx0QHNpZGVJbWFnZXNbZmFjZV0gPSBpbWFnZVBhdGhcblxuXHRcdGxheWVyID0gQGxheWVyRnJvbUZhY2UoZmFjZSlcblx0XHRcblx0XHRpZiBpbWFnZVBhdGhcblx0XHRcdGxheWVyPy5odG1sID0gXCJcIlxuXHRcdFx0bGF5ZXI/LmltYWdlID0gaW1hZ2VQYXRoXG5cdFx0ZWxzZVxuXHRcdFx0bGF5ZXI/Lmh0bWwgPSBsYXllcj8ubmFtZVxuXHRcdFx0bGF5ZXI/LmJhY2tncm91bmRDb2xvciA9IGxheWVyPy5fYmFja2dyb3VuZENvbG9yXG5cblx0Z2V0SW1hZ2U6IChmYWNlKSAtPlxuXG5cdFx0aWYgbm90IGZhY2UgaW4gU0lERVNcblx0XHRcdHRocm93IEVycm9yIFwiVlJDb21wb25lbnQgZ2V0SW1hZ2UsIHdyb25nIG5hbWUgZm9yIGZhY2U6IFwiICsgZmFjZSArIFwiLCB2YWxpZCBvcHRpb25zOiBmcm9udCwgcmlnaHQsIGJhY2ssIGxlZnQsIHRvcCwgYm90dG9tLCBub3J0aCwgZWFzdCwgc291dGgsIHdlc3RcIlxuXG5cdFx0bGF5ZXIgPSBAbGF5ZXJGcm9tRmFjZShmYWNlKVxuXHRcdGlmIGxheWVyXG5cdFx0XHRsYXllci5pbWFnZVxuXG5cdHByb2plY3RMYXllcjogKGluc2VydExheWVyKSAtPlxuXG5cdFx0aGVhZGluZyA9IGluc2VydExheWVyLmhlYWRpbmdcblx0XHRpZiBoZWFkaW5nID09IHVuZGVmaW5lZFxuXHRcdFx0aGVhZGluZyA9IDBcblx0XHRlbGV2YXRpb24gPSBpbnNlcnRMYXllci5lbGV2YXRpb25cblx0XHRpZiBlbGV2YXRpb24gPT0gdW5kZWZpbmVkXG5cdFx0XHRlbGV2YXRpb24gPSAwXG5cblx0XHRpZiBoZWFkaW5nID49IDM2MFxuXHRcdFx0aGVhZGluZyA9IHZhbHVlICUgMzYwXG5cdFx0ZWxzZSBpZiBoZWFkaW5nIDwgMFxuXHRcdFx0cmVzdCA9IE1hdGguYWJzKGhlYWRpbmcpICUgMzYwXG5cdFx0XHRoZWFkaW5nID0gMzYwIC0gcmVzdFxuXG5cdFx0ZWxldmF0aW9uID0gVXRpbHMuY2xhbXAoZWxldmF0aW9uLCAtOTAsIDkwKVxuXG5cdFx0ZGlzdGFuY2UgPSBpbnNlcnRMYXllci5kaXN0YW5jZVxuXHRcdGlmIGRpc3RhbmNlID09IHVuZGVmaW5lZFxuXHRcdFx0ZGlzdGFuY2UgPSAxMjAwXG5cblx0XHRpbnNlcnRMYXllci5oZWFkaW5nID0gaGVhZGluZ1xuXHRcdGluc2VydExheWVyLmVsZXZhdGlvbiA9IGVsZXZhdGlvblxuXHRcdGluc2VydExheWVyLmRpc3RhbmNlID0gZGlzdGFuY2VcblxuXHRcdGFuY2hvciA9IG5ldyBWUkFuY2hvckxheWVyKGluc2VydExheWVyLCBAY3ViZVNpZGUpXG5cdFx0YW5jaG9yLnN1cGVyTGF5ZXIgPSBAd29ybGRcblxuXHRcdGlmIEBsb29rQXRMYXRlc3RQcm9qZWN0ZWRMYXllclxuXHRcdFx0QGxvb2tBdChoZWFkaW5nLCBlbGV2YXRpb24pXG5cblx0IyBNb2JpbGUgZGV2aWNlIG9yaWVudGF0aW9uXG5cblx0ZGV2aWNlT3JpZW50YXRpb25VcGRhdGU6ID0+XG5cblx0XHRpZiBVdGlscy5pc0Rlc2t0b3AoKVxuXHRcdFx0aWYgQGFycm93S2V5c1xuXHRcdFx0XHRpZiBAX2xhc3RDYWxsSG9yaXpvbnRhbCA9PSB1bmRlZmluZWRcblx0XHRcdFx0XHRAX2xhc3RDYWxsSG9yaXpvbnRhbCA9IDBcblx0XHRcdFx0XHRAX2xhc3RDYWxsVmVydGljYWwgPSAwXG5cdFx0XHRcdFx0QF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsID0gMVxuXHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uVmVydGljYWwgPSAxXG5cdFx0XHRcdFx0QF9nb2luZ1VwID0gZmFsc2Vcblx0XHRcdFx0XHRAX2dvaW5nTGVmdCA9IGZhbHNlXG5cblx0XHRcdFx0ZGF0ZSA9IG5ldyBEYXRlKClcblx0XHRcdFx0eCA9IC4xXG5cdFx0XHRcdGlmIEtFWVNET1dOLnVwIHx8IEtFWVNET1dOLmRvd25cblx0XHRcdFx0XHRkaWZmID0gZGF0ZSAtIEBfbGFzdENhbGxWZXJ0aWNhbFxuXHRcdFx0XHRcdGlmIGRpZmYgPCAzMFxuXHRcdFx0XHRcdFx0aWYgQF9hY2NlbGVyYXRpb25WZXJ0aWNhbCA8IDMwXG5cdFx0XHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uVmVydGljYWwgKz0gMC4xOFxuXHRcdFx0XHRcdGlmIEtFWVNET1dOLnVwXG5cdFx0XHRcdFx0XHRpZiBAX2dvaW5nVXAgPT0gZmFsc2Vcblx0XHRcdFx0XHRcdFx0QF9hY2NlbGVyYXRpb25WZXJ0aWNhbCA9IDFcblx0XHRcdFx0XHRcdFx0QF9nb2luZ1VwID0gdHJ1ZVxuXHRcdFx0XHRcdFx0QGRlc2t0b3BQYW4oMCwgMSAqIEBfYWNjZWxlcmF0aW9uVmVydGljYWwgKiB4KVxuXHRcdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRcdGlmIEBfZ29pbmdVcCA9PSB0cnVlXG5cdFx0XHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uVmVydGljYWwgPSAxXG5cdFx0XHRcdFx0XHRcdEBfZ29pbmdVcCA9IGZhbHNlXG5cdFx0XHRcdFx0XHRcblx0XHRcdFx0XHRcdEBkZXNrdG9wUGFuKDAsIC0xICogQF9hY2NlbGVyYXRpb25WZXJ0aWNhbCAqIHgpXG5cdFx0XHRcdFx0QF9sYXN0Q2FsbFZlcnRpY2FsID0gZGF0ZVxuXG5cdFx0XHRcdGVsc2Vcblx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvblZlcnRpY2FsID0gMVxuXG5cdFx0XHRcdGlmIEtFWVNET1dOLmxlZnQgfHwgS0VZU0RPV04ucmlnaHRcblx0XHRcdFx0XHRkaWZmID0gZGF0ZSAtIEBfbGFzdENhbGxIb3Jpem9udGFsXG5cdFx0XHRcdFx0aWYgZGlmZiA8IDMwXG5cdFx0XHRcdFx0XHRpZiBAX2FjY2VsZXJhdGlvbkhvcml6b250YWwgPCAyNVxuXHRcdFx0XHRcdFx0XHRAX2FjY2VsZXJhdGlvbkhvcml6b250YWwgKz0gMC4xOFxuXHRcdFx0XHRcdGlmIEtFWVNET1dOLmxlZnRcblx0XHRcdFx0XHRcdGlmIEBfZ29pbmdMZWZ0ID09IGZhbHNlXG5cdFx0XHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCA9IDFcblx0XHRcdFx0XHRcdFx0QF9nb2luZ0xlZnQgPSB0cnVlXG5cdFx0XHRcdFx0XHRAZGVza3RvcFBhbigxICogQF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsICogeCwgMClcblx0XHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0XHRpZiBAX2dvaW5nTGVmdCA9PSB0cnVlXG5cdFx0XHRcdFx0XHRcdEBfYWNjZWxlcmF0aW9uSG9yaXpvbnRhbCA9IDFcblx0XHRcdFx0XHRcdFx0QF9nb2luZ0xlZnQgPSBmYWxzZVxuXHRcdFx0XHRcdFx0QGRlc2t0b3BQYW4oLTEgKiBAX2FjY2VsZXJhdGlvbkhvcml6b250YWwgKiB4LCAwKVxuXHRcdFx0XHRcdEBfbGFzdENhbGxIb3Jpem9udGFsID0gZGF0ZVxuXHRcdFx0XHRlbHNlXG5cdFx0XHRcdFx0QF9hY2NlbGVyYXRpb25Ib3Jpem9udGFsID0gMVxuXG5cdFx0ZWxzZSBpZiBAb3JpZW50YXRpb25EYXRhXG5cblx0XHRcdGFscGhhID0gQG9yaWVudGF0aW9uRGF0YS5hbHBoYVxuXHRcdFx0YmV0YSA9IEBvcmllbnRhdGlvbkRhdGEuYmV0YVxuXHRcdFx0Z2FtbWEgPSBAb3JpZW50YXRpb25EYXRhLmdhbW1hXG5cblx0XHRcdGlmIGFscGhhICE9IDAgJiYgYmV0YSAhPSAwICYmIGdhbW1hICE9IDBcblx0XHRcdFx0QGRpcmVjdGlvblBhcmFtcyhhbHBoYSwgYmV0YSwgZ2FtbWEpXG5cblx0XHRcdHhBbmdsZSA9IGJldGFcblx0XHRcdHlBbmdsZSA9IC1nYW1tYVxuXHRcdFx0ekFuZ2xlID0gYWxwaGFcblxuXHRcdFx0aGFsZkN1YlNpZGUgPSBAY3ViZVNpZGUvMlxuXHRcdFx0b3JpZW50YXRpb24gPSBcInJvdGF0ZSgje3dpbmRvdy5vcmllbnRhdGlvbiAqIC0xfWRlZykgXCJcblx0XHRcdHRyYW5zbGF0aW9uWCA9IFwidHJhbnNsYXRlWCgjeyhAd2lkdGggLyAyKSAtIGhhbGZDdWJTaWRlfXB4KVwiXG5cdFx0XHR0cmFuc2xhdGlvblkgPSBcIiB0cmFuc2xhdGVZKCN7KEBoZWlnaHQgLyAyKSAtIGhhbGZDdWJTaWRlfXB4KVwiXG5cdFx0XHR0cmFuc2xhdGlvblogPSBcIiB0cmFuc2xhdGVaKCN7QHBlcnNwZWN0aXZlfXB4KVwiXG5cdFx0XHRyb3RhdGlvbiA9IHRyYW5zbGF0aW9uWiArIHRyYW5zbGF0aW9uWCArIHRyYW5zbGF0aW9uWSArIG9yaWVudGF0aW9uICsgXCIgcm90YXRlWSgje3lBbmdsZX1kZWcpIHJvdGF0ZVgoI3t4QW5nbGV9ZGVnKSByb3RhdGVaKCN7ekFuZ2xlfWRlZylcIiArIFwiIHJvdGF0ZVooI3stQF9oZWFkaW5nT2Zmc2V0fWRlZylcIlxuXHRcdFx0QHdvcmxkLnN0eWxlW1wid2Via2l0VHJhbnNmb3JtXCJdID0gcm90YXRpb25cblxuXHRkaXJlY3Rpb25QYXJhbXM6IChhbHBoYSwgYmV0YSwgZ2FtbWEpIC0+XG5cblx0XHRhbHBoYVJhZCA9IGFscGhhICogQGRlZ1RvUmFkXG5cdFx0YmV0YVJhZCA9IGJldGEgKiBAZGVnVG9SYWRcblx0XHRnYW1tYVJhZCA9IGdhbW1hICogQGRlZ1RvUmFkXG5cblx0XHQjIENhbGN1bGF0ZSBlcXVhdGlvbiBjb21wb25lbnRzXG5cdFx0Y0EgPSBNYXRoLmNvcyhhbHBoYVJhZClcblx0XHRzQSA9IE1hdGguc2luKGFscGhhUmFkKVxuXHRcdGNCID0gTWF0aC5jb3MoYmV0YVJhZClcblx0XHRzQiA9IE1hdGguc2luKGJldGFSYWQpXG5cdFx0Y0cgPSBNYXRoLmNvcyhnYW1tYVJhZClcblx0XHRzRyA9IE1hdGguc2luKGdhbW1hUmFkKVxuXG5cdFx0IyB4IHVuaXR2ZWN0b3Jcblx0XHR4ckEgPSAtc0EgKiBzQiAqIHNHICsgY0EgKiBjR1xuXHRcdHhyQiA9IGNBICogc0IgKiBzRyArIHNBICogY0dcblx0XHR4ckMgPSBjQiAqIHNHXG5cblx0XHQjIHkgdW5pdHZlY3RvclxuXHRcdHlyQSA9IC1zQSAqIGNCXG5cdFx0eXJCID0gY0EgKiBjQlxuXHRcdHlyQyA9IC1zQlxuXG5cdFx0IyAteiB1bml0dmVjdG9yXG5cdFx0enJBID0gLXNBICogc0IgKiBjRyAtIGNBICogc0dcblx0XHR6ckIgPSBjQSAqIHNCICogY0cgLSBzQSAqIHNHXG5cdFx0enJDID0gY0IgKiBjR1xuXG5cdFx0IyBDYWxjdWxhdGUgaGVhZGluZ1xuXHRcdGhlYWRpbmcgPSBNYXRoLmF0YW4oenJBIC8genJCKVxuXG5cdFx0IyBDb252ZXJ0IGZyb20gaGFsZiB1bml0IGNpcmNsZSB0byB3aG9sZSB1bml0IGNpcmNsZVxuXHRcdGlmIHpyQiA8IDBcblx0XHRcdGhlYWRpbmcgKz0gTWF0aC5QSVxuXHRcdGVsc2UgaWYgenJBIDwgMFxuXHRcdFx0aGVhZGluZyArPSAyICogTWF0aC5QSVxuXG5cdFx0IyAjIENhbGN1bGF0ZSBBbHRpdHVkZSAoaW4gZGVncmVlcylcblx0XHRlbGV2YXRpb24gPSBNYXRoLlBJIC8gMiAtIE1hdGguYWNvcygtenJDKVxuXG5cdFx0Y0ggPSBNYXRoLnNxcnQoMSAtICh6ckMgKiB6ckMpKVxuXHRcdHRpbHQgPSBNYXRoLmFjb3MoLXhyQyAvIGNIKSAqIE1hdGguc2lnbih5ckMpXG5cblx0XHQjIENvbnZlcnQgcmFkaWFucyB0byBkZWdyZWVzXG5cdFx0aGVhZGluZyAqPSAxODAgLyBNYXRoLlBJXG5cdFx0ZWxldmF0aW9uICo9IDE4MCAvIE1hdGguUElcblx0XHR0aWx0ICo9IDE4MCAvIE1hdGguUElcblxuXHRcdEBfaGVhZGluZyA9IE1hdGgucm91bmQoaGVhZGluZyAqIDEwMDApIC8gMTAwMFxuXHRcdEBfZWxldmF0aW9uID0gTWF0aC5yb3VuZChlbGV2YXRpb24gKiAxMDAwKSAvIDEwMDBcblxuXHRcdHRpbHQgPSBNYXRoLnJvdW5kKHRpbHQgKiAxMDAwKSAvIDEwMDBcblx0XHRvcmllbnRhdGlvblRpbHRPZmZzZXQgPSAod2luZG93Lm9yaWVudGF0aW9uICogLTEpICsgOTBcblx0XHR0aWx0ICs9IG9yaWVudGF0aW9uVGlsdE9mZnNldFxuXHRcdGlmIHRpbHQgPiAxODBcblx0XHRcdGRpZmYgPSB0aWx0IC0gMTgwXG5cdFx0XHR0aWx0ID0gLTE4MCArIGRpZmZcblx0XHRAX3RpbHQgPSB0aWx0XG5cblx0XHRAX2RldmljZUhlYWRpbmcgPSBAX2hlYWRpbmdcblx0XHRAX2RldmljZUVsZXZhdGlvbiA9IEBfZWxldmF0aW9uXG5cblx0XHRAX2VtaXRPcmllbnRhdGlvbkRpZENoYW5nZUV2ZW50KClcblxuXHQjIERlc2t0b3AgdGlsdFxuXG5cdHJlbW92ZURlc2t0b3BQYW5MYXllcjogPT5cblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXI/LmRlc3Ryb3koKVxuXG5cdGFkZERlc2t0b3BQYW5MYXllcjogPT5cblx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXI/LmRlc3Ryb3koKVxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllciA9IG5ldyBMYXllclxuXHRcdFx0d2lkdGg6IDEwMDAwMCwgaGVpZ2h0OiAxMDAwMFxuXHRcdFx0YmFja2dyb3VuZENvbG9yOiBudWxsXG5cdFx0XHRzdXBlckxheWVyOkBcblx0XHRcdG5hbWU6IFwiZGVza3RvcE9yaWVudGF0aW9uTGF5ZXJcIlxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5jZW50ZXIoKVxuXHRcdEBkZXNrdG9wT3JpZW50YXRpb25MYXllci5kcmFnZ2FibGUuZW5hYmxlZCA9IHRydWVcblx0XHRcblx0XHRAcHJldkRlc2t0b3BEaXIgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueFxuXHRcdEBwcmV2RGVza3RvcEhlaWdodCA9IEBkZXNrdG9wT3JpZW50YXRpb25MYXllci55XG5cdFx0XG5cdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLm9uIEV2ZW50cy5EcmFnU3RhcnQsID0+XG5cdFx0XHRAcHJldkRlc2t0b3BEaXIgPSBAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueFxuXHRcdFx0QHByZXZEZXNrdG9wSGVpZ2h0ID0gQGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLnlcblx0XHRcdEBkZXNrdG9wRHJhZ2dhYmxlQWN0aXZlID0gdHJ1ZVxuXHRcdFx0XG5cdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLm9uIEV2ZW50cy5Nb3ZlLCA9PlxuXHRcdFx0aWYgQGRlc2t0b3BEcmFnZ2FibGVBY3RpdmVcblx0XHRcdFx0c3RyZW5ndGggPSBVdGlscy5tb2R1bGF0ZShAcGVyc3BlY3RpdmUsIFsxMjAwLCA5MDBdLCBbMjIsIDE3LjVdKVxuXHRcdFx0XHRkZWx0YURpciA9IChAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueCAtIEBwcmV2RGVza3RvcERpcikgLyBzdHJlbmd0aFxuXHRcdFx0XHRkZWx0YUhlaWdodCA9IChAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXIueSAtIEBwcmV2RGVza3RvcEhlaWdodCkgLyBzdHJlbmd0aFxuXHRcdFx0XHRAZGVza3RvcFBhbihkZWx0YURpciwgZGVsdGFIZWlnaHQpXG5cdFx0XHRcdEBwcmV2RGVza3RvcERpciA9IEBkZXNrdG9wT3JpZW50YXRpb25MYXllci54XG5cdFx0XHRcdEBwcmV2RGVza3RvcEhlaWdodCA9IEBkZXNrdG9wT3JpZW50YXRpb25MYXllci55XG5cdFx0XG5cdFx0QGRlc2t0b3BPcmllbnRhdGlvbkxheWVyLm9uIEV2ZW50cy5BbmltYXRpb25FbmQsID0+XG5cdFx0XHRAZGVza3RvcERyYWdnYWJsZUFjdGl2ZSA9IGZhbHNlXG5cdFx0XHRAZGVza3RvcE9yaWVudGF0aW9uTGF5ZXI/LmNlbnRlcigpXG5cblx0ZGVza3RvcFBhbjogKGRlbHRhRGlyLCBkZWx0YUhlaWdodCkgLT5cblx0XHRoYWxmQ3ViU2lkZSA9IEBjdWJlU2lkZS8yXG5cdFx0dHJhbnNsYXRpb25YID0gXCJ0cmFuc2xhdGVYKCN7KEB3aWR0aCAvIDIpIC0gaGFsZkN1YlNpZGV9cHgpXCJcblx0XHR0cmFuc2xhdGlvblkgPSBcIiB0cmFuc2xhdGVZKCN7KEBoZWlnaHQgLyAyKSAtIGhhbGZDdWJTaWRlfXB4KVwiXG5cdFx0dHJhbnNsYXRpb25aID0gXCIgdHJhbnNsYXRlWigje0BwZXJzcGVjdGl2ZX1weClcIlxuXHRcdEBfaGVhZGluZyAtPSBkZWx0YURpclxuXG5cdFx0aWYgQF9oZWFkaW5nID4gMzYwXG5cdFx0XHRAX2hlYWRpbmcgLT0gMzYwXG5cdFx0ZWxzZSBpZiBAX2hlYWRpbmcgPCAwXG5cdFx0XHRAX2hlYWRpbmcgKz0gMzYwXG5cblx0XHRAX2VsZXZhdGlvbiArPSBkZWx0YUhlaWdodFxuXHRcdEBfZWxldmF0aW9uID0gVXRpbHMuY2xhbXAoQF9lbGV2YXRpb24sIC05MCwgOTApXG5cblx0XHRyb3RhdGlvbiA9IHRyYW5zbGF0aW9uWiArIHRyYW5zbGF0aW9uWCArIHRyYW5zbGF0aW9uWSArIFwiIHJvdGF0ZVgoI3tAX2VsZXZhdGlvbiArIDkwfWRlZykgcm90YXRlWigjezM2MCAtIEBfaGVhZGluZ31kZWcpXCIgKyBcIiByb3RhdGVaKCN7LUBfaGVhZGluZ09mZnNldH1kZWcpXCJcblx0XHRAd29ybGQuc3R5bGVbXCJ3ZWJraXRUcmFuc2Zvcm1cIl0gPSByb3RhdGlvblxuXG5cdFx0QF9oZWFkaW5nID0gTWF0aC5yb3VuZChAX2hlYWRpbmcgKiAxMDAwKSAvIDEwMDBcblx0XHRAX3RpbHQgPSAwXG5cdFx0QF9lbWl0T3JpZW50YXRpb25EaWRDaGFuZ2VFdmVudCgpXG5cblx0bG9va0F0OiAoaGVhZGluZywgZWxldmF0aW9uKSAtPlxuXHRcdGhhbGZDdWJTaWRlID0gQGN1YmVTaWRlLzJcblx0XHR0cmFuc2xhdGlvblggPSBcInRyYW5zbGF0ZVgoI3soQHdpZHRoIC8gMikgLSBoYWxmQ3ViU2lkZX1weClcIlxuXHRcdHRyYW5zbGF0aW9uWSA9IFwiIHRyYW5zbGF0ZVkoI3soQGhlaWdodCAvIDIpIC0gaGFsZkN1YlNpZGV9cHgpXCJcblx0XHR0cmFuc2xhdGlvblogPSBcIiB0cmFuc2xhdGVaKCN7QHBlcnNwZWN0aXZlfXB4KVwiXG5cdFx0cm90YXRpb24gPSB0cmFuc2xhdGlvblogKyB0cmFuc2xhdGlvblggKyB0cmFuc2xhdGlvblkgKyBcIiByb3RhdGVaKCN7QF90aWx0fWRlZykgcm90YXRlWCgje2VsZXZhdGlvbiArIDkwfWRlZykgcm90YXRlWigjey1oZWFkaW5nfWRlZylcIlxuXG5cdFx0QHdvcmxkPy5zdHlsZVtcIndlYmtpdFRyYW5zZm9ybVwiXSA9IHJvdGF0aW9uXG5cdFx0QF9oZWFkaW5nID0gaGVhZGluZ1xuXHRcdEBfZWxldmF0aW9uID0gZWxldmF0aW9uXG5cdFx0aWYgVXRpbHMuaXNNb2JpbGUoKVxuXHRcdFx0QF9oZWFkaW5nT2Zmc2V0ID0gQF9oZWFkaW5nIC0gQF9kZXZpY2VIZWFkaW5nXG5cblx0XHRAX2VsZXZhdGlvbk9mZnNldCA9IEBfZWxldmF0aW9uIC0gQF9kZXZpY2VFbGV2YXRpb25cblxuXHRcdGhlYWRpbmcgPSBAX2hlYWRpbmdcblx0XHRpZiBoZWFkaW5nIDwgMFxuXHRcdFx0aGVhZGluZyArPSAzNjBcblx0XHRlbHNlIGlmIGhlYWRpbmcgPiAzNjBcblx0XHRcdGhlYWRpbmcgLT0gMzYwXG5cblx0XHRAZW1pdChFdmVudHMuT3JpZW50YXRpb25EaWRDaGFuZ2UsIHtoZWFkaW5nOiBoZWFkaW5nLCBlbGV2YXRpb246IEBfZWxldmF0aW9uLCB0aWx0OiBAX3RpbHR9KVxuXG5cdF9lbWl0T3JpZW50YXRpb25EaWRDaGFuZ2VFdmVudDogLT5cblx0XHRAZW1pdChFdmVudHMuT3JpZW50YXRpb25EaWRDaGFuZ2UsIHtoZWFkaW5nOiBAaGVhZGluZywgZWxldmF0aW9uOiBAX2VsZXZhdGlvbiwgdGlsdDogQF90aWx0fSlcbiIsIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBRUFBO0FEQUE7QUFBQSxJQUFBLG9DQUFBO0VBQUE7Ozs7O0FBb0NBLEtBQUEsR0FBUSxDQUNQLE9BRE8sRUFFUCxPQUZPLEVBR1AsTUFITyxFQUlQLE9BSk8sRUFLUCxPQUxPLEVBTVAsTUFOTyxFQU9QLE1BUE8sRUFRUCxNQVJPLEVBU1AsS0FUTyxFQVVQLFFBVk87O0FBYVIsSUFBQSxHQUFPO0VBQ04sU0FBQSxFQUFXLEVBREw7RUFFTixPQUFBLEVBQVMsRUFGSDtFQUdOLFVBQUEsRUFBWSxFQUhOO0VBSU4sU0FBQSxFQUFXLEVBSkw7OztBQU9QLFFBQUEsR0FBVztFQUNWLElBQUEsRUFBTSxLQURJO0VBRVYsRUFBQSxFQUFJLEtBRk07RUFHVixLQUFBLEVBQU8sS0FIRztFQUlWLElBQUEsRUFBTSxLQUpJOzs7QUFPWCxNQUFNLENBQUMsb0JBQVAsR0FBOEI7O0FBRXhCOzs7RUFFUSx1QkFBQyxLQUFELEVBQVEsUUFBUjtJQUNaLCtDQUFNLE1BQU47SUFDQSxJQUFDLENBQUEsS0FBRCxHQUFTO0lBQ1QsSUFBQyxDQUFBLE1BQUQsR0FBVTtJQUNWLElBQUMsQ0FBQSxJQUFELEdBQVE7SUFDUixJQUFDLENBQUEsSUFBRCxHQUFRO0lBQ1IsSUFBQyxDQUFBLFFBQUQsR0FBWTtJQUVaLElBQUMsQ0FBQSxLQUFELEdBQVM7SUFDVCxLQUFLLENBQUMsVUFBTixHQUFtQjtJQUNuQixLQUFLLENBQUMsTUFBTixDQUFBO0lBRUEsS0FBSyxDQUFDLEVBQU4sQ0FBUyxv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
