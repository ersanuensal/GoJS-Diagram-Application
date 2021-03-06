const { text } = require("body-parser");

function init() {
	// short form for defining templates
	var $ = go.GraphObject.make;
	var myModel;

	dateOfToday = getTodayTime().split("T")[0];

	// initial lists that are uses for data mapping
	nodeList = [];
	linkList = [];
	downloadedData = [];
	downloadedLinks = [];
	downloadedDataObj = [];
	downloadedInstanceOfPreset = [];

	
	instanceOfPresetList = downloadedInstanceOfPreset;
	presetList = downloadedDataObj;
	loadcheck = false;
	loadname = null;
	reuseselected = null;

	// diagram id of the current diagram
	diagramId = document.getElementById("diagramId").value;

	myDiagram = $(
		go.Diagram,
		"myDiagramDiv", // create Diagramm in HTML
		{
			// initialContentAlignment: go.Spot.Left,
			initialAutoScale: go.Diagram.UniformToFill,
			layout: $(go.LayeredDigraphLayout, {
				linkSpacing: 80,
				layerSpacing: 150,
				columnSpacing: 80,
				direction: 0,
			}),

			// create new node with double click
			"clickCreatingTool.archetypeNodeData": {
				Name: "Application",
				Version: "",
				Description: "",
				COTS: "Undefined",
				Release: "",
				Shutdown: "",
				color: "blue",
				figure: "Subroutine",
				dateToday: "",
			},
			// function redo and undo
			"undoManager.isEnabled": true,
		}
	);

	// Defining a standard template for the nodes
	myDiagram.nodeTemplate = $(
		go.Node,
		"Auto",
		{
			locationSpot: go.Spot.Center,
		},
		new go.Binding("location", "location", go.Point.parse).makeTwoWay(
			go.Point.stringify
		),
		$(
			go.Shape,
			"Subroutine",
			{
				width: 170,
				height: 100,
				margin: 2,
				fill: "#29292a",
				stroke: "gray",
				strokeWidth: 3.5,
				portId: "",
				fromLinkable: true,
				toLinkable: true,
				fromLinkableDuplicates: false,
				toLinkableDuplicates: false, //disabling dublicate Link from Node A to Node B
				fromLinkableSelfNode: false,
				toLinkableSelfNode: false, //disabling links from a node to it self
			},
			new go.Binding("stroke", "color").makeTwoWay(),
			new go.Binding("figure")
		),
		$(
			go.TextBlock,
			{
				margin: new go.Margin(5, 5, 3, 5),
				font: "bold 16pt sans-serif",
				stroke: "ghostwhite",
				minSize: new go.Size(32, 32),
				maxSize: new go.Size(120, NaN),
				textAlign: "center",
				editable: true,
				verticalAlignment: go.Spot.Center,
				margin: 10,
			},
			new go.Binding("text", "Name").makeTwoWay()
		)
	);
	
	// saving data from the html hidden inputs
	function loadDataFromDB() {
		if (document.getElementById("downloadData").value != "") {
			nodeArrayfromDB = JSON.parse(
				document.getElementById("downloadData").value
			);
			for (var i = 0; i < nodeArrayfromDB.length; i++) {
				downloadedData.push(nodeArrayfromDB[i]);
			}
			linkArrayfromDB = JSON.parse(
				document.getElementById("downloadLinks").value
			);
			for (var i = 0; i < linkArrayfromDB.length; i++) {
				downloadedLinks.push(linkArrayfromDB[i]);
			}
			dataObjArrayfromDB = JSON.parse(
				document.getElementById("downloadDataObj").value
			);
			for (var i = 0; i < dataObjArrayfromDB.length; i++) {
				downloadedDataObj.push(dataObjArrayfromDB[i]);
			}
			instanceOfPresetFromDB = JSON.parse(
				document.getElementById("downloadInstanceOfPreset").value
			);
			for (var i = 0; i < instanceOfPresetFromDB.length; i++) {
				downloadedInstanceOfPreset.push(instanceOfPresetFromDB[i]);
			}

			myDiagram.model = new go.GraphLinksModel(downloadedData, downloadedLinks);
		}
	}

	// get data from the html  
	function loadDataObjFromDB() {
		dataObjArrayfromDB = JSON.parse(
			document.getElementById("downloadDataObj").value
		);
		for (var i = 0; i < dataObjArrayfromDB.length; i++) {
			downloadedDataObj.push(dataObjArrayfromDB[i]);
		}
	}
	loadDataFromDB();

	// The link shape and arrowhead have their stroke brush data bound to the "color" property
	myDiagram.linkTemplate = $(
		go.Link,
		{
			zOrder: 1,
			toShortLength: 1, // avoid interfering with arrowhead or overriding the arrowhead,
			// curve: go.Link.Bezier,
			routing: go.Link.AvoidsNodes,
			relinkableFrom: true,
			relinkableTo: true,
			reshapable: true,
			/**
			 * Handling mouse events (mouseover the Link)
			 */
			// a mouseover highlights the link by changing the first main path shape's stroke:
			mouseEnter: function (e, link) {
				link.elt(0).stroke = "rgba(152, 193, 217, 0.8)";
			},
			mouseLeave: function (e, link) {
				link.elt(0).stroke = "transparent";
			},
		},
		new go.Binding("stroke", "Color"),

		// Link shape
		$(go.Shape, {
			// thick undrawn path make it easier the click the link
			isPanelMain: true,
			stroke: "transparent",
			strokeWidth: 8,
			toShortLength: 8,
		}),

		$(
			go.Shape,
			{
				// the real drawn path default
				isPanelMain: true,
				strokeWidth: 2.2, //binding thickness
			},
			new go.Binding("stroke", "Color").makeTwoWay()
		),

		// Link arrowhead
		$(
			go.Shape,
			{
				// make the arrowhead more visibile and clear by scaling it
				toArrow: "Triangle", //"Standart", "Triangle"
				scale: 0.7, //arrow thickness
			},
			new go.Binding("stroke", "Color").makeTwoWay(),
			new go.Binding("fill", "Color").makeTwoWay()
		),

		// Textblock
		// link label
		$(
			go.Panel,
			"Auto",
			new go.Binding("visible", "Name", function(t) { return t !== ""; }), // the whole node panel
			{

				mouseEnter: function (e, link) {
					link.elt(0).fill = "rgba(152, 193, 217, 1)";
					link.elt(0).stroke = "rgba(152, 193, 217, 1)";
				},
				mouseLeave: function (e, link) {
					link.elt(0).fill = "white";
					link.elt(0).stroke = "white";
				},
			},
			$(go.Shape, "Rectangle", {
				fill: "white",
				stroke: "white",
				strokeWidth: 3,
			}),
			$(go.TextBlock, "left", { segmentOffset: new go.Point(0, -10) },
				new go.Binding("visible", "Name", function(t) { return t !== ""; }),
			 	new go.Binding("text", "Name")) // end Table Panel
		) 
	);

	// initialize Overview
	myOverview = $(go.Overview, "myOverviewDiv", {
		observed: myDiagram,
		contentAlignment: go.Spot.Center,
	});

	// initialize Palette
	myPalette = $(go.Palette, "myPaletteDiv", {
		nodeTemplate: myDiagram.nodeTemplate,
		contentAlignment: go.Spot.Center,
		layout: $(go.GridLayout, {
			wrappingColumn: 1,
			cellSize: new go.Size(2, 2),
		}),
	});

	// now add the initial contents of the Palette
	myPalette.model.nodeDataArray = [
		{
			Name: "Application",
			Version: "",
			Description: "",
			COTS: "Undefined",
			Release: "",
			Shutdown: "",
			color: "blue",
			figure: "Subroutine",
			dateToday: "",
		},
	];


	// Adding a eventlistener that triggers whenever data of nodes or links is changed
	myDiagram.addModelChangedListener(function (e) {
		if (e.change === go.ChangedEvent.Transaction) {
			if (
				e.propertyName === "CommittingTransaction" ||
				e.modelChange === "SourceChanged"
			) {
				nodeList = [];
				linkList = [];
				let selectedPart = myDiagram.selection.first();

				document.getElementById("uploadInstanceOfPreset").value =
					JSON.stringify(instanceOfPresetList);

				myDiagram.commit(function (d) {
					d.links.each(function (link) {
						//Namegeneation for Links
						nameCounter = 0;
						nameString = "";

						// generating a Link Label depending on DataObj's
						// then pushes this element in a local List
						instanceOfPresetList.forEach((elem) => {
							if (
								elem.linkFrom == link.data.from &&
								elem.linkTo == link.data.to
							) {
								presetList.forEach((item) => {
									if (item._id == elem.presetID) {
										if (nameCounter == 0) {
											nameString = item.Name;
										}
										if (nameCounter > 0) {
											nameString += ", " + item.Name;
										}
									}
								});
								nameCounter++;
							}
						});
						myDiagram.model.setDataProperty(link.data, "Name", nameString);

						var linkObj = new Link(
							link.data.from,
							link.data.to,
							link.data.Name,
							link.data.Description,
							link.data.Color,
							link.data.PersonalData,
							link.data.LoadPreset,
							diagramId
						);
						linkList.push(linkObj);
						document.getElementById("uploadLinks").value =
							JSON.stringify(linkList);

						if (
							loadcheck &&
							reuseselected != null &&
							reuseselected instanceof go.Link
						) {
							if (
								reuseselected.data.from == link.data.from &&
								reuseselected.data.to == link.data.to
							) {
								for (var i = 0; i < presetList.length; i++) {
									if (loadname == presetList[i].Name) {
										//link.data.Name = presetList[i].Name;
										myDiagram.model.setDataProperty(
											link.data,
											"Name",
											presetList[i].Name
										);
										myDiagram.model.setDataProperty(
											link.data,
											"Description",
											presetList[i].Description
										);
										myDiagram.model.setDataProperty(
											link.data,
											"Color",
											presetList[i].Color
										);
										myDiagram.model.setDataProperty(
											link.data,
											"PersonalData",
											presetList[i].PersonalData
										);
										loadcheck = false;
										reuseselected = null;
									}
								}
							}
						}
					});

					d.nodes.each(function (node) {
						if (
							node.data.Shutdown <= dateOfToday &&
							node.data.Shutdown >= "0000-00-00"
						) {
							myDiagram.model.setDataProperty(node.data, "color", "red");
						} else if (
							(node.data.Release <= dateOfToday && node.data.Shutdown > dateOfToday) ||
							(node.data.Release <= dateOfToday &&
								node.data.Shutdown === "" &&
								node.data.Release != "")
						) {
							myDiagram.model.setDataProperty(node.data, "color", "green");
						} else if (node.data.Release > dateOfToday) {
							myDiagram.model.setDataProperty(node.data, "color", "orange");
						} else {
							myDiagram.model.setDataProperty(node.data, "color", "blue");
						}

						if (
							node.data.Shutdown < node.data.Release &&
							node.data.Shutdown > "0000-00-00"
						) {
							node.data.Shutdown = "0000-00-00";
							myDiagram.model.setDataProperty(node.data, "color", "green");
						}

						var nodeObj = new Node(
							node.data.Name,
							node.data.Version,
							node.data.Description,
							node.data.COTS,
							node.data.Release,
							node.data.Shutdown,
							node.data.color,
							node.data.figure,
							node.data.key,
							node.data.location,
							diagramId
						);
						nodeList.push(nodeObj);
						document.getElementById("uploadData").value =
							JSON.stringify(nodeList);
						document.getElementById("uploadDataObj").value =
							JSON.stringify(downloadedDataObj);
						document.getElementById("uploadDataObj2").value =
							JSON.stringify(downloadedDataObj);
					});
				});
			}
		}
	});
	
	// Trigger Event when left mouse button is clicked
	myDiagram.addDiagramListener("ObjectSingleClicked", function (e) {
		var tz = true;
		reuseselected = e.subject.part;

		if (reuseselected instanceof go.Link) {
		}
	});

	// Trigger Event when right mouse buttton is clicked
	myDiagram.addDiagramListener("ObjectContextClicked", function (e) {
		reuseselected = e.subject.part;

		// when right clicked item is a Link
		if (reuseselected instanceof go.Link) {
			console.log(
				"Right-Clicked on " +
					reuseselected.data.from +
					" " +
					reuseselected.data.to
			);
			loadDataObjModal();

			// load link data to Modal
			myDiagram.commit(function (d) {
				d.links.each(function (link) {
					if (
						reuseselected.data.from == link.data.from &&
						reuseselected.data.to == link.data.to
					) {
						document.getElementById("linkFrom").value = link.data.from;
						document.getElementById("linkTo").value = link.data.to;
					}
				});
			});
			createTableForLinks(reuseselected.data.from, reuseselected.data.to);
		}

		// when right clicked item is a node
		if (reuseselected instanceof go.Node) {
			console.log("Rightclick on Node with key:  " + reuseselected.data.key);
			loadNodeModal();
			myDiagram.commit(function (d) {
				d.nodes.each(function (node) {
					if (reuseselected.data.key == node.data.key) {
						document.getElementById("nodeID").value = node.data.key;
						document.getElementById("nodeName").value = node.data.Name;
						document.getElementById("nodeVersion").value = node.data.Version;
						document.getElementById("nodeDescription").value =
							node.data.Description;
						document.getElementById("nodeCots").value = node.data.COTS;
						document.getElementById("nodeReleaseDate").value =
							node.data.Release;
						document.getElementById("nodeShutdownDate").value =
							node.data.Shutdown;
					}
				});
			});
		}
	});
}
// save link data to Modal
function saveLinkProperties(node) {
	myDiagram.commit(function (d) {
		d.links.each(function (link) {
			if (
				link.data.from == document.getElementById("linkFrom").value &&
				link.data.to == document.getElementById("linkTo").value
			) {
				myDiagram.model.setDataProperty(
					link.data,
					"Name",
					document.getElementById("linkName").innerHTML
				);
				console.log("Link updated");
			}
		});
	});
	document.getElementById("uploadDBForm").submit();
}

