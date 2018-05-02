let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let gl: WebGLRenderingContext;

const vsSource = `
    attribute vec4 aVertexPosition;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    void main(){
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
`;

const fsSource = `
    void main(){
        gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    }
`;

const vtexSource = `
    attribute vec2 a_position;


    varying vec2 v_texCoord;

    void main(){

        gl_Position = vec4(a_position,0,1);
        v_texCoord = vec2((a_position.x+1.0)/2.0, 1.0-(a_position.y+1.0)/2.0);
      
    }
`;

const ftexSource = `
    
    uniform sampler2D u_image;

    varying mediump vec2 v_texCoord;

    void main(){
        

        gl_FragColor = texture2D(u_image,v_texCoord).rgba;
    }
`;
function main() {
    document.body.appendChild(canvas);
    // ctx = canvas.getContext("2d");
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
        return alert("浏览器不支持webgl");
    }
    // drawImg();
    // gl.clearColor(1, 0, 0, 1);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    gl.useProgram(shaderProgram);
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosttion: gl.getAttribLocation(shaderProgram, "aVertexPosition")
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix")
        }
    }
    let buffer = initBuffers(gl);


    let vpos = programInfo.attribLocations.vertexPosttion;
    let pm = programInfo.uniformLocations.projectionMatrix;
    let mm = programInfo.uniformLocations.modelViewMatrix;
    gl.vertexAttribPointer(vpos, 2, gl.FLOAT, false, 0, 0);
    // gl.vertexAttrib4f(vpos, 0.0, 0.0, 0.0, 0.0);
    gl.enableVertexAttribArray(vpos);
    // gl.bindAttribLocation(shaderProgram, vpos, "aVertexPosition");

    gl.uniformMatrix4fv(pm, false, [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0]);
    gl.uniformMatrix4fv(mm, false, [
        1.0, 0.0, 0.0, 0.0,
        0.0, 1.0, 0.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 0.0, 1.0]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
}


function initBuffers(gl: WebGLRenderingContext) {
    let squareVerticesBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVerticesBuffer);
    let vertices = [
        -1.0, 1.0,
        1.0, 1.0,
        1.0, -1.0,
        1.0, -1.0,
        -1.0, -1.0,
        -1.0, 1.0

    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    return squareVerticesBuffer;
}

function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("创建program失败：" + gl.getProgramInfoLog(shaderProgram));
        return null;
    }
    return shaderProgram;
}

function loadShader(gl: WebGLRenderingContext, type: GLenum, source: string) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("shader编译失败:" + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

function drawImg() {
    let img = document.createElement("img");
    img.crossOrigin = "anonymous";
    img.onload = function () {
        canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        // ctx = canvas.getContext("2d");
        // ctx.drawImage(img, 0, 0);
        // main();
        document.body.appendChild(canvas);
        renderImage(img);

        // for (var i = 0; i < 6; i++) {
        //     for (var j = 0; j < 6; j++) {
        //         ctx.fillStyle = 'rgb(' + Math.floor(255 - 42.5 * i) + ',' +
        //             Math.floor(255 - 42.5 * j) + ',0)';
        //         ctx.fillRect(j * 25, i * 25, 25, 25);
        //     }
        // }
        // ctx.fillStyle = "#ff0000";
        // ctx.fillRect(100, 100, 20, 10);
    }
    img.src = "./resource/bg.jpg";
}

function renderImage(image: HTMLImageElement) {
    gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    let buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    let vertices = [
        1.0, 1.0,
        1.0, -1.0,
        -1.0, 1.0,
        -1.0, -1.0
    ];

    // let vertices = [
    //     1.0, 1.0,
    //     1.0, -1.0,
    //     -1.0, 1.0,
    //     -1.0, 1.0,
    //     -1.0, -1.0,
    //     1.0, -1.0
    // ];
    let arr = new Float32Array(vertices)
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);

    let program = initShaderProgram(gl, vtexSource, ftexSource);
    gl.useProgram(program);

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);

    // gl.NEAREST is also allowed, instead of gl.LINEAR, as neither mipmap.
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    // Prevents s-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    // Prevents t-coordinate wrapping (repeating).
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    // gl.bindTexture(gl.TEXTURE_2D, null);


    // let textCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    // gl.enableVertexAttribArray(textCoordLocation);
    // gl.vertexAttribPointer(textCoordLocation, 2, gl.FLOAT, false, 0, 0);



    let positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);








    let imgpos = gl.getUniformLocation(program, "u_image");

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);




    // gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    gl.uniform1i(imgpos, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    // gl.drawArrays(gl.TRIANGLES, 0, 6);
}
drawImg();