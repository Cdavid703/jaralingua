(function () {
  const activeTabs = Object.create(null);

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function button(id, label, icon, options) {
    const settings = options || {};
    const selected = settings.selected === true;
    const count = settings.count;
    return `
      <button class="staff-tab" type="button" role="tab" id="gradebook-tab-${escapeHtml(id)}" aria-controls="gradebook-panel-${escapeHtml(id)}" aria-selected="${selected ? "true" : "false"}" tabindex="${selected ? "0" : "-1"}" data-gradebook-tab="${escapeHtml(id)}">
        <i class="bi ${escapeHtml(icon)}" aria-hidden="true"></i>
        <span>${escapeHtml(label)}</span>
        ${count == null ? "" : `<span class="staff-tab-count">${escapeHtml(count)}</span>`}
      </button>
    `;
  }

  function panel(id, content, selected) {
    return `<section class="staff-tab-panel" role="tabpanel" id="gradebook-panel-${escapeHtml(id)}" aria-labelledby="gradebook-tab-${escapeHtml(id)}" tabindex="0" data-gradebook-panel="${escapeHtml(id)}"${selected ? "" : " hidden"}>${content}</section>`;
  }

  function wire(root) {
    const shell = root && root.querySelector("[data-gradebook-tabs]");
    if (!shell) return;
    const tabs = Array.from(shell.querySelectorAll("[data-gradebook-tab]"));
    const panels = Array.from(shell.querySelectorAll("[data-gradebook-panel]"));
    const key = root.id || "gradebook";

    function activate(tabId, moveFocus) {
      const nextTab = tabs.find(function (tab) {
        return tab.getAttribute("data-gradebook-tab") === tabId;
      }) || tabs[0];
      if (!nextTab) return;
      const nextId = nextTab.getAttribute("data-gradebook-tab");
      activeTabs[key] = nextId;
      tabs.forEach(function (tab) {
        const selected = tab === nextTab;
        tab.setAttribute("aria-selected", selected ? "true" : "false");
        tab.tabIndex = selected ? 0 : -1;
      });
      panels.forEach(function (tabPanel) {
        tabPanel.hidden = tabPanel.getAttribute("data-gradebook-panel") !== nextId;
      });
      if (moveFocus) nextTab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () {
        activate(tab.getAttribute("data-gradebook-tab"), false);
      });
      tab.addEventListener("keydown", function (event) {
        let nextIndex = null;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") nextIndex = 0;
        if (event.key === "End") nextIndex = tabs.length - 1;
        if (nextIndex == null) return;
        event.preventDefault();
        activate(tabs[nextIndex].getAttribute("data-gradebook-tab"), true);
      });
    });

    const selectedTab = tabs.find(function (tab) {
      return tab.getAttribute("aria-selected") === "true";
    });
    activate(activeTabs[key] || (selectedTab && selectedTab.getAttribute("data-gradebook-tab")), false);
  }

  window.JaraGradebookTabs = { button: button, panel: panel, wire: wire };
})();
