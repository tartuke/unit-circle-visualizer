// /public/unitCircle.js
/**
 * Interactive Unit Circle - A learning tool for Algebra 2 students
 * Visualizes angles, coordinates, and trigonometric functions on the unit circle
 */

// Main class for the Unit Circle component
class UnitCircle {
  // Canvas and context
  canvas;
  ctx;

  // Canvas dimensions and center point
  width = 0;
  height = 0;
  centerX = 0; // Canvas X coordinate of the circle's center
  centerY = 0; // Canvas Y coordinate of the circle's center
  radius = 0; // Radius in pixels

  // Special angles data
  specialAngles = [];

  // Interactions state
  isMouseOverCircle = false;
  mouseCanvasPos = { x: 0, y: 0 }; // Mouse position in Canvas coordinates
  currentAngle = 0; // Angle in standard math radians (0 right, counter-clockwise)
  // currentPoint stores CANVAS coordinates for drawing the hover/pinned point
  currentPoint = { x: 0, y: 0 };
  pinnedAngles = []; // Stores { id, angle, point (canvas coords), angleInfo }
  nextPinId = 1;
  selectedPinId = null;

  // Options state (unchanged)
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

  // Colors (unchanged)
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

  // Snap tolerance (unchanged)
  snapTolerance = 0.05;

  /**
   * Constructor (unchanged)
   */
  constructor() {
    this.initCanvas();
    this.initSpecialAngles();
    this.setupEventListeners();
    this.setupControlListeners();
    this.updatePinnedAnglesList(); // Initialize the pinned angles list
    this.draw();
  }

  // --- Coordinate Transformation ---

  /**
   * Convert Canvas coordinates (origin top-left, +y down) to
   * Math coordinates (origin at circle center, +y up).
   * @param {number} canvasX - X coordinate relative to canvas top-left.
   * @param {number} canvasY - Y coordinate relative to canvas top-left.
   * @returns {{x: number, y: number}} Math coordinates relative to center.
   */
  canvasToMath(canvasX, canvasY) {
    const mathX = canvasX - this.centerX;
    const mathY = this.centerY - canvasY; // Invert Y axis
    return { x: mathX, y: mathY };
  }

  /**
   * Convert Math coordinates (origin at circle center, +y up) to
   * Canvas coordinates (origin top-left, +y down).
   * @param {number} mathX - X coordinate relative to circle center.
   * @param {number} mathY - Y coordinate relative to circle center.
   * @returns {{x: number, y: number}} Canvas coordinates relative to top-left.
   */
  mathToCanvas(mathX, mathY) {
    const canvasX = mathX + this.centerX;
    const canvasY = this.centerY - mathY; // Invert Y axis
    return { x: canvasX, y: canvasY };
  }

