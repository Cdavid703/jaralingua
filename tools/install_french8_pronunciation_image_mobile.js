const fs = require("fs");
const path = require("path");

const pagePath = path.join(__dirname, "..", "frances", "Niveau 8", "ateliers", "prononciation-01d-conditionnel-passe.html");
let page = fs.readFileSync(pagePath, "utf8");

page = page.replace(
  '<link href="../../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet">',
  '<link href="../../../assets/vendor/fonts/jaralingua-fonts.css" rel="stylesheet">\n  <link href="../../../assets/css/french8-pronunciation-mobile.css" rel="stylesheet">'
);
page = page.replace(
  '<img src="../img/ateliers/listening-01a-choix-carriere-v2.webp" alt="Apprenante pratiquant la prononciation du conditionnel passé">',
  '<img src="../img/ateliers/prononciation-conditionnel-passe-v1.webp" width="1536" height="1024" fetchpriority="high" decoding="async" alt="Apprenante pratiquant la prononciation française avec un microphone et une progression en quatre étapes">'
);

if (!page.includes("french8-pronunciation-mobile.css") || !page.includes("prononciation-conditionnel-passe-v1.webp")) {
  throw new Error("Mobile stylesheet or new activity image was not installed.");
}
fs.writeFileSync(pagePath, page, "utf8");
console.log("New pronunciation image and mobile stylesheet installed.");