// save link data to Modal
function saveNodeProperties(node) {
	var checkDateRelease = document.getElementById("nodeReleaseDate").value;
	var checkDateShutdown = document.getElementById("nodeShutdownDate").value;

	if (checkDateShutdown > checkDateRelease || checkDateShutdown == "") {
		myDiagram.commit(function (d) {
			d.nodes.each(function (node) {
				if (node.data.key == document.getElementById("nodeID").value) {
					myDiagram.model.setDataProperty(
						node.data,
						"Name",
						document.getElementById("nodeName").value
					);
					myDiagram.model.setDataProperty(
						node.data,
						"Version",
						document.getElementById("nodeVersion").value
					);
					myDiagram.model.setDataProperty(
						node.data,
						"Description",
						document.getElementById("nodeDescription").value
					);
					myDiagram.model.setDataProperty(
						node.data,
						"COTS",
						document.getElementById("nodeCots").value
					);
					myDiagram.model.setDataProperty(
						node.data,
						"Release",
						document.getElementById("nodeReleaseDate").value
					);
					myDiagram.model.setDataProperty(
						node.data,
						"Shutdown",
						document.getElementById("nodeShutdownDate").value
					);
					console.log("Node updated");
				}
			});
		});
		document.getElementById("uploadDBForm").submit();
	} else {
		document.getElementById("validDates").style.display = "flex";
	} 
}