  // --- Initialization --- (initCanvas, resizeCanvas, initSpecialAngles, getExactTrigString remain the same)
  initCanvas() {
    this.canvas = document.getElementById("unitCircleCanvas");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

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

  initSpecialAngles() {
    // Definition of specialAngles array... (no changes needed here)
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
    // Calculation of trig values... (no changes needed here)
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

  getExactTrigString(value) {
    // No changes needed
    if (value === 0) return "0";
    if (value === 1) return "1";
    if (value === -1) return "-1";
    if (value === Infinity || value === -Infinity) return "undefined";
    if (Math.abs(value - 0.5) < 1e-4) return "1/2";
    if (Math.abs(value + 0.5) < 1e-4) return "-1/2";
    if (Math.abs(value - Math.sqrt(3) / 2) < 1e-4) return "√3/2";
    if (Math.abs(value + Math.sqrt(3) / 2) < 1e-4) return "-√3/2";
    if (Math.abs(value - Math.sqrt(2) / 2) < 1e-4) return "√2/2";
    if (Math.abs(value + Math.sqrt(2) / 2) < 1e-4) return "-√2/2";
    if (Math.abs(value - 1 / Math.sqrt(3)) < 1e-4) return "1/√3";
    if (Math.abs(value + 1 / Math.sqrt(3)) < 1e-4) return "-1/√3";
    if (Math.abs(value - Math.sqrt(3)) < 1e-4) return "√3";
    if (Math.abs(value + Math.sqrt(3)) < 1e-4) return "-√3";
    return value.toFixed(3); // Default precision
  }

  // --- Event Handling ---

  setupEventListeners() {
    this.canvas.addEventListener("mousemove", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      // 1. Get mouse position relative to canvas top-left
      const canvasMouseX = e.clientX - rect.left;
      const canvasMouseY = e.clientY - rect.top;
      this.mouseCanvasPos = { x: canvasMouseX, y: canvasMouseY };

      // 2. Convert to Math coordinates (origin center, +y up)
      const mathMousePos = this.canvasToMath(canvasMouseX, canvasMouseY);

      // 3. Check distance from center using Math coordinates
      const distanceFromCenter = Math.sqrt(
        Math.pow(mathMousePos.x, 2) + Math.pow(mathMousePos.y, 2)
      );
      this.isMouseOverCircle = distanceFromCenter <= this.radius * 1.1; // Allow slight margin

      // 4. Calculate angle using Math coordinates with atan2(y, x)
      let angle = Math.atan2(mathMousePos.y, mathMousePos.x);
      // Ensure angle is [0, 2PI)
      if (angle < 0) angle += 2 * Math.PI;

      // 5. Handle snapping (using the calculated math angle)
      if (this.options.snapToAngles) {
        const closestAngle = this.findClosestSpecialAngle(angle);
        if (closestAngle) {
          angle = closestAngle.radians;
        }
      }

      // 6. Update state
      this.currentAngle = angle; // Store the final math angle

      // 7. Calculate the point on the circle in MATH coordinates
      const currentMathPoint = {
        x: Math.cos(this.currentAngle) * this.radius,
        y: Math.sin(this.currentAngle) * this.radius,
      };
      // 8. Convert the math point to CANVAS coordinates for drawing/storing
      this.currentPoint = this.mathToCanvas(
        currentMathPoint.x,
        currentMathPoint.y
      );

      // Update info panel and redraw
      this.updateInfoPanel();
      this.draw();
    });

    this.canvas.addEventListener("mouseout", () => {
      this.isMouseOverCircle = false;
      this.draw(); // Redraw to remove hover effects
    });

    this.canvas.addEventListener("click", () => {
      if (this.isMouseOverCircle) {
        const angleInfo = this.getCurrentAngleInfo();
        this.pinnedAngles.push({
          id: this.nextPinId++,
          angle: this.currentAngle, // Store math angle
          point: { ...this.currentPoint }, // Store CANVAS coordinates
          angleInfo: angleInfo, // Store full info object
        });
        this.updatePinnedAnglesList();
        this.draw();
      }
    });
  }

  setupControlListeners() {
    // No changes needed here
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

  // --- Calculations & Data Handling --- (findClosestSpecialAngle, getCurrentAngleInfo, calculateReferenceAngle, getQuadrant, updateInfoPanel, formatRadians remain the same)

  findClosestSpecialAngle(angle) {
    // No changes needed
    if (!this.options.snapToAngles) return null;
    let closestAngle = null;
    let minDifference = this.snapTolerance;
    for (const specialAngle of this.specialAngles) {
      let difference = Math.abs(specialAngle.radians - angle);
      if (difference > Math.PI) difference = 2 * Math.PI - difference;
      if (difference < minDifference) {
        minDifference = difference;
        closestAngle = specialAngle;
      }
    }
    return closestAngle;
  }

  getCurrentAngleInfo() {
    // No changes needed, works with this.currentAngle (math angle)
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

  calculateReferenceAngle(angle) {
    // No changes needed
    let refAngle = angle % (2 * Math.PI);
    if (refAngle < 0) refAngle += 2 * Math.PI; // Ensure positive
    if (refAngle >= 0 && refAngle <= Math.PI / 2) return refAngle;
    if (refAngle > Math.PI / 2 && refAngle <= Math.PI)
      return Math.PI - refAngle;
    if (refAngle > Math.PI && refAngle <= (3 * Math.PI) / 2)
      return refAngle - Math.PI;
    return 2 * Math.PI - refAngle;
  }

  getQuadrant(angle) {
    // No changes needed
    const normalizedAngle =
      ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI); // Ensure [0, 2PI)
    if (normalizedAngle === 0 || normalizedAngle === Math.PI) return "X-Axis"; // Or handle axes specifically
    if (
      normalizedAngle === Math.PI / 2 ||
      normalizedAngle === (3 * Math.PI) / 2
    )
      return "Y-Axis";
    if (normalizedAngle > 0 && normalizedAngle < Math.PI / 2) return "I";
    if (normalizedAngle > Math.PI / 2 && normalizedAngle < Math.PI) return "II";
    if (normalizedAngle > Math.PI && normalizedAngle < (3 * Math.PI) / 2)
      return "III";
    return "IV";
  }

  updateInfoPanel() {
    // No changes needed, uses getCurrentAngleInfo
    if (!this.isMouseOverCircle && this.selectedPinId === null) return; // Don't update if nothing active

    let angleInfo;
    if (this.isMouseOverCircle) {
      angleInfo = this.getCurrentAngleInfo();
    } else if (this.selectedPinId !== null) {
      const selectedPin = this.pinnedAngles.find(
        (p) => p.id === this.selectedPinId
      );
      if (selectedPin) {
        angleInfo = selectedPin.angleInfo; // Use stored info for selected pin
      } else {
        return; // Should not happen if selectedPinId is valid
      }
    } else {
      return; // No hover, no selection
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
      : angleInfo.tan === Infinity
      ? "undefined"
      : angleInfo.tan.toFixed(3);

    if (this.options.showExtraTrig) {
      document.getElementById("cscValue").textContent = angleInfo.isExact
        ? angleInfo.cscStr
        : angleInfo.csc === Infinity
        ? "undefined"
        : angleInfo.csc.toFixed(3);
      document.getElementById("secValue").textContent = angleInfo.isExact
        ? angleInfo.secStr
        : angleInfo.sec === Infinity
        ? "undefined"
        : angleInfo.sec.toFixed(3);
      document.getElementById("cotValue").textContent = angleInfo.isExact
        ? angleInfo.cotStr
        : angleInfo.cot === Infinity
        ? "undefined"
        : angleInfo.cot.toFixed(3);
    }
    if (this.options.showRefAngle) {
      document.getElementById("refAngleValue").textContent = `${(
        (refAngle * 180) /
        Math.PI
      ).toFixed(1)}° / ${
        angleInfo.isExact
          ? `${this.formatRadians(angleInfo.radians)} rad`
          : `${(angleInfo.radians / Math.PI).toFixed(2)}π rad`
      }`;
    } else {
      document.getElementById("refAngleValue").textContent = "-"; // Hide if not shown
    }
    if (this.options.showQuadrant) {
      document.getElementById("quadrantValue").textContent = quadrant;
    } else {
      document.getElementById("quadrantValue").textContent = "-"; // Hide if not shown
    }
  }

  formatRadians(radians) {
    // No changes needed
    const pi = Math.PI;
    const tolerance = 0.001; // Tolerance for matching fractions
    const fractions = [2, 3, 4, 6]; // Denominators to check

    if (Math.abs(radians) < tolerance) return "0";
    if (Math.abs(radians - pi) < tolerance) return "π";
    if (Math.abs(radians - 2 * pi) < tolerance) return "2π";

    for (const d of fractions) {
      for (let n = 1; n < 2 * d; n++) {
        // Check numerators
        if (Math.abs(radians - (n * pi) / d) < tolerance) {
          if (n === 1) return `π/${d}`;
          // Potential simplification needed here for gcd, e.g. 4pi/6 -> 2pi/3
          // Basic implementation for now:
          return `${n}π/${d}`;
        }
      }
    }
    return radians.toFixed(2); // Fallback
  }

  // --- Pinned Angle List Management --- (updatePinnedAnglesList, deletePinnedAngle, selectPinnedAngle remain the same)
  updatePinnedAnglesList() {
    // No changes needed
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

  deletePinnedAngle(id) {
    // No changes needed
    this.pinnedAngles = this.pinnedAngles.filter((angle) => angle.id !== id);
    if (id === this.selectedPinId) {
      this.selectedPinId = null;
      this.updateInfoPanel(); // Update panel if deselected
    }
    this.updatePinnedAnglesList();
    this.draw();
  }

  selectPinnedAngle(id) {
    // No changes needed
    this.selectedPinId = this.selectedPinId === id ? null : id; // Toggle selection
    this.updatePinnedAnglesList();
    this.updateInfoPanel(); // Update panel with selected info
    this.draw();
  }

  // --- Drawing Functions ---

  /**
   * Main draw loop
   */
  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    this.drawGrid();
    this.drawCircle();
    this.drawAxes();
    this.drawSpecialAngles(); // Uses mathToCanvas internally

    // Draw arcs for selected angle (if any and option enabled)
    if (this.options.showAngleArcs && this.selectedPinId !== null) {
      const selectedPin = this.pinnedAngles.find(
        (p) => p.id === this.selectedPinId
      );
      if (selectedPin) {
        this.drawAngleArcs(selectedPin.angleInfo); // Uses math angles
      }
    }

    // Draw triangle for selected angle (if any and option enabled)
    if (this.options.showRefTriangle && this.selectedPinId !== null) {
      const selectedPin = this.pinnedAngles.find(
        (p) => p.id === this.selectedPinId
      );
      if (selectedPin) {
        this.drawReferenceTriangle(selectedPin.point.x, selectedPin.point.y); // Uses canvas point
      }
    }

    this.drawPinnedAngles(); // Uses stored CANVAS coordinates

    // Draw current hover effects if mouse is over circle
    if (this.isMouseOverCircle) {
      this.drawCurrentAngle(); // Calculates and uses mathToCanvas
    }
  }

  drawGrid() {
    // No changes needed
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

  drawCircle() {
    // No changes needed
    this.ctx.strokeStyle = this.colors.static;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI);
    this.ctx.stroke();
  }

  drawAxes() {
    // No changes needed
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
   * Draw the special angles markers and labels using transformations
   */
  drawSpecialAngles() {
    const labelDistFactor = 1.15; // Distance factor for labels from center
    const markerRadius = 4;
    const opacity = this.isMouseOverCircle ? 0.2 : 1.0;
    this.ctx.font = "12px Arial"; // Slightly smaller font

    for (const angle of this.specialAngles) {
      // 1. Calculate math coordinates for marker and labels
      const mathMarkerX = Math.cos(angle.radians) * this.radius;
      const mathMarkerY = Math.sin(angle.radians) * this.radius;
      const mathLabelX =
        Math.cos(angle.radians) * this.radius * labelDistFactor;
      const mathLabelY =
        Math.sin(angle.radians) * this.radius * labelDistFactor;

      // 2. Convert math coordinates to canvas coordinates
      const canvasMarker = this.mathToCanvas(mathMarkerX, mathMarkerY);
      const canvasLabel = this.mathToCanvas(mathLabelX, mathLabelY);

      // 3. Draw marker dot at canvas coordinates
      this.ctx.fillStyle = `rgba(136, 136, 136, ${opacity})`;
      this.ctx.beginPath();
      this.ctx.arc(
        canvasMarker.x,
        canvasMarker.y,
        markerRadius,
        0,
        2 * Math.PI
      );
      this.ctx.fill();

      // 4. Draw labels near canvas label coordinates (adjust alignment)
      this.ctx.fillStyle = `rgba(136, 136, 136, ${opacity})`;
      this.ctx.textAlign = "center";
      this.ctx.textBaseline = "middle";

      const yOffset1 = -8; // Offset for first line (deg/rad)
      const yOffset2 = 8; // Offset for second line (coords)

      if (this.options.showDegrees && this.options.showRadians) {
        this.ctx.fillText(
          `${angle.degrees}° | ${this.formatRadians(angle.radians)}`,
          canvasLabel.x,
          canvasLabel.y + yOffset1
        );
      } else if (this.options.showDegrees) {
        this.ctx.fillText(
          `${angle.degrees}°`,
          canvasLabel.x,
          canvasLabel.y + yOffset1
        );
      } else if (this.options.showRadians) {
        this.ctx.fillText(
          this.formatRadians(angle.radians),
          canvasLabel.x,
          canvasLabel.y + yOffset1
        );
      }

      if (this.options.showCoordinates) {
        this.ctx.fillText(
          angle.exactCoordsStr,
          canvasLabel.x,
          canvasLabel.y + yOffset2
        );
      }
      this.ctx.textAlign = "start"; // Reset default
      this.ctx.textBaseline = "alphabetic";
    }
  }

  /**
   * Draw pinned angles using stored CANVAS coordinates
   */
  drawPinnedAngles() {
    if (this.pinnedAngles.length === 0) return;

    for (const pin of this.pinnedAngles) {
      // pin.point already stores CANVAS coordinates
      const { id, angle, point, angleInfo } = pin;
      const isSelected = id === this.selectedPinId;

      // Styles based on selection
      this.ctx.strokeStyle = isSelected
        ? this.colors.hover
        : this.colors.pinned;
      this.ctx.fillStyle = isSelected ? this.colors.hover : this.colors.pinned;
      this.ctx.lineWidth = isSelected ? 3 : 2;
      const pointRadius = isSelected ? 8 : 6;

      // Draw line (using canvas coords)
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(point.x, point.y);
      this.ctx.stroke();

      // Draw point (using canvas coords)
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, pointRadius, 0, 2 * Math.PI);
      this.ctx.fill();

      // Draw label only for selected pin (position relative to canvas point)
      if (isSelected) {
        this.drawHoverAngleLabel(angleInfo, point.x, point.y); // Reuse hover label logic
      }
    }
    this.ctx.lineWidth = 1; // Reset default maybe
  }

  /**
   * Draw the current angle effects (hover)
   */
  drawCurrentAngle() {
    // this.currentAngle is MATH angle
    // this.currentPoint is CANVAS coordinates of the point on the circle

    const angleInfo = this.getCurrentAngleInfo(); // Based on math angle

    // Draw reference triangle if enabled (uses canvas point)
    if (this.options.showRefTriangle) {
      this.drawReferenceTriangle(this.currentPoint.x, this.currentPoint.y);
    }

    // Draw terminal line (from canvas center to canvas point)
    this.ctx.strokeStyle = this.colors.hover;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.centerX, this.centerY);
    this.ctx.lineTo(this.currentPoint.x, this.currentPoint.y);
    this.ctx.stroke();

    // Draw hover point (at canvas point)
    this.ctx.fillStyle = this.colors.hover;
    this.ctx.beginPath();
    this.ctx.arc(this.currentPoint.x, this.currentPoint.y, 6, 0, 2 * Math.PI);
    this.ctx.fill();

    // Draw angle label near the hover point (using canvas point)
    this.drawHoverAngleLabel(
      angleInfo,
      this.currentPoint.x,
      this.currentPoint.y
    );

    // Draw angle arcs if hovering and option enabled (don't draw if showing selected arcs)
    if (this.options.showAngleArcs && this.selectedPinId === null) {
      this.drawAngleArcs(angleInfo); // Uses math angles
    }
  }

  /**
   * Draw the standard angle arc and reference angle arc.
   * Uses MATH angles for logic but converts to CANVAS angles for drawing.
   * Includes numeric labels for the angles.
   * Draws using the canvas default clockwise direction.
   *
   * @param {object} angleInfo - Object containing angle details (radians, degrees, etc.)
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
   * Draw an angle label near a point.
   * Takes CANVAS coordinates of the point as input.
   */
  drawHoverAngleLabel(angleInfo, canvasPointX, canvasPointY) {
    // angleInfo contains MATH angle/degrees
    const angleText = `${angleInfo.degrees.toFixed(1)}°`;
    const offset = 30;

    // Calculate offset direction using the MATH angle
    const mathVectorX = Math.cos(angleInfo.radians);
    const mathVectorY = Math.sin(angleInfo.radians);

    // Calculate label position relative to the CANVAS point
    // Need to invert mathVectorY because canvas Y is down
    const labelX = canvasPointX + mathVectorX * offset;
    const labelY = canvasPointY - mathVectorY * offset; // Use MINUS mathVectorY

    // Draw background
    this.ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    this.ctx.font = "14px Arial";
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
   * Draw reference triangle using CANVAS coordinates.
   */
  drawReferenceTriangle(canvasPointX, canvasPointY) {
    this.ctx.strokeStyle = this.colors.hover;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([5, 3]);

    // Draw from canvas point to canvas y-center on same x
    this.ctx.beginPath();
    this.ctx.moveTo(canvasPointX, canvasPointY);
    this.ctx.lineTo(canvasPointX, this.centerY);
    this.ctx.stroke();

    // Draw from canvas y-center to canvas center
    this.ctx.beginPath();
    this.ctx.moveTo(canvasPointX, this.centerY);
    this.ctx.lineTo(this.centerX, this.centerY);
    this.ctx.stroke();

    this.ctx.setLineDash([]); // Reset line dash
  }
}

// Wait for DOM to load before initializing
document.addEventListener("DOMContentLoaded", () => {
  new UnitCircle();
});
