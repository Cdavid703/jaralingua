(function () {
  "use strict";

  const Q = (question, options, answer, explanation) => ({
    question,
    options,
    answer,
    explanation: explanation || "Relisez l’explication du thème 7 : la réponse est dans le vocabulaire de la maison."
  });

  const A = (title, theme, skill, description, questions, extra) =>
    Object.assign({ title, theme, skill, description, questions }, extra || {});

  const C = {
    "ecoute-appartement-clara": A(
      "Écoute : l’appartement de Clara",
      "Thème 7 · Maison et environnement",
      "Compréhension orale",
      "Écoutez la visite complète de l’appartement de Clara, puis répondez aux questions.",
      [
        Q("Où se trouve l’appartement de Clara ?", ["près de l’université", "loin de la ville", "dans un village"], 0, "Au début, la narratrice dit que Clara habite près de l’université."),
        Q("Qu’y a-t-il dans le couloir ?", ["un miroir et une petite étagère", "un lit et une armoire", "un canapé et une télévision"], 0, "Le couloir a un miroir et une petite étagère."),
        Q("Pourquoi le salon est-il clair ?", ["parce qu’il y a une grande fenêtre", "parce qu’il y a trois lampes", "parce qu’il est blanc"], 0, "La grande fenêtre rend le salon clair."),
        Q("Où est le canapé ?", ["à côté de la bibliothèque", "sous la table", "dans la cuisine"], 0, "Le canapé est à côté de la bibliothèque."),
        Q("Qu’est-ce qu’il n’y a pas dans la cuisine ?", ["un four", "un réfrigérateur", "un évier"], 0, "La cuisine a une plaque de cuisson, mais pas de four."),
        Q("Où se trouve la chambre ?", ["au fond de l’appartement", "à gauche de l’entrée", "sur le balcon"], 0, "La chambre est au fond de l’appartement."),
        Q("Qu’y a-t-il sur le bureau ?", ["un ordinateur et un cahier de français", "une plante et une lampe", "un miroir et une étagère"], 0, "Sur le bureau, il y a un ordinateur et un cahier de français."),
        Q("Quelle phrase résume l’appartement ?", ["Il est agréable et bien organisé.", "Il est très grand et vide.", "Il n’a pas de fenêtre."], 0, "La dernière phrase dit que l’appartement est agréable et bien organisé.")
      ],
      {
        audio: "../audio/theme-7/visite-appartement-clara.mp3?v=20260628-theme7",
        transcript: `Narratrice : Clara habite dans un petit appartement près de l’université. Aujourd’hui, elle fait visiter son logement à son ami Hugo. Quand on entre, il y a un couloir court avec un miroir et une petite étagère. À gauche, il y a le salon. Le salon est clair parce qu’il y a une grande fenêtre. Devant la fenêtre, il y a une table basse et deux fauteuils. Le canapé est à côté de la bibliothèque. Sur la bibliothèque, Clara garde des livres, une plante verte et une lampe.

Narratrice : À droite du salon, il y a la cuisine. Elle est petite, mais pratique. Il y a un réfrigérateur blanc, un évier, une table ronde et deux chaises. Il n’y a pas de four, mais il y a une plaque de cuisson. Clara prépare souvent le petit déjeuner dans cette cuisine.

Narratrice : La chambre est au fond de l’appartement. Dans la chambre, il y a un lit, une armoire et un bureau. Le bureau est près de la fenêtre. Sur le bureau, il y a un ordinateur et un cahier de français. Il n’y a pas de balcon, mais l’appartement est agréable et bien organisé.`
      }
    ),

    "pieces-maison": A(
      "Les pièces de la maison",
      "Thème 7 · Maison et environnement",
      "Vocabulaire",
      "Identifiez les pièces principales d’un logement et choisissez le mot juste en contexte.",
      [
        Q("Où prépare-t-on normalement le dîner ?", ["dans la cuisine", "dans la chambre", "dans l’entrée"], 0, "La cuisine est la pièce où l’on prépare les repas."),
        Q("Où dort-on ?", ["dans le salon", "dans la chambre", "dans le balcon"], 1, "La chambre est la pièce pour dormir."),
        Q("Où prend-on une douche ?", ["dans la salle de bain", "dans la salle à manger", "dans le couloir"], 0, "La salle de bain sert à se laver."),
        Q("Où reçoit-on des amis pour parler ou regarder un film ?", ["dans le garage", "dans le salon", "dans les toilettes"], 1, "Le salon est souvent la pièce commune pour recevoir."),
        Q("Quelle pièce est souvent dehors ou ouverte sur l’extérieur ?", ["le balcon", "la cuisine", "la chambre"], 0, "Le balcon est un espace extérieur ou semi-extérieur."),
        Q("Quel mot désigne un espace vert autour de la maison ?", ["le jardin", "la salle de bain", "l’escalier"], 0, "Le jardin est un espace extérieur avec des plantes."),
        Q("Quelle pièce peut servir à manger en famille ?", ["la salle à manger", "la salle de bain", "le bureau"], 0, "La salle à manger est faite pour les repas."),
        Q("Où peut-on travailler avec un ordinateur ?", ["dans un bureau", "dans une baignoire", "dans un placard"], 0, "Un bureau est une pièce ou un meuble pour travailler."),
        Q("Quel mot désigne le passage entre plusieurs pièces ?", ["le couloir", "la cuisine", "le jardin"], 0, "Le couloir relie les pièces."),
        Q("Quelle phrase est naturelle ?", ["Il y a un lit dans la chambre.", "Il y a une douche dans le salon.", "Il y a une table de nuit dans le jardin."], 0, "Le lit appartient normalement à la chambre."),
        Q("Quelle phrase décrit bien une maison complète ?", ["Il y a une cuisine, un salon et deux chambres.", "Il y a seulement une porte et une fenêtre.", "Il y a un sac dans le métro."], 0, "Cuisine, salon et chambres sont des éléments d’un logement."),
        Q("Quel mot convient pour un appartement ?", ["une pièce", "un professeur", "une nationalité"], 0, "Un appartement est composé de pièces.")
      ]
    ),

    "objets-maison": A(
      "Les objets de la maison",
      "Thème 7 · Maison et environnement",
      "Vocabulaire",
      "Associez les objets courants à leur pièce et à leur fonction.",
      [
        Q("Quel objet trouve-t-on souvent dans une chambre ?", ["un lit", "un four", "une douche"], 0, "Le lit est l’objet principal de la chambre."),
        Q("Quel objet sert à s’asseoir dans le salon ?", ["un canapé", "un lavabo", "un réfrigérateur"], 0, "Le canapé est un meuble du salon."),
        Q("Quel objet conserve les aliments au froid ?", ["un réfrigérateur", "une lampe", "un tapis"], 0, "Le réfrigérateur conserve les aliments."),
        Q("Quel objet éclaire une pièce ?", ["une lampe", "une chaise", "un miroir"], 0, "Une lampe donne de la lumière."),
        Q("Quel objet peut être devant le canapé ?", ["une table basse", "une douche", "un oreiller"], 0, "Une table basse est fréquente dans le salon."),
        Q("Quel objet utilise-t-on dans la salle de bain pour se regarder ?", ["un miroir", "un fauteuil", "une armoire de cuisine"], 0, "Le miroir sert à se regarder."),
        Q("Quel objet se met sur un lit pour dormir ?", ["un oreiller", "une casserole", "un bureau"], 0, "L’oreiller sert à poser la tête."),
        Q("Quel meuble sert à ranger des vêtements ?", ["une armoire", "un évier", "un balcon"], 0, "Une armoire sert à ranger des vêtements."),
        Q("Quel objet sert à cuisiner ?", ["une casserole", "un tapis", "une étagère"], 0, "La casserole est un ustensile de cuisine."),
        Q("Quel objet peut décorer le sol ?", ["un tapis", "un four", "un robinet"], 0, "Un tapis se place sur le sol."),
        Q("Quelle phrase est correcte ?", ["Il y a une table dans la cuisine.", "Il y a un réfrigérateur dans la chambre pour dormir.", "Il y a un lit dans la douche."], 0, "Une table peut être dans la cuisine."),
        Q("Quelle association est logique ?", ["salle de bain → lavabo", "salon → baignoire", "chambre → four"], 0, "Le lavabo appartient normalement à la salle de bain.")
      ]
    ),

    "il-y-a-negation": A(
      "Il y a / Il n’y a pas de",
      "Thème 7 · Maison et environnement",
      "Grammaire",
      "Décrivez ce qui existe ou ce qui n’existe pas dans un logement.",
      [
        Q("Complétez : Dans mon appartement, ___ deux chambres.", ["il y a", "il est", "il va"], 0, "On utilise « il y a » pour dire qu’une chose existe."),
        Q("Complétez : Dans la salle de bain, il ___ une douche.", ["y a", "est", "a"], 0, "La structure est fixe : il y a + nom."),
        Q("Choisissez la négation correcte.", ["Il n’y a pas de balcon.", "Il ne y a pas balcon.", "Il n’y pas a de balcon."], 0, "La négation correcte est « il n’y a pas de + nom »."),
        Q("Complétez : Il n’y a pas ___ jardin.", ["de", "un", "le"], 0, "Après une négation, on utilise souvent « de » : pas de jardin."),
        Q("Quelle phrase décrit une présence ?", ["Il y a une lampe sur la table.", "Il n’y a pas de lampe.", "La lampe ne table pas."], 0, "« Il y a » indique la présence d’un objet."),
        Q("Quelle phrase décrit une absence ?", ["Il n’y a pas de four.", "Il y a un four.", "Le four est grand."], 0, "« Il n’y a pas de » indique l’absence."),
        Q("Transformez : Il y a un balcon.", ["Il n’y a pas de balcon.", "Il n’y a pas un balcon.", "Il pas y a balcon."], 0, "La forme académique de base est « pas de balcon »."),
        Q("Complétez : Dans ma chambre, il y a ___ armoire.", ["une", "un", "des"], 0, "« Armoire » est féminin singulier : une armoire."),
        Q("Complétez : Dans le salon, il y a ___ fauteuils.", ["des", "un", "une"], 0, "Au pluriel, on utilise « des »."),
        Q("Quelle phrase est naturelle ?", ["Il y a une fenêtre dans la cuisine.", "Il y a une cuisine dans la fenêtre.", "Il n’y a pas de il y a."], 0, "Une fenêtre peut être dans une cuisine."),
        Q("Que signifie « Il n’y a pas de garage » ?", ["Le logement n’a pas de garage.", "Le garage est très grand.", "Le garage est dans la cuisine."], 0, "La phrase indique une absence."),
        Q("Quelle question demande l’existence d’un objet ?", ["Est-ce qu’il y a une terrasse ?", "Comment tu t’appelles ?", "Quelle est ta nationalité ?"], 0, "« Est-ce qu’il y a… ? » demande si quelque chose existe.")
      ]
    ),

    "prepositions-lieu": A(
      "Où est l’objet ?",
      "Thème 7 · Maison et environnement",
      "Prépositions de lieu",
      "Utilisez sur, sous, dans, devant, derrière, entre, à côté de et près de.",
      [
        Q("Complétez : Le livre est ___ la table.", ["sur", "sous", "derrière"], 0, "« Sur » indique que l’objet est posé au-dessus avec contact."),
        Q("Complétez : Le chat est ___ le lit.", ["sous", "sur", "entre"], 0, "« Sous » indique une position plus basse."),
        Q("Complétez : La lampe est ___ du lit.", ["à côté", "dans", "entre"], 0, "« À côté de » indique la proximité latérale."),
        Q("Complétez : Les clés sont ___ le sac.", ["dans", "devant", "sur"], 0, "« Dans » indique l’intérieur."),
        Q("Complétez : Le fauteuil est ___ la fenêtre.", ["près de", "sous", "dans"], 0, "« Près de » indique la proximité."),
        Q("Complétez : Le tapis est ___ le canapé.", ["devant", "dans", "sur"], 0, "Un tapis peut être devant un canapé."),
        Q("Complétez : La chaise est ___ la table et la fenêtre.", ["entre", "sous", "sur"], 0, "« Entre » se place avec deux repères."),
        Q("Complétez : Le tableau est ___ le mur.", ["sur", "dans", "sous"], 0, "Un tableau est accroché sur le mur."),
        Q("Quelle phrase est correcte ?", ["Le bureau est à côté de la fenêtre.", "Le bureau est à côté la fenêtre.", "Le bureau côté de fenêtre."], 0, "La locution complète est « à côté de »."),
        Q("Quelle phrase répond à « Où est la lampe ? »", ["Elle est sur la table.", "Elle est bleue.", "Elle est étudiante."], 0, "La question « où » demande un lieu."),
        Q("Quelle préposition indique l’arrière ?", ["derrière", "devant", "sur"], 0, "« Derrière » indique la position arrière."),
        Q("Quelle phrase est claire pour décrire une chambre ?", ["Le lit est entre la fenêtre et l’armoire.", "Le lit est maison cuisine.", "Le lit parle entre."], 0, "La phrase utilise une préposition et deux repères.")
      ]
    ),

    "lecture-annonce-logement": A(
      "Une petite annonce immobilière",
      "Thème 7 · Maison et environnement",
      "Compréhension écrite",
      "Lisez une annonce courte, puis vérifiez les informations du logement.",
      [
        Q("Où se trouve le studio ?", ["près de l’université", "loin du centre", "dans une maison de campagne"], 0),
        Q("Combien de pièces principales a le studio ?", ["une", "deux", "quatre"], 0),
        Q("Qu’y a-t-il dans la pièce principale ?", ["un lit, une table et une armoire", "un jardin et un garage", "deux salles de bain"], 0),
        Q("Quelle pièce est petite ?", ["la cuisine", "la chambre", "le balcon"], 0),
        Q("Qu’est-ce qu’il n’y a pas ?", ["un balcon", "une fenêtre", "une salle de bain"], 0),
        Q("Pourquoi le studio est-il pratique ?", ["Il est près des commerces et du tramway.", "Il est très loin.", "Il n’a pas de cuisine."], 0),
        Q("À qui convient le studio ?", ["à une personne seule ou à un étudiant", "à une famille de six personnes", "à une équipe sportive"], 0),
        Q("Quelle phrase résume l’annonce ?", ["Petit logement pratique et bien situé.", "Grande maison avec jardin.", "Appartement sans salle de bain."], 0)
      ],
      {
        reading: "À louer : petit studio lumineux près de l’université. Il y a une pièce principale avec un lit, une table, deux chaises et une armoire. La cuisine est petite mais équipée : il y a un réfrigérateur, une plaque de cuisson et un évier. La salle de bain a une douche, un lavabo et un miroir. Il n’y a pas de balcon, mais il y a une grande fenêtre. Le studio est pratique : il est près des commerces, du tramway et de la bibliothèque. Idéal pour une personne seule ou un étudiant."
      }
    ),

    "production-decris-chambre": A(
      "Décris ta chambre",
      "Thème 7 · Maison et environnement",
      "Production guidée",
      "Choisissez les blocs qui construisent une description simple, correcte et organisée.",
      [
        Q("Pour commencer une description, choisissez :", ["Ma chambre est petite mais confortable.", "Ma chambre travaille lundi.", "Je chambre nationalité."], 0),
        Q("Pour dire ce qui existe, choisissez :", ["Il y a un lit près de la fenêtre.", "Il est un lit près fenêtre.", "Il y a pas lit le."], 0),
        Q("Pour ajouter un meuble, choisissez :", ["Il y a aussi une armoire blanche.", "Il blanc armoire aussi.", "Une armoire ne parle pas."], 0),
        Q("Pour utiliser une préposition, choisissez :", ["La lampe est sur la table de nuit.", "La lampe est le table nuit.", "La lampe travaille dans le soir."], 0),
        Q("Pour faire une négation, choisissez :", ["Il n’y a pas de balcon.", "Il ne y a pas balcon.", "Il pas balcon."], 0),
        Q("Pour décrire l’ambiance, choisissez :", ["La pièce est claire et calme.", "La pièce est quatorze et téléphone.", "La pièce va à Lyon."], 0),
        Q("Pour parler d’un objet personnel, choisissez :", ["Sur le bureau, il y a mon ordinateur.", "Sur le bureau, je suis ordinateur.", "Le bureau est ma nationalité."], 0),
        Q("Pour dire la couleur d’un meuble, choisissez :", ["Mon armoire est blanche.", "Mon armoire a blanche.", "Mon armoire blanc est."], 0),
        Q("Pour terminer, choisissez :", ["J’aime ma chambre parce qu’elle est agréable.", "J’aime ma chambre hier allé.", "Ma chambre parce que prénom."], 0),
        Q("Quelle description complète est la meilleure ?", ["Ma chambre est claire. Il y a un lit, une armoire et un bureau. La lampe est sur la table.", "Ma chambre est lit il travaille. Armoire dans je.", "Chambre grand français numéro table."], 0)
      ]
    )
  };

  window.quizCatalog = window.quizCatalog || {};
  window.french1ExpandedActivities = window.french1ExpandedActivities || {};
  Object.assign(window.quizCatalog, C);
  Object.assign(window.french1ExpandedActivities, C);
})();
