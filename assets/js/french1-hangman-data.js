(function () {
  "use strict";

  window.JaraLinguaHangmanA1 = {
    version: "20260716-a1-vocabulaire-sans-verbes",
    categories: [
      {
        id: "premiers-contacts",
        label: "Premiers contacts",
        icon: "bi-chat-heart-fill",
        entries: [
          { answer: "bonjour", clue: "Salutation utilisée pendant la journée.", hints: ["Mot de politesse pour commencer une interaction.", "Très fréquent au début d'une conversation.", "Équivalent de « buenos días » ou « hola » selon le contexte."] },
          { answer: "salut", clue: "Salutation familière.", hints: ["Mot court entre amis ou personnes proches.", "Plus informel que « bonjour ».", "Peut aussi servir pour dire au revoir dans un contexte familier."] },
          { answer: "merci", clue: "Mot pour exprimer la gratitude.", hints: ["Réponse polie après une aide ou un cadeau.", "Mot essentiel dans toutes les interactions.", "Équivalent de « gracias »."] },
          { answer: "prénom", clue: "Nom individuel d'une personne.", hints: ["Il vient avant le nom de famille.", "Exemple : Lina, Ana, David.", "Dans « je m'appelle Lina », Lina est le prénom."] },
          { answer: "nom", clue: "Partie officielle de l'identité familiale.", hints: ["Il apparaît dans les documents d'identité.", "Il peut être accompagné du prénom.", "Équivalent de « apellido » dans beaucoup de contextes."] },
          { answer: "âge", clue: "Nombre d'années d'une personne.", hints: ["On l'indique avec un nombre.", "Exemple : vingt ans.", "Question associée : « Quel âge ? »"] },
          { answer: "ville", clue: "Lieu urbain où une personne habite.", hints: ["Paris, Bogotá et Medellín sont des exemples.", "Mot utile pour parler de son origine ou de son adresse.", "On dit souvent : « ma ville »."] },
          { answer: "pays", clue: "Territoire avec une identité nationale.", hints: ["La France, la Colombie et le Canada sont des exemples.", "Mot utile pour parler de la nationalité.", "Il peut être masculin ou féminin en français."] },
          { answer: "téléphone", clue: "Numéro ou appareil pour communiquer à distance.", hints: ["Information fréquente dans une fiche personnelle.", "Il peut être portable ou fixe.", "Mot lié au contact personnel."] },
          { answer: "adresse", clue: "Information qui indique où se trouve une personne ou un lieu.", hints: ["Elle peut être postale ou électronique.", "Mot fréquent dans les formulaires.", "Une rue et un numéro peuvent en faire partie."] }
        ]
      },
      {
        id: "alphabet-nombres",
        label: "Alphabet et nombres",
        icon: "bi-123",
        entries: [
          { answer: "alphabet", clue: "Ensemble ordonné des lettres d'une langue.", hints: ["Il commence par A, B, C.", "Il sert à épeler les mots.", "Le français utilise l'alphabet latin."] },
          { answer: "lettre", clue: "Signe écrit utilisé pour former un mot.", hints: ["A, B et C en sont des exemples.", "Elle peut être majuscule ou minuscule.", "Elle possède un nom et parfois plusieurs sons."] },
          { answer: "zéro", clue: "Nombre qui représente l'absence de quantité.", hints: ["Il vient avant un.", "Il est important dans les numéros de téléphone.", "Il s'écrit avec un accent aigu."] },
          { answer: "sept", clue: "Nombre entre six et huit.", hints: ["Il contient une consonne finale écrite.", "Il est fréquent dans les dates et les numéros.", "En français, le P ne se prononce pas clairement comme en espagnol."] },
          { answer: "onze", clue: "Nombre après dix.", hints: ["Il commence par la voyelle O.", "Il appartient aux nombres de 11 à 16.", "Il précède douze."] },
          { answer: "douze", clue: "Nombre après onze.", hints: ["Il appartient aux nombres de 11 à 16.", "Il contient le son « ou ».", "Il précède treize."] },
          { answer: "quinze", clue: "Nombre après quatorze.", hints: ["Il appartient aux nombres de 11 à 16.", "Il contient la lettre Q.", "Il précède seize."] },
          { answer: "vingt", clue: "Nombre après dix-neuf.", hints: ["Il termine la première série travaillée dans les nombres.", "La lettre finale T est généralement muette.", "Il sert de base dans vingt et un, vingt-deux, etc."] },
          { answer: "nombre", clue: "Mot général pour une quantité.", hints: ["Un, deux et trois sont des exemples.", "Il peut être écrit en chiffres ou en lettres.", "Il sert à compter."] },
          { answer: "date", clue: "Indication du jour, du mois et de l'année.", hints: ["Elle apparaît dans les calendriers.", "Elle peut inclure un nombre ordinal ou cardinal selon la langue.", "Exemple : 16 juillet 2026."] }
        ]
      },
      {
        id: "classe",
        label: "La classe",
        icon: "bi-backpack-fill",
        entries: [
          { answer: "cahier", clue: "Objet avec des pages pour écrire.", hints: ["Il peut être dans le sac.", "On l'utilise pour prendre des notes.", "Il ressemble à un notebook."] },
          { answer: "stylo", clue: "Objet pour écrire avec de l'encre.", hints: ["Il est souvent bleu, noir ou rouge.", "Il se tient dans la main.", "Équivalent de « bolígrafo »."] },
          { answer: "livre", clue: "Objet avec des pages imprimées.", hints: ["On l'utilise pour lire ou étudier.", "Il peut être scolaire ou littéraire.", "Il se trouve souvent dans une bibliothèque."] },
          { answer: "tableau", clue: "Surface de classe où le professeur écrit.", hints: ["Il peut être blanc ou noir.", "Il est généralement devant les étudiants.", "On y écrit avec un marqueur ou une craie."] },
          { answer: "professeur", clue: "Personne qui enseigne.", hints: ["Elle guide la classe.", "Elle explique les sujets.", "Mot fréquent à l'université et à l'école."] },
          { answer: "étudiant", clue: "Personne inscrite dans un cours.", hints: ["Elle apprend une matière.", "À l'université, ce mot est très fréquent.", "Mot masculin ; le féminin est étudiante."] },
          { answer: "chaise", clue: "Meuble pour s'asseoir.", hints: ["Elle a généralement quatre pieds.", "Elle est près d'une table ou d'un bureau.", "Objet fréquent dans une salle de classe."] },
          { answer: "bureau", clue: "Table de travail ou espace administratif.", hints: ["Un professeur peut y poser ses documents.", "Un étudiant peut y travailler.", "Mot utile pour parler des meubles."] },
          { answer: "sac", clue: "Objet pour transporter les affaires.", hints: ["On y met un cahier ou un livre.", "Il peut être porté sur le dos.", "Mot court de trois lettres."] },
          { answer: "porte", clue: "Élément qui ouvre ou ferme une salle.", hints: ["Elle permet d'entrer ou de sortir.", "Elle peut être ouverte ou fermée.", "Dans la classe, elle se trouve souvent près du mur."] }
        ]
      },
      {
        id: "famille",
        label: "Famille",
        icon: "bi-people-fill",
        entries: [
          { answer: "mère", clue: "Parent féminin direct.", hints: ["Mot familial de base.", "Il contient un accent grave.", "Équivalent de « madre »."] },
          { answer: "père", clue: "Parent masculin direct.", hints: ["Mot familial de base.", "Il contient un accent grave.", "Équivalent de « padre »."] },
          { answer: "frère", clue: "Garçon ou homme avec les mêmes parents.", hints: ["Mot de la famille proche.", "Il contient un accent grave.", "Équivalent de « hermano »."] },
          { answer: "sœur", clue: "Fille ou femme avec les mêmes parents.", hints: ["Mot de la famille proche.", "Il contient la ligature œ.", "Équivalent de « hermana »."] },
          { answer: "cousin", clue: "Fils d'un oncle ou d'une tante.", hints: ["Membre de la famille élargie.", "Mot masculin.", "Le féminin prend un E final."] },
          { answer: "cousine", clue: "Fille d'un oncle ou d'une tante.", hints: ["Membre de la famille élargie.", "Mot féminin.", "Le masculin est cousin."] },
          { answer: "tante", clue: "Sœur du père ou de la mère.", hints: ["Membre adulte de la famille.", "Mot féminin.", "Équivalent de « tía »."] },
          { answer: "oncle", clue: "Frère du père ou de la mère.", hints: ["Membre adulte de la famille.", "Mot masculin.", "Équivalent de « tío »."] },
          { answer: "grands-parents", clue: "Parents du père ou de la mère.", hints: ["Expression lexicale avec un trait d'union.", "Elle inclut grand-mère et grand-père.", "Mot utile pour présenter sa famille."] },
          { answer: "famille", clue: "Groupe de personnes liées par parenté.", hints: ["Mot général du thème.", "Il peut être proche ou élargi.", "Équivalent de « familia »."] }
        ]
      },
      {
        id: "description-physique",
        label: "Description physique",
        icon: "bi-person-bounding-box",
        entries: [
          { answer: "cheveux", clue: "Ils couvrent la tête.", hints: ["Ils peuvent être longs, courts, bruns ou blonds.", "Mot toujours au pluriel dans beaucoup de descriptions.", "Équivalent de « cabello »."] },
          { answer: "yeux", clue: "Partie du visage pour voir.", hints: ["Ils peuvent être bleus, verts ou marron.", "Mot pluriel irrégulier.", "Le singulier est œil."] },
          { answer: "lunettes", clue: "Objet porté devant les yeux.", hints: ["Elles aident à mieux voir.", "Mot généralement au pluriel.", "Accessoire fréquent dans les descriptions."] },
          { answer: "barbe", clue: "Poils sur le visage d'un homme.", hints: ["Elle peut être courte ou longue.", "Elle se trouve sur le menton et les joues.", "Mot féminin."] },
          { answer: "taille", clue: "Hauteur d'une personne.", hints: ["Elle peut être petite, moyenne ou grande.", "Mot utile pour une description physique.", "Il ne s'agit pas ici de la taille d'un vêtement."] },
          { answer: "sourire", clue: "Expression positive du visage.", hints: ["Il apparaît avec la bouche.", "Il montre souvent la joie ou la gentillesse.", "Mot lié au visage."] },
          { answer: "visage", clue: "Partie avant de la tête.", hints: ["Il contient les yeux, le nez et la bouche.", "Mot central pour décrire quelqu'un.", "Équivalent de « rostro » ou « cara »."] },
          { answer: "brun", clue: "Couleur foncée pour les cheveux.", hints: ["Adjectif masculin.", "Le féminin est brune.", "Contraire fréquent de blond."] },
          { answer: "blonde", clue: "Couleur claire pour les cheveux au féminin.", hints: ["Adjectif féminin.", "Le masculin est blond.", "Mot courant dans les descriptions physiques."] },
          { answer: "grand", clue: "Adjectif pour une personne de haute taille.", hints: ["Le féminin est grande.", "Il s'oppose souvent à petit.", "Mot utile pour décrire la taille."] }
        ]
      },
      {
        id: "professions",
        label: "Professions",
        icon: "bi-briefcase-fill",
        entries: [
          { answer: "professeur", clue: "Profession liée à l'enseignement.", hints: ["Personne qui explique un cours.", "Profession présente dans une classe.", "Mot masculin ou féminin selon le contexte."] },
          { answer: "médecin", clue: "Profession liée à la santé.", hints: ["Personne qui soigne les patients.", "On la trouve dans un hôpital ou un cabinet.", "Mot avec accent aigu."] },
          { answer: "infirmière", clue: "Profession de santé qui accompagne les soins.", hints: ["Personne qui aide les patients.", "Mot féminin avec accent grave.", "Le masculin est infirmier."] },
          { answer: "étudiant", clue: "Statut d'une personne en formation.", hints: ["Personne inscrite dans un programme d'études.", "Mot fréquent à l'université.", "Le féminin est étudiante."] },
          { answer: "architecte", clue: "Profession liée aux bâtiments.", hints: ["Personne qui conçoit des maisons ou des immeubles.", "Mot qui peut être masculin ou féminin.", "Il commence par la lettre A."] },
          { answer: "serveur", clue: "Profession dans un restaurant ou un café.", hints: ["Personne qui apporte les plats ou les boissons.", "Mot masculin.", "Le féminin est serveuse."] },
          { answer: "vendeuse", clue: "Profession dans un magasin.", hints: ["Personne qui aide les clients.", "Mot féminin.", "Le masculin est vendeur."] },
          { answer: "photographe", clue: "Profession liée aux images.", hints: ["Personne qui prend des photos.", "Mot avec PH.", "Profession artistique ou journalistique."] },
          { answer: "artiste", clue: "Profession ou identité liée à la création.", hints: ["Personne qui crée de la musique, de la peinture ou du théâtre.", "Mot masculin ou féminin.", "Mot transparent pour les hispanophones."] },
          { answer: "vétérinaire", clue: "Profession liée à la santé des animaux.", hints: ["Personne qui soigne les chiens, les chats et d'autres animaux.", "Mot avec accent aigu.", "Profession médicale spécialisée."] }
        ]
      },
      {
        id: "maison",
        label: "Maison",
        icon: "bi-house-heart-fill",
        entries: [
          { answer: "maison", clue: "Lieu où une famille peut habiter.", hints: ["Elle peut avoir des chambres, une cuisine et un salon.", "Mot général du logement.", "Équivalent de « casa »."] },
          { answer: "appartement", clue: "Logement dans un immeuble.", hints: ["Il peut être petit ou grand.", "Il se trouve souvent en ville.", "Équivalent de « apartamento »."] },
          { answer: "chambre", clue: "Pièce pour dormir.", hints: ["Elle contient souvent un lit.", "Mot féminin.", "Pièce personnelle dans la maison."] },
          { answer: "cuisine", clue: "Pièce pour préparer la nourriture.", hints: ["Elle contient souvent un réfrigérateur.", "Pièce liée aux repas.", "Mot féminin."] },
          { answer: "salon", clue: "Pièce pour se reposer ou recevoir des invités.", hints: ["Elle peut contenir un canapé.", "Pièce commune de la maison.", "Équivalent de « sala »."] },
          { answer: "salle", clue: "Pièce ou espace intérieur.", hints: ["Mot général pour une pièce.", "On le trouve dans salle de classe ou salle de bain.", "Mot féminin."] },
          { answer: "lit", clue: "Meuble pour dormir.", hints: ["Il se trouve dans la chambre.", "Mot très court.", "Équivalent de « cama »."] },
          { answer: "table", clue: "Meuble avec une surface plate.", hints: ["On peut y manger ou travailler.", "Elle peut être dans la cuisine ou le salon.", "Mot féminin."] },
          { answer: "lampe", clue: "Objet qui donne de la lumière.", hints: ["Elle peut être sur une table.", "Elle se trouve souvent dans une chambre.", "Mot féminin."] },
          { answer: "fenêtre", clue: "Ouverture avec du verre dans un mur.", hints: ["Elle laisse entrer la lumière.", "Elle peut être ouverte ou fermée.", "Mot avec accent circonflexe."] }
        ]
      },
      {
        id: "objets-maison",
        label: "Objets de la maison",
        icon: "bi-lamp-fill",
        entries: [
          { answer: "miroir", clue: "Objet qui reflète l'image.", hints: ["On l'utilise pour voir son visage.", "Il peut être dans la chambre ou la salle de bain.", "Mot masculin."] },
          { answer: "canapé", clue: "Meuble confortable pour s'asseoir.", hints: ["Il se trouve souvent dans le salon.", "Plus grand qu'une chaise.", "Mot avec accent aigu."] },
          { answer: "chaise", clue: "Meuble individuel pour s'asseoir.", hints: ["Elle peut être près d'une table.", "Elle a souvent un dossier.", "Mot féminin."] },
          { answer: "bureau", clue: "Meuble ou espace pour travailler.", hints: ["On peut y poser un ordinateur.", "Il peut être dans une chambre.", "Mot masculin."] },
          { answer: "armoire", clue: "Meuble pour ranger des vêtements ou objets.", hints: ["Elle a souvent des portes.", "Elle peut être dans une chambre.", "Mot féminin."] },
          { answer: "ordinateur", clue: "Appareil électronique pour travailler ou étudier.", hints: ["Il peut être portable ou de bureau.", "Objet fréquent chez les étudiants.", "Mot masculin."] },
          { answer: "cahier", clue: "Objet avec des pages pour écrire.", hints: ["Il peut être sur un bureau.", "On y prend des notes.", "Mot masculin."] },
          { answer: "plante", clue: "Élément naturel décoratif dans la maison.", hints: ["Elle peut être verte.", "Elle peut être dans un pot.", "Mot féminin."] },
          { answer: "porte", clue: "Élément qui permet l'accès à une pièce.", hints: ["Elle peut séparer deux espaces.", "Elle a souvent une poignée.", "Mot féminin."] },
          { answer: "réfrigérateur", clue: "Appareil pour garder les aliments au froid.", hints: ["Il se trouve dans la cuisine.", "Mot long avec accent aigu.", "Équivalent de « nevera » ou « refrigerador »."] }
        ]
      },
      {
        id: "alimentation",
        label: "Alimentation",
        icon: "bi-cup-hot-fill",
        entries: [
          { answer: "café", clue: "Boisson chaude très fréquente.", hints: ["Mot avec accent aigu.", "On peut le boire le matin.", "Très courant dans un café ou un restaurant."] },
          { answer: "eau", clue: "Boisson naturelle transparente.", hints: ["Mot très court.", "Elle peut être plate ou gazeuse.", "Équivalent de « agua »."] },
          { answer: "pain", clue: "Aliment de base fait avec de la farine.", hints: ["Très important dans la culture française.", "On peut le manger avec du fromage.", "Mot masculin."] },
          { answer: "croissant", clue: "Viennoiserie française en forme de demi-lune.", hints: ["On le mange souvent au petit déjeuner.", "Mot transparent dans beaucoup de langues.", "Il contient le son nasal AN."] },
          { answer: "salade", clue: "Plat froid avec des légumes.", hints: ["Elle peut être verte.", "Mot féminin.", "Équivalent de « ensalada »."] },
          { answer: "pomme", clue: "Fruit rond souvent rouge, vert ou jaune.", hints: ["Fruit très courant.", "Mot féminin.", "Équivalent de « manzana »."] },
          { answer: "fromage", clue: "Aliment fait avec du lait.", hints: ["Très important dans la gastronomie française.", "Il peut être doux ou fort.", "Mot masculin."] },
          { answer: "jus", clue: "Boisson faite avec des fruits.", hints: ["Il peut être d'orange ou de pomme.", "Mot court.", "La consonne finale ne se prononce généralement pas."] },
          { answer: "thé", clue: "Boisson chaude préparée avec des feuilles.", hints: ["Mot avec accent aigu.", "Il peut être vert, noir ou à la menthe.", "Équivalent de « té »."] },
          { answer: "tarte", clue: "Préparation sucrée ou salée avec une pâte.", hints: ["Elle peut être aux pommes.", "Mot féminin.", "Dessert fréquent en français débutant."] }
        ]
      },
      {
        id: "ville-transport",
        label: "Ville et transport",
        icon: "bi-bus-front-fill",
        entries: [
          { answer: "bus", clue: "Transport public sur la route.", hints: ["Il transporte plusieurs passagers.", "Mot court.", "On l'attend souvent à une station."] },
          { answer: "métro", clue: "Transport urbain souvent souterrain.", hints: ["Mot avec accent aigu.", "Très fréquent dans les grandes villes.", "Il circule sur des lignes."] },
          { answer: "station", clue: "Lieu où l'on attend un transport.", hints: ["Elle peut être de métro ou de bus.", "Mot féminin.", "Équivalent proche de « estación » selon le contexte."] },
          { answer: "ticket", clue: "Document ou preuve d'accès au transport.", hints: ["Il peut être papier ou numérique.", "Mot masculin.", "Il sert à voyager en bus ou métro."] },
          { answer: "gare", clue: "Lieu lié aux trains.", hints: ["On y trouve des quais.", "Mot féminin.", "Équivalent de « estación de tren »."] },
          { answer: "parc", clue: "Espace vert dans une ville.", hints: ["On peut y marcher ou se reposer.", "Mot masculin.", "Il contient souvent des arbres."] },
          { answer: "rue", clue: "Voie dans une ville.", hints: ["Les maisons et magasins peuvent être autour.", "Mot féminin très court.", "Elle apparaît dans une adresse."] },
          { answer: "pharmacie", clue: "Lieu où l'on achète des médicaments.", hints: ["Magasin lié à la santé.", "Mot féminin.", "Il peut avoir une croix verte en France."] },
          { answer: "bibliothèque", clue: "Lieu avec des livres.", hints: ["On peut y lire ou étudier.", "Mot avec accent grave.", "Elle peut être municipale ou universitaire."] },
          { answer: "centre-ville", clue: "Partie centrale d'une ville.", hints: ["Expression lexicale avec un trait d'union.", "On y trouve souvent commerces, places et transports.", "Équivalent de « centro »."] }
        ]
      }
    ]
  };
})();
