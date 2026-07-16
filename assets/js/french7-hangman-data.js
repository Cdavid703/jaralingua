(function () {
  "use strict";

  window.JaraLinguaHangmanB1 = {
    version: "20260716-n7-pendu-vocab",
    categories: [
      {
        id: "professions",
        label: "Professions",
        icon: "bi-briefcase-fill",
        entries: [
          { answer: "L'architecte", clue: "Une personne qui conçoit des bâtiments et prépare des plans." },
          { answer: "Le journaliste", clue: "Une personne qui cherche, vérifie et présente des informations." },
          { answer: "La chercheuse", clue: "Une professionnelle qui produit de nouvelles connaissances." },
          { answer: "L'infirmier", clue: "Un professionnel de santé qui accompagne les patients." },
          { answer: "La traductrice", clue: "Une personne qui fait passer un texte d'une langue à une autre." },
          { answer: "Le comptable", clue: "Une personne qui organise les chiffres et les finances d'une entreprise." },
          { answer: "La cheffe de projet", clue: "Une personne qui coordonne une équipe et un calendrier de travail." },
          { answer: "Le technicien", clue: "Un professionnel qui installe, répare ou contrôle des équipements." }
        ]
      },
      {
        id: "medias",
        label: "Médias",
        icon: "bi-broadcast-pin",
        entries: [
          { answer: "La presse", clue: "L'ensemble des journaux, magazines et médias d'information." },
          { answer: "Le reportage", clue: "Un contenu informatif réalisé sur le terrain." },
          { answer: "Le titre", clue: "La phrase courte qui annonce le sujet principal d'un article." },
          { answer: "La une", clue: "La première page d'un journal." },
          { answer: "Les réseaux sociaux", clue: "Des plateformes où les utilisateurs publient et partagent du contenu." },
          { answer: "La source", clue: "L'origine d'une information." },
          { answer: "La rumeur", clue: "Une information qui circule sans preuve claire." },
          { answer: "La publicité", clue: "Un message conçu pour promouvoir un produit, un service ou une idée." }
        ]
      },
      {
        id: "environnement",
        label: "Environnement",
        icon: "bi-tree-fill",
        entries: [
          { answer: "La pollution", clue: "La dégradation d'un milieu par des substances ou des activités nocives." },
          { answer: "Le recyclage", clue: "La transformation de déchets pour réutiliser leurs matériaux." },
          { answer: "La biodiversité", clue: "La variété des espèces vivantes et des milieux naturels." },
          { answer: "Le climat", clue: "L'ensemble des conditions météorologiques habituelles d'une région." },
          { answer: "Les déchets", clue: "Des objets ou matières dont on veut se débarrasser." },
          { answer: "Les énergies renouvelables", clue: "Des sources d'énergie qui se reconstituent naturellement." },
          { answer: "La forêt", clue: "Un grand espace couvert d'arbres." },
          { answer: "L'eau potable", clue: "Une eau que l'on peut boire sans danger." }
        ]
      },
      {
        id: "technologie",
        label: "Technologie",
        icon: "bi-cpu-fill",
        entries: [
          { answer: "L'application", clue: "Un programme utilisé sur un téléphone, une tablette ou un ordinateur." },
          { answer: "Le mot de passe", clue: "Une suite de caractères qui protège un compte." },
          { answer: "Le réseau", clue: "Un ensemble d'appareils ou de personnes reliés entre eux." },
          { answer: "La cybersécurité", clue: "La protection des données et des systèmes numériques." },
          { answer: "Le fichier", clue: "Un document numérique enregistré sur un appareil." },
          { answer: "L'écran", clue: "La surface où apparaissent les images et les informations." },
          { answer: "Le clavier", clue: "L'objet utilisé pour taper des lettres et des chiffres." },
          { answer: "L'intelligence artificielle", clue: "Un domaine technologique lié aux systèmes capables d'analyser et de produire des réponses." }
        ]
      },
      {
        id: "sante",
        label: "Santé",
        icon: "bi-heart-pulse-fill",
        entries: [
          { answer: "Le médecin", clue: "Un professionnel qui examine, conseille et soigne les patients." },
          { answer: "La pharmacie", clue: "Le lieu où l'on obtient des médicaments et des conseils de santé." },
          { answer: "Le traitement", clue: "L'ensemble des moyens utilisés pour soigner un problème de santé." },
          { answer: "La douleur", clue: "Une sensation désagréable liée à un problème physique." },
          { answer: "Le repos", clue: "Un moment nécessaire pour récupérer de la fatigue." },
          { answer: "La santé mentale", clue: "L'équilibre psychologique et émotionnel d'une personne." },
          { answer: "Les premiers secours", clue: "Les gestes immédiats réalisés avant l'arrivée des professionnels." },
          { answer: "L'assurance santé", clue: "Un système qui aide à couvrir des frais médicaux." }
        ]
      },
      {
        id: "education",
        label: "Éducation",
        icon: "bi-mortarboard-fill",
        entries: [
          { answer: "L'université", clue: "Un établissement d'enseignement supérieur." },
          { answer: "Le diplôme", clue: "Un document qui confirme la réussite d'une formation." },
          { answer: "La matière", clue: "Une discipline étudiée dans un programme." },
          { answer: "L'examen", clue: "Une épreuve qui évalue des connaissances ou des compétences." },
          { answer: "La bibliothèque", clue: "Un lieu où l'on consulte ou emprunte des livres et des ressources." },
          { answer: "La formation", clue: "Un parcours organisé pour développer des compétences." },
          { answer: "Le mémoire", clue: "Un travail écrit long souvent demandé à l'université." },
          { answer: "La salle de classe", clue: "Le lieu où se déroule une partie du cours." }
        ]
      },
      {
        id: "culture",
        label: "Culture",
        icon: "bi-palette-fill",
        entries: [
          { answer: "Le musée", clue: "Un lieu où l'on conserve et expose des œuvres ou des objets." },
          { answer: "Le théâtre", clue: "Un lieu ou un art lié aux pièces jouées devant un public." },
          { answer: "Le roman", clue: "Un long récit écrit avec des personnages et une histoire." },
          { answer: "La peinture", clue: "Un art visuel réalisé avec des couleurs sur une surface." },
          { answer: "La chanson", clue: "Une composition musicale avec des paroles." },
          { answer: "Le festival", clue: "Un événement culturel organisé autour d'un thème ou d'un art." },
          { answer: "Le patrimoine", clue: "L'ensemble des biens culturels transmis par l'histoire." },
          { answer: "La bande dessinée", clue: "Une histoire racontée avec des images et des bulles de texte." }
        ]
      },
      {
        id: "voyages",
        label: "Voyages",
        icon: "bi-airplane-fill",
        entries: [
          { answer: "L'aéroport", clue: "Le lieu où arrivent et partent les avions." },
          { answer: "Le passeport", clue: "Un document officiel utilisé pour voyager à l'étranger." },
          { answer: "La valise", clue: "Un bagage utilisé pour transporter des affaires." },
          { answer: "La réservation", clue: "Une confirmation pour un hôtel, un vol ou une activité." },
          { answer: "Le billet", clue: "Un document qui donne accès à un transport ou à un événement." },
          { answer: "L'hébergement", clue: "Le lieu où l'on dort pendant un voyage." },
          { answer: "Le guide touristique", clue: "Une personne ou un document qui aide à découvrir un lieu." },
          { answer: "La frontière", clue: "La limite entre deux pays ou territoires." }
        ]
      },
      {
        id: "services",
        label: "Services",
        icon: "bi-building-fill-gear",
        entries: [
          { answer: "La banque", clue: "Une institution où l'on gère de l'argent, des comptes et des paiements." },
          { answer: "La poste", clue: "Un service lié aux lettres, colis et démarches administratives." },
          { answer: "La mairie", clue: "L'administration principale d'une commune." },
          { answer: "Le commissariat", clue: "Le lieu où travaillent des policiers." },
          { answer: "Le guichet", clue: "Un point d'accueil où l'on fait une démarche." },
          { answer: "Le formulaire", clue: "Un document avec des informations à compléter." },
          { answer: "Le rendez-vous", clue: "Une rencontre prévue à une date et une heure précises." },
          { answer: "Le service client", clue: "Un espace d'aide pour les utilisateurs ou les consommateurs." }
        ]
      },
      {
        id: "societe",
        label: "Société",
        icon: "bi-people-fill",
        entries: [
          { answer: "La citoyenneté", clue: "Le statut et la participation d'une personne dans une société." },
          { answer: "Les droits humains", clue: "Des protections fondamentales reconnues à chaque personne." },
          { answer: "La solidarité", clue: "L'aide et le soutien entre personnes ou groupes." },
          { answer: "Le bénévolat", clue: "Une activité volontaire réalisée sans salaire." },
          { answer: "Les inégalités", clue: "Des différences injustes de ressources, de droits ou de possibilités." },
          { answer: "Les stéréotypes", clue: "Des idées simplifiées attribuées à tout un groupe." },
          { answer: "La diversité", clue: "La présence de différences culturelles, sociales ou personnelles." },
          { answer: "La génération", clue: "Un groupe de personnes d'un âge ou d'une époque proche." }
        ]
      }
    ]
  };
})();
