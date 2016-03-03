var container, 
    renderer, 
    scene, 
    camera, 
    mesh, 
    start = Date.now(),
    fov = 30;

var isFirefox = typeof InstallTrigger !== 'undefined';

if(!isFirefox){
    document.body.innerHTML =  'It seems like you are not using Firefox. This application sadly only works on Firefox at the moment, sorry bout that...';
}

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;
var stream;
var dataArray = new Uint8Array(256);
var imageValue = $('input[name=pattern]:checked').val();
var textureLoader = new THREE.TextureLoader();
$('.noise-frequency-input').jRange({
    from: 0,
    to: 255,
    step: 1,
    scale: [0,255],
    format: '%s',
    width: document.getElementById("menu").offsetWidth*0.8,
    showLabels: true,
    showScale: true,
    isRange : true,
    theme: "theme-blue"
});
var soundSize = $('.size-frequency-input').jRange({
    from: 0,
    to: 255,
    step: 1,
    scale: [0,255],
    format: '%s',
    width: document.getElementById("menu").offsetWidth*0.8,
    showLabels: true,
    showScale: true,
    isRange : true,
    theme: "theme-blue"
});
var sizeString = $('.size-frequency-input').val();
var sizeStringSplit = sizeString.split(",");
var soundSizeUniform = sizeStringSplit;

var phongBool =  $('input[name=phong]:checked').val();

//set up the different audio nodes we will use for the app

var analyser = audioCtx.createAnalyser();
//analyser.minDecibels = -90;
//analyser.maxDecibels = -10;
//analyser.smoothingTimeConstant = 0.85;

var distortion = audioCtx.createWaveShaper();
var gainNode = audioCtx.createGain();
var biquadFilter = audioCtx.createBiquadFilter();
var convolver = audioCtx.createConvolver();

//main block for doing the audio recording

var p = navigator.mediaDevices.getUserMedia({ audio: true });

p.then(function(mediaStream) {
    
    source = audioCtx.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    analyser.connect(distortion);
    distortion.connect(biquadFilter);
    biquadFilter.connect(convolver);
    convolver.connect(gainNode);
    gainNode.gain.value = 1;
    gainNode.connect(audioCtx.destination);
    
    visualize();


});

p.catch(function(err) { console.log(err.name); });

function visualize() {

    analyser.fftSize = 512;
    var bufferLength = analyser.frequencyBinCount;
    //console.log(bufferLength);
    dataArray = new Uint8Array(bufferLength);

    function draw() {
      drawVisual = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
    };

    draw();

}


SHADER_LOADER.load(
        function(data){

            
            

            vertexUniforms = {
                time: {type: "f", value: 0.0},
                soundDisplacement: {type: "i", value: 1},
                soundSize: {type: "i", value: soundSizeUniform}
            }
            fragmentUniform = {
                texture: {type: "t", value: textureLoader.load('pattern' + imageValue + '.png')},
                phong: {type: "i", value: phongBool},
                cameraDir: {type: "v3", value: 0}
            }

            var vShader = data.shader.vertex;
            var fShader = data.shader.fragment;

            material = new THREE.ShaderMaterial( {
            uniforms: {
            texture: {type: "t", value: textureLoader.load('pattern' + imageValue + '.png')},
            time: {type: "f", value: 0.0},
            soundDisplacement: {type: "i", value: 1},
            soundSize: {type: "i", value: soundSizeUniform},
            phong: {type: "i", value: phongBool},
            cameraDir: {type: "v3", value:0}
            },
            vertexShader: vShader,
            fragmentShader: fShader,
            derivatives: true
            } );

            }
            
    )


window.addEventListener( 'load', function() {

    // grab the container from the DOM
    container = document.getElementById( "container" );
    
    // create a scene
    scene = new THREE.Scene();

    // create a camera the size of the browser window
    // and place it 100 units away, looking towards the center of the scene
    camera = new THREE.PerspectiveCamera( 
        fov, 
        window.innerWidth / window.innerHeight, 
        1, 
        10000 );
    camera.position.z = 100;
    camera.position.x = -10;
    camera.target = new THREE.Vector3( 0, 0, 0 );

    scene.add( camera );

    material.uniforms[ 'cameraDir' ].value = camera.getWorldDirection;

    // create a sphere and assign the material
    mesh = new THREE.Mesh(
        new THREE.IcosahedronGeometry( 20, 4 ), 
        //new THREE.PlaneGeometry( 50, 50, 100, 100 ), 
        material 
    );
    mesh.rotation.x = -Math.PI / 4;

    scene.add( mesh );
    
    // create the renderer and attach it to the DOM
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    container.appendChild( renderer.domElement );

    render();

} );

function render() {
    updateUniforms();
    material.transparent = true;
    material.opacity = 0.0;

    renderer.setSize(window.innerWidth*0.97, window.innerHeight*0.97);
    renderer.render( scene, camera );
    requestAnimationFrame( render );
    
}

function updateUniforms(){

    mesh.geometry.computeVertexNormals();
    mesh.geometry.mergeVertices();
    
    var soundNoiseUniform = 1;
    var noiseString = $('.noise-frequency-input').val();
    var noiseStringSplit = noiseString.split(",");
    var startNoise = noiseStringSplit[0];
    var endNoise = noiseStringSplit[1];
    for(i = startNoise; i < endNoise; i++){
        soundNoiseUniform += dataArray[i];
    }
    soundNoiseUniform /= (endNoise - startNoise);

    
    var sizeString = $('.size-frequency-input').val();
    var sizeStringSplit = sizeString.split(",");
    soundSizeUniform = 0;

    var startSize = sizeStringSplit[0];
    var endSize = sizeStringSplit[1];

    for(i = startSize; i < endSize; i++){
        soundSizeUniform += Math.min(dataArray[i], 3000/(endSize-startSize));
    }
    soundSizeUniform = Math.min(soundSizeUniform/(endSize - startSize), 15);



    material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
    material.uniforms['soundDisplacement'].value = soundNoiseUniform;
    material.uniforms['soundSize'].value = soundSizeUniform;

    $("input[name=pattern]:radio").change(function () {
        imageValue = $('input[name=pattern]:checked').val();
        material.uniforms['texture'].value = textureLoader.load('pattern' + imageValue + '.png');
    });
    $("input[name=phong]:radio").change(function () {
        phongBool = $('input[name=phong]:checked').val();
        //console.log(phongBool);
        material.uniforms['phong'].value = phongBool;
    });

}