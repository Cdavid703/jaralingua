(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function aliases(text) {
    var normalized = normalize(text);
    var extra = [];
    normalized.replace(/\bunit\s*([0-9]+)\b/g, function (_match, number) {
      extra.push("unidad " + number, "unit " + number, "u" + number, "tema " + number);
      return _match;
    });
    normalized.replace(/\bunidad\s*([0-9]+)\b/g, function (_match, number) {
      extra.push("unit " + number, "unidad " + number, "u" + number, "tema " + number);
      return _match;
    });
    return normalized + " " + extra.join(" ");
  }

  function queryTerms(value) {
    var normalized = normalize(value)
      .replace(/\bunidad\s*([0-9]+)\b/g, "unit $1")
      .replace(/\btema\s*([0-9]+)\b/g, "unit $1")
      .replace(/\bu\s*([0-9]+)\b/g, "unit $1");
    var seen = {};
    return normalized.split(" ").filter(function (term) {
      if (!term || seen[term]) return false;
      seen[term] = true;
      return true;
    });
  }

  function matchesSearch(searchText, terms) {
    return terms.every(function (term) {
      return searchText.indexOf(term) !== -1;
    });
  }

  function textFor(element) {
    var parts = [
      element.textContent,
      element.id,
      element.getAttribute("data-search-keywords"),
      element.getAttribute("aria-label")
    ];
    $all("img", element).forEach(function (image) {
      parts.push(image.getAttribute("alt"));
    });
    $all("a", element).forEach(function (link) {
      parts.push(link.getAttribute("href"));
    });
    return aliases(parts.filter(Boolean).join(" "));
  }

  function groupHeaderText(group) {
    var summary = group && group.tagName === "DETAILS" ? $("summary", group) : null;
    return summary ? textFor(summary) : textFor(group);
  }

  function setHidden(element, hidden) {
    if (!element) return;
    element.hidden = Boolean(hidden);
    element.classList.toggle("search-hidden", Boolean(hidden));
  }

  function initialOpen(element) {
    if (!element || element.tagName !== "DETAILS") return;
    if (!element.hasAttribute("data-search-initial-open")) {
      element.setAttribute("data-search-initial-open", element.open ? "1" : "0");
    }
  }

  function restoreOpen(element) {
    if (!element || element.tagName !== "DETAILS") return;
    element.open = element.getAttribute("data-search-initial-open") === "1";
  }

  function countVisible(items) {
    return items.filter(function (item) { return !item.hidden; }).length;
  }

  function initPanel(panel) {
    var input = $("[data-course-search-input]", panel);
    var clearButton = $("[data-course-search-clear]", panel);
    var countNode = $("[data-course-search-count]", panel);
    var emptyNode = $("[data-course-search-empty]", panel);
    if (!emptyNode && panel.nextElementSibling && panel.nextElementSibling.hasAttribute("data-course-search-empty")) {
      emptyNode = panel.nextElementSibling;
    }
    var target = $(panel.getAttribute("data-search-target") || "");
    if (!input || !target) return;

    var itemSelector = panel.getAttribute("data-search-items") || "[data-search-item]";
    var groupSelector = panel.getAttribute("data-search-groups") || "";
    var groupItemSelector = panel.getAttribute("data-search-group-items") || itemSelector;
    var groups = groupSelector ? $all(groupSelector, target) : [];
    var standaloneItems = groups.length ? [] : $all(itemSelector, target);
    groups.forEach(initialOpen);

    function filter() {
      var terms = queryTerms(input.value);
      var hasQuery = terms.length > 0;
      document.documentElement.classList.toggle("course-search-active", hasQuery);
      var visibleItems = 0;
      var visibleGroups = 0;

      if (!hasQuery) {
        groups.forEach(function (group) {
          setHidden(group, false);
          restoreOpen(group);
          $all(groupItemSelector, group).forEach(function (item) { setHidden(item, false); });
        });
        standaloneItems.forEach(function (item) { setHidden(item, false); });
        visibleItems = groups.length ? groups.length : standaloneItems.length;
        visibleGroups = groups.length;
      } else if (groups.length) {
        groups.forEach(function (group) {
          var groupText = groupHeaderText(group);
          var groupMatches = matchesSearch(groupText, terms);
          var children = $all(groupItemSelector, group);
          var childMatches = 0;
          children.forEach(function (child) {
            var matches = groupMatches || matchesSearch(textFor(child), terms);
            setHidden(child, !matches);
            if (matches) childMatches += 1;
          });
          var visible = groupMatches || childMatches > 0;
          setHidden(group, !visible);
          if (group.tagName === "DETAILS") group.open = visible;
          if (visible) {
            visibleGroups += 1;
            visibleItems += children.length ? childMatches : 1;
          }
        });
      } else {
        standaloneItems.forEach(function (item) {
          var matches = matchesSearch(textFor(item), terms);
          setHidden(item, !matches);
        });
        visibleItems = countVisible(standaloneItems);
      }

      if (countNode) {
        var label = visibleItems === 1 ? "result" : "results";
        if (!hasQuery) {
          countNode.textContent = groups.length ? visibleItems + " sections available" : visibleItems + " items available";
        } else if (groups.length && visibleGroups) {
          countNode.textContent = visibleItems + " " + label + " in " + visibleGroups + " section" + (visibleGroups === 1 ? "" : "s");
        } else {
          countNode.textContent = visibleItems + " " + label;
        }
      }
      if (emptyNode) emptyNode.hidden = !hasQuery || visibleItems > 0;
      if (clearButton) clearButton.hidden = !hasQuery;
    }

    input.addEventListener("input", filter);
    if (clearButton) {
      clearButton.addEventListener("click", function () {
        input.value = "";
        input.focus();
        filter();
      });
    }
    filter();
  }

  document.addEventListener("DOMContentLoaded", function () {
    $all("[data-course-search-panel]").forEach(initPanel);
  });
})();
