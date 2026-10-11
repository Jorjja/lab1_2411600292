const inventoryData = [
    { id: 1, sku: "FIT-001", name: "Yoga Mat Premium", category: "Accessories", price: 850, quantity: 32, reorderLevel: 10 },
    { id: 2, sku: "FIT-002", name: "Adjustable Dumbbell 10kg", category: "Equipment", price: 3200, quantity: 8, reorderLevel: 12 },
    { id: 3, sku: "FIT-003", name: "Resistance Bands Set", category: "Accessories", price: 450, quantity: 55, reorderLevel: 15 },
    { id: 4, sku: "FIT-004", name: "Protein Powder (1kg)", category: "Supplements", price: 1850, quantity: 6, reorderLevel: 10 },
    { id: 5, sku: "FIT-005", name: "Gym Gloves Pro", category: "Accessories", price: 350, quantity: 48, reorderLevel: 20 },
    { id: 6, sku: "FIT-006", name: "Kettlebell 16kg", category: "Equipment", price: 2200, quantity: 5, reorderLevel: 5 },
    { id: 7, sku: "FIT-007", name: "Water Bottle 1L", category: "Accessories", price: 180, quantity: 120, reorderLevel: 30 },
    { id: 8, sku: "FIT-008", name: "Pre-Workout Energy", category: "Supplements", price: 1200, quantity: 0, reorderLevel: 8 },
    { id: 9, sku: "FIT-009", name: "Foam Roller", category: "Recovery", price: 650, quantity: 22, reorderLevel: 8 },
    { id: 10, sku: "FIT-010", name: "Gym Backpack", category: "Apparel", price: 950, quantity: 14, reorderLevel: 5 }
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
            datasets: [{ label: "Value (₱)", data: values, backgroundColor: "#0d5c3e", borderRadius: 6 }]
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
        const label = status === "instock" ? "In Stock ✅" : status === "lowstock" ? "Low Stock ⚠️" : "Out of Stock ❌";
        const badge = status === "instock" ? "bg-success" : status === "lowstock" ? "bg-warning text-dark" : "bg-danger";
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${p.sku}</td>
            <td><strong>${p.name}</strong></td>
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
    const headers = ["SKU","Item Name","Category","Unit Price","Quantity","Status"];
    const rows = appState.filteredProducts.map(p => [
        p.sku, p.name, p.category, p.price, p.quantity,
        getStockStatus(p).replace("instock","In Stock").replace("lowstock","Low Stock").replace("outofstock","Out of Stock")
    ]);
    const csv = [headers,...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], {type:"text/csv"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "JosephFitness_Inventory_" + new Date().toISOString().slice(0,10) + ".csv";
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