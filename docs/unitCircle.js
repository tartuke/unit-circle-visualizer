/**
 * Interactive Unit Circle - A learning tool for Algebra 2 students
 * Visualizes angles, coordinates, and trigonometric functions on the unit circle
 *
 * Changes in v1.1.0:
 * - Simplified coordinate transformation methods
 * - Improved event handling with better performance
 * - Optimized angle calculations and special value detection
 * - Enhanced code readability and maintainability
 * - Reduced code duplication in utility functions
 *
 * @author Tartuke
 * @version 1.1.0
 */

class UnitCircle {
  /** @type {HTMLCanvasElement} Canvas element */
  canvas;
  /** @type {CanvasRenderingContext2D} Canvas 2D context */
  ctx;

  /** @type {number} Canvas width in pixels */
  width = 0;
  /** @type {number} Canvas height in pixels */
  height = 0;
  /** @type {number} Canvas X coordinate of the circle's center */
  centerX = 0;
  /** @type {number} Canvas Y coordinate of the circle's center */
  centerY = 0;
  /** @type {number} Radius of the unit circle in pixels */
  radius = 0;

  /** @type {Array} Special angles data with exact values */
  specialAngles = [];

  /** @type {boolean} Whether mouse/touch is actively interacting near the circle */
  isInteractionActive = false;
  /** @type {Object} Pointer position (mouse or touch) in canvas coordinates */
  pointerCanvasPos = { x: 0, y: 0 };
  /** @type {boolean} Flag to track if touch has moved significantly */
  touchMoved = false;
  /** @type {number} Current angle in standard math radians (0 right, counter-clockwise) */
  currentAngle = 0;
  /** @type {Object} Current point on circle in canvas coordinates */
  currentPoint = { x: 0, y: 0 };
  /** @type {Array} Pinned angles with their data */
  pinnedAngles = [];
  /** @type {number} Next ID to assign to a pinned angle */
  nextPinId = 1;
  /** @type {number|null} Currently selected pin ID */
  selectedPinId = null;
  /** @type {number|null} ID of the pinned angle being hovered over */
  hoveredPinId = null;
  /** @type {number} Distance threshold for detecting clicks on pinned angles (in pixels) */
  pinClickThreshold = 15;
  /** @type {number} Multiplier for the radius to determine the interaction area */
  interactionRadiusMultiplier = 1.3;

  /** @type {Object} Display options */
  options = {
    showDegrees: true,
    showRadians: true,
    showCoordinates: true,
    showRefTriangle: true,
    snapToAngles: true,
    showExtraTrig: false,
    showRefAngle: true,
    showQuadrant: true,
    showAngleArcs: true,
  };

  /** @type {Object} Color scheme */
  colors = {
    static: "rgba(136, 136, 136, 1)",
    staticFaded: "rgba(136, 136, 136, 0.2)",
    hover: "#3498db",
    pinned: "#27ae60",
    axis: "#aaaaaa",
    grid: "#eeeeee",
    standardArc: "rgba(231, 76, 60, 0.8)",
    referenceArc: "rgba(46, 204, 113, 0.8)",
  };

  /** @type {number} Tolerance for snapping to special angles in radians */
  snapTolerance = 0.02;

  /**
   * Constructor - Initializes the unit circle visualization
   */
  constructor() {
    this.initCanvas();
    this.initSpecialAngles();
    this.setupEventListeners(); // Will now set up both mouse and touch
    this.setupControlListeners();
    this.updatePinnedAnglesList();
    this.draw();
  }

  // ===== COORDINATE TRANSFORMATIONS =====

  /**
   * Convert Canvas coordinates (origin top-left, +y down) to
   * Math coordinates (origin at circle center, +y up).
   * @param {number} canvasX - X coordinate relative to canvas top-left
   * @param {number} canvasY - Y coordinate relative to canvas top-left
   * @returns {{x: number, y: number}} Math coordinates relative to center
   */
  canvasToMath(canvasX, canvasY) {
    return {
      x: canvasX - this.centerX,
      y: this.centerY - canvasY, // Invert Y axis
    };
  }

  /**
   * Convert Math coordinates (origin at circle center, +y up) to
   * Canvas coordinates (origin top-left, +y down).
   * @param {number} mathX - X coordinate relative to circle center
   * @param {number} mathY - Y coordinate relative to circle center
   * @returns {{x: number, y: number}} Canvas coordinates relative to top-left
   */
  mathToCanvas(mathX, mathY) {
    return {
      x: mathX + this.centerX,
      y: this.centerY - mathY, // Invert Y axis
    };
  }

  // ===== INITIALIZATION =====

