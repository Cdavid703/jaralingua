/* The new gradebook starts with empty page sections, without a records API. */
(() => {
  'use strict';
  const root = document.getElementById('preintermediate-gradebook');
  if (root && window.JaraGradebookTabs) window.JaraGradebookTabs.wire(root);
})();
