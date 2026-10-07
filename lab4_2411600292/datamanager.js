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

function getStockStatus(product) {
    if (product.quantity <= 0) return "outofstock";
    if (product.quantity <= product.reorderLevel) return "lowstock";
    return "instock";
}

function applyFilters() {
    appState.filteredProducts = inventoryData.filter(p => {
        const matchSearch = appState.searchQuery === "" ||
            p.name.toLowerCase().includes(appState.searchQuery.toLowerCase()) ||
            p.sku.toLowerCase().includes(appState.searchQuery.toLowerCase());
        const matchCat = appState.category === "all" || p.category === appState.category;
        const status = getStockStatus(p);
        const matchStock = appState.stockStatus === "all" || status === appState.stockStatus;
        const matchPrice = p.price <= appState.priceMax;
        return matchSearch && matchCat && matchStock && matchPrice;
    });
}

function getStats() {
    const total = inventoryData.length;
    const low = inventoryData.filter(p => p.quantity <= p.reorderLevel).length;
    const out = inventoryData.filter(p => p.quantity <= 0).length;
    const value = inventoryData.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const cats = [...new Set(inventoryData.map(p => p.category))].length;
    return { total, low, out, value, cats };
}

function getCategorySummary() {
    const summary = {};
    inventoryData.forEach(p => {
        if (!summary[p.category]) summary[p.category] = 0;
        summary[p.category] += p.price * p.quantity;
    });
    return summary;
}

function getStockDist() {
    return {
        instock: inventoryData.filter(p => getStockStatus(p) === "instock").length,
        low: inventoryData.filter(p => getStockStatus(p) === "lowstock").length,
        out: inventoryData.filter(p => getStockStatus(p) === "outofstock").length
    };
}

let valueChart, stockChart;

function initCharts() {
    const catData = getCategorySummary();
    const labels = Object.keys(catData);
    const values = Object.values(catData);
    const stock = getStockDist();

    const ctx1 = document.getElementById("valueChart").getContext("2d");
    if (valueChart) valueChart.destroy();
    valueChart = new Chart(ctx1, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{ label: "Value (₱)", data: values, backgroundColor: "#0d47a1", borderRadius: 6 }]
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } }
    });

    const ctx2 = document.getElementById("stockChart").getContext("2d");
    if (stockChart) stockChart.destroy();
    stockChart = new Chart(ctx2, {
        type: "doughnut",
        data: {
            labels: ["In Stock", "Low Stock", "Out of Stock"],
            datasets: [{ data: [stock.instock, stock.low, stock.out], backgroundColor: ["#10b981", "#f59e0b", "#ef4444"] }]
        },
        options: { responsive: true }
    });
}

function renderTable() {
    const tbody = document.getElementById("inventoryTable");
    tbody.innerHTML = "";
    appState.filteredProducts.forEach(p => {
        const status = getStockStatus(p);
        const label = status === "instock" ? "In Stock" : status === "lowstock" ? "Low Stock" : "Out of Stock";
        const badge = status === "instock" ? "bg-success" : status === "lowstock" ? "bg-warning text-dark" : "bg-danger";
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.sku}</td>
            <td>${p.name}</td>
            <td>${p.category}</td>
            <td>₱${p.price.toLocaleString()}</td>
            <td>${p.quantity}</td>
            <td><span class="badge ${badge}">${label}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function updateUI() {
    applyFilters();
    const s = getStats();
    document.getElementById("totalProducts").textContent = s.total;
    document.getElementById("totalValue").textContent = "₱" + s.value.toLocaleString();
    document.getElementById("lowStockCount").textContent = s.low;
    document.getElementById("categoryCount").textContent = s.cats;
    document.getElementById("lowStockAlert").classList.toggle("d-none", s.low === 0 && s.out === 0);
    renderTable();
    initCharts();
}

function exportCSV() {
    const headers = ["SKU","Product Name","Category","Unit Price","Quantity","Status"];
    const rows = appState.filteredProducts.map(p => [
        p.sku, p.name, p.category, p.price, p.quantity,
        getStockStatus(p).replace("instock","In Stock").replace("lowstock","Low Stock").replace("outofstock","Out of Stock")
    ]);
    const csv = [headers,...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Inventory_Export_" + new Date().toISOString().slice(0,10) + ".csv";
    a.click();
    URL.revokeObjectURL(url);
}

function initDataManager() {
    const cats = [...new Set(inventoryData.map(p => p.category))];
    const catSelect = document.getElementById("categoryFilter");
    cats.forEach(c => { const o = document.createElement("option"); o.value = c; o.textContent = c; catSelect.appendChild(o); });

    document.getElementById("searchInput").addEventListener("input", e => {
        appState.searchQuery = e.target.value;
        updateUI();
    });
    document.getElementById("categoryFilter").addEventListener("change", e => {
        appState.category = e.target.value;
        updateUI();
    });
    document.getElementById("stockFilter").addEventListener("change", e => {
        appState.stockStatus = e.target.value;
        updateUI();
    });
    document.getElementById("priceMax").addEventListener("input", e => {
        appState.priceMax = e.target.value === "" ? Infinity : Number(e.target.value);
        updateUI();
    });
    document.getElementById("exportBtn").addEventListener("click", exportCSV);

    updateUI();
}