  /**
   * Initialize the canvas element and context
   */
  initCanvas() {
    this.canvas = document.getElementById("unitCircleCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  /**
   * Resize the canvas to fit its container and recalculate dimensions
   */
  resizeCanvas() {
    const container = this.canvas.parentElement;
    const rect = container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.radius = Math.min(this.width, this.height) * 0.4;
    this.draw();
  }

  /**
   * Initialize the special angles data with exact values
   */
  initSpecialAngles() {
    this.specialAngles = [
      {
        radians: 0,
        degrees: 0,
        coords: { x: 1, y: 0 },
        exactCoordsStr: "(1, 0)",
      },
      {
        radians: Math.PI / 6,
        degrees: 30,
        coords: { x: Math.sqrt(3) / 2, y: 1 / 2 },
        exactCoordsStr: "(√3/2, 1/2)",
      },
      {
        radians: Math.PI / 4,
        degrees: 45,
        coords: { x: Math.sqrt(2) / 2, y: Math.sqrt(2) / 2 },
        exactCoordsStr: "(√2/2, √2/2)",
      },
      {
        radians: Math.PI / 3,
        degrees: 60,
        coords: { x: 1 / 2, y: Math.sqrt(3) / 2 },
        exactCoordsStr: "(1/2, √3/2)",
      },
      {
        radians: Math.PI / 2,
        degrees: 90,
        coords: { x: 0, y: 1 },
        exactCoordsStr: "(0, 1)",
      },
      {
        radians: (2 * Math.PI) / 3,
        degrees: 120,
        coords: { x: -1 / 2, y: Math.sqrt(3) / 2 },
        exactCoordsStr: "(-1/2, √3/2)",
      },
      {
        radians: (3 * Math.PI) / 4,
        degrees: 135,
        coords: { x: -Math.sqrt(2) / 2, y: Math.sqrt(2) / 2 },
        exactCoordsStr: "(-√2/2, √2/2)",
      },
      {
        radians: (5 * Math.PI) / 6,
        degrees: 150,
        coords: { x: -Math.sqrt(3) / 2, y: 1 / 2 },
        exactCoordsStr: "(-√3/2, 1/2)",
      },
      {
        radians: Math.PI,
        degrees: 180,
        coords: { x: -1, y: 0 },
        exactCoordsStr: "(-1, 0)",
      },
      {
        radians: (7 * Math.PI) / 6,
        degrees: 210,
        coords: { x: -Math.sqrt(3) / 2, y: -1 / 2 },
        exactCoordsStr: "(-√3/2, -1/2)",
      },
      {
        radians: (5 * Math.PI) / 4,
        degrees: 225,
        coords: { x: -Math.sqrt(2) / 2, y: -Math.sqrt(2) / 2 },
        exactCoordsStr: "(-√2/2, -√2/2)",
      },
      {
        radians: (4 * Math.PI) / 3,
        degrees: 240,
        coords: { x: -1 / 2, y: -Math.sqrt(3) / 2 },
        exactCoordsStr: "(-1/2, -√3/2)",
      },
      {
        radians: (3 * Math.PI) / 2,
        degrees: 270,
        coords: { x: 0, y: -1 },
        exactCoordsStr: "(0, -1)",
      },
      {
        radians: (5 * Math.PI) / 3,
        degrees: 300,
        coords: { x: 1 / 2, y: -Math.sqrt(3) / 2 },
        exactCoordsStr: "(1/2, -√3/2)",
      },
      {
        radians: (7 * Math.PI) / 4,
        degrees: 315,
        coords: { x: Math.sqrt(2) / 2, y: -Math.sqrt(2) / 2 },
        exactCoordsStr: "(√2/2, -√2/2)",
      },
      {
        radians: (11 * Math.PI) / 6,
        degrees: 330,
        coords: { x: Math.sqrt(3) / 2, y: -1 / 2 },
        exactCoordsStr: "(√3/2, -1/2)",
      },
    ];
    // Calculate trigonometric values for each special angle
    this.specialAngles.forEach((angle) => {
      const { x, y } = angle.coords;
      angle.sin = y;
      angle.cos = x;
      angle.tan = x === 0 ? Infinity : y / x;
      angle.csc = y === 0 ? Infinity : 1 / y;
      angle.sec = x === 0 ? Infinity : 1 / x;
      angle.cot = y === 0 ? Infinity : x / y;
      angle.sinStr = this.getExactTrigString(angle.sin);
      angle.cosStr = this.getExactTrigString(angle.cos);
      angle.tanStr = this.getExactTrigString(angle.tan);
      angle.cscStr = this.getExactTrigString(angle.csc);
      angle.secStr = this.getExactTrigString(angle.sec);
      angle.cotStr = this.getExactTrigString(angle.cot);
    });
  }

  /**
   * Convert a numeric trigonometric value to its exact string representation
   * @param {number} value - The trigonometric value
   * @returns {string} The exact string representation
   */
  getExactTrigString(value) {
    // Handle special cases
    if (value === 0) return "0";
    if (value === 1) return "1";
    if (value === -1) return "-1";
    if (value === Infinity || value === -Infinity || isNaN(value))
      return "undefined";

    // Define common exact values with their string representations
    const exactValues = [
      { value: 0.5, str: "1/2" },
      { value: Math.sqrt(3) / 2, str: "√3/2" },
      { value: Math.sqrt(2) / 2, str: "√2/2" },
      { value: 1 / Math.sqrt(3), str: "1/√3" },
      { value: Math.sqrt(3), str: "√3" },
    ];

    // Check for matches with a small tolerance
    const tolerance = 1e-4;

    // Check positive values
    for (const exact of exactValues) {
      if (Math.abs(value - exact.value) < tolerance) {
        return exact.str;
      }
      // Check negative values
      if (Math.abs(value + exact.value) < tolerance) {
        return "-" + exact.str;
      }
    }

    // Default to fixed precision for non-exact values
    return value.toFixed(3);
  }

  // ===== EVENT HANDLING =====

  /**
   * Get pointer coordinates relative to the canvas, handling both mouse and touch events.
   * @param {MouseEvent|TouchEvent} e - The event object
   * @returns {{x: number, y: number}|null} Canvas coordinates or null if no touch point
   */
  getPointerPosition(e) {
    const rect = this.canvas.getBoundingClientRect();
    let clientX, clientY;

    // Extract client coordinates based on event type
    if (e.touches?.length > 0) {
      // First touch point for touchstart/touchmove
      ({ clientX, clientY } = e.touches[0]);
    } else if (e.changedTouches?.length > 0) {
      // First touch point for touchend/touchcancel
      ({ clientX, clientY } = e.changedTouches[0]);
    } else if (e.clientX !== undefined) {
      // Mouse event
      ({ clientX, clientY } = e);
    } else {
      return null; // No pointer data
    }

    // Convert to canvas coordinates
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  /**
   * Central handler for pointer movement (mouse or touch).
   * Updates the angle and redraws.
   * @param {number} canvasX - X coordinate relative to canvas top-left
   * @param {number} canvasY - Y coordinate relative to canvas top-left
   */
  handlePointerMove(canvasX, canvasY) {
    this.pointerCanvasPos = { x: canvasX, y: canvasY };
    let needsRedraw = false;
    let needsInfoUpdate = false;

    // Check if hovering over a pinned angle
    const nearestPinId = this.findNearestPinnedAngle(canvasX, canvasY);
    const hoverChanged = nearestPinId !== this.hoveredPinId;

    if (hoverChanged) {
      this.hoveredPinId = nearestPinId;
      this.canvas.style.cursor =
        nearestPinId !== null ? "pointer" : "crosshair";
      needsRedraw = true;
    }

    // If a pin is selected, just update hover state but don't change the angle
    if (this.selectedPinId !== null) {
      if (needsRedraw) this.draw();
      return;
    }

    // Calculate distance from center to determine if interaction is active
    const mathPointerPos = this.canvasToMath(canvasX, canvasY);
    const distanceFromCenter = Math.hypot(mathPointerPos.x, mathPointerPos.y);
    const wasActive = this.isInteractionActive;

    // Update active state if pointer is near the circle
    this.isInteractionActive =
      distanceFromCenter <= this.radius * this.interactionRadiusMultiplier;

    if (wasActive !== this.isInteractionActive) {
      needsRedraw = true;
      needsInfoUpdate = true;
    }

    // Update angle and position if interaction is active
    if (this.isInteractionActive) {
      // Calculate angle in standard position (0 to 2π)
      let angle = Math.atan2(mathPointerPos.y, mathPointerPos.x);
      if (angle < 0) angle += 2 * Math.PI;

      // Snap to special angles if enabled
      if (this.options.snapToAngles) {
        const closestAngle = this.findClosestSpecialAngle(angle);
        if (closestAngle) angle = closestAngle.radians;
      }

      // Only update if angle changed significantly
      if (Math.abs(this.currentAngle - angle) > 0.001) {
        this.currentAngle = angle;

        // Calculate point on circle
        const currentMathPoint = {
          x: Math.cos(this.currentAngle) * this.radius,
          y: Math.sin(this.currentAngle) * this.radius,
        };
        this.currentPoint = this.mathToCanvas(
          currentMathPoint.x,
          currentMathPoint.y
        );

        needsRedraw = true;
        needsInfoUpdate = true;
      }
    }

    // Update UI if needed
    if (needsInfoUpdate) this.updateInfoPanel();
    if (needsRedraw) this.draw();
  }

  /**
   * Handle pointer down (mousedown or touchstart).
   * @param {MouseEvent|TouchEvent} e
   */
  handlePointerDown(e) {
    const pos = this.getPointerPosition(e);
    if (!pos) return;

    if (e.type === "touchstart") {
      // Prevent page scrolling when interacting with the canvas
      e.preventDefault();
      this.touchMoved = false; // Reset touch movement flag
    }

    // Check distance immediately on down event
    const mathPointerPos = this.canvasToMath(pos.x, pos.y);
    const distanceFromCenter = Math.hypot(mathPointerPos.x, mathPointerPos.y);
    this.isInteractionActive =
      distanceFromCenter <= this.radius * this.interactionRadiusMultiplier;

    // Update visuals immediately based on press location
    if (this.isInteractionActive) {
      this.handlePointerMove(pos.x, pos.y);
    }
  }

  /**
   * Handle pointer up (mouseup or touchend).
   * Handles pinning logic for taps/clicks.
   * @param {MouseEvent|TouchEvent} e
   */
  handlePointerUp(e) {
    const pos = this.getPointerPosition(e); // Get final position
    if (!pos) return;

    // First, check if we're clicking on a pinned angle
    const clickedPinId = this.findNearestPinnedAngle(pos.x, pos.y);

    // Check distance from center for other operations
    const mathPointerPos = this.canvasToMath(pos.x, pos.y);
    const distanceFromCenter = Math.sqrt(
      Math.pow(mathPointerPos.x, 2) + Math.pow(mathPointerPos.y, 2)
    );
    const wasActive = this.isInteractionActive; // Remember if interaction was active before clearing

    // Case 1: Clicked on a pinned angle
    if (clickedPinId !== null) {
      // If we clicked on the currently selected pin, unselect it
      if (clickedPinId === this.selectedPinId) {
        this.selectedPinId = null;
      } else {
        // Otherwise, select the clicked pin
        this.selectedPinId = clickedPinId;
      }
      this.updatePinnedAnglesList();
      this.updateInfoPanel();
      this.draw();
      this.handlePointerMove(pos.x, pos.y); // Update hover state
      return; // Exit after handling the pinned angle click
    }

    // Case 2: A pin is selected and we're clicking elsewhere on the circle
    if (
      this.selectedPinId !== null &&
      wasActive &&
      distanceFromCenter <= this.radius * this.interactionRadiusMultiplier
    ) {
      this.selectedPinId = null;
      this.updatePinnedAnglesList();
      this.updateInfoPanel();
      this.draw();
      this.handlePointerMove(pos.x, pos.y);
      return; // Exit after unselecting to require a second click to pin a new angle
    }

    // Case 3: No pin is selected and we're clicking on the circle to create a new pin
    if (
      this.selectedPinId === null &&
      wasActive &&
      distanceFromCenter <= this.radius * this.interactionRadiusMultiplier
    ) {
      if (e.type === "mouseup" || (e.type === "touchend" && !this.touchMoved)) {
        const angleInfo = this.getCurrentAngleInfo();
        const newPinId = this.nextPinId++;
        this.pinnedAngles.push({
          id: newPinId,
          angle: this.currentAngle,
          point: { ...this.currentPoint },
          angleInfo: angleInfo,
        });
        // Immediately select the newly pinned angle
        this.selectedPinId = newPinId;
        this.updatePinnedAnglesList();
        this.updateInfoPanel(); // Update info panel with the selected pin's data
        this.draw(); // Redraw to show the pinned angle immediately
      }
    }

    // Reset interaction state after handling potential pin
    this.handlePointerEnd();
  }

  /**
   * Handle pointer end (mouseleave, mouseout, touchend, touchcancel).
   * Cleans up interaction state and redraws.
   */
  handlePointerEnd() {
    // Only deactivate and redraw if interaction was previously active
    // to avoid unnecessary redraws on mouseout far from circle.
    if (this.isInteractionActive || this.hoveredPinId !== null) {
      this.isInteractionActive = false;
      this.hoveredPinId = null; // Reset hover state
      this.canvas.style.cursor = "crosshair"; // Reset cursor
      this.draw(); // Redraw to remove hover effects
      this.updateInfoPanel(); // Clear panel if nothing selected
    }
    this.touchMoved = false; // Reset touch flag regardless
  }

  /**
   * Set up mouse and touch event listeners for the canvas
   */
  setupEventListeners() {
    // Mouse Events
    this.canvas.addEventListener(
      "mousedown",
      this.handlePointerDown.bind(this)
    );
    this.canvas.addEventListener("mousemove", (e) => {
      const pos = this.getPointerPosition(e);
      if (pos) this.handlePointerMove(pos.x, pos.y);
    });
    // Use mouseup on document to catch drags ending outside canvas
    document.addEventListener("mouseup", this.handlePointerUp.bind(this));
    // Use mouseleave on canvas to stop interaction if pointer leaves canvas
    this.canvas.addEventListener(
      "mouseleave",
      this.handlePointerEnd.bind(this)
    );

    // Touch Events
    this.canvas.addEventListener(
      "touchstart",
      this.handlePointerDown.bind(this),
      { passive: false }
    ); // Need passive: false to preventDefault
    this.canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault(); // Prevent scroll during canvas drag
        const pos = this.getPointerPosition(e);
        if (pos) {
          this.touchMoved = true; // Flag that touch has moved
          this.handlePointerMove(pos.x, pos.y);
        }
      },
      { passive: false }
    );
    this.canvas.addEventListener("touchend", this.handlePointerUp.bind(this));
    this.canvas.addEventListener(
      "touchcancel",
      this.handlePointerEnd.bind(this)
    );

    // Window Resize
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  /**
   * Set up event listeners for UI controls
   */
  setupControlListeners() {
    document.getElementById("clearPinsBtn").addEventListener("click", () => {
      this.pinnedAngles = [];
      this.selectedPinId = null;
      this.updatePinnedAnglesList();
      this.draw();
    });
    document
      .getElementById("showDegreesCheck")
      .addEventListener("change", (e) => {
        this.options.showDegrees = e.target.checked;
        this.draw();
      });
    document
      .getElementById("showRadiansCheck")
      .addEventListener("change", (e) => {
        this.options.showRadians = e.target.checked;
        this.draw();
      });
    document
      .getElementById("showCoordinatesCheck")
      .addEventListener("change", (e) => {
        this.options.showCoordinates = e.target.checked;
        this.draw();
      });
    document
      .getElementById("showRefTriangleCheck")
      .addEventListener("change", (e) => {
        this.options.showRefTriangle = e.target.checked;
        this.draw();
      });
    document
      .getElementById("snapToAnglesCheck")
      .addEventListener("change", (e) => {
        this.options.snapToAngles = e.target.checked;
      }); // No redraw needed just for snap toggle
    document
      .getElementById("showAngleArcsCheck")
      .addEventListener("change", (e) => {
        this.options.showAngleArcs = e.target.checked;
        this.draw();
      });
    document
      .getElementById("showExtraTrigCheck")
      .addEventListener("change", (e) => {
        this.options.showExtraTrig = e.target.checked;
        document
          .getElementById("extraTrigValues")
          .classList.toggle("hide", !e.target.checked);
        this.updateInfoPanel();
      });
    document
      .getElementById("showRefAngleCheck")
      .addEventListener("change", (e) => {
        this.options.showRefAngle = e.target.checked;
        this.updateInfoPanel();
      });
    document
      .getElementById("showQuadrantCheck")
      .addEventListener("change", (e) => {
        this.options.showQuadrant = e.target.checked;
        this.updateInfoPanel();
      });
  }

  // ===== CALCULATIONS & DATA HANDLING =====

  /**
   * Find the closest special angle to the given angle
   * @param {number} angle - The angle in radians
   * @returns {Object|null} The closest special angle or null if none found
   */
  findClosestSpecialAngle(angle) {
    if (!this.options.snapToAngles) return null;

    return (
      this.specialAngles.reduce((closest, specialAngle) => {
        // Calculate angular difference (accounting for circular wrap-around)
        let difference = Math.abs(specialAngle.radians - angle);
        if (difference > Math.PI) difference = 2 * Math.PI - difference;

        // Update closest if this angle is closer than previous closest
        if (
          difference < this.snapTolerance &&
          (!closest || difference < closest.difference)
        ) {
          return { angle: specialAngle, difference };
        }
        return closest;
      }, null)?.angle || null
    );
  }

  /**
   * Get detailed information about the current angle
   * @returns {Object} Angle information including trig values
   */
  getCurrentAngleInfo() {
    const closestAngle = this.findClosestSpecialAngle(this.currentAngle);
    if (closestAngle) {
      // Return special angle exact values (already calculated)
      return { ...closestAngle, isExact: true };
    } else {
      // Calculate approximate values based on current math angle
      const x = Math.cos(this.currentAngle);
      const y = Math.sin(this.currentAngle);
      const tan = Math.abs(x) < 1e-10 ? Infinity : y / x; // Avoid division by near zero
      const csc = Math.abs(y) < 1e-10 ? Infinity : 1 / y;
      const sec = Math.abs(x) < 1e-10 ? Infinity : 1 / x;
      const cot = Math.abs(y) < 1e-10 ? Infinity : x / y; // Check y for cot
      return {
        radians: this.currentAngle,
        degrees: (this.currentAngle * 180) / Math.PI,
        coords: { x, y },
        exactCoordsStr: null,
        sin: y,
        cos: x,
        tan: tan,
        csc: csc,
        sec: sec,
        cot: cot,
        sinStr: this.getExactTrigString(y),
        cosStr: this.getExactTrigString(x),
        tanStr: this.getExactTrigString(tan),
        cscStr: this.getExactTrigString(csc),
        secStr: this.getExactTrigString(sec),
        cotStr: this.getExactTrigString(cot),
        isExact: false,
      };
    }
  }

  /**
   * Calculate the reference angle (angle in first quadrant)
   * @param {number} angle - The angle in radians
   * @returns {number} The reference angle in radians
   */
  calculateReferenceAngle(angle) {
    // Normalize angle to [0, 2π)
    const normalizedAngle =
      ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Calculate reference angle based on quadrant
    if (normalizedAngle <= Math.PI / 2) {
      // Quadrant I: angle is already the reference angle
      return normalizedAngle;
    } else if (normalizedAngle <= Math.PI) {
      // Quadrant II: reference angle is π - angle
      return Math.PI - normalizedAngle;
    } else if (normalizedAngle <= (3 * Math.PI) / 2) {
      // Quadrant III: reference angle is angle - π
      return normalizedAngle - Math.PI;
    } else {
      // Quadrant IV: reference angle is 2π - angle
      return 2 * Math.PI - normalizedAngle;
    }
  }

  /**
   * Determine which quadrant an angle is in
   * @param {number} angle - The angle in radians
   * @returns {string} The quadrant (I, II, III, IV) or axis
   */
  getQuadrant(angle) {
    // Normalize angle to [0, 2π)
    const normalizedAngle =
      ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

    // Check for special cases (on axes)
    const tolerance = 1e-10; // Small tolerance for floating-point comparison

    if (
      Math.abs(normalizedAngle) < tolerance ||
      Math.abs(normalizedAngle - Math.PI) < tolerance
    ) {
      return "X-Axis";
    }

    if (
      Math.abs(normalizedAngle - Math.PI / 2) < tolerance ||
      Math.abs(normalizedAngle - (3 * Math.PI) / 2) < tolerance
    ) {
      return "Y-Axis";
    }

    // Determine quadrant
    if (normalizedAngle < Math.PI / 2) return "I";
    if (normalizedAngle < Math.PI) return "II";
    if (normalizedAngle < (3 * Math.PI) / 2) return "III";
    return "IV";
  }

  /**
   * Update the information panel with current angle data
   */
  updateInfoPanel() {
    // Show info if interacting OR if a pin is selected
    if (!this.isInteractionActive && this.selectedPinId === null) {
      // Optionally clear the panel or show default/placeholder text
      // document.getElementById("degreesValue").textContent = "-";
      // ... clear other fields ...
      return; // Or clear fields before returning
    }

    let angleInfo;
    if (this.isInteractionActive) {
      angleInfo = this.getCurrentAngleInfo();
    } else if (this.selectedPinId !== null) {
      const selectedPin = this.pinnedAngles.find(
        (p) => p.id === this.selectedPinId
      );
      if (selectedPin) {
        angleInfo = selectedPin.angleInfo;
      } else {
        // Selected pin not found (shouldn't happen), clear panel
        this.selectedPinId = null;
        // ... clear fields ...
        return;
      }
    } else {
      // Should not be reached if the initial check passes, but good practice
      return;
    }

    const refAngle = this.calculateReferenceAngle(angleInfo.radians);
    const quadrant = this.getQuadrant(angleInfo.radians);

    document.getElementById(
      "degreesValue"
    ).textContent = `${angleInfo.degrees.toFixed(1)}°`;
    document.getElementById("radiansValue").textContent = angleInfo.isExact
      ? `${this.formatRadians(angleInfo.radians)} rad`
      : `${angleInfo.radians.toFixed(2)} rad`;
    document.getElementById("coordinatesValue").textContent =
      angleInfo.isExact && angleInfo.exactCoordsStr
        ? angleInfo.exactCoordsStr
        : `(${angleInfo.coords.x.toFixed(2)}, ${angleInfo.coords.y.toFixed(
            2
          )})`;
    document.getElementById("sinValue").textContent = angleInfo.isExact
      ? angleInfo.sinStr
      : angleInfo.sin.toFixed(3);
    document.getElementById("cosValue").textContent = angleInfo.isExact
      ? angleInfo.cosStr
      : angleInfo.cos.toFixed(3);
    document.getElementById("tanValue").textContent = angleInfo.isExact
      ? angleInfo.tanStr
      : angleInfo.tan === Infinity || isNaN(angleInfo.tan) // Check for NaN too
      ? "undefined"
      : angleInfo.tan.toFixed(3);

    if (this.options.showExtraTrig) {
      document.getElementById("cscValue").textContent = angleInfo.isExact
        ? angleInfo.cscStr
        : angleInfo.csc === Infinity || isNaN(angleInfo.csc)
        ? "undefined"
        : angleInfo.csc.toFixed(3);
      document.getElementById("secValue").textContent = angleInfo.isExact
        ? angleInfo.secStr
        : angleInfo.sec === Infinity || isNaN(angleInfo.sec)
        ? "undefined"
        : angleInfo.sec.toFixed(3);
      document.getElementById("cotValue").textContent = angleInfo.isExact
        ? angleInfo.cotStr
        : angleInfo.cot === Infinity || isNaN(angleInfo.cot)
        ? "undefined"
        : angleInfo.cot.toFixed(3);
    }
    if (this.options.showRefAngle) {
      const refRadFormatted = this.formatRadians(refAngle); // Format ref angle too
      const refDeg = (refAngle * 180) / Math.PI;
      document.getElementById("refAngleValue").textContent = `${refDeg.toFixed(
        1
      )}° / ${refRadFormatted} rad`;
    } else {
      document.getElementById("refAngleValue").textContent = "-";
    }
    if (this.options.showQuadrant) {
      document.getElementById("quadrantValue").textContent = quadrant;
    } else {
      document.getElementById("quadrantValue").textContent = "-";
    }
  }

  /**
   * Format radians as exact fractions of π when possible
   * @param {number} radians - The angle in radians
   * @returns {string} Formatted string representation
   */
  formatRadians(radians) {
    const pi = Math.PI;
    const tolerance = 0.001; // Tolerance for matching fractions

    // Handle special cases
    if (Math.abs(radians) < tolerance) return "0";
    if (Math.abs(radians - pi) < tolerance) return "π";
    if (Math.abs(radians - 2 * pi) < tolerance) return "2π";

    // Common fractions to check (numerator/denominator pairs)
    const fractions = [
      { num: 1, den: 6 }, // π/6 (30°)
      { num: 1, den: 4 }, // π/4 (45°)
      { num: 1, den: 3 }, // π/3 (60°)
      { num: 1, den: 2 }, // π/2 (90°)
      { num: 2, den: 3 }, // 2π/3 (120°)
      { num: 3, den: 4 }, // 3π/4 (135°)
      { num: 5, den: 6 }, // 5π/6 (150°)
      { num: 7, den: 6 }, // 7π/6 (210°)
      { num: 5, den: 4 }, // 5π/4 (225°)
      { num: 4, den: 3 }, // 4π/3 (240°)
      { num: 3, den: 2 }, // 3π/2 (270°)
      { num: 5, den: 3 }, // 5π/3 (300°)
      { num: 7, den: 4 }, // 7π/4 (315°)
      { num: 11, den: 6 }, // 11π/6 (330°)
    ];

    // Check each fraction
    for (const { num, den } of fractions) {
      const fracValue = (num * pi) / den;
      if (Math.abs(radians - fracValue) < tolerance) {
        return num === 1 ? `π/${den}` : `${num}π/${den}`;
      }
    }

    return radians.toFixed(2); // Fallback for non-exact values
  }

  // ===== PINNED ANGLE LIST MANAGEMENT =====

  /**
   * Update the pinned angles list in the UI
   */
  updatePinnedAnglesList() {
    const listElement = document.getElementById("pinnedAnglesList");
    listElement.innerHTML = "";
    if (this.pinnedAngles.length === 0) {
      listElement.innerHTML =
        '<li class="empty-list-message">No angles pinned yet</li>';
      return;
    }
    this.pinnedAngles.forEach((pin) => {
      const listItem = document.createElement("li");
      listItem.dataset.id = pin.id;
      listItem.className = pin.id === this.selectedPinId ? "selected" : "";
      const angleText = document.createElement("span");
      angleText.textContent = `${pin.angleInfo.degrees.toFixed(
        1
      )}° (${this.formatRadians(pin.angle)})`;
      listItem.appendChild(angleText);
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-pin";
      deleteBtn.textContent = "×";
      deleteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.deletePinnedAngle(pin.id);
      });
      listItem.appendChild(deleteBtn);
      listItem.addEventListener("click", () => {
        this.selectPinnedAngle(pin.id);
      });
      listElement.appendChild(listItem);
    });
  }

