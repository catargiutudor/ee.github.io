/*******************************************************
 1) Basic page styling
 *******************************************************/
 document.body.style.margin = '0';
 document.body.style.padding = '0';
 document.body.style.overflow = 'hidden';
 document.body.style.background = 'black';
 
 /*******************************************************
  2) Create the canvas and handle DPI scaling
  *******************************************************/
 const canvas = document.createElement('canvas');
 const ctx = canvas.getContext('2d');
 document.body.appendChild(canvas);
 
 let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2; // Initialize mouse position in the center
 
 document.addEventListener('mousemove', (e) => {
   mouseX = e.clientX;
   mouseY = e.clientY;
 });
 
 function setSizeAndDpr() {
   const dpr = window.devicePixelRatio || 1;
 
   // CSS size
   canvas.style.width = window.innerWidth + 'px';
   canvas.style.height = window.innerHeight + 'px';
 
   // Actual device-pixel size
   canvas.width = Math.floor(window.innerWidth * dpr);
   canvas.height = Math.floor(window.innerHeight * dpr);
 
   ctx.setTransform(1, 0, 0, 1, 0, 0);
   ctx.scale(dpr, dpr);
 
   columns = Math.floor(window.innerWidth / fontSize) + margin * 2;
   rows = Math.floor(window.innerHeight / fontSize) + margin * 4;
 
   ctx.font = `${fontSize}px Arial`;
   ctx.textBaseline = 'top';
 }
 
 /*******************************************************
  3) Matrix effect variables
  *******************************************************/
 const margin = 5;          // extra rows/cols beyond screen edges
 const fontSize = 21;       // integer px for crisper text
 let columns, rows;         // set after setSizeAndDpr()
 const gradientSteps = 50;  // Length of the fade trail
 
 let drops, speeds, staticBits;
 
 /*******************************************************
  4) Initialize data (drops, speeds, bits)
  *******************************************************/
 const characters = {
   japanese: "アカサタナハマヤラワイキシチニヒミリウクスツヌフムユルエケセテネヘメレオコソトノホモヨロ",
   chinese: "的一是在人有我他这中大来上个国到说时要就出会也那对可",
   russian: "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ",
   latin: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
   greek: "αβγδεζηθικλμνξοπρστυφχψω",
   hebrew: "אבגדהוזחטיכלמנסעפצקרשת",
   numbers: "0123456789"
 };
 
 function getRandomCharacter() {
   const allCharacters = characters.japanese + characters.chinese + characters.russian + characters.latin + characters.greek + characters.hebrew + characters.numbers;
   return allCharacters[Math.floor(Math.random() * allCharacters.length)];
 }
 
 function initMatrixData() {
   // Each column starts above the screen
   drops = Array(columns).fill(0).map(
     () => -Math.floor(Math.random() * rows) - gradientSteps
   );
 
   // Speeds ~0.1 to ~0.4
   speeds = Array.from({ length: columns }, () => Math.random() * 0.3 + 0.1);
 
   // Random mixed characters
   staticBits = Array.from({ length: columns }, () =>
     Array.from({ length: rows * 2 }, () => getRandomCharacter())
   );
 }
 
 /*******************************************************
  5) Parallax layers
  *******************************************************/
 const layers = [
   { xRatio: 0.0,  yRatio: 0.0,   scale: 1.0, opacity: 1.0, parallaxFactor: 5 },
   { xRatio: 0.05, yRatio: -0.05, scale: 0.85, opacity: 0.95, parallaxFactor: 10 },
   { xRatio: -0.05, yRatio: -0.1,  scale: 0.7, opacity: 0.9, parallaxFactor: 15 },
   { xRatio: 0.1,  yRatio: -0.15, scale: 0.5, opacity: 0.85, parallaxFactor: 20 },
   { xRatio: -0.1, yRatio: -0.2,  scale: 0.35, opacity: 0.8, parallaxFactor: 25 }
 ];
 
 /*******************************************************
  6) Draw a single layer
  *******************************************************/
 function drawLayer(offsetX, offsetY, scale, opacity, parallaxFactor) {
   ctx.save();
   ctx.translate(offsetX, offsetY);
   ctx.scale(scale, scale);
   ctx.globalAlpha = opacity;
 
   const layerColumns = Math.floor((window.innerWidth / scale) / fontSize) + margin * 2;
   const layerRows = Math.floor((window.innerHeight / scale) / fontSize) + margin * 4;
 
   const parallaxX = (mouseX / window.innerWidth - 0.5) * parallaxFactor;
   const parallaxY = (mouseY / window.innerHeight - 0.5) * parallaxFactor;
 
   for (let x = 0; x < layerColumns; x++) {
     const colIndex = x % columns;
     const y = Math.floor(drops[colIndex]);
 
     const renderX = x * fontSize + parallaxX;
     const renderY = y * fontSize + parallaxY;
 
     // Main bright bit
     if (y >= 0 && y < layerRows) {
       ctx.fillStyle = `rgba(0, 88, 232, ${opacity})`;
       ctx.fillText(staticBits[colIndex][y % rows], renderX, renderY);
     }
 
     // Fading trail above
     for (let i = 1; i <= gradientSteps; i++) {
       const fadeY = y - i;
       const renderFadeY = fadeY * fontSize + parallaxY;
 
       if (fadeY >= 0 && fadeY < layerRows) {
         const fadeOpacity = Math.max(1 - i / gradientSteps, 0) * opacity;
         ctx.fillStyle = `rgba(0, 88, 232, ${fadeOpacity})`;
         ctx.fillText(staticBits[colIndex][fadeY % rows], renderX, renderFadeY);
       }
     }
 
     if (Math.random() > 0.90) {
       drops[colIndex] += speeds[colIndex];
       if (drops[colIndex] >= layerRows + rows * 2) {
         drops[colIndex] = -Math.floor(Math.random() * rows) - gradientSteps;
       }
     }
   }
   ctx.restore();
 }
 
 /*******************************************************
  7) Draw all parallax layers
  *******************************************************/
 function drawMatrix() {
   ctx.fillStyle = 'black';
   ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
 
   layers.forEach(layer => {
     const offsetX = layer.xRatio * window.innerWidth;
     const offsetY = layer.yRatio * window.innerHeight;
     drawLayer(offsetX, offsetY, layer.scale, layer.opacity, layer.parallaxFactor);
   });
 
   // Add static noise filter
   addStaticNoise();
 }
 
 /*******************************************************
  8) Static Noise Filter (Optimized)
  *******************************************************/
 let cachedNoiseCanvas;
 
 function generateStaticNoise() {
   const noiseCanvas = document.createElement('canvas');
   noiseCanvas.width = canvas.width;
   noiseCanvas.height = canvas.height;
   const noiseCtx = noiseCanvas.getContext('2d');
 
   const imageData = noiseCtx.createImageData(canvas.width, canvas.height);
   const buffer = new Uint32Array(imageData.data.buffer);
 
   for (let i = 0; i < buffer.length; i++) {
     buffer[i] = Math.random() < 0.5 ? 0xff000000 : 0xffffffff;
   }
 
   noiseCtx.putImageData(imageData, 0, 0);
   return noiseCanvas;
 }
 
 function addStaticNoise() {
   if (!cachedNoiseCanvas) {
     cachedNoiseCanvas = generateStaticNoise(); // Generate once and cache
   }
   ctx.globalAlpha = 0.1; // Adjust transparency for the noise effect
   ctx.drawImage(cachedNoiseCanvas, 0, 0);
   ctx.globalAlpha = 1.0; // Reset alpha
 }
 
 /*******************************************************
  9) Animation
  *******************************************************/
 function animate() {
   requestAnimationFrame(animate);
   drawMatrix();
 }
 
 /*******************************************************
  10) Handle Resize
  *******************************************************/
 function onResize() {
   setSizeAndDpr();
   initMatrixData();
   cachedNoiseCanvas = null; // Regenerate noise on resize
 }
 
 // Initial setup
 onResize();
 animate();
 window.addEventListener('resize', onResize);
 