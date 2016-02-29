//Noise variables
varying vec2 vUv;
varying float noise;
uniform sampler2D texture;
uniform int phong;
varying vec3 newPosition;
const vec3 lightPos = normalize(vec3(1.0,1.0,1.0));
varying vec3 fnormal;
uniform vec3 cameraDir;


float random( vec3 scale, float seed ){
    return fract( sin( dot( gl_FragCoord.xyz + seed, scale ) ) * 43758.5453 + seed ) ;
}

void main() {

    // get a random offset
    float r = .01 * random( vec3( 12.9898, 78.233, 151.7182 ), 0.0 );

    // lookup vertically in the texture, using noise and offset
    // to get the right RGB colour
    vec2 tPos = vec2( 0, 1.3 * noise + r);
    vec4 color = texture2D( texture, tPos );

    

    if(phong == 1){
        vec3 dx = dFdx(newPosition);
    vec3 dy = dFdy(newPosition);
    vec3 newNormal = normalize(cross(dx, dy));

        vec3 lightDir = normalize(lightPos);
        float intensity;
        intensity = dot(lightDir,newNormal);

        
        vec3 reflectDir = reflect(lightDir, newNormal);
        vec3 viewDir = normalize(-newPosition);

        float lambertian = max(dot(lightDir,newNormal), 0.0);
        float specular = 0.3;

           float specAngle = max(dot(reflectDir, viewDir), 0.0);
           specular = pow(specAngle, 16.0);
        

        vec3 diffuseColor = intensity*color.rgb;
        vec3 specColor = vec3(1.0, 1.0, 1.0);

        gl_FragColor = vec4( 0.05*color.rgb + lambertian*diffuseColor + specular*specColor, 1.0);



/*

        
        vec3 dx = dFdx(newPosition);
        vec3 dy = dFdy(newPosition);
        vec3 newNormal = normalize(cross(dx, dy));

        vec3 lightDir = normalize(lightPos);
        vec3 e = normalize(cameraDir);
        float intensity;
        intensity = dot(lightDir,newNormal);
        float specular = 0.0;

        if(intensity > 0.0){
            vec3 reflectDir = reflect(lightDir, newNormal);
            vec3 viewDir = normalize(-newPosition);
            float specAngle = max(dot(reflectDir, viewDir), 0.0);
            specular = pow(specAngle, 16.0);
        }
        

        float lambertian = max(dot(lightDir,newNormal), 0.0);
        

        vec3 diffuseColor = intensity*color.rgb;
        vec3 specColor = intensity*vec3(1.0, 1.0, 1.0);

        gl_FragColor = vec4( 0.05*color.rgb + lambertian*diffuseColor + specular*specColor, 1.0);*/
    }
    else{
        gl_FragColor = vec4( color.rgb , 1.0 );
    }
   
    
}