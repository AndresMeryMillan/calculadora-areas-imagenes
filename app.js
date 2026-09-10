const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');

const btnNewProject = document.getElementById('btnNewProject');
const imageUpload = document.getElementById('imageUpload');
const btnCalibrate = document.getElementById('btnCalibrate');
const btnDraw = document.getElementById('btnDraw');
const calibrationStatus = document.getElementById('calibrationStatus');
const instructionText = document.getElementById('instructionText');

const APP_STATES = {
    IDLE: 'idle',
    CALIBRATING: 'calibrating',
    DRAWING: 'drawing'
};

let currentState = APP_STATES.IDLE;
let loadedImage = null;
let imageRect = { x: 0, y: 0, width: 0, height: 0 }; 

// Calibration data
let scale = null; // { pixels: number, meters: number, factor: number }
let calibPoints = []; // [ {x,y}, {x,y} ]

// Drawing data
let isDrawing = false;
let currentPoints = [];
let contours = []; // [ { points: [{x,y}...], area: number } ]
let selectedContourIndex = -1;

// Colors
const COLOR_CALIB = '#ef4444'; // Red
const COLOR_DRAW_STROKE = '#22c55e'; // Green
const COLOR_DRAW_FILL = 'rgba(34, 197, 94, 0.3)';
const COLOR_CONTOUR = '#6366f1'; // Indigo
const COLOR_CONTOUR_FILL = 'rgba(99, 102, 241, 0.3)';
const COLOR_SELECTED_FILL = 'rgba(234, 179, 8, 0.4)'; // Yellowish

function resetProject() {
    loadedImage = null;
    scale = null;
    contours = [];
    calibPoints = [];
    currentPoints = [];
    currentState = APP_STATES.IDLE;
    btnCalibrate.disabled = true;
    btnDraw.disabled = true;
    btnCalibrate.classList.remove('active');
    btnDraw.classList.remove('active');
    calibrationStatus.textContent = 'Escala no calibrada.';
    instructionText.textContent = 'Importa una imagen para comenzar.';
    imageUpload.value = '';
    
    canvas.width = 800;
    canvas.height = 600;
    
    drawAll();
}

function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth - 40;
    canvas.height = container.clientHeight - 40;
    drawAll();
}

window.addEventListener('resize', resizeCanvas);

btnNewProject.addEventListener('click', resetProject);

imageUpload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
            resetProject();
            loadedImage = img;
            btnCalibrate.disabled = false;
            instructionText.textContent = 'Imagen cargada. Por favor, pulsa "Calibrar Escala" y selecciona dos puntos.';
            resizeCanvas(); 
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

btnCalibrate.addEventListener('click', () => {
    if (!loadedImage) return;
    currentState = APP_STATES.CALIBRATING;
    calibPoints = [];
    btnCalibrate.classList.add('active');
    btnDraw.classList.remove('active');
    instructionText.textContent = 'Haz clic en dos puntos de la imagen para establecer la escala.';
    drawAll();
});

btnDraw.addEventListener('click', () => {
    if (!loadedImage || !scale) return;
    currentState = APP_STATES.DRAWING;
    btnDraw.classList.add('active');
    btnCalibrate.classList.remove('active');
    instructionText.textContent = 'Haz clic y arrastra para dibujar el contorno del área que deseas medir.';
    drawAll();
});

// Event handling
canvas.addEventListener('mousedown', (e) => {
    const pos = getMousePos(e);

    if (currentState === APP_STATES.IDLE) {
        selectedContourIndex = -1;
        for (let i = contours.length - 1; i >= 0; i--) {
            if (isPointInPolygon(pos, contours[i].points)) {
                selectedContourIndex = i;
                break;
            }
        }
        drawAll();
    } 
    else if (currentState === APP_STATES.CALIBRATING) {
        calibPoints.push(pos);
        if (calibPoints.length === 2) {
            const pxDistance = distance(calibPoints[0], calibPoints[1]);
            const input = prompt('Ingrese el valor real en metros de la distancia entre estos dos puntos:');
            
            if (input && !isNaN(parseFloat(input)) && parseFloat(input) > 0) {
                const meters = parseFloat(input);
                scale = {
                    pixels: pxDistance,
                    meters: meters,
                    factor: meters / pxDistance 
                };
                calibrationStatus.textContent = `Escala: 1px = ${scale.factor.toFixed(4)}m`;
                instructionText.textContent = 'Escala calibrada. Ahora puedes trazar contornos.';
                btnDraw.disabled = false;
                currentState = APP_STATES.IDLE;
                btnCalibrate.classList.remove('active');
            } else {
                alert('Valor inválido. Inténtalo de nuevo.');
                calibPoints = []; 
            }
        }
        drawAll();
    }
    else if (currentState === APP_STATES.DRAWING) {
        isDrawing = true;
        currentPoints = [pos];
        drawAll();
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDrawing && currentState === APP_STATES.DRAWING) {
        const pos = getMousePos(e);
        const lastPoint = currentPoints[currentPoints.length - 1];
        if (distance(lastPoint, pos) > 3) {
            currentPoints.push(pos);
            drawAll();
        }
    }
});