  /**
   * Delete a pinned angle by its ID
   * @param {number} id - The ID of the pinned angle to delete
   */
  deletePinnedAngle(id) {
    this.pinnedAngles = this.pinnedAngles.filter((angle) => angle.id !== id);
    if (id === this.selectedPinId) {
      this.selectedPinId = null;
      this.updateInfoPanel(); // Update panel if deselected
    }
    this.updatePinnedAnglesList();
    this.draw();
  }

  /**
   * Select or deselect a pinned angle
   * @param {number} id - The ID of the pinned angle to select
   */
  selectPinnedAngle(id) {
    this.selectedPinId = this.selectedPinId === id ? null : id; // Toggle selection
    this.updatePinnedAnglesList();
    this.updateInfoPanel(); // Update panel with selected info
    this.draw();
  }

  /**
   * Check if a point is near a pinned angle
   * @param {number} x - X coordinate in canvas space
   * @param {number} y - Y coordinate in canvas space
   * @returns {number|null} ID of the nearest pinned angle within threshold, or null if none
   */
  findNearestPinnedAngle(x, y) {
    if (this.pinnedAngles.length === 0) return null;

    let nearestId = null;
    let minDistance = this.pinClickThreshold;

    // Check each pinned angle
    for (const pin of this.pinnedAngles) {
      // First check distance to the endpoint (higher priority)
      const pointDistance = Math.hypot(pin.point.x - x, pin.point.y - y);

      if (pointDistance < minDistance) {
        minDistance = pointDistance;
        nearestId = pin.id;
        continue; // Skip line check if point is close enough
      }

      // If endpoint is not close enough, check distance to the line
      const lineDistance = this.distanceToLineSegment(
        this.centerX,
        this.centerY, // Line start (center)
        pin.point.x,
        pin.point.y, // Line end (pin point)
        x,
        y // Test point
      );

      if (lineDistance < minDistance) {
        minDistance = lineDistance;
        nearestId = pin.id;
      }
    }

    return nearestId;
  }

