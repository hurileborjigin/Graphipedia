import Sigma from "sigma";
import Graph from "graphology";
import circular from "graphology-layout/circular";
import forceAtlas2 from "graphology-layout-forceatlas2";



import FA2Layout from "graphology-layout-forceatlas2/worker";

import axios from "axios"
import { EdgeDisplayData, NodeDisplayData, PlainObject} from "sigma/types";
import {animateNodes} from "sigma/utils/animate";

// Function to build the graph from JSON data
let renderer;
function buildGraphFromJson(data) {
    // const graph = new Graph();
    if (renderer) {
        renderer.kill();
    }
    let graph = new Graph();
    graph.clear()


    function addEdgeIfNeeded(sourceId, targetId) {
        if (!graph.hasEdge(sourceId, targetId)) {
            graph.addEdge(sourceId, targetId);
        }
    }

    // Calculate degrees for each node first
    const degreeMap = new Map();
    data.forEach(item => {
        // Increment the degree for the parent node
        if (!degreeMap.has(item.from_id)) {
            degreeMap.set(item.from_id, 0);
        }
        degreeMap.set(item.from_id, degreeMap.get(item.from_id) + item.to_id.length);

        // Set the degree for child nodes to 1 (or increment if they are also a parent)
        item.to_id.forEach(childId => {
            if (!degreeMap.has(childId)) {
                degreeMap.set(childId, 0);
            }
            // Increment if it's already there, otherwise, it stays 1
            degreeMap.set(childId, degreeMap.get(childId) + 1);
        });
    });

    // Set sizes based on individual reference counts
    const minSize = 8, maxSize = 50;

// Extract all individual reference counts from the data
    const allReferenceCounts = data.flatMap(item => item.reference_count);

    // Calculate the minimum and maximum reference counts for scaling
    const minReferenceCount = Math.min(...allReferenceCounts);
    const maxReferenceCount = Math.max(...allReferenceCounts);

    function calculateMean(data) {
        const total = data.reduce((acc, val) => acc + val, 0);
        return total / data.length;
    }

    function calculateStandardDeviation(data, mean) {
        const squareDiffs = data.map(value => {
            const diff = value - mean;
            return diff * diff;
        });
        const avgSquareDiff = calculateMean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }
    if (minReferenceCount!==Infinity && maxReferenceCount!== Infinity && minReferenceCount!==maxReferenceCount){
        const mean = calculateMean(allReferenceCounts);
        const standardDeviation = calculateStandardDeviation(allReferenceCounts, mean);

        // Use mean ± 2 sigmas for slider range
        const minThreshold = Math.max(mean - 2 * standardDeviation, 0);
        const maxThreshold = mean + 2 * standardDeviation;



        // @ts-ignore
        document.getElementById("labels-threshold").min = minThreshold;
        // @ts-ignore
        document.getElementById("labels-threshold").max = maxThreshold;
        // @ts-ignore
        document.getElementById("labels-threshold").step = (maxThreshold - minThreshold) / 100;

    }




// Function to calculate node size based on individual reference count
    function calculateNodeSize(referenceCount) {
        if (minReferenceCount === maxReferenceCount)

            return maxSize;
        return minSize + ((referenceCount - minReferenceCount) / (maxReferenceCount - minReferenceCount)) * (maxSize - minSize);
    }


// Add nodes with sizes
    // Add nodes with sizes and colors
    data.forEach(item => {
        const fromId = item.from_id;
        let fromTitle = item.from_title;
        if (typeof fromTitle === 'string') {
            fromTitle = fromTitle.replace(/_/g, ' '); // Replace underscores with spaces
        }

        // Set size for the parent node, if needed
        // You might want to set a default size or calculate it differently
        addNodeIfNeeded(fromId, fromTitle, 30, true, maxReferenceCount); // true for parent


        item.to_id.forEach((childId, index) => {
            const childTitle = item.to_title[index];
            const childReferenceCount = item.reference_count[index];
            const childSize = calculateNodeSize(childReferenceCount);

            addNodeIfNeeded(childId, childTitle, childSize, false, item.reference_count[index]); // false for child
            addEdgeIfNeeded(fromId, childId);
        });
    });


    function addNodeIfNeeded(id, label, size, isParent, referenceCount) {
        if (!graph.hasNode(id)) {
            // Node does not exist yet, add it with the appropriate color
            const color = isParent ? "#4444aa" : "#aa4444";
            const Parent = !!isParent;
            if(typeof label === 'string'){
                label = label.replace(/_/g, ' ');
            }
            graph.addNode(id, {
                label: label,
                size: size,
                color: color,
                referenceCount: referenceCount,
                isParent: Parent
            });
        } else if (isParent) {
            // Node already exists but is now identified as a parent, update its color only
            graph.updateNode(id, node => {
                return { ...node, color: "#4444aa", isParent:true};
            });
        }
    }

    // Position nodes on a circle, then run Force Atlas 2 for a while to get
    circular.assign(graph);
    const settings = forceAtlas2.inferSettings(graph);

    forceAtlas2.assign(graph, { settings, iterations: 150 }); // Increase iterations




    // Hide the loader from the DOM:
    const loader = document.getElementById("loader") as HTMLElement;
    loader.style.display = "none";

    // Finally, draw the graph using sigma:
    const container = document.getElementById("sigma-container") as HTMLElement;


    //buttons
    const FA2Button = document.getElementById("forceatlas2") as HTMLElement;
    const FA2StopLabel = document.getElementById("forceatlas2-stop-label") as HTMLElement;
    const FA2StartLabel = document.getElementById("forceatlas2-start-label") as HTMLElement;

    const randomButton = document.getElementById("random") as HTMLElement;

    const circularButton = document.getElementById("circular") as HTMLElement;

    /** FA2 LAYOUT **/

    // Graphology provides a easy to use implementation of Force Atlas 2 in a web worker
    const sensibleSettings = forceAtlas2.inferSettings(graph);
    const fa2Layout = new FA2Layout(graph, {
        settings: sensibleSettings,
    });


    // A variable is used to toggle state between start and stop
    let cancelCurrentAnimation: (() => void) | null = null;

    // correlate start/stop actions with state management
    function stopFA2() {
        fa2Layout.stop();
        FA2StartLabel.style.display = "flex";
        FA2StopLabel.style.display = "none";
    }
    function startFA2() {
        if (cancelCurrentAnimation) cancelCurrentAnimation();
        fa2Layout.start();
        FA2StartLabel.style.display = "none";
        FA2StopLabel.style.display = "flex";
    }

    // the main toggle function
    function toggleFA2Layout() {
        if (fa2Layout.isRunning()) {
            stopFA2();
        } else {
            startFA2();
        }
    }
    // bind method to the forceatlas2 button
    FA2Button.addEventListener("click", toggleFA2Layout);

    /** RANDOM LAYOUT **/
    /* Layout can be handled manually by setting nodes x and y attributes */
    /* This random layout has been coded to show how to manipulate positions directly in the graph instance */
    function randomLayout() {
        // stop fa2 if running
        if (fa2Layout.isRunning()) stopFA2();
        if (cancelCurrentAnimation) cancelCurrentAnimation();

        // to keep positions scale uniform between layouts, we first calculate positions extents
        const xExtents = { min: 0, max: 0 };
        const yExtents = { min: 0, max: 0 };
        graph.forEachNode((node, attributes) => {
            xExtents.min = Math.min(attributes.x, xExtents.min);
            xExtents.max = Math.max(attributes.x, xExtents.max);
            yExtents.min = Math.min(attributes.y, yExtents.min);
            yExtents.max = Math.max(attributes.y, yExtents.max);
        });
        const randomPositions: PlainObject<PlainObject<number>> = {};
        graph.forEachNode((node) => {
            // create random positions respecting position extents
            randomPositions[node] = {
                x: Math.random() * (xExtents.max - xExtents.min),
                y: Math.random() * (yExtents.max - yExtents.min),
            };
        });
        // use sigma animation to update new positions
        cancelCurrentAnimation = animateNodes(graph, randomPositions, { duration: 2000 });
    }

// bind method to the random button
    randomButton.addEventListener("click", randomLayout);

    /** CIRCULAR LAYOUT **/
    function circularLayout() {
        // stop fa2 if running
        if (fa2Layout.isRunning()) stopFA2();
        if (cancelCurrentAnimation) cancelCurrentAnimation();

        //since we want to use animations we need to process positions before applying them through animateNodes
        const circularPositions = circular(graph, { scale: 100 });

        cancelCurrentAnimation = animateNodes(graph, circularPositions, { duration: 2000, easing: "linear" });
    }
    // bind method to the random button
    circularButton.addEventListener("click", circularLayout);

    renderer = new Sigma(graph, container);

    const searchInput = document.getElementById("search-input") as HTMLInputElement;


    interface State {
        hoveredNode?: string;
        searchQuery: string;

        // State derived from query:
        selectedNode?: string;
        suggestions?: Set<string>;

        // State derived from hovered node:
        hoveredNeighbors?: Set<string>;
    }
    const state: State = { searchQuery: "" };




    // Actions:
    function setSearchQuery(query) {
        // Ensure query is a string
        if (typeof query !== 'string') {
            console.error('setSearchQuery: query is not a string', query);
            return;
        }

        state.searchQuery = query;

        if (searchInput.value !== query) {
            searchInput.value = query;
        }

        // Handle empty query
        if (!query) {
            state.selectedNode = undefined;
            state.suggestions = undefined;
            renderer.refresh();
            return;
        }

        const lcQuery = query.toLowerCase();
        try {
            const suggestions = graph
                .nodes()
                .map((n) => ({
                    id: n,
                    label: graph.getNodeAttribute(n, "label")
                }))
                .filter(({ label }) => label && label.toLowerCase().includes(lcQuery));

            if (suggestions.length === 1 && suggestions[0].label === query) {
                state.selectedNode = suggestions[0].id;
                state.suggestions = undefined;

                // Move camera to center on selected node
                const nodePosition = renderer.getNodeDisplayData(state.selectedNode);
                if (nodePosition) {
                    renderer.getCamera().animate(nodePosition, { duration: 500 });
                }
            } else {
                state.selectedNode = undefined;
                state.suggestions = new Set(suggestions.map(({ id }) => id));
            }
        } catch (error) {
            console.error('Error in setSearchQuery:', error);
        }

        // Refresh rendering
        renderer.refresh();
    }



    function setHoveredNode(node?: string) {
        if (node) {
            state.hoveredNode = node;
            state.hoveredNeighbors = new Set(graph.neighbors(node));
            renderer.on("enterNode", ({ node }) => {
                const nodeData = graph.getNodeAttributes(node);
                const tooltip = document.getElementById('tooltip');
                // Sanitize and encode the label for URL
                const encodedLabel = encodeURIComponent(nodeData.label.replace(/"/g, ''));


                // Fetch Wikipedia preview
                fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodedLabel}`)
                    .then(response => response.json())
                    .then(data => {
                        tooltip.innerHTML = `
                <p>${data.extract}</p>
                <a href="https://en.wikipedia.org/wiki/${encodeURIComponent(encodedLabel)}" target="_blank">Access the Wikipedia page</a>
            `;
                        tooltip.style.display = 'block';
                    })
                    .catch(error => {
                        console.error('Error fetching Wikipedia summary:', error);
                    });
                const nodePosition = renderer.getNodeDisplayData(node);

                if (nodePosition) {
                    // Position the tooltip to the right of the node
                    const offsetX = 2; // Horizontal offset from the node
                    const offsetY = 0; // Vertical offset from the node

                    // Translate graph coordinates to screen coordinates
                    const screenPosition = renderer.graphToViewport({ x: nodePosition.x, y: nodePosition.y });

                    tooltip.style.left = (screenPosition.x + offsetX) + 'px';

                    tooltip.style.top = (screenPosition.y + offsetY) + 'px';

                    tooltip.style.display = 'block';
                }
            });

            let isCursorOverTooltip = false;

            const tooltip = document.getElementById('tooltip');
            tooltip.addEventListener('mouseenter', () => {
                isCursorOverTooltip = true;
            });
            tooltip.addEventListener('mouseleave', () => {
                isCursorOverTooltip = false;
                tooltip.style.display = 'none'; // Hide the tooltip when cursor leaves
            });

            renderer.on("leaveNode", () => {
                // Delay hiding tooltip to allow time to move the cursor onto the tooltip
                setTimeout(() => {
                    // Check if the cursor is not over the tooltip before hiding
                    if (!isCursorOverTooltip) {
                        const tooltip = document.getElementById('tooltip');
                        tooltip.style.display = 'none';
                    }
                }, 6000); // Adjust delay as needed
            })

        } else {
            state.hoveredNode = undefined;
            state.hoveredNeighbors = undefined;
        }

        // Refresh rendering:
        renderer.refresh();
    }

    // Bind search input interactions:
    searchInput.addEventListener("input", () => {
        setSearchQuery(searchInput.value || "");
    });


    // Bind graph interactions:
    renderer.on("enterNode", ({ node }) => {
        setHoveredNode(node);
    });
    renderer.on("leaveNode", () => {
        setHoveredNode(undefined);
    });

    // Render nodes accordingly to the internal state:
    // 1. If a node is selected, it is highlighted
    // 2. If there is query, all non-matching nodes are greyed
    // 3. If there is a hovered node, all non-neighbor nodes are greyed
    renderer.setSetting("nodeReducer", (node, data) => {
        const res: Partial<NodeDisplayData> = { ...data };

        if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
            res.label = "";
            res.color = "#f6f6f6";
        }

        if (state.selectedNode === node) {
            res.highlighted = true;
        } else if (state.suggestions && !state.suggestions.has(node)) {
            res.label = "";
            res.color = "#f6f6f6";
        }

        return res;
    });

    // Add click event listener to nodes
    renderer.on("clickNode", ({ node }) => {
        const wikiPageId = node; // node is the Wikipedia page ID

        if (wikiPageId) {
            // Construct the Wikipedia URL using the page ID
            const wikiUrl = `https://en.wikipedia.org/?curid=${wikiPageId}`;
            // Open the Wikipedia page in a new tab
            window.open(wikiUrl, '_blank');
        }
    });

    const labelsThresholdRange = document.getElementById("labels-threshold") as HTMLInputElement;

    labelsThresholdRange.addEventListener('input', function(e) {
        // @ts-ignore
        const threshold = parseFloat(e.target.value);

        // Loop through each node to determine visibility based on the threshold
        graph.forEachNode((node, attributes) => {
            if(!attributes.isParent){
                if (attributes.referenceCount < threshold) {
                    // Hide the node if its reference count is below the threshold
                    graph.setNodeAttribute(node, 'hidden', true);
                } else {
                    // Show the node otherwise
                    graph.setNodeAttribute(node, 'hidden', false);
                }
            }


        });
        renderer.refresh();
    })





    // Render edges accordingly to the internal state:
    // 1. If a node is hovered, the edge is hidden if it is not connected to the
    //    node
    // 2. If there is a query, the edge is only visible if it connects two
    //    suggestions
    renderer.setSetting("edgeReducer", (edge, data) => {
        const res: Partial<EdgeDisplayData> = { ...data };

        if (state.hoveredNode && !graph.hasExtremity(edge, state.hoveredNode)) {
            res.hidden = true;
        }

        if (state.suggestions && (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))) {
            res.hidden = true;
        }

        return res;
    });
}

// Function to load JSON and build the graph
function loadJsonAndBuildGraph() {
    fetch('./exampleOutput.json')
        .then(response => response.json())
        .then(data => {
            buildGraphFromJson(data);
        })
        .catch(error => {
            console.error('Error fetching or parsing JSON:', error);
        });
}

function handleSearch() {
    // Retrieve input values
    // @ts-ignore
    const searchText = document.getElementById("search-text").value;
    const searchDepthElement = document.getElementById("search-depth");
    // @ts-ignore
    const searchDepth = parseInt(searchDepthElement.options[searchDepthElement.selectedIndex].value, 10);
    // @ts-ignore
    let threshold = 0
    // @ts-ignore
    if (document.getElementById("threshold").checked){
        // @ts-ignore
        threshold = parseInt(document.getElementById("labels-threshold").value)
    }

    // Process search terms
    // const searchTerms = searchText.split(',').map(term => `'${term.trim()}'`).join(',');
    const searchData = {
        text: `('${searchText}')`,
        depth: searchDepth,
        threshold: threshold
    };

    // Make the Axios POST request
    axios.post('http://localhost:3000/api/postgres/insertIntoBfs', searchData)
        .then(response => {
            console.log('Success:', response.data.data);
            buildGraphFromJson(response.data.data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// Bind the search button event listener
document.addEventListener("DOMContentLoaded", () => {
    const searchButton = document.getElementById("search-button");
    if (searchButton) {
        searchButton.addEventListener("click", handleSearch);
    }
});

// Call the function to start the process
loadJsonAndBuildGraph();

