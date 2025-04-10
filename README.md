# Interactive Unit Circle

An interactive web application that visualizes the unit circle, helping students learn and explore trigonometric concepts. This educational tool is perfect for Algebra 2 and Trigonometry students to understand angles, coordinates, and trigonometric functions.

Live demo: `https://tartuke.github.io/unit-circle-visualizer/`

## Features

- **Interactive Visualization**: Drag points around the unit circle to see real-time updates
- **Comprehensive Information**: View angle measurements in degrees and radians
- **Trigonometric Values**: See sin, cos, tan, csc, sec, and cot values update in real-time
- **Reference Triangle**: Visualize the reference angle and understand quadrants
- **Pin Important Angles**: Save specific angles for reference
- **Customizable Display**: Toggle various visual elements on/off

## Technologies Used

- TypeScript
- Bun - JavaScript runtime & package manager
- HTML5 Canvas for visualization
- CSS3 for styling

## Installation

This project uses [Bun](https://bun.sh) as its JavaScript runtime and package manager.

1. Install Bun if you haven't already:

   ```bash
   curl -fsSL https://bun.sh/install | bash
   ```

2. Clone the repository:

   ```bash
   git clone https://github.com/tartuke/unit-circle-visualizer.git
   cd unit-circle-visualizer
   ```

3. Install dependencies:
   ```bash
   bun install
   ```

## Running Locally

Start the development server:

```bash
bun run index.ts
```

Then open your browser and navigate to [http://localhost:3001](http://localhost:3001)

## Project Structure

- `index.ts` - Server code for local development
- `docs/index.html` - HTML file for GitHub Pages
- `docs/styles.css` - Styling for the application
- `docs/unitCircle.js` - JavaScript code for the interactive unit circle
- `LICENSE` - MIT License file

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Acknowledgments

- Created as an educational tool for mathematics students
- Inspired by the need for interactive learning resources in trigonometry