canvas.addEventListener('mouseup', () => {
    if (isDrawing && currentState === APP_STATES.DRAWING) {
        isDrawing = false;
        if (currentPoints.length > 3) {
            currentPoints.push({...currentPoints[0]});
            
            const areaPx = calculateShoelaceArea(currentPoints);
            const areaMeters = areaPx * (scale.factor * scale.factor);

            contours.push({
                points: [...currentPoints],
                area: areaMeters
            });
            instructionText.textContent = `Contorno creado. Área: ${areaMeters.toFixed(2)} m². Haz clic en el contorno para ver su área, o traza uno nuevo.`;
        }
        currentPoints = [];
        currentState = APP_STATES.IDLE;
        btnDraw.classList.remove('active');
        drawAll();
    }
});

// Helpers
function getMousePos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (evt.clientX - rect.left) * (canvas.width / rect.width),
        y: (evt.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function distance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Rendering
function drawAll() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (loadedImage) {
        const ratioX = canvas.width / loadedImage.width;
        const ratioY = canvas.height / loadedImage.height;
        const ratio = Math.min(ratioX, ratioY);

        imageRect.width = loadedImage.width * ratio;
        imageRect.height = loadedImage.height * ratio;
        imageRect.x = (canvas.width - imageRect.width) / 2;
        imageRect.y = (canvas.height - imageRect.height) / 2;

        ctx.drawImage(loadedImage, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
    }

    contours.forEach((contour, idx) => {
        ctx.beginPath();
        ctx.moveTo(contour.points[0].x, contour.points[0].y);
        for (let i = 1; i < contour.points.length; i++) {
            ctx.lineTo(contour.points[i].x, contour.points[i].y);
        }
        
        ctx.fillStyle = (idx === selectedContourIndex) ? COLOR_SELECTED_FILL : COLOR_CONTOUR_FILL;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = COLOR_CONTOUR;
        ctx.stroke();

        if (idx === selectedContourIndex) {
            const centroid = getCentroid(contour.points);
            drawTextLabel(`${contour.area.toFixed(2)} m²`, centroid.x, centroid.y);
        }
    });

    if (currentPoints.length > 0) {
        ctx.beginPath();
        ctx.moveTo(currentPoints[0].x, currentPoints[0].y);
        for (let i = 1; i < currentPoints.length; i++) {
            ctx.lineTo(currentPoints[i].x, currentPoints[i].y);
        }
        ctx.lineWidth = 2;
        ctx.strokeStyle = COLOR_DRAW_STROKE;
        ctx.stroke();
        
        if (isDrawing && currentPoints.length > 2) {
            ctx.fillStyle = COLOR_DRAW_FILL;
            ctx.fill();
        }
    }

    calibPoints.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = COLOR_CALIB;
        ctx.fill();
    });
    
    if (calibPoints.length === 2) {
        ctx.beginPath();
        ctx.moveTo(calibPoints[0].x, calibPoints[0].y);
        ctx.lineTo(calibPoints[1].x, calibPoints[1].y);
        ctx.strokeStyle = COLOR_CALIB;
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
    }
}

function drawTextLabel(text, x, y) {
    ctx.font = '16px Inter, sans-serif';
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(x - textWidth/2 - 10, y - 15, textWidth + 20, 30);
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
}

// Math
function calculateShoelaceArea(points) {
    let area = 0;
    const n = points.length;
    for (let i = 0; i < n - 1; i++) {
        area += points[i].x * points[i + 1].y;
        area -= points[i + 1].x * points[i].y;
    }
    if (points[0].x !== points[n-1].x || points[0].y !== points[n-1].y) {
        area += points[n-1].x * points[0].y;
        area -= points[0].x * points[n-1].y;
    }
    return Math.abs(area) / 2;
}

function getCentroid(points) {
    let x = 0, y = 0;
    for (const p of points) {
        x += p.x;
        y += p.y;
    }
    return { x: x / points.length, y: y / points.length };
}

function isPointInPolygon(point, vs) {
    let x = point.x, y = point.y;
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        let xi = vs[i].x, yi = vs[i].y;
        let xj = vs[j].x, yj = vs[j].y;
        
        let intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
}

resizeCanvas();
