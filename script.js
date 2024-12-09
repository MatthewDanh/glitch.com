// Define nodes representing various social circles
const nodes = new vis.DataSet([
  { id: 1, label: "The Inner Circle", color: "#ff6b6b", title: "Closest friends and family who know you best." },
  { id: 2, label: "The Close Circle", color: "#ffa36b", title: "Trusted friends who are always there for you." },
  { id: 3, label: "The Supportive Circle", color: "#ffd56b", title: "Friends who help during times of need." },
  { id: 4, label: "The Social Circle", color: "#e5ff6b", title: "Friends you enjoy spending time with socially." },
  { id: 5, label: "The Acquaintance Circle", color: "#6bffa3", title: "Acquaintances you see occasionally." },
  { id: 6, label: "The Professional Circle", color: "#6bafff", title: "Professional relationships and collaborators." },
  { id: 7, label: "The Distant Circle", color: "#b66bff", title: "Friends from the past or distant relationships." },
]);

// Define edges to connect nodes, representing relationships between circles
const edges = new vis.DataSet([
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
  { from: 4, to: 5 },
  { from: 5, to: 6 },
  { from: 6, to: 7 },
  { from: 1, to: 3 },
  { from: 2, to: 5 },
  { from: 3, to: 6 },
  { from: 4, to: 7 },
]);

// Get the container element for rendering the network
const container = document.getElementById("graph-container");
const data = { nodes, edges };
const options = {
  layout: {
    hierarchical: {
      direction: "UD", // Up to Down layout
      sortMethod: "directed", // Directed hierarchy
    },
  },
  nodes: {
    shape: "circle",
    size: 30,
    font: {
      size: 20,
      color: "#000000", // Black font for node labels
    },
    borderWidth: 2,
  },
  edges: {
    color: "#000000", // Black edges
    width: 2,
    smooth: {
      type: "curvedCCW", // Curved counterclockwise edges
    },
  },
  physics: {
    enabled: true, // Enable physics for dynamic layout
    stabilization: false, // Allow continuous adjustments
  },
  interaction: {
    hover: true, // Enable hover interactions
    tooltipDelay: 100, // Delay for showing tooltips
    hideEdgesOnDrag: false, // Keep edges visible while dragging
  },
};

// Initialize the network
const network = new vis.Network(container, data, options);

// Handle node click events
network.on("click", (params) => {
  if (params.nodes.length > 0) {
    const nodeId = params.nodes[0];
    const node = nodes.get(nodeId);

    if (!node || !node.color || !node.label) return;

    // Highlight the clicked node
    const originalColor = node.color;
    nodes.update({ id: nodeId, color: "#ffffff", font: { color: "#000" } });

    // Change background color dynamically
    const body = document.body;
    body.style.background = originalColor;
    body.style.transition = "background 0.5s ease-in-out";

    // Update the detail element with node information
    const detailElement = document.getElementById("circle-details");
    if (detailElement) {
      detailElement.innerHTML = `
        <h3>${node.label}</h3>
        <p>${node.title}</p>
      `;
      detailElement.style.opacity = 1;
    }
  }
});

// Handle blur events to reset nodes and hide details
network.on("blurNode", () => {
  // Reset only the nodes that were updated
  const updatedNodes = nodes.map((node) => {
    if (node.font.color !== "#000") {
      return { id: node.id, color: node.color, font: { color: "#000" } };
    }
    return null;
  }).filter(Boolean);

  nodes.update(updatedNodes);

  // Reset background color and hide details
  document.body.style.background = "#202020";
  const detailElement = document.getElementById("circle-details");
  if (detailElement) {
    detailElement.style.opacity = 0;
  }
});

// Add search functionality
const searchInput = document.createElement("input");
searchInput.type = "text";
searchInput.placeholder = "Search nodes...";
searchInput.style.position = "absolute";
searchInput.style.top = "10px";
searchInput.style.left = "10px";
searchInput.style.padding = "5px";
searchInput.style.border = "1px solid #ccc";
document.body.appendChild(searchInput);

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  nodes.update(
    nodes.map((node) => ({
      ...node,
      hidden: query && !node.label.toLowerCase().includes(query),
    }))
  );
});

// Enable physics and animations for hover interactions
network.on("hoverNode", (params) => {
  const nodeId = params.node;
  const node = nodes.get(nodeId);
  if (node && typeof node.title === "string") {
    network.canvas.body.container.title = node.title;
  } else {
    network.canvas.body.container.title = "";
  }
});

// Allow node additions via double click
document.addEventListener("dblclick", (event) => {
  const newNodeId = nodes.length + 1;
  const newNode = {
    id: newNodeId,
    label: `New Node ${newNodeId}`,
    color: "#ffa500",
    title: "A dynamically added node.",
  };
  nodes.add(newNode);
  edges.add({ from: Math.floor(Math.random() * newNodeId) + 1, to: newNodeId });
});

// Add theme toggle button
const themeToggle = document.createElement("button");
themeToggle.id = "theme-toggle";
themeToggle.textContent = "Toggle Theme";
themeToggle.style.position = "absolute";
themeToggle.style.top = "10px";
themeToggle.style.right = "10px";
themeToggle.style.padding = "5px 10px";
themeToggle.style.border = "none";
themeToggle.style.cursor = "pointer";
document.body.appendChild(themeToggle);

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark-theme");
});

// Ensure the detail element exists or create it if not
let detailElement = document.getElementById("circle-details");
if (!detailElement) {
  detailElement = document.getElementById("circle-details") || (() => {
    const newElement = document.createElement("div");
    newElement.id = "circle-details";
    newElement.style.position = "absolute";
    newElement.style.top = "20px";
    newElement.style.right = "20px";
    newElement.style.padding = "20px";
    newElement.style.background = "rgba(0, 0, 0, 0.7)";
    newElement.style.color = "#fff";
    newElement.style.borderRadius = "8px";
    newElement.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.5)";
    newElement.style.transition = "opacity 0.3s";
    newElement.style.opacity = 0;
    document.body.appendChild(newElement);
    return newElement;
  })();
}