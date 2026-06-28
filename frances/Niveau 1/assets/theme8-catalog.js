(function () {
  "use strict";

  const Q = (question, options, answer, explanation) => ({
    question,
    options,
    answer,
    explanation: explanation || "Relisez le thème 8 : la réponse se trouve dans le vocabulaire de l’alimentation, des achats ou des articles partitifs."
  });

  const A = (title, theme, skill, description, questions, extra) =>
    Object.assign({ title, theme, skill, description, questions }, extra || {});

  const C = {
    "ecoute-au-cafe": A(
      "Écoute : au café de la place",
      "Thème 8 · Alimentation et achats",
      "Compréhension orale",
      "Écoutez le dialogue complet au café, puis répondez aux questions de compréhension.",
      [
        Q("Où se passe la scène ?", ["dans un café", "dans une bibliothèque", "dans une pharmacie"], 0, "La scène se passe au Café de la place."),
        Q("Que voudrait Lina ?", ["un café crème et un croissant", "une soupe et du riz", "un jus d’orange et une salade"], 0, "Lina commande un café crème et un croissant."),
        Q("Que prend Mateo ?", ["un thé, un jus d’orange et une part de tarte", "un café, du fromage et une bouteille d’eau", "une salade, du pain et du poulet"], 0, "Mateo prend un thé, un jus d’orange et une part de tarte."),
        Q("Quel produit n’est pas disponible ?", ["les croissants aux amandes", "le thé", "la tarte"], 0, "La serveuse dit qu’il n’y a plus de croissants aux amandes."),
        Q("Que propose la serveuse à la place ?", ["des croissants nature", "du poisson", "des pommes"], 0, "Elle propose des croissants nature."),
        Q("Combien coûte la commande au total ?", ["neuf euros quatre-vingts", "six euros cinquante", "douze euros quinze"], 0, "La serveuse annonce : neuf euros quatre-vingts."),
        Q("Comment Lina paie-t-elle ?", ["par carte", "en espèces", "avec un billet de train"], 0, "Lina demande si elle peut payer par carte."),
        Q("Quelle formule de politesse est utilisée à la fin ?", ["Merci, bonne journée !", "Je ne parle pas.", "Où est la chambre ?"], 0, "La scène se termine avec une formule de remerciement et de politesse.")
      ],
      {
        audio: "../audio/theme-8/au-cafe-de-la-place.mp3?v=20260628-theme8",
        transcript: `Narratrice : Il est dix heures trente. Lina et Mateo entrent au Café de la place pour prendre une petite pause.

Serveuse : Bonjour, vous désirez ?

Lina : Bonjour madame. Je voudrais un café crème et un croissant, s’il vous plaît.

Serveuse : Très bien. Un café crème et un croissant. Et pour vous, monsieur ?

Mateo : Pour moi, je prends un thé, un jus d’orange et une part de tarte aux pommes.

Serveuse : D’accord. Nous n’avons plus de croissants aux amandes, mais nous avons des croissants nature.

Lina : Un croissant nature, c’est parfait. Est-ce que vous avez aussi de l’eau ?

Serveuse : Oui, bien sûr. Une carafe d’eau, c’est gratuit.

Mateo : Merci. Et ça coûte combien, s’il vous plaît ?

Serveuse : Le café crème coûte deux euros quatre-vingts, le croissant coûte deux euros, le thé coûte deux euros cinquante, le jus d’orange coûte deux euros et la tarte coûte trois euros. Avec la carafe d’eau, cela fait neuf euros quatre-vingts.

Lina : Très bien. Je peux payer par carte ?

Serveuse : Oui, sans problème.

Mateo : Merci beaucoup.

Serveuse : Merci à vous. Bonne journée !`
      }
    ),

    "aliments-essentiels": A(
      "Les aliments essentiels",
      "Thème 8 · Alimentation et achats",
      "Vocabulaire",
      "Associez les aliments et les boissons fréquents à leur usage quotidien.",
      [
        Q("Quel mot désigne une boisson chaude noire ?", ["le café", "le pain", "la salade"], 0, "Le café est une boisson chaude."),
        Q("Quel aliment mange-t-on souvent avec du fromage ?", ["du pain", "de l’eau", "un ticket"], 0, "On peut manger du pain avec du fromage."),
        Q("Quel mot est une boisson froide ?", ["un jus d’orange", "une chaise", "un bureau"], 0, "Le jus d’orange est une boisson."),
        Q("Quel aliment est souvent vert et frais ?", ["la salade", "le café", "la monnaie"], 0, "La salade est un aliment frais."),
        Q("Quel mot désigne un fruit ?", ["une pomme", "une carte", "un sac"], 0, "La pomme est un fruit."),
        Q("Quel mot convient pour un produit laitier ?", ["le fromage", "le métro", "le miroir"], 0, "Le fromage est un produit laitier."),
        Q("Quel mot désigne une pâtisserie française fréquente au petit déjeuner ?", ["un croissant", "un cahier", "une fenêtre"], 0, "Le croissant est une pâtisserie."),
        Q("Quel aliment peut être chaud et liquide ?", ["la soupe", "la table", "la porte"], 0, "La soupe est un plat liquide."),
        Q("Quelle phrase est naturelle ?", ["Je bois de l’eau.", "Je bois du pain.", "Je bois une chaise."], 0, "On boit de l’eau."),
        Q("Quelle phrase est naturelle ?", ["Je mange une pomme.", "Je mange un café.", "Je mange une carte bancaire."], 0, "On mange une pomme."),
        Q("Dans un café, on peut commander :", ["un café et un croissant", "une armoire et un lit", "un billet et une valise"], 0, "Le café et le croissant appartiennent au contexte du café."),
        Q("Dans une épicerie, on peut acheter :", ["des fruits et du pain", "une douche et un miroir", "une nationalité et un prénom"], 0, "Les fruits et le pain sont des produits alimentaires.")
      ]
    ),

    "articles-partitifs": A(
      "Du, de la, de l’, des",
      "Thème 8 · Alimentation et achats",
      "Grammaire",
      "Choisissez l’article partitif correct et utilisez la forme négative avec de / d’.",
      [
        Q("Complétez : Je prends ___ pain.", ["du", "de la", "des"], 0, "Pain est masculin singulier : du pain."),
        Q("Complétez : Elle mange ___ salade.", ["de la", "du", "des"], 0, "Salade est féminin singulier : de la salade."),
        Q("Complétez : Nous buvons ___ eau.", ["de l’", "du", "des"], 0, "Devant une voyelle, on utilise de l’ : de l’eau."),
        Q("Complétez : Ils achètent ___ fruits.", ["des", "du", "de la"], 0, "Fruits est pluriel : des fruits."),
        Q("Quelle phrase est correcte ?", ["Je voudrais du café.", "Je voudrais de le café.", "Je voudrais des café."], 0, "Au masculin singulier, de + le devient du."),
        Q("Quelle phrase est correcte ?", ["Je prends de la soupe.", "Je prends du soupe.", "Je prends des soupe."], 0, "Soupe est féminin singulier : de la soupe."),
        Q("Transformez au négatif : Je prends du thé.", ["Je ne prends pas de thé.", "Je ne prends pas du thé.", "Je prends ne pas de thé."], 0, "Après une négation de quantité, on utilise de : pas de thé."),
        Q("Transformez au négatif : Elle mange de la salade.", ["Elle ne mange pas de salade.", "Elle ne mange pas de la salade.", "Elle ne salade pas."], 0, "Après pas, l’article partitif devient de."),
        Q("Complétez : Il n’y a pas ___ eau.", ["d’", "de la", "du"], 0, "Devant une voyelle, de devient d’ : pas d’eau."),
        Q("Complétez : Nous n’achetons pas ___ croissants.", ["de", "des", "du"], 0, "Après une négation, des devient de : pas de croissants."),
        Q("Quelle phrase utilise une quantité indéfinie ?", ["Je bois de l’eau.", "Je bois l’eau de la bouteille bleue.", "Je suis l’eau."], 0, "De l’eau signifie une quantité non précisée."),
        Q("Quelle phrase est académique ?", ["Je ne mange pas de fromage.", "Je ne mange pas du fromage.", "Je ne fromage pas mange."], 0, "La forme de base attendue est pas de fromage.")
      ]
    ),

    "je-voudrais-commander": A(
      "Je voudrais commander",
      "Thème 8 · Alimentation et achats",
      "Interaction",
      "Construisez une commande polie dans un café ou une petite boutique.",
      [
        Q("Pour commander poliment, choisissez :", ["Je voudrais un café, s’il vous plaît.", "Donne café.", "Je suis café."], 0, "Je voudrais + nom est une forme polie."),
        Q("Pour demander le prix, choisissez :", ["Ça coûte combien ?", "Tu t’appelles combien ?", "Où est le combien ?"], 0, "Ça coûte combien  demande le prix."),
        Q("Pour demander si un produit existe, choisissez :", ["Vous avez des croissants ?", "Vous êtes des croissants ?", "Vous allez croissant ?"], 0, "Vous avez...  est naturel pour demander un produit."),
        Q("Pour répondre à la serveuse, choisissez :", ["Pour moi, un thé, s’il vous plaît.", "Moi thé donne vite.", "Je thé suis."], 0, "Pour moi + article + nom est une réponse courte polie."),
        Q("Quelle formule termine une commande ?", ["Merci beaucoup.", "Je ne suis pas une table.", "Le métro est grand."], 0, "Merci beaucoup est une formule de politesse."),
        Q("Complétez : Je voudrais ___ croissant.", ["un", "une", "des"], 0, "Croissant est masculin singulier : un croissant."),
        Q("Complétez : Je voudrais ___ salade.", ["une", "un", "des"], 0, "Salade est féminin singulier : une salade."),
        Q("Complétez : Je voudrais ___ fruits.", ["des", "un", "une"], 0, "Fruits est pluriel : des fruits."),
        Q("Dans un café, le client peut dire :", ["L’addition, s’il vous plaît.", "La chambre est sous le lit.", "Je suis nationalité."], 0, "L’addition sert à demander le total à payer."),
        Q("Pour payer, choisissez :", ["Je peux payer par carte ?", "Je peux dormir par carte ?", "Je peux habiter la carte ?"], 0, "Payer par carte est une expression utile dans un achat."),
        Q("Quelle phrase est la plus polie ?", ["Je voudrais de l’eau, s’il vous plaît.", "Eau !", "Donne-moi eau maintenant."], 0, "Je voudrais... s’il vous plaît est la forme recommandée."),
        Q("Si un produit manque, le vendeur peut dire :", ["Nous n’avons plus de croissants.", "Nous ne sommes plus de croissants.", "Nous allons plus croissants."], 0, "Ne plus avoir de + nom exprime l’absence d’un produit.")
      ]
    ),

    "lecture-menu-simple": A(
      "Lire un menu simple",
      "Thème 8 · Alimentation et achats",
      "Compréhension écrite",
      "Lisez un menu court de café et identifiez les produits, les prix et les choix possibles.",
      [
        Q("Quel produit coûte 2,80 € ?", ["le café crème", "la salade complète", "le menu déjeuner"], 0),
        Q("Quel produit est une boisson froide ?", ["le jus d’orange", "le thé", "le croissant"], 0),
        Q("Combien coûte le croissant ?", ["2,00 €", "4,50 €", "8,90 €"], 0),
        Q("Quel produit contient du fromage ?", ["le sandwich jambon-fromage", "le jus d’orange", "le café crème"], 0),
        Q("Quel choix est le plus cher ?", ["le menu déjeuner", "le croissant", "le thé"], 0),
        Q("Quel produit est adapté pour une petite faim ?", ["une part de tarte", "une carafe d’eau", "un ticket"], 0),
        Q("Quel produit est gratuit ?", ["la carafe d’eau", "la salade complète", "le jus d’orange"], 0),
        Q("Quelle phrase résume le menu ?", ["Il propose des boissons, des pâtisseries et des plats simples.", "Il propose seulement des chambres.", "Il propose des horaires de train."], 0)
      ],
      {
        reading: "Menu du Café de la place. Boissons : café crème 2,80 €, thé 2,50 €, jus d’orange 2,00 €, carafe d’eau gratuite. Pâtisseries : croissant 2,00 €, part de tarte aux pommes 3,00 €. Plats simples : sandwich jambon-fromage 4,50 €, salade complète 6,80 €. Menu déjeuner : sandwich, boisson et dessert 8,90 €. Le service commence à dix heures."
      }
    ),

    "prix-quantites": A(
      "Prix et quantités",
      "Thème 8 · Alimentation et achats",
      "Prix et nombres",
      "Comprenez les prix simples et associez les quantités aux produits.",
      [
        Q("Comment lit-on 2,50 € ?", ["deux euros cinquante", "vingt-cinq euros", "deux cent cinquante euros"], 0, "En français courant, 2,50 € se lit deux euros cinquante."),
        Q("Comment lit-on 3,80 € ?", ["trois euros quatre-vingts", "trente-huit euros", "trois euros huit"], 0, "3,80 € = trois euros quatre-vingts."),
        Q("Quel prix correspond à « neuf euros quatre-vingts » ?", ["9,80 €", "98,00 €", "0,98 €"], 0, "Neuf euros quatre-vingts correspond à 9,80 €."),
        Q("Complétez : une ___ d’eau.", ["bouteille", "croissant", "fromage"], 0, "Une bouteille d’eau est une quantité courante."),
        Q("Complétez : un ___ de café.", ["paquet", "salade", "pomme"], 0, "Un paquet de café est une quantité emballée."),
        Q("Complétez : une ___ de tarte.", ["part", "verre", "kilo"], 0, "Une part de tarte est une portion."),
        Q("Complétez : un ___ de jus d’orange.", ["verre", "pain", "fruit"], 0, "On peut commander un verre de jus d’orange."),
        Q("Quelle quantité convient pour le pain ?", ["une baguette", "un verre", "une tasse"], 0, "Une baguette est une forme de pain."),
        Q("Quelle question demande le prix total ?", ["Ça fait combien ?", "Tu fais quoi ?", "Tu habites où ?"], 0, "Ça fait combien  demande le total."),
        Q("Si le café coûte 2,80 € et le croissant 2,00 €, le total est :", ["4,80 €", "2,80 €", "8,20 €"], 0, "2,80 + 2,00 = 4,80."),
        Q("Quelle phrase est naturelle ?", ["Je voudrais deux croissants.", "Je voudrais deux eau.", "Je voudrais deux café sans article."], 0, "Avec un nom comptable pluriel : deux croissants."),
        Q("Quelle phrase est naturelle ?", ["Je voudrais un verre d’eau.", "Je voudrais un verre de croissant.", "Je voudrais un verre de table."], 0, "Un verre d’eau est une expression de quantité correcte.")
      ]
    ),

    "production-commande-cafe": A(
      "Jeu de rôle : commander au café",
      "Thème 8 · Alimentation et achats",
      "Production guidée",
      "Choisissez les blocs qui construisent un dialogue clair entre un client et une serveuse.",
      [
        Q("Pour commencer le dialogue, choisissez :", ["Bonjour, vous désirez ?", "La chambre est petite.", "Je m’appelle prix."], 0),
        Q("Le client commande poliment :", ["Je voudrais un thé, s’il vous plaît.", "Thé moi maintenant.", "Je suis un thé."], 0),
        Q("Le client ajoute une pâtisserie :", ["Et une part de tarte, s’il vous plaît.", "Et je vais une chaise.", "Et une nationalité."], 0),
        Q("La serveuse confirme :", ["Très bien : un thé et une part de tarte.", "Très bien : une armoire et un lit.", "Très bien : quinze nationalités."], 0),
        Q("Le client demande le prix :", ["Ça fait combien ?", "Ça habite combien ?", "Ça s’appelle café ?"], 0),
        Q("La serveuse répond :", ["Ça fait cinq euros cinquante.", "Ça fait je suis français.", "Ça fait dans la cuisine."], 0),
        Q("Le client demande à payer :", ["Je peux payer par carte ?", "Je peux payer par fenêtre ?", "Je peux payer par famille ?"], 0),
        Q("Pour refuser un produit, choisissez :", ["Non merci, je ne prends pas de jus.", "Non merci, je ne prends pas du jus.", "Non merci, pas jus je."], 0),
        Q("Pour demander de l’eau, choisissez :", ["Vous avez de l’eau ?", "Vous êtes de l’eau ?", "Vous allez d’eau ?"], 0),
        Q("Pour terminer le dialogue, choisissez :", ["Merci, bonne journée !", "Merci, je suis le menu.", "Bonne journée coûte."], 0)
      ]
    )
  };

  window.quizCatalog = window.quizCatalog || {};
  window.french1ExpandedActivities = window.french1ExpandedActivities || {};
  Object.assign(window.quizCatalog, C);
  Object.assign(window.french1ExpandedActivities, C);
})();
