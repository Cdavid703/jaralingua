(function () {
  const allowedEmails = new Set([
    "andresafmt@gmail.com",
    "cdavid.jaramillo@gmail.com"
  ]);

  function normalizeEmail(value) {
    return String(value || "").trim().toLowerCase();
  }

  function readStoredUser(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || sessionStorage.getItem(key) || "null");
    } catch (error) {
      return null;
    }
  }

  function currentEmail() {
    const googleUser = readStoredUser("jaralingua_google_user");
    const microsoftUser = readStoredUser("jaralingua_microsoft_user");
    return normalizeEmail((googleUser && googleUser.email) || (microsoftUser && microsoftUser.email));
  }

  function updateSpecialActivities() {
    const canView = allowedEmails.has(currentEmail());
    document.querySelectorAll('[data-special-activity="andres-retake"]').forEach(function (node) {
      node.hidden = !canView;
      node.setAttribute("aria-hidden", canView ? "false" : "true");
    });
  }

  document.addEventListener("DOMContentLoaded", updateSpecialActivities);
  window.addEventListener("storage", updateSpecialActivities);
  setInterval(updateSpecialActivities, 1000);
})();
