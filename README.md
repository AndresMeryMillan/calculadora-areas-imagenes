# AreaCalc - Calculadora de Áreas Irregulares sobre Imágenes 📐🖼️

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/es/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![Canvas API](https://img.shields.io/badge/API-HTML5%20Canvas-orange.svg)](https://developer.mozilla.org/es/docs/Web/API/Canvas_API)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Dependencies](https://img.shields.io/badge/dependencies-0%20external-brightgreen.svg)](#requisitos)

**AreaCalc** es una aplicación web interactiva desarrollada con **JavaScript Vanilla y la API de HTML5 Canvas** que permite medir con precisión el área de superficies y regiones irregulares sobre fotografías, planos arquitectónicos, mapas o imágenes aéreas, basándose en una escala de referencia métrica calibrada por el usuario.

---

## 🌟 Características Principales

* **Cero Dependencias (Vanilla Web):** Construida íntegramente con estándares web nativos (HTML5, CSS3 y JavaScript moderno), sin librerías pesadas ni frameworks, garantizando máxima velocidad y portabilidad.
* **Ajuste y Escalado Adaptativo:** Motor de renderizado en Canvas que ajusta automáticamente cualquier imagen cargada al espacio de trabajo, preservando su relación de aspecto original (*aspect ratio*) sin distorsiones.
* **Calibración Interactiva de Escala:** Herramienta de dos puntos con cálculo de distancia euclidiana para convertir píxeles a metros reales ($px \to m$).
* **Trazado Libre con Cierre Automático:** Permite al usuario delinear a mano alzada contornos de formas complejas con el mouse, cerrando la geometría automáticamente al finalizar el trazo.
* **Detección Geométrica de Clics (*Hit Testing*):** Permite hacer clic sobre cualquier contorno previamente dibujado para seleccionarlo, resaltarlo y consultar su área calculada.
* **Diseño Moderno (Dark Theme):** Interfaz limpia, minimalista y responsiva con paleta de colores oscuros inspirada en herramientas profesionales de diseño e ingeniería.

---

## 🔬 Fundamentos Matemáticos y Algoritmos

La precisión y rendimiento de la herramienta se basan en tres pilares algorítmicos implementados desde cero:

### 1. Fórmula de la Lazada (*Shoelace Formula / Gauss's Area Formula*)
Para calcular el área del polígono irregular generado a partir de la lista de vértices $\{(x_1, y_1), (x_2, y_2), \dots, (x_n, y_n)\}$:

$$A_{\text{px}} = \frac{1}{2} \left| \sum_{i=1}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) + (x_n y_1 - x_1 y_n) \right|$$

El área real en metros cuadrados se obtiene aplicando el factor de escala al cuadrado:
$$A_{\text{real}} = A_{\text{px}} \times (\text{factor})^2$$

### 2. Algoritmo de Lanzamiento de Rayos (*Ray-Casting Algorithm / Even-Odd Rule*)
Para determinar si un clic del usuario $(x_0, y_0)$ se encuentra dentro de un polígono irregular, se traza un rayo horizontal semi-infinito y se contabiliza el número de intersecciones con las aristas. Si la cantidad de cruces es impar, el punto se encuentra dentro de la figura.

### 3. Cálculo del Centroide Geométrico
Para ubicar la etiqueta flotante de texto con los metros cuadrados ($m^2$) en el centro visual de la figura, se promedian las coordenadas de los vértices que componen el contorno:
$$C = \left(\frac{1}{n}\sum_{i=1}^n x_i, \; \frac{1}{n}\sum_{i=1}^n y_i\right)$$

---

## 📂 Estructura del Proyecto

```text
CalculadoraAreas/
├── .gitignore                      # Configuración de exclusión para Git
├── README.md                       # Documentación principal del proyecto
├── index.html                      # Estructura semántica de la aplicación y Sidebar
├── style.css                       # Estilos CSS, diseño flexbox y tema oscuro
└── app.js                          # Máquina de estados, lógica del Canvas y algoritmos
```

---

## 🎮 Flujo de Uso

1. **Nuevo Proyecto:** Haz clic en **"Nuevo Proyecto"** para limpiar el área de trabajo y restablecer los datos.
2. **Importar Imagen:** Carga cualquier imagen (plano, croquis, terreno o foto) mediante el botón **"Importar Imagen"**.
3. **Calibrar Escala:**
   * Haz clic en **"Calibrar Escala"**.
   * Marca **dos puntos** en la imagen sobre un objeto cuya medida real conozcas (por ejemplo, una pared de 5 metros o una regla de escala).
   * Ingresa la distancia en metros en el diálogo emergente. El sistema calculará el ratio $px \to m$.
4. **Trazar Contorno:**
   * Haz clic en **"Trazar Contorno"**.
   * Mantén presionado el clic y dibuja el perímetro del área que deseas medir.
   * Al soltar el clic, el polígono se cierra y el área en $m^2$ se calcula de inmediato.
5. **Consultar Medidas:**
   * En cualquier momento puedes hacer clic sobre cualquier polígono existente para seleccionarlo; se resaltará en amarillo y mostrará su etiqueta métrica en el centro.

---

## 🚀 Cómo Ejecutar el Proyecto

Al ser una aplicación web estática sin dependencias de Node.js ni compiladores:

1. Clona el repositorio:
   ```bash
   git clone https://github.com/TU_USUARIO/calculadora-areas-canvas.git
   cd calculadora-areas-canvas
   ```
2. Abre el archivo `index.html` directamente en tu navegador favorito (Chrome, Firefox, Edge, Safari), o ejecútalo con extensiones locales como **Live Server** en VS Code.

> [!TIP]
> **Despliegue Gratuito en GitHub Pages:**  
> Al estar compuesto por archivos estáticos (`index.html`, `style.css`, `app.js`), puedes habilitar **GitHub Pages** en `Settings` > `Pages` del repositorio y la aplicación estará disponible en línea públicamente en minutos.

---

## 👤 Autor

* **Andrés Mery** - *Desarrollo de interfaz, implementación de Canvas y algoritmos geométricos*.


