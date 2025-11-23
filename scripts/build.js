const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const distDir = path.resolve(__dirname, '../dist');
const outputFile = path.join(distDir, 'atlas.js');

const css = `
.atlas-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.atlas-tile-pane {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.atlas-overlay-pane,
.atlas-marker-pane,
.atlas-popup-pane {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.atlas-marker-icon {
  width: 25px;
  height: 41px;
  background-image: url('https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png');
  background-size: 25px 41px;
  margin-left: -12px;
  margin-top: -41px;
}

.atlas-popup {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 3px 14px rgba(0,0,0,0.4);
  z-index: 10;
  white-space: nowrap;
}
`;

const cssInjection = `
(function() {
  const style = document.createElement('style');
  style.type = 'text/css';
  style.innerHTML = \`${css}\`;
  document.head.appendChild(style);
})();
`;

esbuild.build({
  entryPoints: ['src/Atlas.js'],
  bundle: true,
  outfile: outputFile,
  format: 'iife',
  globalName: 'Atlas',
  footer: {
    js: cssInjection,
  },
}).catch(() => process.exit(1));

console.log('Build complete: dist/atlas.js');
