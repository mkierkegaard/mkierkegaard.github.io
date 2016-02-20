var container, 
    renderer, 
    scene, 
    camera, 
    mesh, 
    start = Date.now(),
    fov = 30;

// set up forked web audio context, for multiple browsers
// window. is needed otherwise Safari explodes

var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
var source;
var stream;
var dataArray = new Uint8Array(256);
var imageValue = $('input[name=pattern]:checked').val();
var textureLoader = new THREE.TextureLoader();
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
    console.log(bufferLength);
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
                soundDisplacement: {type: "iv1", value: new Uint8Array(256)}
            }
            fragmentUniform = {
                tExplosion: {type: "t", value: textureLoader.load('pattern' + imageValue + '.png')}
            }

            var vShader = data.shader.vertex;
            var fShader = data.shader.fragment;

            material = new THREE.ShaderMaterial( {
            uniforms: {
            tExplosion: {type: "t", value: textureLoader.load('pattern' + imageValue + '.png')},
            time: {type: "f", value: 0.0},
            soundDisplacement: {type: "iv1", value: new Uint8Array(256)}
            },
            vertexShader: vShader,
            fragmentShader: fShader
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
    
    // create a sphere and assign the material
    mesh = new THREE.Mesh( 
        new THREE.IcosahedronGeometry( 20, 4 ), 
        material 
    );
    scene.add( mesh );
    
    // create the renderer and attach it to the DOM
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize( window.innerWidth, window.innerHeight );
    
    container.appendChild( renderer.domElement );

    render();

} );

function render() {
    updateUniforms();
    
    /*if (document.getElementById('pattern1').checked) {
                //imageValue = document.getElementById('pattern1').value;

                
                mesh = new THREE.Mesh( 
                new THREE.IcosahedronGeometry( 20, 4 ), 
                material 
                );
                
            }
    else if (document.getElementById('pattern2').checked) {
                //imageValue = document.getElementById('pattern2').value;
                
                material.uniforms['tExplosion'].value = textureLoader.load('pattern' + imageValue + '.png');
               
                mesh = new THREE.Mesh( 
                new THREE.IcosahedronGeometry( 20, 4 ), 
                material 
                );
            }*/
    
    //material.uniforms['tExplosion'].value = textureLoader.load('pattern' + imageValue + '.png');
    //material.needsUpdate = true;

    


    renderer.setSize(window.innerWidth*0.97, window.innerHeight*0.97);
    renderer.render( scene, camera );
    requestAnimationFrame( render );
    
}

function updateUniforms(){
    material.uniforms[ 'time' ].value = .00025 * ( Date.now() - start );
    material.uniforms['soundDisplacement'].value = dataArray;
    $("input[name=pattern]:radio").change(function () {
        imageValue = $('input[name=pattern]:checked').val();
        material.uniforms['tExplosion'].value = textureLoader.load('pattern' + imageValue + '.png');
    });
}