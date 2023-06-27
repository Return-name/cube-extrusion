# cube-extrusion

## A Basic Babylon.js based Cube extrusion with mouse click cube face extrusion toggle
## Author - Rishabh Anand

### Babylon Playground link - https://playground.babylonjs.com/#LQNS6C#5
#### Babylon.js - https://www.babylonjs.com/
### To Run - Simply Clone and open the index.html in any browser

### How it works:
After drawing the mesh (a box in this case) it register pointer events using the onPointerObservable.add() then depending on the event type -  
-> If the event is pointer down then either extrusion is starting or finishing which is done by updating the appropriate variables. The mesh and the face to be extruded are obtained from the pointerInfo object passed to the observer.  
-> If the event is pointer move then first mouse movement is calculated in world coordinates using BABYLON.Vector3.Unproject method then the mesh vertices are modified after calculating the updates by multiplying the movement data with the face normal. 

### Demonstration
![image](https://github.com/Return-name/cube-extrusion/assets/25453678/8634ac97-ed8a-4dab-974a-10e4b10c6f9f)
![image](https://github.com/Return-name/cube-extrusion/assets/25453678/1753428d-804f-49ce-8ac8-ca2c8cec0412)
![image](https://github.com/Return-name/cube-extrusion/assets/25453678/31143b63-47ae-41f5-a29f-8c7164c337a5)
