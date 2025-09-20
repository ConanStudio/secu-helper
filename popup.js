const priceInput = document.getElementById('priceInput');
const enableSwitch = document.getElementById('enableSwitch');
const saveBtn = document.getElementById('saveBtn');
const status = document.getElementById('status');

// 页面加载时读取设置
chrome.storage.sync.get(['secPrice', 'enabled'], ({ secPrice, enabled }) => {
    priceInput.value = secPrice || 0.0285;
    enableSwitch.checked = enabled !== false; // 默认启用
});

saveBtn.addEventListener('click', () => {
    const price = parseFloat(priceInput.value);
    if (isNaN(price) || price <= 0) {
        status.textContent = "请输入有效的每SeCU价格";
        return;
    }
    const enabled = enableSwitch.checked;

    chrome.storage.sync.set({ secPrice: price, enabled: enabled }, () => {
        status.textContent = "设置已保存，页面将刷新";
        setTimeout(() => {
            // 刷新当前页
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.tabs.reload(tabs[0].id);
            });
        }, 500);
    });
});
