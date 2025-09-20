console.log("[SeCU插件] 内容脚本已加载");

// 格式化数字
function formatNumber(num) {
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// 更新单行
function updateRow(row, pricePerSeCU) {
    if (row.querySelector('td[data-actual-fee]')) return;

    const tdList = row.querySelectorAll('td');
    if (tdList.length < 4) return;

    const secuCell = tdList[3];
    const secuTotal = parseFloat(secuCell.textContent.replace(/,/g, ''));
    if (isNaN(secuTotal)) return;

    const actualFee = secuTotal * pricePerSeCU;

    const operationCell = tdList[tdList.length - 1];
    const newCell = document.createElement('td');
    newCell.setAttribute("data-actual-fee", "1");
    newCell.style.minWidth = "140px";
    newCell.style.whiteSpace = "nowrap";
    newCell.innerHTML = `<div class="cs-table-cell-wrapper">${formatNumber(actualFee)} RMB</div>`;

    row.insertBefore(newCell, operationCell);
}

// 更新整个表格
function updateTable(table, pricePerSeCU) {
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;

    // 添加表头
    const headerRow = thead.querySelector('tr');
    if (!headerRow.querySelector('th[data-actual-fee]')) {
        let th = document.createElement('th');
        th.setAttribute("role", "gridcell");
        th.setAttribute("data-actual-fee", "1");
        th.innerHTML = `<div class="cs-table-cell-wrapper">实际资源包抵扣费用</div>`;
        th.style.minWidth = "140px";
        th.style.whiteSpace = "nowrap";
        const operationIndex = headerRow.children.length - 1;
        headerRow.insertBefore(th, headerRow.children[operationIndex]);
        console.log("[SeCU插件] 添加表头列: 实际资源包抵扣费用");
    }

    tbody.querySelectorAll('tr').forEach(row => updateRow(row, pricePerSeCU));
}

// 观察 tbody 内部变化
function observeTable(table, pricePerSeCU) {
    const tbody = table.querySelector('tbody');
    if (!tbody) return;

    const tbodyObserver = new MutationObserver(() => updateTable(table, pricePerSeCU));
    tbodyObserver.observe(tbody, { childList: true, subtree: true });
}

// 主函数
function main() {
    chrome.storage.sync.get(['secPrice', 'enabled'], ({ secPrice, enabled }) => {
        if (enabled === false) return; // 功能关闭
        const pricePerSeCU = secPrice || 0.0285;
        const table = document.querySelector('table[role="table"]');
        if (table) {
            updateTable(table, pricePerSeCU);
            observeTable(table, pricePerSeCU);
        }
    });
}

// 暴露全局函数供 popup 调用
window.updateSeCU = main;

// 页面加载及变化观察
const pageObserver = new MutationObserver(main);
pageObserver.observe(document.body, { childList: true, subtree: true });
