console.log("[SeCU插件] 内容脚本已加载");

function formatNumber(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateRow(row) {
    if (row.querySelector('td[data-actual-fee]')) return;

    const tdList = row.querySelectorAll('td');
    if (tdList.length < 4) return;

    const secuCell = tdList[3];
    const secuTotal = parseFloat(secuCell.textContent.replace(/,/g, ''));
    if (isNaN(secuTotal)) return;

    const actualFee = secuTotal * 0.0285;

    const operationCell = tdList[tdList.length - 1];
    const newCell = document.createElement('td');
    newCell.setAttribute("data-actual-fee", "1");
    newCell.style.minWidth = "120px";
    newCell.style.whiteSpace = "nowrap";
    newCell.innerHTML = `<div class="cs-table-cell-wrapper">${formatNumber(actualFee)} RMB</div>`;

    row.insertBefore(newCell, operationCell);
}

function updateTable(table) {
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    const headerRow = thead.querySelector('tr');
    if (!headerRow.querySelector('th[data-actual-fee]')) {
        let th = document.createElement('th');
        th.setAttribute("role", "gridcell");
        th.setAttribute("data-actual-fee", "1");
        th.innerHTML = `<div class="cs-table-cell-wrapper">实际资源包抵扣费用</div>`;
        th.style.minWidth = "120px";
        th.style.whiteSpace = "nowrap";
        const operationIndex = headerRow.children.length - 1;
        headerRow.insertBefore(th, headerRow.children[operationIndex]);
        console.log("[SeCU插件] 添加表头列: 实际资源包抵扣费用");
    }

    tbody.querySelectorAll('tr').forEach(updateRow);
}

// 观察 tbody 内部变化，动态更新新增行
function observeTable(table) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const tbodyObserver = new MutationObserver(() => updateTable(table));
    tbodyObserver.observe(tbody, { childList: true, subtree: true });
}

// 观察整个页面，找到表格后启动 tbody 观察
const pageObserver = new MutationObserver(() => {
    const table = document.querySelector('table[role="table"]');
    if (table) {
        updateTable(table);
        observeTable(table);
    }
});

pageObserver.observe(document.body, { childList: true, subtree: true });
