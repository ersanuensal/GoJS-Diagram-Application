function init() {

  // short form for defining templates
  var $ = go.GraphObject.make;

  var myDiagram =
    $(go.Diagram, "myDiagramDiv", // create Diagramm in HTML
      {
        // create new node with doube click
        "clickCreatingTool.archetypeNodeData": { text: "Node", color: "white" },
        // function redo and undo
        "undoManager.isEnabled": true
      });

  // Defining a standard template for the nodes
  myDiagram.nodeTemplate =
    $(go.Node, "Auto",
      { background: "#44CCFF" },

      $(go.Shape, "RoundedRectangle",
        {
          portId: "", cursor: "pointer",  // the Shape is the port, not the whole Node
          // allow all kinds of links from and to this port
          // An link can only be between two different Nodes
          fromLinkable: true, fromLinkableSelfNode: false, fromLinkableDuplicates: true,
          toLinkable: true, toLinkableSelfNode: false, toLinkableDuplicates: true
        },
        new go.Binding("fill", "color")
      ),



      $(go.TextBlock,
        "Default Text",
        { margin: 12, stroke: "white", font: "bold 16px sans-serif", editable: true },
        new go.Binding("text", "name")
      ),


    );
    // initialize Overview
     myOverview =
       $(go.Overview, "myOverviewDiv",
         {
           observed: myDiagram,
           contentAlignment: go.Spot.Center
         });

         // initialize Palette
     myPalette =
       $(go.Palette, "myPaletteDiv",
         {
           nodeTemplate: myDiagram.nodeTemplate,
           contentAlignment: go.Spot.Center,
           layout:
             $(go.GridLayout,
               { wrappingColumn: 1, cellSize: new go.Size(2, 2) }),
         });

     // now add the initial contents of the Palette
     myPalette.model.nodeDataArray = [
       { text: "Circle", color: "blue", figure: "Circle" },
       { text: "Square", color: "purple", figure: "Square" },
       { text: "Ellipse", color: "orange", figure: "Ellipse" },
       { text: "Rectangle", color: "red", figure: "Rectangle" },
       { text: "Rounded\nRectangle", color: "green", figure: "RoundedRectangle" },
       { text: "Triangle", color: "purple", figure: "Triangle" },
     ];



  var model = $(go.GraphLinksModel);
  // for each object in this Array, the Diagram creates a Node to represent it
  model.nodeDataArray = [
    { key: 1, name: "Langer Text Beispiel" },
    { key: 2, name: "Test" },
    { key: 3, name: "A" }
  ];

  model.linkDataArray =
    [
      { from: 1, to: 2 },
      { from: 2, to: 3 }
    ];
  myDiagram.model = model;

}
