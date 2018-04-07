class SignageScroll {
  constructor(element, options) {
    this.opts = Object.assign(
      {
        pageHoldTime: 4000,
        pageSlideTime: 500,
        constantSlideTime: 5000,
        pageOffset: 0,
        constantOffset: 0,
        hideScrollBar: true,
        maxPages: 10,
        callbackAnimate: () => true, // not used
        callbackSlide: () => true // not used
      },
      options
    );

    this.opts.pageHoldTime += this.opts.pageSlideTime;
    this.intervalId = 0;
    this.timeoutArray = [];
    this.element = element;
    this.setCss();
  }

  setCss() {
    const html = document.getElementsByTagName("html")[0];
    const body = document.getElementsByTagName("body")[0];
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

  run(method = "constant") {
    this.stop();

    if (method === "constant") {
      this.intervalId = this.runConstant();
    } else if (method === "page") {
      this.intervalId = this.runPage();
    } else {
      throw Error(`Unknown method "${method}"`);
    }
  }

  stop() {
    // clear existing intervals and timeouts, if any
    if (this.intervalId !== 0) {
      clearInterval(this.intervalId);
      this.intervalId = 0;
    }
    this.clearTimeoutArray();
  }

  clearTimeoutArray() {
    this.timeoutArray.forEach((e) => {
      clearTimeout(e);
    });
    this.timeoutArray = [];
  }

  // slide up and down continously
  runConstant() {
    const { element, opts } = this;
    const animate = () => {
      // slide up, reveal bottom of element
      element.style.marginTop = -(scrollHeight - windowHeight + opts.constantOffset) + "px";

      this.clearTimeoutArray();

      // slide back up, reveal top of element
      const timeoutId = setTimeout(() => {
        element.style.marginTop = "0";
      }, opts.constantSlideTime);
      this.timeoutArray.push(timeoutId);
    };

    const windowHeight = window.innerHeight;
    const elementHeight = element.offsetHeight;
    const scrollHeight = elementHeight;

    if (windowHeight >= elementHeight) {
      // element fits in window, no need to scroll
      return 0;
    }

    element.style.transition = "margin " + opts.constantSlideTime + "ms";

    animate();
    return setInterval(() => {
      animate();
    }, opts.constantSlideTime * 2);
  }

  // slide up one page at a time, then repeatedly start again from the top
  runPage() {
    const { element, opts } = this;
    // scroll one page at a time, top to bottom, start from topmost
    const animate = () => {
      this.clearTimeoutArray();
      for (let i = 0; i < pages; i++) {
        const timeoutId = setTimeout(() => {
          element.style.marginTop = -(i * scrollHeight) + "px";
        }, i * opts.pageHoldTime);
        this.timeoutArray.push(timeoutId);
      }
    };

    const pageOffset = -this.opts.pageOffset;
    const windowHeight = window.innerHeight + pageOffset;
    if (windowHeight <= 0) {
      throw Error("window.innerHeight + pageOffset <= 0");
    }
    const elementHeight = element.offsetHeight;
    const pages = Math.ceil(elementHeight / windowHeight);
    if (pages === 1) {
      // no need to animate if only one page
      // we also have a maximum page count display
      return 0;
    }
    if (pages < 0) {
      throw Error("Negative page count");
    }
    if (pages > opts.maxPages) {
      throw Error(`Exceeded max page count of ${opts.maxPages}`);
    }

    const scrollHeight = Math.ceil((elementHeight - windowHeight) / (pages - 1));
    const params = {
      pages,
      windowHeight,
      elementHeight,
      scrollHeight
    };
    // console.log(params);

    element.style.transition = "margin " + opts.pageSlideTime + "ms";

    animate();
    return setInterval(() => {
      animate();
    }, opts.pageHoldTime * pages);
  }
}

module.exports = SignageScroll;
