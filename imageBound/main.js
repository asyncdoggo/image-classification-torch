const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const img = document.getElementById('img');

const name_input = document.getElementById('name');


name_input.addEventListener('change', e => {
    images[current].name = e.target.value;
});

const images = [];

let orig_images = [];

let current = 0



function scaleDimensions(originalWidth, originalHeight, constWidth = null, constHeight = null) {

    if (originalHeight > originalWidth) {
        const temp = constHeight;
        constHeight = constWidth;
        constWidth = temp;
    }

    const aspectRatio = originalWidth / originalHeight;

    if (constWidth && constHeight) {
        return { width: constWidth, height: constHeight };
    }

    if (constWidth) {
        const scaledHeight = constWidth / aspectRatio;
        return { width: constWidth, height: scaledHeight };
    }

    if (constHeight) {
        const scaledWidth = constHeight * aspectRatio;
        return { width: scaledWidth, height: constHeight };
    }
    return { width: originalWidth, height: originalHeight };
}


img.onload = function () {
    const { width, height } = scaleDimensions(img.width, img.height, 512, 512);
    canvas.width = width;
    canvas.height = height;
    img.height = height;
    img.width = width;
    console.log(width, height)
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
}

let image
function loadFile(event) {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        images.push({
            src: URL.createObjectURL(files[i]),
            isBase64: false,
            name: files[i].name,
            type: files[i].type,
            size: files[i].size,
            dim: {
                xMin: 0,
                yMin: 0,
                xMax: 0,
                yMax: 0,
            }
        });
    }
    // load the first image
    img.src = images[current].src;
    current = 0;
    image = images[current];
    name_input.value = image.name;
    orig_images = []
    orig_images = JSON.parse(JSON.stringify(images));
}

let isDrawing = false;




const next = document.getElementById('next');
const prev = document.getElementById('prev');
const clear = document.getElementById('clear');


clear.addEventListener('click', () => {
    images[current].dim = {
        xMin: 0,
        yMin: 0,
        xMax: 0,
        yMax: 0,
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    img.src = orig_images[current].src;
    // ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
})


next.addEventListener('click', () => {
    if (current < images.length - 1) {
        current++;
        img.src = images[current].src;
        image = images[current];
        name_input.value = image.name;
    }
});

prev.addEventListener('click', () => {
    if (current > 0) {
        current--;
        img.src = images[current].src;
        image = images[current];
        name_input.value = image.name;
    }
});



canvas.addEventListener('mousedown', e => {
    image.dim.xMin = e.offsetX;
    image.dim.yMin = e.offsetY;
    isDrawing = true;
});

canvas.addEventListener('mousemove', e => {
    if (isDrawing === true) {
        drawRect(image.dim.xMin, image.dim.yMin, e.offsetX - image.dim.xMin, e.offsetY - image.dim.yMin);
    }
});

canvas.addEventListener('mouseup', e => {
    if (isDrawing === true) {
        drawRect(image.dim.xMin, image.dim.yMin, e.offsetX - image.dim.xMin, e.offsetY - image.dim.yMin);
        image.dim.xMax = e.offsetX;
        image.dim.yMax = e.offsetY;
        image.isBase64 = true;
        isDrawing = false;

        images[current].src = canvas.toDataURL();
    }

});

function drawRect(xMin, yMin, xMax, yMax) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.rect(xMin, yMin, xMax, yMax);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.stroke();
}


function saveZip() {
    const zip = new JSZip();
    for (let i = 0; i < images.length; i++) {
        zip.file(images[i].name, images[i].src.split(',')[1], { base64: true });
    }
    zip.file('images.json', JSON.stringify(images.map(image => {
        return {
            name: image.name,
            type: image.type,
            size: image.size,
            dim: image.dim
        }
    })));
    zip.generateAsync({ type: 'blob' }).then(content => {
        saveAs(content, 'images.zip');
    });
}


