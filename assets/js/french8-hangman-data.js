(function () {
  "use strict";

  window.JaraLinguaHangmanB2 = {
    version: "20260715-b2",
    categories: [
      {
        id: "films-series",
        label: "Films et séries célèbres",
        icon: "bi-film",
        entries: [
          { answer: "Le Roi Lion", clue: "Un jeune héritier doit retrouver sa place dans la savane." },
          { answer: "La Reine des neiges", clue: "Deux sœurs affrontent un hiver provoqué par un pouvoir incontrôlé." },
          { answer: "Le Monde de Nemo", clue: "Un père traverse l'océan pour retrouver son fils." },
          { answer: "Vice-versa", clue: "Des émotions personnifiées dirigent la vie intérieure d'une adolescente." },
          { answer: "Moi, moche et méchant", clue: "Un ancien méchant découvre une nouvelle forme de famille." },
          { answer: "Les Indestructibles", clue: "Une famille cache des capacités extraordinaires." },
          { answer: "Monstres et Cie", clue: "Des créatures travaillent derrière les portes des chambres d'enfants." },
          { answer: "Là-haut", clue: "Une maison s'envole grâce à des milliers de ballons." },
          { answer: "La Belle et la Bête", clue: "Une jeune femme apprend à regarder au-delà des apparences." },
          { answer: "Le Seigneur des Anneaux", clue: "Une communauté entreprend de détruire un objet très dangereux." },
          { answer: "Le Hobbit", clue: "Un voyage inattendu conduit un personnage discret loin de chez lui." },
          { answer: "Mercredi", clue: "Une adolescente singulière enquête dans une académie mystérieuse." }
        ]
      },
      {
        id: "societe",
        label: "Société",
        icon: "bi-people-fill",
        entries: [
          { answer: "La cohésion sociale", clue: "La capacité d'un groupe à vivre ensemble malgré ses différences." },
          { answer: "Les valeurs", clue: "Des principes qui orientent les choix et les comportements." },
          { answer: "Les générations", clue: "Des groupes d'âge qui partagent une période et des expériences." },
          { answer: "Les droits humains", clue: "Des protections fondamentales reconnues à toute personne." },
          { answer: "Les inégalités", clue: "Des écarts injustes de ressources, de droits ou d'opportunités." },
          { answer: "Le bénévolat", clue: "Une activité volontaire réalisée sans rémunération." },
          { answer: "Les stéréotypes", clue: "Des idées simplifiées attribuées à tout un groupe." }
        ]
      },
      {
        id: "travail",
        label: "Travail",
        icon: "bi-briefcase-fill",
        entries: [
          { answer: "Les métiers", clue: "Les différentes professions exercées dans la société." },
          { answer: "L'entreprise", clue: "Une organisation qui produit des biens ou des services." },
          { answer: "Le recrutement", clue: "Le processus utilisé pour choisir de nouveaux employés." },
          { answer: "L'entretien d'embauche", clue: "Une rencontre qui permet d'évaluer une candidature." },
          { answer: "Les compétences", clue: "Des savoirs et capacités mobilisés pour accomplir une tâche." },
          { answer: "Le télétravail", clue: "Une organisation professionnelle exercée à distance." },
          { answer: "Les conditions de travail", clue: "L'ensemble des circonstances matérielles et sociales d'un emploi." }
        ]
      },
      {
        id: "education",
        label: "Éducation",
        icon: "bi-mortarboard-fill",
        entries: [
          { answer: "L'université", clue: "Un établissement d'enseignement supérieur et de recherche." },
          { answer: "Les matières", clue: "Les disciplines étudiées dans un programme scolaire." },
          { answer: "Les diplômes", clue: "Des documents qui attestent une formation réussie." },
          { answer: "Les examens", clue: "Des épreuves destinées à évaluer des connaissances." },
          { answer: "Les formations", clue: "Des parcours organisés pour développer des compétences." }
        ]
      },
      {
        id: "medias-communication",
        label: "Médias et communication",
        icon: "bi-broadcast-pin",
        entries: [
          { answer: "Les médias", clue: "Des moyens qui diffusent des informations à un large public." },
          { answer: "Les réseaux sociaux", clue: "Des plateformes numériques où les utilisateurs publient et échangent." },
          { answer: "Les fausses informations", clue: "Des contenus inexacts présentés comme des faits." },
          { answer: "La publicité", clue: "Un message conçu pour promouvoir un produit ou une idée." },
          { answer: "La presse", clue: "L'ensemble des publications et des professionnels de l'information." },
          { answer: "La télévision", clue: "Un média audiovisuel qui diffuse des programmes." }
        ]
      },
      {
        id: "technologie",
        label: "Technologie",
        icon: "bi-cpu-fill",
        entries: [
          { answer: "L'intelligence artificielle", clue: "Des systèmes capables d'exécuter certaines tâches associées au raisonnement." },
          { answer: "L'informatique", clue: "Le traitement automatique de l'information par des machines." },
          { answer: "Internet", clue: "Un réseau mondial qui relie des appareils et des services." },
          { answer: "La cybersécurité", clue: "La protection des systèmes et des données contre les attaques numériques." },
          { answer: "Les applications", clue: "Des programmes conçus pour accomplir des fonctions précises." },
          { answer: "Les réseaux", clue: "Des ensembles de dispositifs reliés pour échanger des données." }
        ]
      },
      {
        id: "environnement",
        label: "Environnement",
        icon: "bi-tree-fill",
        entries: [
          { answer: "Le changement climatique", clue: "Une modification durable du climat à l'échelle mondiale." },
          { answer: "Le recyclage", clue: "La transformation de déchets pour réutiliser leurs matériaux." },
          { answer: "La pollution", clue: "La dégradation d'un milieu par des substances ou activités nocives." },
          { answer: "Les énergies renouvelables", clue: "Des sources d'énergie qui se reconstituent naturellement." },
          { answer: "La biodiversité", clue: "La variété des espèces, des milieux et des formes de vie." },
          { answer: "Les catastrophes naturelles", clue: "Des phénomènes naturels qui provoquent d'importants dégâts." }
        ]
      },
      {
        id: "sante",
        label: "Santé",
        icon: "bi-heart-pulse-fill",
        entries: [
          { answer: "La santé mentale", clue: "L'équilibre psychologique, émotionnel et social d'une personne." },
          { answer: "Les maladies", clue: "Des altérations de l'état normal de l'organisme." },
          { answer: "Les traitements", clue: "Des moyens employés pour soigner ou contrôler un problème de santé." },
          { answer: "Le stress", clue: "Une réaction physique et mentale face à une forte pression." },
          { answer: "Les addictions", clue: "Des dépendances difficiles à contrôler malgré leurs conséquences." },
          { answer: "Les premiers secours", clue: "Les gestes immédiats pratiqués avant l'arrivée des professionnels." }
        ]
      },
      {
        id: "voyages",
        label: "Voyages",
        icon: "bi-airplane-fill",
        entries: [
          { answer: "Les pays", clue: "Des territoires organisés sous une autorité politique." },
          { answer: "Les capitales", clue: "Des villes où siègent généralement les institutions principales d'un pays." },
          { answer: "Les monuments", clue: "Des constructions remarquables par leur histoire ou leur valeur culturelle." },
          { answer: "Les hôtels", clue: "Des établissements qui proposent un hébergement temporaire." },
          { answer: "Les vacances", clue: "Une période consacrée au repos ou au voyage." },
          { answer: "Les aéroports", clue: "Des infrastructures où arrivent et partent les avions." }
        ]
      },
      {
        id: "culture",
        label: "Culture",
        icon: "bi-palette-fill",
        entries: [
          { answer: "Les films et séries célèbres", clue: "Des œuvres audiovisuelles connues par un large public." },
          { answer: "La musique", clue: "L'art d'organiser les sons, les rythmes et les silences." },
          { answer: "Les instruments de musique", clue: "Des objets conçus pour produire des sons musicaux." },
          { answer: "Les livres", clue: "Des œuvres écrites réunies dans un volume imprimé ou numérique." },
          { answer: "Les écrivains", clue: "Des personnes qui créent des œuvres littéraires." },
          { answer: "Les peintres", clue: "Des artistes qui s'expriment principalement par la peinture." }
        ]
      },
      {
        id: "economie",
        label: "Économie",
        icon: "bi-graph-up-arrow",
        entries: [
          { answer: "L'argent", clue: "Un moyen d'échange utilisé pour acheter des biens et des services." },
          { answer: "Les banques", clue: "Des institutions qui gèrent l'épargne, le crédit et les paiements." },
          { answer: "Le commerce", clue: "L'activité d'achat, de vente et d'échange." },
          { answer: "Les impôts", clue: "Des contributions obligatoires destinées à financer les services publics." },
          { answer: "L'inflation", clue: "Une hausse générale et durable des prix." }
        ]
      },
      {
        id: "politique-citoyennete",
        label: "Politique et citoyenneté",
        icon: "bi-bank2",
        entries: [
          { answer: "Les élections", clue: "Un processus qui permet aux citoyens de choisir leurs représentants." },
          { answer: "Le gouvernement", clue: "L'ensemble des responsables qui dirigent l'action de l'État." },
          { answer: "Les institutions", clue: "Des structures durables qui organisent la vie publique." },
          { answer: "Les lois", clue: "Des règles obligatoires adoptées par une autorité compétente." },
          { answer: "La démocratie", clue: "Un système politique fondé sur la participation des citoyens." }
        ]
      },
      {
        id: "justice",
        label: "Justice",
        icon: "bi-shield-fill-check",
        entries: [
          { answer: "Le tribunal", clue: "Le lieu et l'institution où des affaires sont jugées." },
          { answer: "Les crimes", clue: "Des infractions considérées comme particulièrement graves." },
          { answer: "Les sanctions", clue: "Des conséquences imposées lorsqu'une règle est enfreinte." },
          { answer: "Les droits", clue: "Des libertés et protections reconnues par la loi." },
          { answer: "Les avocats", clue: "Des professionnels qui conseillent et défendent leurs clients en justice." }
        ]
      },
      {
        id: "sciences",
        label: "Sciences",
        icon: "bi-eyedropper",
        entries: [
          { answer: "La biologie", clue: "La science qui étudie les êtres vivants." },
          { answer: "La chimie", clue: "La science de la composition et des transformations de la matière." },
          { answer: "La physique", clue: "La science qui étudie la matière, l'énergie et leurs interactions." },
          { answer: "L'espace", clue: "L'immense étendue située au-delà de l'atmosphère terrestre." },
          { answer: "Les inventions", clue: "Des créations nouvelles qui apportent une solution ou une technique." }
        ]
      },
      {
        id: "sports",
        label: "Sports",
        icon: "bi-trophy-fill",
        entries: [
          { answer: "L'esprit sportif", clue: "Une attitude fondée sur le respect, l'effort et le jeu loyal." },
          { answer: "Les compétitions", clue: "Des épreuves dans lesquelles plusieurs participants cherchent à gagner." },
          { answer: "Les Jeux olympiques", clue: "Une grande manifestation internationale organisée tous les quatre ans." },
          { answer: "Les équipements sportifs", clue: "Le matériel et les installations nécessaires à la pratique d'un sport." }
        ]
      },
      {
        id: "nature",
        label: "Nature",
        icon: "bi-globe-americas",
        entries: [
          { answer: "Les animaux sauvages", clue: "Des espèces qui vivent sans dépendre directement des humains." },
          { answer: "Les plantes", clue: "Des organismes vivants qui réalisent généralement la photosynthèse." },
          { answer: "Les montagnes", clue: "Des reliefs naturels qui s'élèvent fortement au-dessus du terrain." },
          { answer: "Les océans", clue: "De vastes étendues d'eau salée qui couvrent la majeure partie de la planète." },
          { answer: "Les phénomènes météorologiques", clue: "Des événements atmosphériques comme les tempêtes ou le brouillard." }
        ]
      },
      {
        id: "gastronomie",
        label: "Gastronomie",
        icon: "bi-cup-hot-fill",
        entries: [
          { answer: "Les cuisines du monde", clue: "Les traditions culinaires propres à différentes régions et cultures." },
          { answer: "Les desserts", clue: "Des préparations généralement servies à la fin d'un repas." },
          { answer: "Les boissons", clue: "Des liquides destinés à être consommés." },
          { answer: "Les ingrédients", clue: "Les produits utilisés pour préparer une recette." },
          { answer: "Les épices", clue: "Des substances aromatiques qui donnent du goût aux aliments." }
        ]
      },
      {
        id: "personnalite",
        label: "Personnalité",
        icon: "bi-person-hearts",
        entries: [
          { answer: "Les qualités", clue: "Des caractéristiques considérées comme positives chez une personne." },
          { answer: "Les défauts", clue: "Des traits jugés négatifs ou susceptibles d'être améliorés." },
          { answer: "Les émotions", clue: "Des réactions affectives comme la joie, la peur ou la colère." },
          { answer: "Les traits de caractère", clue: "Des tendances durables qui décrivent la manière d'être d'une personne." }
        ]
      }
    ]
  };
})();
