var canvas = document.getElementById("renderCanvas");

var startRenderLoop = function (engine, canvas) {
    engine.runRenderLoop(function () {
        if (sceneToRender && sceneToRender.activeCamera) {
            sceneToRender.render();
        }
    });
}

var engine = null;
var scene = null;
var sceneToRender = null;
var createDefaultEngine = function() { return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true,  disableWebGL2Support: false}); };

var createScene = function () {

    //Setting Up the Scene
    var scene = new BABYLON.Scene(engine);
    scene.ambientColor = new BABYLON.Color3(1.0, 1.0, 1.0);

    // Setting an Arc Camera
    var camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(65), 5, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // The Cube
    var box = BABYLON.MeshBuilder.CreateBox("box", { size: 1, updatable: true }, scene);
    box.updateFacetData();
    box.enableEdgesRendering();
    box.edgesWidth = 2.0;
    box.edgesColor = new BABYLON.Color4(0, 0, 1, 1);

    const mat = new BABYLON.StandardMaterial("mat");
    mat.ambientColor = new BABYLON.Color3(0.02, 0.37, 0.42);
    box.material = mat;

    // To remove duplicate vertices
    // Optional - if not removing same vertices in the vertex buffer 
    // then while updating positions update if for all copies of the vertex accordingly
    box.forceSharedVertices();

    // paramters for extrusion
    var currentMesh = null;
    var extrude_face = -1;
    var startingPoint = null;

    const pointerDown = (mesh, facet) => {
    if (extrude_face !== -1) {
        // when extrusion is finished - after second mouse click
        camera.attachControl(canvas, true); // for camera movements which was paused during extrusion
        box.disableEdgesRendering();
        box.enableEdgesRendering(); // recalculates and renders new edges
        extrude_face = -1;  // resetting the parameters for next extrusion
        startingPoint = null;
        currentMesh = null;
        return;
    }

    extrude_face = facet;

    if (extrude_face !== -1) {
        // extrusion starting - after first click
        camera.detachControl();  // to pause camera movements during extrusion
        currentMesh = mesh;
        startingPoint = getMousePositionInWorld(scene); // required to compare in pointer move handler to calculate pointer movement parameters
    }
    }


    const pointerMove = () => {
    if (!startingPoint) {
        return;
    }
    if (extrude_face !== -1) {
        // extrusion going on
        var current = getMousePositionInWorld(scene);

        var diff = current.subtract(startingPoint);

        startingPoint = current;
        extrudeMeshFacetAndAdjacentFacet(currentMesh, extrude_face, diff)
    }
    }

    scene.onPointerObservable.add((pointerInfo) => {

    switch (pointerInfo.type) {
        case BABYLON.PointerEventTypes.POINTERDOWN:
            pointerDown(
                pointerInfo?.pickInfo?.pickedMesh, 
                pointerInfo?.pickInfo?.subMeshFaceId
            );
            break;

        case BABYLON.PointerEventTypes.POINTERMOVE:
            pointerMove();
            break;
    }
    });

    return scene;
};

function extrudeMeshFacetAndAdjacentFacet(mesh, facet, move) {

    // to know the vector for extusion direction
    const facetNormal = mesh.getFacetLocalNormals()[facet];

    const meshIndices = mesh.getIndices();
    var facetVerticesIndices = meshIndices.slice(facet * 3, facet * 3 + 3);

    // because we are extruding faces, we need to extrude both facets
    const adjacentFacet = (facet % 2 == 0 ? facet + 1 : facet - 1);
    facetVerticesIndices.push(...meshIndices.slice(adjacentFacet * 3, adjacentFacet * 3 + 3));
    facetVerticesIndices = new Array(... new Set(facetVerticesIndices));

    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    facetVerticesIndices.map((idx) => {
        const p = idx * 3;

        // Math.sign is used to correctly handle the direction of extrusion according to mouse movements
        positions[p] += Math.sign(facetNormal.x) * facetNormal.x * move._x / 500;
        positions[p + 1] += Math.sign(facetNormal.y) * facetNormal.y * move._y / 500;
        positions[p + 2] += Math.sign(facetNormal.z) * facetNormal.z * move._z / 500;

    })

    mesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions);
}

var getMousePositionInWorld = function (scene) {
    return BABYLON.Vector3.Unproject(
        new BABYLON.Vector3(scene.pointerX, scene.pointerY, 1),
        engine.getRenderWidth(),
        engine.getRenderHeight(),
        BABYLON.Matrix.Identity(), scene.getViewMatrix(),
        scene.getProjectionMatrix());
}



window.initFunction = async function() {

    var asyncEngineCreation = async function() {
        try {
        return createDefaultEngine();
        } catch(e) {
        console.log("the available createEngine function failed. Creating the default engine instead");
        return createDefaultEngine();
        }
    }

    window.engine = await asyncEngineCreation();
    if (!engine) throw 'engine should not be null.';
    startRenderLoop(engine, canvas);
    window.scene = createScene();
};
initFunction().then(() => {sceneToRender = scene                    
});

// Resize
window.addEventListener("resize", function () {
    engine.resize();
});