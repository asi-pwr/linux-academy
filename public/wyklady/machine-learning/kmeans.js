"use strict";

function hsl2rgb(h,s,l) {
  h = h / 60;
  var C = s * (1 - Math.abs(2*l - 1));
  var X = C * (1 - Math.abs(h%2 - 1));
  var m = l - C/2;
  var a = (C+m)*255, b = (X+m)*255, c = m*255;
  if(h >= 0 && h < 1) return [a, b, c];
  if(h >= 1 && h < 2) return [b, a, c];
  if(h >= 2 && h < 3) return [c, a, b];
  if(h >= 3 && h < 4) return [c, b, a];
  if(h >= 4 && h < 5) return [b, c, a];
  if(h >= 5 && h < 6) return [a, c, b];
}

function KMeans() {
}
KMeans.prototype = {
    getPixelData: function(img) {
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        return ctx.getImageData(0, 0, img.width, img.height);
    },
    
    init: function(img, centers) {
        if(img instanceof Image) {
            this.pixels = this.getPixelData(img);
            this.initializeCenters(centers);
            if(this.onload) this.onload();
        } else {
            var image = new Image();
            image.onload = function() { this.init(image, centers); }.bind(this);
            image.src = img;
        }
    },
    
    initializeCenters: function(centers) {
        if(centers instanceof Array) {
            this.centers = centers;
        } else {
            this.centers = [];
            var random = function(max) { return Math.floor(Math.random() * max); };
            for(var i = 0; i < centers; i++) {
                var x = random(this.pixels.width), y = random(this.pixels.height);
                this.centers.push([x, y]);
            }
        }
        for(var i = 0; i < this.centers.length; i++) {
            this.centers[i].push(hsl2rgb(360/this.centers.length*i, 1, 0.5))
        }
    },
    
    assignClusters: function() {
        for(var x = 0; x < this.pixels.width; x++) {
            for(var y = 0; y < this.pixels.height; y++) {
                var pos = 4*(x + y*this.pixels.width);
                if(this.pixels.data[pos + 3] == 0) continue;
                var min = 0;
                var minDistance = Math.pow(x - this.centers[0][0], 2) + Math.pow(y - this.centers[0][1], 2);
                for(var i=1; i < this.centers.length; i++) {
                    var dist = Math.pow(x - this.centers[i][0], 2) + Math.pow(y - this.centers[i][1], 2);
                    if(dist < minDistance) {
                        minDistance = dist;
                        min = i;
                    }
                }
                this.pixels.data[pos + 0] = this.centers[min][2][0];
                this.pixels.data[pos + 1] = this.centers[min][2][1];
                this.pixels.data[pos + 2] = this.centers[min][2][2];
                this.pixels.data[pos + 3] = 255 - min;
            }
        }
    },
    
    moveCenters: function() {
        var centers_data = [];
        for(var i=0; i < this.centers.length; i++) {
            centers_data.push([0, 0, 0]);
        }
        for(var x = 0; x < this.pixels.width; x++) {
            for(var y = 0; y < this.pixels.height; y++) {
                var pos = 4*(x + y*this.pixels.width);
                if(this.pixels.data[pos + 3] == 0) continue;
                var center_id = 255 - this.pixels.data[pos + 3];
                centers_data[center_id][0] += x;
                centers_data[center_id][1] += y;
                centers_data[center_id][2] += 1;
            }
        }
        for(var i=0; i < this.centers.length; i++) {
            if(centers_data[i][2] == 0) continue;
            this.centers[i][0] = centers_data[i][0] / centers_data[i][2];
            this.centers[i][1] = centers_data[i][1] / centers_data[i][2];
        }
    }
};

function KMeansVizualizer(elem, img, centers) {
    this.elem = elem;
    if(img instanceof KMeans) {
        this.kmeans = img;
        this.createElements();
    } else {
        this.kmeans = new KMeans(img, centers);
        this.kmeans.onload = this.createElements.bind(this);
    }
}
KMeansVizualizer.prototype = {
    options: {
        scale: 5
    },
    
    createElements: function() {
        this.elem.innerHTML = '';
        this.createSvg();
        this.createCanvas();
    },
    
    createCanvas: function() {
        var canvas = this.canvas = document.createElement('canvas');
        canvas.width = this.kmeans.pixels.width  * this.options.scale;
        canvas.height= this.kmeans.pixels.height * this.options.scale;

        this.elem.appendChild(canvas);
        this.drawPixels();
    },
    
    drawPixels: function() {
        var ctx = this.canvas.getContext('2d');
        var pixels = ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        for(var x = 0; x < pixels.width; x++) {
            for(var y = 0; y < pixels.height; y++) {
                var pos = 4*(x + y*pixels.width);
                var kpos = 4*(Math.floor(x/this.options.scale) +
                              Math.floor(y/this.options.scale)*this.kmeans.pixels.width);
                pixels.data[pos + 0] = this.kmeans.pixels.data[kpos + 0];
                pixels.data[pos + 1] = this.kmeans.pixels.data[kpos + 1];
                pixels.data[pos + 2] = this.kmeans.pixels.data[kpos + 2];
                pixels.data[pos + 3] = this.kmeans.pixels.data[kpos + 3];
            }
        }
        ctx.putImageData(pixels, 0, 0);
    },
    
    updateCenters: function() {
        for(var i = 0; i < this.centers.length; i++) {
            this.createMarker(
                    this.kmeans.centers[i][0]*this.options.scale,
                    this.kmeans.centers[i][1]*this.options.scale,
                    i*360/this.kmeans.centers.length)
            
            this.createLine(this.centers[i][0], this.centers[i][1],
                            this.kmeans.centers[i][0]*this.options.scale, this.kmeans.centers[i][1]*this.options.scale);
            
            this.centers[i][0] = this.kmeans.centers[i][0]*this.options.scale;
            this.centers[i][1] = this.kmeans.centers[i][1]*this.options.scale;
        }
    },
    
    createSvg: function() {
        var svg = this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.width.baseVal.value = this.kmeans.pixels.width  * this.options.scale;
        svg.height.baseVal.value= this.kmeans.pixels.height * this.options.scale;

        this.elem.appendChild(svg);
        this.centers = [];
        for(var i in this.kmeans.centers) {
            this.createMarker(
                this.kmeans.centers[i][0]*this.options.scale,
                this.kmeans.centers[i][1]*this.options.scale,
                i*360/this.kmeans.centers.length);
            this.centers.push([this.kmeans.centers[i][0]*this.options.scale,
                               this.kmeans.centers[i][1]*this.options.scale]);
        }
    },
    
    createMarker: function(x, y, hue) {
        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', y);
        circle.setAttribute('r', 5);
        circle.setAttribute('fill', 'hsl(' + hue + ', 100%, 80%)');
        circle.setAttribute('stroke', 'hsl(' + hue + ', 100%, 35%)');
        circle.style.strokeWidth = '2px';
        circle.style.opacity = 0.69;
        this.svg.appendChild(circle);
        
        return circle;
    },
    
    createLine: function(x1, y1, x2, y2) {
        var line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('stroke', 'black');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '4 4');
        
        this.svg.appendChild(line);
        return line;
    }
};
