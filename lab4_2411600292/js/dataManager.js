const inventoryData = [
    { id: 1, sku: "PRD-001", name: "Wireless Keyboard", category: "Electronics", price: 850, quantity: 45, reorderLevel: 10 },
    { id: 2, sku: "PRD-002", name: "USB-C Monitor Cable", category: "Accessories", price: 450, quantity: 120, reorderLevel: 20 },
    { id: 3, sku: "PRD-003", name: "Mechanical Mouse", category: "Electronics", price: 1200, quantity: 8, reorderLevel: 15 },
    { id: 4, sku: "PRD-004", name: "Office Chair", category: "Furniture", price: 4500, quantity: 12, reorderLevel: 5 },
    { id: 5, sku: "PRD-005", name: "Notebook A4 (50pcs)", category: "Stationery", price: 180, quantity: 200, reorderLevel: 30 },
    { id: 6, sku: "PRD-006", name: "Standing Desk", category: "Furniture", price: 12500, quantity: 3, reorderLevel: 3 },
    { id: 7, sku: "PRD-007", name: "Webcam HD 1080p", category: "Electronics", price: 2300, quantity: 18, reorderLevel: 10 },
    { id: 8, sku: "PRD-008", name: "Desk Lamp LED", category: "Accessories", price: 650, quantity: 0, reorderLevel: 8 }
];

let appState = {
    searchQuery: "",
    category: "all",
    stockStatus: "all",
    priceMax: Infinity,
    filteredProducts: [...inventoryData]
};

function getProducts() {
    return appState.filteredProducts;
}

function getUniqueCategories() {
    return [...new Set(inventoryData.map(p => p.category))];
}

function getStockStatus(product) {
    if (product.quantity <= 0) return "outofstock";
    if (product.quantity <= product.reorderLevel) return "lowstock";
    return "instock";
}

function getStockStatusLabel(status) {
    const labels = { instock: "In Stock", lowstock: "Low Stock", outofstock: "Out of Stock" };
    return labels[status] || "Unknown";
}

function applyFilters() {
    appState.filteredProducts = inventoryData.filter(product => {
        const matchSearch = appState.searchQuery === "" ||
            product.name.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            product.sku.toLowerCase().includes(appState.searchQuery.toLowerCase());
        const matchCategory = appState.category === "all" || product.category === appState.category;
        const status = getStockStatus(product);
        const matchStock = appState.stockStatus === "all" || status === appState.stockStatus;
        const matchPrice = product.price <= appState.priceMax;
        return matchSearch && matchCategory && matchStock && matchPrice;
    });
}

function getStatistics() {
    const totalProducts = inventoryData.length;
    const totalValue = inventoryData.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const lowStockCount = inventoryData.filter(p => p.quantity <= p.reorderLevel).length;
    const categories = getUniqueCategories().length;
    return { totalProducts, totalValue, lowStockCount, categories };
}

function getCategorySummary() {
    const summary = {};
    inventoryData.forEach(p => {
        if (!summary[p.category]) summary[p.category] = { value: 0, quantity: 0 };
        summary[p.category].value += p.price * p.quantity;
        summary[p.category].quantity += p.quantity;
    });
    return summary;
}

function getStockDistribution() {
    const counts = { instock: 0, lowstock: 0, outofstock: 0 };
    inventoryData.forEach(p => counts[getStockStatus(p)]++);
    return counts;
}

function exportToCSV() {
    const headers = ["SKU", "Product Name", "Category", "Price", "Quantity", "Status"];
    const rows = appState.filteredProducts.map(p => [
        p.sku, p.name, p.category, p.price, p.quantity, getStockStatusLabel(getStockStatus(p))
    ]);
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Inventory_Export_" + new Date().toISOString().slice(0, 10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
}

function simulateRealTimeUpdate() {
    const randomIndex = Math.floor(Math.random() * inventoryData.length);
    const change = Math.floor(Math.random() * 5) - 2;
    inventoryData[randomIndex].quantity = Math.max(0, inventoryData[randomIndex].quantity + change);
    updateAllUI();
}

let valueChart, stockChart;

function initCharts() {
    const categoryData = getCategorySummary();
    const catLabels = Object.keys(categoryData);
    const catValues = catLabels.map(c => categoryData[c].value);
    const stockDist = getStockDistribution();

    const ctx1 = document.getElementById("valueChart").getContext("2d");
    if (valueChart) valueChart.destroy();
    valueChart = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: catLabels,
            datasets: [{ label: "Inventory Value (₱)", data: catValues, backgroundColor: "#0d47a1", borderRadius: 6 }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    const ctx2 = document.getElementById("stockChart").getContext("2d");
    if (stockChart) stockChart.destroy();
    stockChart = new Chart(ctx2, {
        type: "doughnut",
        data: {
            labels: ["In Stock", "Low Stock", "Out of Stock"],
            datasets: [{
                data: [stockDist.instock, stockDist.lowstock, stockDist.outofstock],
                backgroundColor: ["#10b981", "#f59e0b", "#ef4444"]
            }]
        },
        options: { responsive: true }
    });
}

function renderInventoryTable() {
    const tbody = document.getElementById("inventoryTable");
    tbody.innerHTML = "";
    appState.filteredProducts.forEach(p => {
        const status = getStockStatus(p);
        const statusLabel = getStockStatusLabel(status);
        const row = document.createElement("tr");
        if (status === "lowstock") row.classList.add("table-warning");
        if (status === "outofstock") row.classList.add("table-danger");
        row.innerHTML = `
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>₱${p.price.toLocaleString()}</td>
            <td>${p.quantity}</td>
            <td>${statusLabel}</td>
        `;
        tbody.appendChild(row);
    });
}

function renderStatistics() {
    const stats = getStatistics();
    document.getElementById("totalProducts").textContent = stats.totalProducts;
    document.getElementById("totalValue").textContent = "₱" + stats.totalValue.toLocaleString();
    document.getElementById("lowStockCount").textContent = stats.lowStockCount;
    document.getElementById("categoryCount").textContent = stats.categories;
    document.getElementById("lowStockAlert").classList.toggle("d-none", stats.lowStockCount === 0);
}

function populateCategoryFilter() {
    const select = document.getElementById("categoryFilter");
    getUniqueCategories().forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
}

function updateAllUI() {
    applyFilters();
    renderStatistics();
    renderInventoryTable();
    initCharts();
}

function initEventListeners() {
    document.getElementById("searchInput").addEventListener("input", e => {
        appState.searchQuery = e.target.value;
        updateAllUI();
    });
    document.getElementById("categoryFilter").addEventListener("change", e => {
        appState.category = e.target.value;
        updateAllUI();
    });
    document.getElementById("stockFilter").addEventListener("change", e => {
        appState.stockStatus = e.target.value;
        updateAllUI();
    });
    document.getElementById("priceMax").addEventListener("input", e => {
        appState.priceMax = e.target.value === "" ? Infinity : Number(e.target.value);
        updateAllUI();
    });
    document.getElementById("exportBtn").addEventListener("click", exportToCSV);
}

function initDataManager() {
    populateCategoryFilter();
    initEventListeners();
    updateAllUI();
    setInterval(simulateRealTimeUpdate, 30000);
}