  /**
   * Calculate the distance from a point to a line segment
   * @param {number} x1 - Line segment start X
   * @param {number} y1 - Line segment start Y
   * @param {number} x2 - Line segment end X
   * @param {number} y2 - Line segment end Y
   * @param {number} px - Point X
   * @param {number} py - Point Y
   * @returns {number} The shortest distance from the point to the line segment
   */
  distanceToLineSegment(x1, y1, x2, y2, px, py) {
    // Calculate the squared length of the line segment
    const lengthSquared = (x2 - x1) ** 2 + (y2 - y1) ** 2;

    // If the line segment is actually a point, return distance to that point
    if (lengthSquared === 0) return Math.hypot(px - x1, py - y1);

    // Calculate projection parameter (t) of point onto the infinite line
    // t < 0: closest to start point, t > 1: closest to end point, 0 <= t <= 1: closest to segment
    const dotProduct = (px - x1) * (x2 - x1) + (py - y1) * (y2 - y1);
    const t = Math.max(0, Math.min(1, dotProduct / lengthSquared));

    // Calculate closest point on line segment
    const projectionX = x1 + t * (x2 - x1);
    const projectionY = y1 + t * (y2 - y1);

    // Return distance to closest point
    return Math.hypot(px - projectionX, py - projectionY);
  }

