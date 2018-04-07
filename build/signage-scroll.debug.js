(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Scroll = f()}})(function(){var define,module,exports;return (function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7OztJQ0FNLGE7QUFDSix5QkFBWSxPQUFaLEVBQXFCLE9BQXJCLEVBQThCO0FBQUE7O0FBQzVCLFNBQUssSUFBTCxHQUFZLE9BQU8sTUFBUCxDQUNWO0FBQ0Usb0JBQWMsSUFEaEI7QUFFRSxxQkFBZSxHQUZqQjtBQUdFLHlCQUFtQixJQUhyQjtBQUlFLGtCQUFZLENBSmQ7QUFLRSxzQkFBZ0IsQ0FMbEI7QUFNRSxxQkFBZSxJQU5qQjtBQU9FLGdCQUFVLEVBUFo7QUFRRSx1QkFBaUI7QUFBQSxlQUFNLElBQU47QUFBQSxPQVJuQixFQVErQjtBQUM3QixxQkFBZTtBQUFBLGVBQU0sSUFBTjtBQUFBLE9BVGpCLENBUzRCO0FBVDVCLEtBRFUsRUFZVixPQVpVLENBQVo7O0FBZUEsU0FBSyxJQUFMLENBQVUsWUFBVixJQUEwQixLQUFLLElBQUwsQ0FBVSxhQUFwQztBQUNBLFNBQUssVUFBTCxHQUFrQixDQUFsQjtBQUNBLFNBQUssWUFBTCxHQUFvQixFQUFwQjtBQUNBLFNBQUssT0FBTCxHQUFlLE9BQWY7QUFDQSxTQUFLLE1BQUw7QUFDRDs7Ozs2QkFFUTtBQUNQLFVBQU0sT0FBTyxTQUFTLG9CQUFULENBQThCLE1BQTlCLEVBQXNDLENBQXRDLENBQWI7QUFDQSxVQUFNLE9BQU8sU0FBUyxvQkFBVCxDQUE4QixNQUE5QixFQUFzQyxDQUF0QyxDQUFiO0FBQ0EsVUFBSSxDQUFDLElBQUQsSUFBUyxDQUFDLElBQWQsRUFBb0I7QUFDbEIsY0FBTSxNQUFNLHlDQUFOLENBQU47QUFDRDs7QUFFRDtBQUNBLFVBQUksS0FBSyxJQUFMLENBQVUsYUFBZCxFQUE2QjtBQUMzQjtBQUNBLGFBQUssS0FBTCxDQUFXLEtBQVgsR0FBbUIsTUFBbkI7QUFDQSxhQUFLLEtBQUwsQ0FBVyxNQUFYLEdBQW9CLE1BQXBCO0FBQ0EsYUFB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QjtBQUNBLFVBQU0sZUFBZSxPQUFPLFdBQVAsR0FBcUIsVUFBMUM7QUFDQSxVQUFJLGdCQUFnQixDQUFwQixFQUF1QjtBQUNyQixjQUFNLE1BQU0sc0NBQU4sQ0FBTjtBQUNEO0FBQ0QsVUFBTSxnQkFBZ0IsUUFBUSxZQUE5QjtBQUNBLFVBQU0sUUFBUSxLQUFLLElBQUwsQ0FBVSxnQkFBZ0IsWUFBMUIsQ0FBZDtBQUNBLFVBQUksVUFBVSxDQUFkLEVBQWlCO0FBQ2Y7QUFDQTtBQUNBLGVBQU8sQ0FBUDtBQUNEO0FBQ0QsVUFBSSxRQUFRLENBQVosRUFBZTtBQUNiLGNBQU0sTUFBTSxxQkFBTixDQUFOO0FBQ0Q7QUFDRCxVQUFJLFFBQVEsS0FBSyxRQUFqQixFQUEyQjtBQUN6QixjQUFNLHNDQUFvQyxLQUFLLFFBQXpDLENBQU47QUFDRDs7QUFFRCxVQUFNLGVBQWUsS0FBSyxJQUFMLENBQVUsQ0FBQyxnQkFBZ0IsWUFBakIsS0FBa0MsUUFBUSxDQUExQyxDQUFWLENBQXJCO0FBQ0EsVUFBTSxTQUFTO0FBQ2Isb0JBRGE7QUFFYixrQ0FGYTtBQUdiLG9DQUhhO0FBSWI7QUFKYSxPQUFmO0FBTUE7O0FBRUEsY0FBUSxLQUFSLENBQWMsVUFBZCxHQUEyQixZQUFZLEtBQUssYUFBakIsR0FBaUMsSUFBNUQ7O0FBRUE7QUFDQSxhQUFPLFlBQVksWUFBTTtBQUN2QjtBQUNELE9BRk0sRUFFSixLQUFLLFlBQUwsR0FBb0IsS0FGaEIsQ0FBUDtBQUdEOzs7Ozs7QUFHSCxPQUFPLE9BQVAsR0FBaUIsYUFBakIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfXJldHVybiBlfSkoKSIsImNsYXNzIFNpZ25hZ2VTY3JvbGwge1xuICBjb25zdHJ1Y3RvcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgIHtcbiAgICAgICAgcGFnZUhvbGRUaW1lOiA0MDAwLFxuICAgICAgICBwYWdlU2xpZGVUaW1lOiA1MDAsXG4gICAgICAgIGNvbnN0YW50U2xpZGVUaW1lOiA1MDAwLFxuICAgICAgICBwYWdlT2Zmc2V0OiAwLFxuICAgICAgICBjb25zdGFudE9mZnNldDogMCxcbiAgICAgICAgaGlkZVNjcm9sbEJhcjogdHJ1ZSxcbiAgICAgICAgbWF4UGFnZXM6IDEwLFxuICAgICAgICBjYWxsYmFja0FuaW1hdGU6ICgpID0+IHRydWUsIC8vIG5vdCB1c2VkXG4gICAgICAgIGNhbGxiYWNrU2xpZGU6ICgpID0+IHRydWUgLy8gbm90IHVzZWRcbiAgICAgIH0sXG4gICAgICBvcHRpb25zXG4gICAgKTtcblxuICAgIHRoaXMub3B0cy5wYWdlSG9sZFRpbWUgKz0gdGhpcy5vcHRzLnBhZ2VTbGlkZVRpbWU7XG4gICAgdGhpcy5pbnRlcnZhbElkID0gMDtcbiAgICB0aGlzLnRpbWVvdXRBcnJheSA9IFtdO1xuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5zZXRDc3MoKTtcbiAgfVxuXG4gIHNldENzcygpIHtcbiAgICBjb25zdCBodG1sID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJodG1sXCIpWzBdO1xuICAgIGNvbnN0IGJvZHkgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF07XG4gICAgaWYgKCFodG1sIHx8ICFib2R5KSB7XG4gICAgICB0aHJvdyBFcnJvcihcIkNvdWxkIG5vdCBnZXQgaHRtbCBhbmQvb3IgYm9keSBlbGVtZW50c1wiKTtcbiAgICB9XG5cbiAgICAvLyBkaXNhYmxlIHNjcm9sbGJhcnNcbiAgICBpZiAodGhpcy5vcHRzLmhpZGVTY3JvbGxCYXIpIHtcbiAgICAgIC8vIG5vdCBzdXJlIGlmIHRoZXNlIHN0eWxlcyBhcmUgYWN0dWFsbHkgY3JpdGljYWxcbiAgICAgIGh0bWwuc3R5bGUud2lkdGggPSBcIjEwMCVcIjtcbiAgICAgIGh0bWwuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XG4gICAgICBib2R5LnN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgICBib2R5LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgYm9keS5zdHlsZS5tYXJnaW4gPSAwO1xuXG4gICAgICAvLyB0aGVzZSBkaXNhYmxlIHNjcm9sbGJhcnNcbiAgICAgIGh0bWwuc3R5bGUub3ZlcmZsb3cgPSBcImhpZGRlblwiO1xuICAgICAgYm9keS5zdHlsZS5vdmVyZmxvdyA9IFwiaGlkZGVuXCI7XG4gICAgfVxuICB9XG5cbiAgcnVuKG1ldGhvZCA9IFwiY29uc3RhbnRcIikge1xuICAgIHRoaXMuc3RvcCgpO1xuXG4gICAgaWYgKG1ldGhvZCA9PT0gXCJjb25zdGFudFwiKSB7XG4gICAgICB0aGlzLmludGVydmFsSWQgPSB0aGlzLnJ1bkNvbnN0YW50KCk7XG4gICAgfSBlbHNlIGlmIChtZXRob2QgPT09IFwicGFnZVwiKSB7XG4gICAgICB0aGlzLmludGVydmFsSWQgPSB0aGlzLnJ1blBhZ2UoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgRXJyb3IoYFVua25vd24gbWV0aG9kIFwiJHttZXRob2R9XCJgKTtcbiAgICB9XG4gIH1cblxuICBzdG9wKCkge1xuICAgIC8vIGNsZWFyIGV4aXN0aW5nIGludGVydmFscyBhbmQgdGltZW91dHMsIGlmIGFueVxuICAgIGlmICh0aGlzLmludGVydmFsSWQgIT09IDApIHtcbiAgICAgIGNsZWFySW50ZXJ2YWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IDA7XG4gICAgfVxuICAgIHRoaXMuY2xlYXJUaW1lb3V0QXJyYXkoKTtcbiAgfVxuXG4gIGNsZWFyVGltZW91dEFycmF5KCkge1xuICAgIHRoaXMudGltZW91dEFycmF5LmZvckVhY2goKGUpID0+IHtcbiAgICAgIGNsZWFyVGltZW91dChlKTtcbiAgICB9KTtcbiAgICB0aGlzLnRpbWVvdXRBcnJheSA9IFtdO1xuICB9XG5cbiAgLy8gc2xpZGUgdXAgYW5kIGRvd24gY29udGlub3VzbHlcbiAgcnVuQ29uc3RhbnQoKSB7XG4gICAgY29uc3QgeyBlbGVtZW50LCBvcHRzIH0gPSB0aGlzO1xuICAgIGNvbnN0IGFuaW1hdGUgPSAoKSA9PiB7XG4gICAgICAvLyBzbGlkZSB1cCwgcmV2ZWFsIGJvdHRvbSBvZiBlbGVtZW50XG4gICAgICBlbGVtZW50LnN0eWxlLm1hcmdpblRvcCA9IC0oc2Nyb2xsSGVpZ2h0IC0gd2luZG93SGVpZ2h0ICsgb3B0cy5jb25zdGFudE9mZnNldCkgKyBcInB4XCI7XG5cbiAgICAgIHRoaXMuY2xlYXJUaW1lb3V0QXJyYXkoKTtcblxuICAgICAgLy8gc2xpZGUgYmFjayB1cCwgcmV2ZWFsIHRvcCBvZiBlbGVtZW50XG4gICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZWxlbWVudC5zdHlsZS5tYXJnaW5Ub3AgPSBcIjBcIjtcbiAgICAgIH0sIG9wdHMuY29uc3RhbnRTbGlkZVRpbWUpO1xuICAgICAgdGhpcy50aW1lb3V0QXJyYXkucHVzaCh0aW1lb3V0SWQpO1xuICAgIH07XG5cbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG4gICAgY29uc3QgZWxlbWVudEhlaWdodCA9IGVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgIGNvbnN0IHNjcm9sbEhlaWdodCA9IGVsZW1lbnRIZWlnaHQ7XG5cbiAgICBpZiAod2luZG93SGVpZ2h0ID49IGVsZW1lbnRIZWlnaHQpIHtcbiAgICAgIC8vIGVsZW1lbnQgZml0cyBpbiB3aW5kb3csIG5vIG5lZWQgdG8gc2Nyb2xsXG4gICAgICByZXR1cm4gMDtcbiAgICB9XG5cbiAgICBlbGVtZW50LnN0eWxlLnRyYW5zaXRpb24gPSBcIm1hcmdpbiBcIiArIG9wdHMuY29uc3RhbnRTbGlkZVRpbWUgKyBcIm1zXCI7XG5cbiAgICBhbmltYXRlKCk7XG4gICAgcmV0dXJuIHNldEludGVydmFsKCgpID0+IHtcbiAgICAgIGFuaW1hdGUoKTtcbiAgICB9LCBvcHRzLmNvbnN0YW50U2xpZGVUaW1lICogMik7XG4gIH1cblxuICAvLyBzbGlkZSB1cCBvbmUgcGFnZSBhdCBhIHRpbWUsIHRoZW4gcmVwZWF0ZWRseSBzdGFydCBhZ2FpbiBmcm9tIHRoZSB0b3BcbiAgcnVuUGFnZSgpIHtcbiAgICBjb25zdCB7IGVsZW1lbnQsIG9wdHMgfSA9IHRoaXM7XG4gICAgLy8gc2Nyb2xsIG9uZSBwYWdlIGF0IGEgdGltZSwgdG9wIHRvIGJvdHRvbSwgc3RhcnQgZnJvbSB0b3Btb3N0XG4gICAgY29uc3QgYW5pbWF0ZSA9ICgpID0+IHtcbiAgICAgIHRoaXMuY2xlYXJUaW1lb3V0QXJyYXkoKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGFnZXM7IGkrKykge1xuICAgICAgICBjb25zdCB0aW1lb3V0SWQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBlbGVtZW50LnN0eWxlLm1hcmdpblRvcCA9IC0oaSAqIHNjcm9sbEhlaWdodCkgKyBcInB4XCI7XG4gICAgICAgIH0sIGkgKiBvcHRzLnBhZ2VIb2xkVGltZSk7XG4gICAgICAgIHRoaXMudGltZW91dEFycmF5LnB1c2godGltZW91dElkKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgY29uc3QgcGFnZU9mZnNldCA9IC10aGlzLm9wdHMucGFnZU9mZnNldDtcbiAgICBjb25zdCB3aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQgKyBwYWdlT2Zmc2V0O1xuICAgIGlmICh3aW5kb3dIZWlnaHQgPD0gMCkge1xuICAgICAgdGhyb3cgRXJyb3IoXCJ3aW5kb3cuaW5uZXJIZWlnaHQgKyBwYWdlT2Zmc2V0IDw9IDBcIik7XG4gICAgfVxuICAgIGNvbnN0IGVsZW1lbnRIZWlnaHQgPSBlbGVtZW50Lm9mZnNldEhlaWdodDtcbiAgICBjb25zdCBwYWdlcyA9IE1hdGguY2VpbChlbGVtZW50SGVpZ2h0IC8gd2luZG93SGVpZ2h0KTtcbiAgICBpZiAocGFnZXMgPT09IDEpIHtcbiAgICAgIC8vIG5vIG5lZWQgdG8gYW5pbWF0ZSBpZiBvbmx5IG9uZSBwYWdlXG4gICAgICAvLyB3ZSBhbHNvIGhhdmUgYSBtYXhpbXVtIHBhZ2UgY291bnQgZGlzcGxheVxuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChwYWdlcyA8IDApIHtcbiAgICAgIHRocm93IEVycm9yKFwiTmVnYXRpdmUgcGFnZSBjb3VudFwiKTtcbiAgICB9XG4gICAgaWYgKHBhZ2VzID4gb3B0cy5tYXhQYWdlcykge1xuICAgICAgdGhyb3cgRXJyb3IoYEV4Y2VlZGVkIG1heCBwYWdlIGNvdW50IG9mICR7b3B0cy5tYXhQYWdlc31gKTtcbiAgICB9XG5cbiAgICBjb25zdCBzY3JvbGxIZWlnaHQgPSBNYXRoLmNlaWwoKGVsZW1lbnRIZWlnaHQgLSB3aW5kb3dIZWlnaHQpIC8gKHBhZ2VzIC0gMSkpO1xuICAgIGNvbnN0IHBhcmFtcyA9IHtcbiAgICAgIHBhZ2VzLFxuICAgICAgd2luZG93SGVpZ2h0LFxuICAgICAgZWxlbWVudEhlaWdodCxcbiAgICAgIHNjcm9sbEhlaWdodFxuICAgIH07XG4gICAgLy8gY29uc29sZS5sb2cocGFyYW1zKTtcblxuICAgIGVsZW1lbnQuc3R5bGUudHJhbnNpdGlvbiA9IFwibWFyZ2luIFwiICsgb3B0cy5wYWdlU2xpZGVUaW1lICsgXCJtc1wiO1xuXG4gICAgYW5pbWF0ZSgpO1xuICAgIHJldHVybiBzZXRJbnRlcnZhbCgoKSA9PiB7XG4gICAgICBhbmltYXRlKCk7XG4gICAgfSwgb3B0cy5wYWdlSG9sZFRpbWUgKiBwYWdlcyk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBTaWduYWdlU2Nyb2xsO1xuIl19
