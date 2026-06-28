(function () {
  "use strict";

  const Q = (question, options, answer, explanation) => ({
    question,
    options,
    answer,
    explanation: explanation || "Relisez le thème 9 : la réponse se trouve dans les transports, l’heure, la ville, le futur proche ou le passé récent."
  });

  const A = (title, theme, skill, description, questions, extra) =>
    Object.assign({ title, theme, skill, description, questions }, extra || {});

  const C = {
    "transports-vocabulaire": A(
      "Les transports",
      "Thème 9 · Transport, heure et projets immédiats",
      "Vocabulaire",
      "Associez les moyens de transport à des phrases utiles de déplacement.",
      [
        Q("Quelle phrase est correcte ?", ["Je vais à l’université en bus.", "Je vais à l’université dans bus.", "Je vais à l’université bus."], 0, "Pour un moyen de transport, on utilise souvent en + transport."),
        Q("Quelle forme est l’exception à mémoriser ?", ["à pied", "en pied", "dans pied"], 0, "On dit à pied, pas en pied."),
        Q("Quel transport circule souvent sous la ville ?", ["le métro", "le vélo", "la voiture"], 0, "Le métro circule généralement sous la ville ou sur des lignes dédiées."),
        Q("Quel transport prend-on à la gare ?", ["le train", "la pharmacie", "la table"], 0, "À la gare, on prend le train."),
        Q("Quelle phrase est naturelle ?", ["Elle rentre en taxi.", "Elle rentre à taxi.", "Elle rentre taxi."], 0, "On dit en taxi."),
        Q("Quel mot correspond à une personne qui marche ?", ["à pied", "en train", "en métro"], 0, "À pied signifie en marchant."),
        Q("Complétez : Nous allons au centre-ville ___ métro.", ["en", "à", "de"], 0, "En métro est la forme attendue."),
        Q("Complétez : Tu vas au parc ___ vélo.", ["à", "en", "de"], 0, "On dit à vélo."),
        Q("Quelle phrase indique un déplacement ?", ["Je prends le bus.", "Je suis une chaise.", "Le café est rouge."], 0, "Prendre le bus indique un déplacement."),
        Q("Quel transport est individuel et payant ?", ["un taxi", "un parc", "une gare"], 0, "Le taxi est un moyen de transport individuel."),
        Q("Quelle association est correcte ?", ["gare → train", "pharmacie → métro", "café → bus"], 0, "On associe normalement la gare au train."),
        Q("Quelle phrase évite l’erreur fréquente ?", ["Je vais à pied.", "Je vais en pied.", "Je vais de pied."], 0, "La seule forme correcte est à pied.")
      ]
    ),

    "lieux-ville": A(
      "Les lieux de la ville",
      "Thème 9 · Transport, heure et projets immédiats",
      "Vocabulaire",
      "Identifiez les lieux utiles pour se déplacer et choisissez la bonne contraction avec à.",
      [
        Q("Où prend-on le métro ?", ["à la station de métro", "à la cuisine", "à la chambre"], 0),
        Q("Où attend-on le bus ?", ["à l’arrêt de bus", "au lit", "à la douche"], 0),
        Q("Complétez : Je vais ___ parc.", ["au", "à le", "à la"], 0, "À + le devient au."),
        Q("Complétez : Elle va ___ pharmacie.", ["à la", "au", "aux"], 0, "Pharmacie est féminin : à la pharmacie."),
        Q("Complétez : Nous allons ___ université.", ["à l’", "au", "à la"], 0, "Devant une voyelle, on utilise à l’."),
        Q("Quel lieu sert à acheter des médicaments ?", ["la pharmacie", "la gare", "le parc"], 0),
        Q("Quel lieu est souvent vert et ouvert ?", ["le parc", "la station de métro", "le supermarché"], 0),
        Q("Où peut-on acheter de la nourriture ?", ["au supermarché", "au métro", "à la station"], 0),
        Q("Quelle phrase est correcte ?", ["Je vais au centre-ville.", "Je vais à le centre-ville.", "Je vais en centre-ville."], 0),
        Q("Quelle question demande un lieu ?", ["Où est la gare ?", "Quelle heure est-il ?", "Tu vas prendre le bus ?"], 0),
        Q("Quelle réponse indique une proximité ?", ["La station est près du café.", "La station est huit heures.", "La station est en bus."], 0),
        Q("Quelle association est logique ?", ["station de métro → métro", "pharmacie → train", "parc → croissant"], 0)
      ]
    ),

    "quelle-heure": A(
      "Quelle heure est-il ?",
      "Thème 9 · Transport, heure et projets immédiats",
      "Heure",
      "Reconnaissez les heures de base et utilisez à pour indiquer le moment d’une action.",
      [
        Q("Comment dit-on 8:00 ?", ["Il est huit heures.", "Il est huit heure.", "Il est huit ans."], 0),
        Q("Comment dit-on 8:30 ?", ["Il est huit heures et demie.", "Il est huit heures et demi.", "Il est huit demie heures."], 0),
        Q("Comment dit-on 9:15 ?", ["Il est neuf heures et quart.", "Il est neuf heures moins quart.", "Il est neuf quart heures."], 0),
        Q("Complétez : Le cours commence ___ neuf heures.", ["à", "en", "de"], 0, "On utilise à pour l’heure d’un événement."),
        Q("Quelle question demande l’heure ?", ["Quelle heure est-il ?", "Où est la station ?", "Comment tu t’appelles ?"], 0),
        Q("Quel mot désigne 12:00 le jour ?", ["midi", "minuit", "matin"], 0),
        Q("Quel mot désigne 00:00 ?", ["minuit", "midi", "soir"], 0),
        Q("Quelle phrase est correcte ?", ["Le bus arrive à sept heures trente.", "Le bus arrive en sept heures trente.", "Le bus arrive sept heures à."], 0),
        Q("Quelle phrase est naturelle ?", ["Je pars à huit heures.", "Je pars huit ans.", "Je pars à huit ville."], 0),
        Q("Quelle forme est correcte au pluriel ?", ["deux heures", "deux heure", "deux heur"], 0),
        Q("Si le cours est à 9:00 et il est 8:20, Clara est :", ["à l’heure", "à minuit", "à pied"], 0),
        Q("Quelle information donne « à neuf heures » ?", ["le moment", "le transport", "la nationalité"], 0)
      ]
    ),

    "demander-chemin": A(
      "Demander son chemin",
      "Thème 9 · Transport, heure et projets immédiats",
      "Interaction",
      "Choisissez les phrases utiles pour demander et comprendre un itinéraire simple.",
      [
        Q("Pour commencer poliment, choisissez :", ["Excusez-moi, où est la gare ?", "Donne gare.", "Je suis gare."], 0),
        Q("Quelle phrase donne une direction ?", ["Allez tout droit.", "Je m’appelle tout droit.", "Le bus est une famille."], 0),
        Q("Complétez : Tournez ___ droite.", ["à", "en", "de"], 0, "On dit tourner à droite."),
        Q("Complétez : Tournez ___ gauche.", ["à", "au", "de"], 0, "On dit tourner à gauche."),
        Q("Quelle phrase utilise un repère ?", ["La station est près du café.", "La station mange un café.", "La station est huit ans."], 0),
        Q("Quelle réponse est utile pour un chemin ?", ["C’est à droite.", "Je suis étudiant.", "J’aime le fromage."], 0),
        Q("Quelle question demande un itinéraire ?", ["Comment aller à la gare ?", "Quel âge as-tu ?", "Tu as des frères ?"], 0),
        Q("Quelle phrase est correcte ?", ["La pharmacie est à côté du supermarché.", "La pharmacie est côté supermarché.", "La pharmacie est de côté à."], 0),
        Q("Quel mot indique la direction opposée à droite ?", ["gauche", "tout droit", "près"], 0),
        Q("Quel mot indique continuer sans tourner ?", ["tout droit", "à gauche", "à droite"], 0),
        Q("Pour remercier, choisissez :", ["Merci beaucoup.", "Merci gare droite.", "Je merci bus."], 0),
        Q("Quelle mini-interaction est cohérente ?", ["Où est la station ? — Elle est à gauche.", "Où est la station ? — Je suis colombienne.", "Où est la station ? — Il est midi."], 0)
      ]
    ),

    "futur-proche": A(
      "Le futur proche",
      "Thème 9 · Transport, heure et projets immédiats",
      "Grammaire",
      "Formez des projets immédiats avec aller au présent + infinitif.",
      [
        Q("Quelle est la formule du futur proche ?", ["aller au présent + infinitif", "être + adjectif", "avoir + nom"], 0),
        Q("Complétez : Je ___ prendre le bus.", ["vais", "va", "allons"], 0, "Avec je, aller = vais."),
        Q("Complétez : Tu ___ aller au centre-ville.", ["vas", "vais", "vont"], 0, "Avec tu, aller = vas."),
        Q("Complétez : Elle ___ acheter un ticket.", ["va", "vais", "allez"], 0, "Avec elle, aller = va."),
        Q("Complétez : Nous ___ visiter le parc.", ["allons", "allez", "vont"], 0, "Avec nous, aller = allons."),
        Q("Quelle phrase est correcte ?", ["Ils vont prendre le train.", "Ils vont prennent le train.", "Ils va prendre le train."], 0),
        Q("Choisissez la négation correcte.", ["Je ne vais pas prendre le taxi.", "Je vais ne pas prendre le taxi.", "Je ne pas vais prendre le taxi."], 0),
        Q("Quelle question est correcte ?", ["Est-ce que tu vas partir à huit heures ?", "Est-ce que tu pars vas huit heures ?", "Vas tu prendre à huit ?" ], 0),
        Q("Quelle phrase exprime un projet proche ?", ["Je vais prendre le métro.", "Je prends souvent le métro.", "J’ai pris le métro hier."], 0),
        Q("Quelle forme doit suivre aller ?", ["un infinitif", "un adjectif féminin", "un article"], 0),
        Q("Transformez : Nous visitons le centre demain.", ["Nous allons visiter le centre demain.", "Nous allons visitons le centre demain.", "Nous sommes visiter le centre demain."], 0),
        Q("Quelle phrase est académique ?", ["Vous allez rentrer à pied.", "Vous allez rentrez à pied.", "Vous aller rentrer à pied."], 0)
      ]
    ),

    "passe-recent": A(
      "Le passé récent",
      "Thème 9 · Transport, heure et projets immédiats",
      "Grammaire",
      "Utilisez venir de + infinitif pour parler d’une action qui vient de se passer.",
      [
        Q("Quelle est la formule du passé récent ?", ["venir de + infinitif", "aller + infinitif", "être + adjectif"], 0),
        Q("Complétez : Je ___ d’arriver.", ["viens", "vais", "suis"], 0, "Avec je, venir = viens. Devant une voyelle, de devient d’."),
        Q("Complétez : Tu ___ de sortir.", ["viens", "vient", "venons"], 0, "Avec tu, venir = viens."),
        Q("Complétez : Elle ___ d’entrer.", ["vient", "viens", "venez"], 0, "Avec elle, venir = vient."),
        Q("Complétez : Nous ___ de prendre le métro.", ["venons", "venez", "viennent"], 0, "Avec nous, venir = venons."),
        Q("Quelle phrase est correcte ?", ["Ils viennent d’arriver.", "Ils viennent de arrivent.", "Ils vont d’arriver."], 0),
        Q("Choisissez la négation correcte.", ["Je ne viens pas d’arriver.", "Je viens ne pas d’arriver.", "Je ne pas viens d’arriver."], 0),
        Q("Quelle question est correcte ?", ["Est-ce que tu viens de sortir ?", "Est-ce tu viens sortir de ?", "Tu viens de sorti ?" ], 0),
        Q("Quelle phrase exprime une action récente ?", ["Je viens de prendre le bus.", "Je vais prendre le bus.", "Je prends toujours le bus."], 0),
        Q("Devant une voyelle, on écrit :", ["d’", "de le", "du"], 0),
        Q("Transformez : Elle arrive maintenant, tout juste.", ["Elle vient d’arriver.", "Elle va arriver.", "Elle est arriver."], 0),
        Q("Quelle phrase est académique ?", ["Nous venons de finir l’exercice.", "Nous venons finissons l’exercice.", "Nous venons de fini l’exercice."], 0)
      ]
    ),

    "ecoute-station-metro": A(
      "Écoute : à la station de métro",
      "Thème 9 · Transport, heure et projets immédiats",
      "Compréhension orale",
      "Écoutez le dialogue complet à la station de métro, puis répondez aux questions.",
      [
        Q("Où sont Clara et Noé ?", ["devant la station de métro", "dans une cuisine", "à la pharmacie"], 0),
        Q("À quelle heure commence le cours ?", ["à neuf heures", "à huit heures vingt", "à midi"], 0),
        Q("Quelle ligne vont-ils prendre ?", ["la ligne deux", "la ligne dix", "la ligne trois"], 0),
        Q("Combien de minutes vont-ils marcher ?", ["cinq minutes", "vingt minutes", "deux minutes"], 0),
        Q("Après le cours, Clara va prendre :", ["le bus", "le taxi", "le train"], 0),
        Q("Où Clara doit-elle aller ?", ["à la pharmacie", "à la gare", "au parc seulement"], 0),
        Q("Où Noé va-t-il après le cours ?", ["à la bibliothèque", "au café de la place", "à la maison de Clara"], 0),
        Q("Où se trouve la bibliothèque ?", ["près du parc, à droite de la mairie", "dans la station", "loin de la ville"], 0),
        Q("Quand le métro arrive-t-il ?", ["dans deux minutes", "dans trente minutes", "demain"], 0),
        Q("Quelle phrase utilise le passé récent ?", ["Je viens d’arriver à la station.", "Je vais prendre le bus.", "Le cours commence à neuf heures."], 0)
      ],
      {
        audio: "../audio/theme-9/station-metro.mp3?v=20260628-theme9",
        transcript: `Narratrice : Il est huit heures vingt. Clara et Noé sont devant la station de métro. Ils vont aller au centre-ville pour un cours de français.

Clara : Noé, tu vas prendre le métro avec moi ?

Noé : Oui. Je viens d’arriver à la station. Le cours commence à neuf heures, c’est ça ?

Clara : Oui, à neuf heures. Nous allons prendre la ligne deux, puis nous allons marcher cinq minutes jusqu’à l’école.

Noé : Très bien. Après le cours, tu vas rentrer à pied ?

Clara : Non, je vais prendre le bus. Je dois aller à la pharmacie, puis je vais déjeuner avec ma sœur au café de la place.

Noé : Moi, je vais aller à la bibliothèque après le cours. Elle est près du parc, à droite de la mairie.

Clara : D’accord. Le métro arrive dans deux minutes. Nous sommes à l’heure.

Narratrice : Clara et Noé entrent dans la station. Ils vont prendre le métro, puis ils vont aller à l’école ensemble.`
      }
    ),

    "lecture-rendez-vous-centre-ville": A(
      "Rendez-vous au centre-ville",
      "Thème 9 · Transport, heure et projets immédiats",
      "Compréhension écrite",
      "Lisez un texte court sur un rendez-vous en ville, puis repérez les transports, l’heure et les projets.",
      [
        Q("Qui a un rendez-vous ?", ["Clara", "Noé", "la professeure"], 0),
        Q("À quelle heure Clara va-t-elle sortir de chez elle ?", ["à huit heures", "à midi", "à dix heures trente"], 0),
        Q("Quel transport va-t-elle prendre d’abord ?", ["le bus", "le taxi", "le train"], 0),
        Q("Où va-t-elle retrouver son amie ?", ["près d’un café au centre-ville", "dans une chambre", "à la pharmacie seulement"], 0),
        Q("Que vont-elles visiter après le café ?", ["une librairie", "un hôpital", "une maison"], 0),
        Q("À quelle heure vont-elles rentrer ?", ["à midi", "à minuit", "à sept heures"], 0),
        Q("Quelle phrase est au futur proche ?", ["Elles vont visiter une librairie.", "Clara est étudiante.", "Le café est près de la place."], 0),
        Q("Quel lieu de la ville apparaît dans le texte ?", ["la station de métro", "la salle de bain", "la cuisine"], 0)
      ],
      {
        reading: "Demain matin, Clara va sortir de chez elle à huit heures. Elle va prendre le bus jusqu’à la station de métro, puis elle va descendre au centre-ville. Son amie Lina vient d’arriver à Lyon et elles ont rendez-vous près d’un café, à côté de la place principale. Le rendez-vous est à neuf heures. Après le café, elles vont visiter une petite librairie et acheter un cahier pour le cours de français. Ensuite, elles vont marcher jusqu’au parc. À midi, Clara va rentrer à pied parce que son appartement est près du centre."
      }
    ),

    "production-mon-trajet-demain": A(
      "Mon trajet demain",
      "Thème 9 · Transport, heure et projets immédiats",
      "Production guidée",
      "Construisez un petit texte pour expliquer où vous allez, à quelle heure, avec quel transport et ce que vous allez faire.",
      [
        Q("Pour commencer, choisissez :", ["Demain, je vais aller au centre-ville.", "Demain, je suis nationalité.", "Demain, bus café moi."], 0),
        Q("Pour dire l’heure, choisissez :", ["Je vais partir à huit heures.", "Je vais partir en huit heures.", "Je vais partir huit ans."], 0),
        Q("Pour dire le transport, choisissez :", ["Je vais prendre le métro.", "Je vais prends le métro.", "Je prends vais le métro."], 0),
        Q("Pour dire un lieu, choisissez :", ["Je vais à la bibliothèque.", "Je vais en bibliothèque.", "Je vais de bibliothèque."], 0),
        Q("Pour dire un projet, choisissez :", ["Je vais étudier avec une amie.", "Je vais étudie avec une amie.", "Je suis étudier avec une amie."], 0),
        Q("Pour ajouter une action récente, choisissez :", ["Je viens d’acheter un ticket.", "Je viens de acheté un ticket.", "Je vais d’acheter un ticket."], 0),
        Q("Pour faire une négation, choisissez :", ["Je ne vais pas prendre le taxi.", "Je vais ne pas prendre le taxi.", "Je ne pas vais taxi."], 0),
        Q("Pour demander un chemin, choisissez :", ["Excusez-moi, où est la station ?", "Excusez-moi, je suis station ?", "Où station être moi ?"], 0),
        Q("Pour terminer, choisissez :", ["Après le cours, je vais rentrer à pied.", "Après le cours, je rentrée pied.", "Après cours pied je."], 0),
        Q("Quelle production est la meilleure ?", ["Demain, je vais partir à huit heures. Je vais prendre le bus et aller à l’université.", "Demain bus huit université aller moi.", "Je suis demain le bus à pied métro."], 0)
      ]
    )
  };

  window.quizCatalog = window.quizCatalog || {};
  window.french1ExpandedActivities = window.french1ExpandedActivities || {};
  Object.assign(window.quizCatalog, C);
  Object.assign(window.french1ExpandedActivities, C);
})();
