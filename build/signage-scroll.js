(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.SignageScroll = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SignageScroll = function () {
  function SignageScroll(element, options) {
    _classCallCheck(this, SignageScroll);

    this.opts = Object.assign({
      pageHoldTime: 4000,
      pageSlideTime: 500,
      constantSlideTime: 5000,
      pageOffset: 0,
      constantOffset: 0,
      hideScrollBar: true,
      maxPages: 10,
      callbackAnimate: function callbackAnimate() {
        return true;
      }, // not used
      callbackSlide: function callbackSlide() {
        return true;
      } // not used
    }, options);

    this.opts.pageHoldTime += this.opts.pageSlideTime;
    this.intervalId = 0;
    this.timeoutArray = [];
    this.element = element;
    this.setCss();
  }

  _createClass(SignageScroll, [{
    key: "setCss",
    value: function setCss() {
      var html = document.getElementsByTagName("html")[0];
      var body = document.getElementsByTagName("body")[0];
      if (!html || !body) {
        throw Error("Could not get html and/or body elements");
      }

      // disable scrollbars
      if (this.opts.hideScrollBar) {
        // not sure if these styles are actually critical
        html.style.width = "100%";
        html.style.height = "100%";
        body.style.width = "100%";
        body.style.height = "100%";
        body.style.margin = 0;

        // these disable scrollbars
        html.style.overflow = "hidden";
        body.style.overflow = "hidden";
      }
    }
  }, {
    key: "run",
    value: function run() {
      var method = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "constant";

      this.stop();

      if (method === "constant") {
        this.intervalId = this.runConstant();
      } else if (method === "page") {
        this.intervalId = this.runPage();
      } else {
        throw Error("Unknown method \"" + method + "\"");
      }
    }
  }, {
    key: "stop",
    value: function stop() {
      // clear existing intervals and timeouts, if any
      if (this.intervalId !== 0) {
        clearInterval(this.intervalId);
        this.intervalId = 0;
      }
      this.clearTimeoutArray();
    }
  }, {
    key: "clearTimeoutArray",
    value: function clearTimeoutArray() {
      this.timeoutArray.forEach(function (e) {
        clearTimeout(e);
      });
      this.timeoutArray = [];
    }

    // slide up and down continously

  }, {
    key: "runConstant",
    value: function runConstant() {
      var _this = this;

      var element = this.element,
          opts = this.opts;

      var animate = function animate() {
        // slide up, reveal bottom of element
        element.style.marginTop = -(scrollHeight - windowHeight + opts.constantOffset) + "px";

        _this.clearTimeoutArray();

        // slide back up, reveal top of element
        var timeoutId = setTimeout(function () {
          element.style.marginTop = "0";
        }, opts.constantSlideTime);
        _this.timeoutArray.push(timeoutId);
      };

      var windowHeight = window.innerHeight;
      var elementHeight = element.offsetHeight;
      var scrollHeight = elementHeight;

      if (windowHeight >= elementHeight) {
        // element fits in window, no need to scroll
        return 0;
      }

      element.style.transition = "margin " + opts.constantSlideTime + "ms";

      animate();
      return setInterval(function () {
        animate();
      }, opts.constantSlideTime * 2);
    }

    // slide up one page at a time, then repeatedly start again from the top

  }, {
    key: "runPage",
    value: function runPage() {
      var _this2 = this;

      var element = this.element,
          opts = this.opts;
      // scroll one page at a time, top to bottom, start from topmost

      var animate = function animate() {
        _this2.clearTimeoutArray();

        var _loop = function _loop(i) {
          var timeoutId = setTimeout(function () {
            element.style.marginTop = -(i * scrollHeight) + "px";
          }, i * opts.pageHoldTime);
          _this2.timeoutArray.push(timeoutId);
        };

        for (var i = 0; i < pages; i++) {
          _loop(i);
        }
      };

      var pageOffset = -this.opts.pageOffset;
      var windowHeight = window.innerHeight + pageOffset;
      if (windowHeight <= 0) {
        throw Error("window.innerHeight + pageOffset <= 0");
      }
      var elementHeight = element.offsetHeight;
      var pages = Math.ceil(elementHeight / windowHeight);
      if (pages === 1) {
        // no need to animate if only one page
        // we also have a maximum page count display
        return 0;
      }
      if (pages < 0) {
        throw Error("Negative page count");
      }
      if (pages > opts.maxPages) {
        throw Error("Exceeded max page count of " + opts.maxPages);
      }

      var scrollHeight = Math.ceil((elementHeight - windowHeight) / (pages - 1));
      var params = {
        pages: pages,
        windowHeight: windowHeight,
        elementHeight: elementHeight,
        scrollHeight: scrollHeight
      };
      // console.log(params);

      element.style.transition = "margin " + opts.pageSlideTime + "ms";

      animate();
      return setInterval(function () {
        animate();
      }, opts.pageHoldTime * pages);
    }
  }]);

  return SignageScroll;
}();

module.exports = SignageScroll;

},{}]},{},[1])(1)
});