  // ===== DRAWING FUNCTIONS =====

  /**
   * Main draw loop - clears and redraws all elements
   */
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    this.drawCircle();
    this.drawAxes();
    // Fade static labels if actively interacting
    this.drawSpecialAngles(this.isInteractionActive);

    // Draw elements for the selected pin FIRST if one exists
    const selectedPin =
      this.selectedPinId !== null
        ? this.pinnedAngles.find((p) => p.id === this.selectedPinId)
        : null;

    if (selectedPin) {
      // Draw arcs for selected angle
      if (this.options.showAngleArcs) {
        this.drawAngleArcs(selectedPin.angleInfo);
      }
      // Draw triangle for selected angle
      if (this.options.showRefTriangle) {
        this.drawReferenceTriangle(
          selectedPin.point.x,
          selectedPin.point.y,
          this.colors.hover
        ); // Use highlight color for selected
      }
    }

    // Draw *all* pinned angles (selected one will be drawn over slightly differently)
    this.drawPinnedAngles();

    // Draw current interaction effects if active AND no pin is selected (avoid overlap)
    if (this.isInteractionActive && !selectedPin) {
      this.drawCurrentAngle(); // Includes triangle, arcs (if enabled) for hover state
    }

    // If a pin IS selected, draw its highlight effects (overwrites generic pinned point)
    if (selectedPin) {
      this.drawPinnedAngleHighlight(selectedPin);
    }
  }

  /**
   * Draw the background grid
   */
  drawGrid() {
    this.ctx.strokeStyle = this.colors.grid;
    this.ctx.lineWidth = 1;
    const gridSize = this.radius / 5;
    const numLines =
      Math.ceil(Math.max(this.width, this.height) / gridSize) + 1;
    this.ctx.beginPath();
    for (let i = -numLines; i <= numLines; i++) {
      const x = this.centerX + i * gridSize;
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.height);
    }
    for (let i = -numLines; i <= numLines; i++) {
      const y = this.centerY + i * gridSize;
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.width, y);
    }
    this.ctx.stroke();
  }

  /**
   * Draw the unit circle
   */
  drawCircle() {
    this.ctx.strokeStyle = this.colors.static;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  /**
   * Draw the coordinate axes
   */
  drawAxes() {
    this.ctx.strokeStyle = this.colors.axis;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.centerY);
    this.ctx.lineTo(this.width, this.centerY);
    this.ctx.stroke(); // X-axis
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, 0);
    this.ctx.lineTo(this.centerX, this.height);
    this.ctx.stroke(); // Y-axis
    this.ctx.font = "14px Arial";
    this.ctx.fillStyle = this.colors.axis;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    // this.ctx.fillText("x", this.width - 15, this.centerY + 15);
    // this.ctx.fillText("y", this.centerX - 15, 15);
    const tickLength = 8;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX + this.radius, this.centerY - tickLength / 2);
    this.ctx.lineTo(this.centerX + this.radius, this.centerY + tickLength / 2);
    this.ctx.stroke();
    this.ctx.moveTo(this.centerX - this.radius, this.centerY - tickLength / 2);
    this.ctx.lineTo(this.centerX - this.radius, this.centerY + tickLength / 2);
    this.ctx.stroke();
    this.ctx.moveTo(this.centerX - tickLength / 2, this.centerY - this.radius);
    this.ctx.lineTo(this.centerX + tickLength / 2, this.centerY - this.radius);
    this.ctx.stroke();
    this.ctx.moveTo(this.centerX - tickLength / 2, this.centerY + this.radius);
    this.ctx.lineTo(this.centerX + tickLength / 2, this.centerY + this.radius);
    this.ctx.stroke();
    this.ctx.textAlign = "start";
    this.ctx.textBaseline = "alphabetic"; // Reset
  }

  /**
   * Draw the special angles markers and labels
   * @param {boolean} faded - Whether to draw labels faded
   */
  drawSpecialAngles(faded = false) {
    // Added faded parameter
    const labelDistFactor = 1.15;
    const markerRadius = 4;
    const baseOpacity = faded ? 0.2 : 1.0; // Use parameter
    const baseColor = this.colors.static.replace(
      /,[^,)]+\)/,
      `, ${baseOpacity})`
    ); // Adjust alpha
    this.ctx.font = "12px Arial";

    for (const angle of this.specialAngles) {
      const mathMarkerX = Math.cos(angle.radians) * this.radius;
      const mathMarkerY = Math.sin(angle.radians) * this.radius;
      const mathLabelX =
        Math.cos(angle.radians) * this.radius * labelDistFactor;
      const mathLabelY =
        Math.sin(angle.radians) * this.radius * labelDistFactor;

      const canvasMarker = this.mathToCanvas(mathMarkerX, mathMarkerY);
      const canvasLabel = this.mathToCanvas(mathLabelX, mathLabelY);

      // Draw marker dot
      this.ctx.fillStyle = baseColor;
      this.ctx.beginPath();
      this.ctx.arc(
        canvasMarker.x,
        canvasMarker.y,
        markerRadius,
        0,
        2 * Math.PI
      );
      this.ctx.fill();

      // Draw labels
      this.ctx.fillStyle = baseColor;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      const yOffset1 = -8;
      const yOffset2 = 8;
      let line1Text = "";
      let line2Text = "";

      if (this.options.showDegrees && this.options.showRadians) {
        line1Text = `${angle.degrees}° | ${this.formatRadians(angle.radians)}`;
      } else if (this.options.showDegrees) {
        line1Text = `${angle.degrees}°`;
      } else if (this.options.showRadians) {
        line1Text = this.formatRadians(angle.radians);
      }

      if (this.options.showCoordinates) {
        line2Text = angle.exactCoordsStr;
      }

      if (line1Text) {
        this.ctx.fillText(
          line1Text,
          canvasLabel.x,
          canvasLabel.y + (line2Text ? yOffset1 : 0)
        ); // Center if only one line
      }
      if (line2Text) {
        this.ctx.fillText(
          line2Text,
          canvasLabel.x,
          canvasLabel.y + (line1Text ? yOffset2 : 0)
        ); // Center if only one line
      }

      this.ctx.textAlign = "start";
      this.ctx.textBaseline = "alphabetic";
    }
  }

  /**
   * Draw all pinned angles (basic markers)
   */
  drawPinnedAngles() {
    if (this.pinnedAngles.length === 0) return;

    for (const pin of this.pinnedAngles) {
      const { id, point } = pin;
      const isSelected = id === this.selectedPinId;
      const isHovered = id === this.hoveredPinId;

      // Determine color and style based on state (selected > hovered > normal)
      let color;
      let lineWidth;

      if (isSelected) {
        color = this.colors.hover;
        lineWidth = 2.5;
      } else if (isHovered) {
        color = this.colors.hover;
        lineWidth = 2;
      } else {
        color = this.colors.pinned;
        lineWidth = 1;
      }

      // If hovered or selected, draw a subtle glow effect first
      if (isHovered || isSelected) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth + 2;
        this.ctx.globalAlpha = 0.3; // Transparent for glow effect

        this.ctx.beginPath();
        this.ctx.moveTo(this.centerX, this.centerY);
        this.ctx.lineTo(point.x, point.y);
        this.ctx.stroke();

        this.ctx.globalAlpha = 1.0; // Reset transparency
      }

      // Draw the main line
      this.ctx.strokeStyle = color;
      this.ctx.fillStyle = color;
      this.ctx.lineWidth = lineWidth;

      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(point.x, point.y);
      this.ctx.stroke();

      // Draw arrow head
      const arrowSize = isSelected ? 14 : isHovered ? 12 : 10;
      const angle = Math.atan2(point.y - this.centerY, point.x - this.centerX);
      this.ctx.beginPath();
      this.ctx.moveTo(point.x, point.y);
      this.ctx.lineTo(
        point.x - arrowSize * Math.cos(angle - Math.PI / 6),
        point.y - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(
        point.x - arrowSize * Math.cos(angle + Math.PI / 6),
        point.y - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.closePath();
      this.ctx.fill();

      // If hovered or selected, draw the angle label
      if ((isHovered && !isSelected) || isSelected) {
        this.drawHoverAngleLabel(pin.angleInfo, point.x, point.y, isSelected);
      }
    }
    this.ctx.lineWidth = 1; // Reset
  }

  /**
   * Draw highlight effects for the currently selected pinned angle
   * @param {object} pin - The selected pin object
   */
  drawPinnedAngleHighlight(pin) {
    if (!pin) return;
    const { point, angleInfo } = pin;

    // Draw larger circle and label for the selected pin
    this.ctx.strokeStyle = this.colors.hover;
    this.ctx.fillStyle = this.colors.hover;
    this.ctx.lineWidth = 3; // Thicker line for selected highlight

    // Redraw line (thicker)
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(point.x, point.y);
    this.ctx.stroke();

    // Draw arrow head (larger for selected)
    const arrowSize = 14;
    const angle = Math.atan2(point.y - this.centerY, point.x - this.centerX);
    this.ctx.beginPath();
    this.ctx.moveTo(point.x, point.y);
    this.ctx.lineTo(
      point.x - arrowSize * Math.cos(angle - Math.PI / 6),
      point.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      point.x - arrowSize * Math.cos(angle + Math.PI / 6),
      point.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fill();

    // Draw label
    this.drawHoverAngleLabel(angleInfo, point.x, point.y, true); // Pass flag for selected

    this.ctx.lineWidth = 1; // Reset
  }

  /**
   * Draw the current hover angle effects
   */
  drawCurrentAngle() {
    // Should only be called when isInteractionActive is true and no pin is selected

    const angleInfo = this.getCurrentAngleInfo();

    // Draw reference triangle if enabled
    if (this.options.showRefTriangle) {
      this.drawReferenceTriangle(
        this.currentPoint.x,
        this.currentPoint.y,
        this.colors.hover
      );
    }

    // Draw terminal line
    this.ctx.strokeStyle = this.colors.hover;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
    this.ctx.stroke();

    // Draw arrow head
    const arrowSize = 10;
    const angle = Math.atan2(
      this.currentPoint.y - this.centerY,
      this.currentPoint.x - this.centerX
    );
    this.ctx.fillStyle = this.colors.hover;
    this.ctx.beginPath();
    this.ctx.moveTo(this.currentPoint.x, this.currentPoint.y);
    this.ctx.lineTo(
      this.currentPoint.x - arrowSize * Math.cos(angle - Math.PI / 6),
      this.currentPoint.y - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    this.ctx.lineTo(
      this.currentPoint.x - arrowSize * Math.cos(angle + Math.PI / 6),
      this.currentPoint.y - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    this.ctx.closePath();
    this.ctx.fill();

    // Draw angle label
    this.drawHoverAngleLabel(
      angleInfo,
      this.currentPoint.x,
      this.currentPoint.y,
      false // Not a selected pin
    );

    // Draw angle arcs if hovering and option enabled
    if (this.options.showAngleArcs) {
      this.drawAngleArcs(angleInfo);
    }
  }

  /**
   * Draw the standard angle arc and reference angle arc
   * @param {object} angleInfo - Object containing angle details
   */
  drawAngleArcs(angleInfo) {
    const mathAngle = angleInfo.radians; // Current MATH angle (0 to 2PI)
    // Ensure angle is strictly within [0, 2PI) for consistent quadrant/logic checks
    const normalizedMathAngle =
      ((mathAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    const degrees = angleInfo.degrees; // Degrees for labels

    const refAngleRad = this.calculateReferenceAngle(normalizedMathAngle); // Reference angle in radians (always positive, <= PI/2)
    const refAngleDeg = (refAngleRad * 180) / Math.PI;
    const quadrant = this.getQuadrant(normalizedMathAngle);

    const standardArcRadius = this.radius * 0.2;
    const referenceArcRadius = this.radius * 0.35; // Slightly further out
    const labelOffsetFactor = 1.3; // How far out labels are from arc radius
    const arcLineWidth = 2;
    const labelFont = "bold 12px Arial";

    this.ctx.lineWidth = arcLineWidth;
    this.ctx.font = labelFont;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";

    // --- Draw Standard Angle Arc (θ) ---
    // Draw clockwise (default) from 0 to the negative of the math angle
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.colors.standardArc;
    this.ctx.arc(
      this.centerX,
      this.centerY,
      standardArcRadius,
      0, // Canvas start angle (3 o'clock)
      -normalizedMathAngle, // Canvas end angle (negative math angle)
      true // Clockwise
    );
    this.ctx.stroke();

    // Add arrow head at end of arc
    const arrowSize = 10;
    const endX =
      this.centerX + standardArcRadius * Math.cos(-normalizedMathAngle);
    const endY =
      this.centerY + standardArcRadius * Math.sin(-normalizedMathAngle);
    const angle = (-normalizedMathAngle - Math.PI / 2) / 1; // Perpendicular to radius at end point

    // Draw arrow head
    if (Math.abs(degrees) > 0.1) {
      this.ctx.moveTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
      );
      this.ctx.lineTo(endX, endY);
      this.ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
      );
      this.ctx.stroke();
    }

    // Standard angle label (numeric degrees) - Placement uses MATH angle midpoint
    // Avoid placing label directly at 0 or 2PI if angle is tiny
    const standardLabelAngleMid =
      Math.abs(normalizedMathAngle) < 0.01 ? 0 : normalizedMathAngle / 2;
    const mathLabelPosStd = {
      x:
        Math.cos(standardLabelAngleMid) * standardArcRadius * labelOffsetFactor,
      y:
        Math.sin(standardLabelAngleMid) * standardArcRadius * labelOffsetFactor,
    };
    const canvasLabelPosStd = this.mathToCanvas(
      mathLabelPosStd.x,
      mathLabelPosStd.y
    );
    this.ctx.fillStyle = this.colors.standardArc;
    // Don't draw 0 degree label if it's exactly 0 to avoid clutter
    if (Math.abs(degrees) > 0.1) {
      this.ctx.fillText(
        `${degrees.toFixed(0)}°`,
        canvasLabelPosStd.x,
        canvasLabelPosStd.y
      );
    }

    // --- Determine and Draw Reference Angle Arc (θ') ---
    let refStartCanvas = 0; // Canvas angle where ref arc starts
    let refEndCanvas = 0; // Canvas angle where ref arc ends
    let refLabelAngleMid = 0; // Math angle for placing the reference label midpoint
    let needsRefArcDraw = true; // Flag to control drawing the arc line

    // Calculate start/end for CW drawing and the math midpoint for the label
    switch (quadrant) {
      case "I":
        // Ref arc is from angle back to 0 axis.
        refStartCanvas = 0; // Start at angle
        refEndCanvas = -normalizedMathAngle; // End at 0 axis
        refLabelAngleMid = normalizedMathAngle / 2; // Midpoint in Q1
        // Don't draw a separate line, it overlaps standard arc visually
        // needsRefArcDraw = Math.abs(normalizedMathAngle) < 0.01; // Only draw if angle is near 0 (optional)
        break;
      case "II":
        // Ref arc is from PI axis back to angle.
        refStartCanvas = -normalizedMathAngle; // Start at PI axis (canvas angle)
        refEndCanvas = -Math.PI; // End at angle
        refLabelAngleMid = (Math.PI + normalizedMathAngle) / 2; // Midpoint between PI and angle
        break;
      case "III":
        // Ref arc is from PI axis forward to angle.
        refStartCanvas = -Math.PI; // Start at PI axis
        refEndCanvas = -normalizedMathAngle; // End at angle
        refLabelAngleMid = (Math.PI + normalizedMathAngle) / 2; // Midpoint between PI and angle
        break;
      case "IV":
        // Ref arc is from angle back to 2PI (0) axis.
        refStartCanvas = -normalizedMathAngle; // Start at angle
        refEndCanvas = -2 * Math.PI; // End at 2PI axis (equiv. to 0 CW)
        // Midpoint between angle and 2PI (label placement needs care near 360)
        refLabelAngleMid = (normalizedMathAngle + 2 * Math.PI) / 2;
        // Adjust midpoint if it wraps past 2PI for cleaner positioning
        if (refLabelAngleMid >= 2 * Math.PI) refLabelAngleMid -= 2 * Math.PI;
        break;
      case "X-Axis":
        // No reference arc needed for angles exactly on the X-axis.
        needsRefArcDraw = false;
        refLabelAngleMid = normalizedMathAngle; // Set midpoint for potential label if needed (usually not)
        break;
      case "Y-Axis":
        if (normalizedMathAngle < Math.PI) {
          // show refence angle for angles exactly on the Y-axis
          refStartCanvas = 0; // Start at angle
          refEndCanvas = -normalizedMathAngle; // End at 0 axis
          refLabelAngleMid = normalizedMathAngle / 2;
        } else {
          refStartCanvas = -Math.PI; // Start at PI axis
          refEndCanvas = -normalizedMathAngle; // End at angle
          refLabelAngleMid = (Math.PI + normalizedMathAngle) / 2; // Midpoint between PI and angle
        }
        break;
    }

    // Draw the reference arc line if needed
    if (needsRefArcDraw) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = this.colors.referenceArc;
      this.ctx.arc(
        this.centerX,
        this.centerY,
        referenceArcRadius,
        refStartCanvas,
        refEndCanvas,
        true // Clockwise
      );
      this.ctx.stroke();
    }

    // Draw Reference Angle Label (θ') - Don't draw if angle is exactly on axis
    if (Math.abs(refAngleRad) > 0.01) {
      // Check ref angle isn't zero
      const mathLabelPosRef = {
        x: Math.cos(refLabelAngleMid) * referenceArcRadius * labelOffsetFactor,
        y: Math.sin(refLabelAngleMid) * referenceArcRadius * labelOffsetFactor,
      };
      const canvasLabelPosRef = this.mathToCanvas(
        mathLabelPosRef.x,
        mathLabelPosRef.y
      );
      this.ctx.fillStyle = this.colors.referenceArc;
      this.ctx.fillText(
        `${refAngleDeg.toFixed(0)}°`, // Use calculated reference angle degrees
        canvasLabelPosRef.x,
        canvasLabelPosRef.y
      );
    }

    // Reset defaults
    this.ctx.lineWidth = 1;
    this.ctx.textAlign = "start";
    this.ctx.textBaseline = "alphabetic";
    this.ctx.font = "10px sans-serif"; // Reset font if needed
  }

  /**
   * Draw an angle label near a point
   * @param {object} angleInfo - Angle information object
   * @param {number} canvasPointX - X coordinate in canvas space
   * @param {number} canvasPointY - Y coordinate in canvas space
   * @param {boolean} isSelected - Whether this is a selected angle (affects styling)
   */
  drawHoverAngleLabel(
    angleInfo,
    canvasPointX,
    canvasPointY,
    isSelected = false
  ) {
    // angleInfo contains MATH angle/degrees
    const angleText =
      angleInfo.isExact && angleInfo.exactCoordsStr
        ? angleInfo.exactCoordsStr
        : `(${angleInfo.coords.x.toFixed(2)}, ${angleInfo.coords.y.toFixed(
            2
          )})`;
    const offset = isSelected ? 35 : 30; // Slightly larger offset for selected angles

    // Calculate offset direction using the MATH angle
    const mathVectorX = Math.cos(angleInfo.radians);
    const mathVectorY = Math.sin(angleInfo.radians);

    // Calculate label position relative to the CANVAS point
    // Need to invert mathVectorY because canvas Y is down
    const labelX = canvasPointX + mathVectorX * offset;
    const labelY = canvasPointY - mathVectorY * offset; // Use MINUS mathVectorY

    // Draw background with slightly different opacity for selected angles
    this.ctx.fillStyle = isSelected
      ? "rgba(255, 255, 255, 0.9)"
      : "rgba(255, 255, 255, 0.8)";
    this.ctx.font = isSelected ? "bold 14px Arial" : "14px Arial";
    const textWidth = this.ctx.measureText(angleText).width;
    this.ctx.fillRect(
      labelX - textWidth / 2 - 4,
      labelY - 10,
      textWidth + 8,
      20
    ); // Adjust Y pos slightly

    // Draw text
    this.ctx.fillStyle = this.colors.hover;
    this.ctx.textAlign = "center";
    this.ctx.textBaseline = "middle";
    this.ctx.fillText(angleText, labelX, labelY);

    // Reset text alignment
    this.ctx.textAlign = "start";
    this.ctx.textBaseline = "alphabetic";
  }

  /**
   * Draw reference triangle
   * @param {number} canvasPointX - X coordinate in canvas space
   * @param {number} canvasPointY - Y coordinate in canvas space
   * @param {string} color - Color to use for the triangle (defaults to hover color)
   */
  drawReferenceTriangle(canvasPointX, canvasPointY, color = null) {
    this.ctx.strokeStyle = color || this.colors.hover;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 3]);

    this.ctx.beginPath();
    this.ctx.moveTo(canvasPointX, canvasPointY);
    this.ctx.lineTo(canvasPointX, this.centerY); // Line to X-axis
    this.ctx.stroke();

    this.ctx.beginPath();
    this.ctx.moveTo(canvasPointX, this.centerY);
    this.ctx.lineTo(this.centerX, this.centerY); // Line along X-axis to center
    this.ctx.stroke();

    this.ctx.setLineDash([]);
    this.ctx.lineWidth = 1; // Reset
  }
}

// Initialize the unit circle when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  new UnitCircle();
});