// delete a dataObject from the list of a Link
function deleteInstance(id, from, to) {
	var id = id;
	var from = from;
	var to = to;
	instanceOfPresetList.forEach((item, i) => {
		if (item.presetID == id && item.linkFrom == from && item.linkTo == to) {
			console.log(
				"Deleted item " +
					i +
					" from Array " +
					id +
					" from Link " +
					from +
					":" +
					to
			);
			instanceOfPresetList.splice(i, 1);
		}
	});

	var from = from;
	var to = to;
	createTableForLinks(from, to);
	myDiagram.commit(function (d) {
		d.links.each(function (link) {
			var renaming = "renaming..";
			if (link.data.from == from && link.data.to == to) {
				myDiagram.model.setDataProperty(link.data, "Name", renaming);
			}
		});
	});
}

// creating table for the link dataObjects and renaming the link depeending that
function createTableForLinks(from, to) {
	createTableForAddDataObj();
	var localinstances = [];

	nameCounter = 0;
	nameString = "";

	// generating a Link Label depending on DataObj's
	// then pushes this element in a local List
	instanceOfPresetList.forEach((elem) => {
		if (elem.linkFrom == from && elem.linkTo == to) {
			presetList.forEach((item) => {
				if (item._id == elem.presetID) {
					if (nameCounter == 0) {
						nameString = item.Name;
					}
					if (nameCounter > 0) {
						nameString += ", " + item.Name;
					}
				}
			});
			nameCounter++;
			localinstances.push(elem);
		}
	});

	document.getElementById("linkName").text = nameString;

	var localPresets = [];
	localinstances.forEach((item) => {
		var idToCheck = item.presetID;
		presetList.forEach((elem) => {
			if (elem._id == idToCheck) {
				localPresets.push(elem);
			}
		});
	});

	var tableHeaderRowCount = 1;
	var table = document.getElementById("linkTable");
	var rowCount = table.rows.length;
	for (var i = tableHeaderRowCount; i < rowCount; i++) {
		table.deleteRow(tableHeaderRowCount);
	}
	var index = 0;

	localPresets.forEach((elem) => {
		index = index + 1;
		var row = table.insertRow();
		row.setAttribute("class", "collapsed");
		row.setAttribute("data-bs-toggle", "collapse");
		var toggleAddress = "#toggleDescription" + index;
		row.setAttribute("data-bs-target", toggleAddress);
		row.setAttribute("aria-expanded", "true");
		row.setAttribute(
			"style",
			"font: helvetica, sans-serif;  font-size: 1.3em;"
		);

		let nameCell = row.insertCell();
		let personalDataCell = row.insertCell();
		let deleteCell = row.insertCell();
		nameText = document.createTextNode(elem.Name);
		personalDataText = document.createTextNode(elem.PersonalData);
		deleteLink = document.createElement("p");
		var presetId = '"' + elem._id + '"';
		var fromId = from;
		var toId = to;
		var buttonString =
			"<button class='btn' style='margin-bottom: -15px; margin-top: -5px;' onclick='deleteInstance(" +
			presetId +
			", " +
			fromId +
			", " +
			toId +
			")'><i class='fa fa-trash' style='max-height:15px'></i></button>";
		deleteLink.innerHTML = buttonString;
		nameCell.appendChild(nameText);
		personalDataCell.appendChild(personalDataText);
		deleteCell.appendChild(deleteLink);

		var hiddenRow = table.insertRow();
		hiddenRow.setAttribute("class", "collapsed");
		let hiddenPanel = hiddenRow.insertCell();
		hiddenPanel.setAttribute("class", "hiddenRow");
		hiddenPanel.setAttribute("colspan", "6"); // String oder Integer?
		var panelDiv = document.createElement("div");
		var toggleValue = "toggleDescription" + index;
		panelDiv.setAttribute("id", toggleValue);
		panelDiv.setAttribute("class", "collapse");
		panelDiv.setAttribute(
			"style",
			"margin-left:15px; padding-top:10px; padding-bottom:10px; font: helvetica, sans-serif; font-style: italic; font-size: 1.3em;"
		);
		hiddenPanel.appendChild(panelDiv);
		descriptionText = document.createTextNode(elem.Description);
		panelDiv.appendChild(descriptionText);
	});
}

// Function to log data that is generated by GoJS
function showData() {
	var json = myDiagram.model.toJson();
	console.log(json);
}

window.addEventListener("DOMContentLoaded", init);
