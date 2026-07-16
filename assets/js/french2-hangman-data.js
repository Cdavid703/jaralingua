(function () {
  "use strict";

  window.JaraLinguaHangmanA2 = {
    version: "20260716-a2-vocabulaire",
    categories: [
      {
        id: "vetements",
        label: "Vêtements",
        icon: "bi-bag-heart-fill",
        entries: [
          { answer: "chemise", clue: "Vêtement avec un col, souvent porté au travail.", hints: ["Elle peut être blanche ou bleue.", "Elle se porte sur le haut du corps.", "On peut la porter avec une veste."] },
          { answer: "pantalon", clue: "Vêtement pour les jambes.", hints: ["Il peut être noir, bleu ou beige.", "Il n'est pas une jupe.", "On le porte avec une ceinture parfois."] },
          { answer: "robe", clue: "Vêtement souvent féminin, en une seule pièce.", hints: ["Elle peut être élégante.", "Elle peut être courte ou longue.", "On peut la porter avec des chaussures."] },
          { answer: "jupe", clue: "Vêtement porté autour de la taille.", hints: ["Elle ne couvre pas les deux jambes séparément.", "Elle peut être courte ou longue.", "Mot féminin de quatre lettres."] },
          { answer: "veste", clue: "Vêtement porté par-dessus une chemise ou un pull.", hints: ["Elle peut être légère.", "Elle se porte sur le haut du corps.", "Mot utile dans une boutique."] },
          { answer: "pull", clue: "Vêtement chaud pour le haut du corps.", hints: ["Il peut être en laine.", "Il est utile quand il fait froid.", "Mot court de quatre lettres."] },
          { answer: "manteau", clue: "Vêtement chaud pour l'extérieur.", hints: ["Il est plus chaud qu'une veste.", "On le porte en hiver.", "Il peut être long."] },
          { answer: "chaussures", clue: "Objets portés aux pieds.", hints: ["Mot généralement au pluriel.", "Elles peuvent être noires ou blanches.", "On les achète avec une pointure."] },
          { answer: "baskets", clue: "Chaussures sportives.", hints: ["Elles sont confortables.", "On les porte pour marcher ou faire du sport.", "Mot fréquent dans les boutiques."] },
          { answer: "chapeau", clue: "Accessoire porté sur la tête.", hints: ["Il protège du soleil parfois.", "Il peut être élégant.", "Mot masculin."] }
        ]
      },
      {
        id: "couleurs-tailles",
        label: "Couleurs et tailles",
        icon: "bi-palette-fill",
        entries: [
          { answer: "rouge", clue: "Couleur du bouton principal de JaraLingua.", hints: ["Couleur chaude.", "Elle peut décrire une robe.", "Mot de cinq lettres."] },
          { answer: "bleu", clue: "Couleur très présente dans JaraLingua.", hints: ["Couleur froide.", "Elle peut décrire un pantalon.", "Mot masculin de quatre lettres."] },
          { answer: "vert", clue: "Couleur associée aux plantes.", hints: ["Couleur froide.", "Elle peut décrire un pull.", "Mot masculin de quatre lettres."] },
          { answer: "noir", clue: "Couleur très foncée.", hints: ["Elle s'oppose souvent à blanc.", "Un pantalon peut être de cette couleur.", "Mot de quatre lettres."] },
          { answer: "blanc", clue: "Couleur claire.", hints: ["Une chemise peut être de cette couleur.", "Elle s'oppose souvent à noir.", "Mot de cinq lettres."] },
          { answer: "gris", clue: "Couleur entre noir et blanc.", hints: ["Couleur neutre.", "Elle peut décrire un manteau.", "Mot de quatre lettres."] },
          { answer: "beige", clue: "Couleur claire et neutre.", hints: ["Couleur fréquente pour les vêtements.", "Elle ressemble à une couleur sable.", "Mot de cinq lettres."] },
          { answer: "taille", clue: "Information pour choisir un vêtement.", hints: ["Elle peut être S, M ou L.", "Mot féminin.", "En boutique, on demande souvent cette information."] },
          { answer: "pointure", clue: "Taille des chaussures.", hints: ["Elle concerne les pieds.", "Elle peut être 38, 39 ou 40.", "Mot féminin."] },
          { answer: "prix", clue: "Somme à payer pour un article.", hints: ["Il peut être cher ou bon marché.", "On le regarde avant d'acheter.", "La lettre finale ne se prononce généralement pas."] }
        ]
      },
      {
        id: "achats-boutique",
        label: "Achats et boutique",
        icon: "bi-shop",
        entries: [
          { answer: "magasin", clue: "Lieu où l'on achète des articles.", hints: ["Il peut vendre des vêtements.", "Mot masculin.", "On y trouve des clients."] },
          { answer: "boutique", clue: "Petit magasin spécialisé.", hints: ["Mot féminin.", "Elle peut vendre des vêtements.", "Elle est souvent plus petite qu'un grand magasin."] },
          { answer: "cabine", clue: "Petit espace pour essayer des vêtements.", hints: ["Elle est dans une boutique.", "On y essaie une robe ou un pantalon.", "Mot féminin."] },
          { answer: "caisse", clue: "Lieu où l'on paie.", hints: ["Elle se trouve près de la sortie.", "Mot féminin.", "La personne y donne le ticket."] },
          { answer: "vendeur", clue: "Personne qui travaille dans un magasin.", hints: ["Mot masculin.", "Il aide le client.", "Le féminin est vendeuse."] },
          { answer: "cliente", clue: "Personne qui achète dans un magasin.", hints: ["Mot féminin.", "Le masculin est client.", "Elle peut demander le prix."] },
          { answer: "ticket", clue: "Preuve d'achat.", hints: ["Il peut être papier.", "On le reçoit après avoir payé.", "Mot masculin."] },
          { answer: "réduction", clue: "Prix plus bas que le prix normal.", hints: ["Mot avec accent aigu.", "Très utile pendant les soldes.", "Elle permet de payer moins."] },
          { answer: "carte", clue: "Moyen de paiement ou petit document.", hints: ["Elle peut être bancaire.", "Mot féminin.", "On peut payer avec elle."] },
          { answer: "espèces", clue: "Argent liquide.", hints: ["Mot au pluriel.", "Billets et pièces en font partie.", "Autre moyen de paiement que la carte."] }
        ]
      },
      {
        id: "journee-horaires",
        label: "Journée et horaires",
        icon: "bi-clock-fill",
        entries: [
          { answer: "matin", clue: "Première partie de la journée.", hints: ["Moment du petit-déjeuner.", "Il vient avant midi.", "Mot masculin."] },
          { answer: "midi", clue: "Moment central de la journée.", hints: ["Il est autour de douze heures.", "Moment du déjeuner.", "Mot de quatre lettres."] },
          { answer: "après-midi", clue: "Partie de la journée après midi.", hints: ["Mot composé avec un trait d'union.", "Il vient avant le soir.", "Il contient un accent grave."] },
          { answer: "soir", clue: "Partie de la journée avant la nuit.", hints: ["Moment du dîner.", "On dit parfois bonsoir.", "Mot masculin."] },
          { answer: "nuit", clue: "Partie sombre de la journée.", hints: ["Moment du sommeil.", "Elle vient après le soir.", "Mot féminin."] },
          { answer: "semaine", clue: "Période de sept jours.", hints: ["Elle contient lundi, mardi, mercredi...", "Mot féminin.", "Le week-end en fait partie."] },
          { answer: "week-end", clue: "Fin de la semaine.", hints: ["Mot avec un trait d'union.", "Samedi et dimanche.", "Mot souvent utilisé en français."] },
          { answer: "heure", clue: "Unité de temps.", hints: ["Elle sert à dire l'horaire.", "Mot féminin.", "Une journée en a vingt-quatre."] },
          { answer: "minute", clue: "Petite unité de temps.", hints: ["Soixante minutes font une heure.", "Mot féminin.", "Elle sert pour les horaires précis."] },
          { answer: "calendrier", clue: "Objet ou outil pour organiser les dates.", hints: ["Il montre les jours et les mois.", "Mot masculin.", "Il aide à planifier la semaine."] }
        ]
      },
      {
        id: "routine-quotidienne",
        label: "Routine quotidienne",
        icon: "bi-calendar2-check-fill",
        entries: [
          { answer: "réveil", clue: "Objet ou moment du début de la journée.", hints: ["Mot avec accent aigu.", "Il est lié au matin.", "Il peut sonner."] },
          { answer: "douche", clue: "Moment ou espace lié à l'hygiène.", hints: ["Elle se prend souvent le matin.", "Mot féminin.", "Elle est dans la salle de bain."] },
          { answer: "petit-déjeuner", clue: "Premier repas de la journée.", hints: ["Mot composé.", "Il peut inclure café, pain ou croissant.", "Il vient le matin."] },
          { answer: "repas", clue: "Moment où l'on mange.", hints: ["Mot masculin.", "Il peut être le matin, à midi ou le soir.", "Il fait partie de la routine quotidienne."] },
          { answer: "soirée", clue: "Partie du jour liée au soir.", hints: ["Mot féminin avec accent aigu.", "Elle vient après l'après-midi.", "Elle peut être calme ou animée."] },
          { answer: "travail", clue: "Activité professionnelle ou lieu professionnel.", hints: ["Mot masculin.", "Il peut commencer le matin.", "Il fait partie de la routine adulte."] },
          { answer: "cours", clue: "Séance d'apprentissage.", hints: ["Mot masculin.", "Il peut être de français.", "La consonne finale ne se prononce pas."] },
          { answer: "transport", clue: "Moyen pour aller d'un lieu à un autre.", hints: ["Bus et métro en sont des exemples.", "Mot masculin.", "Il fait partie de la routine."] },
          { answer: "maison", clue: "Lieu où l'on habite.", hints: ["On y revient souvent le soir.", "Mot féminin.", "Elle peut être remplacée par appartement."] },
          { answer: "sommeil", clue: "Repos de la nuit.", hints: ["Il est nécessaire pour la santé.", "Mot masculin.", "Il est lié au lit."] }
        ]
      },
      {
        id: "meteo-saisons",
        label: "Météo et saisons",
        icon: "bi-cloud-sun-fill",
        entries: [
          { answer: "soleil", clue: "Astro lumineux associé au beau temps.", hints: ["Il est dans le ciel.", "Mot masculin.", "Il est fréquent en été."] },
          { answer: "pluie", clue: "Eau qui tombe du ciel.", hints: ["Elle mouille la rue.", "Mot féminin.", "On utilise parfois un parapluie."] },
          { answer: "neige", clue: "Précipitation blanche et froide.", hints: ["Elle apparaît quand il fait très froid.", "Mot féminin.", "Elle est fréquente en hiver dans certains pays."] },
          { answer: "vent", clue: "Air en mouvement.", hints: ["Il peut être fort ou léger.", "Mot masculin.", "Il bouge les arbres."] },
          { answer: "nuage", clue: "Forme blanche ou grise dans le ciel.", hints: ["Il annonce parfois la pluie.", "Mot masculin.", "Il cache parfois le soleil."] },
          { answer: "orage", clue: "Phénomène avec tonnerre et éclairs.", hints: ["Il peut être fort.", "Mot masculin.", "Il arrive avec des nuages noirs."] },
          { answer: "printemps", clue: "Saison après l'hiver.", hints: ["Les fleurs apparaissent.", "Mot masculin.", "Il vient avant l'été."] },
          { answer: "été", clue: "Saison chaude.", hints: ["Mot très court avec accent aigu.", "Il vient après le printemps.", "Moment des vacances dans beaucoup de pays."] },
          { answer: "automne", clue: "Saison entre l'été et l'hiver.", hints: ["Les feuilles changent de couleur.", "Mot masculin.", "Il vient avant l'hiver."] },
          { answer: "hiver", clue: "Saison froide.", hints: ["Il vient après l'automne.", "Mot masculin.", "Il est lié au manteau."] }
        ]
      },
      {
        id: "loisirs",
        label: "Loisirs",
        icon: "bi-stars",
        entries: [
          { answer: "cinéma", clue: "Lieu ou activité avec des films.", hints: ["Mot avec accent aigu.", "On y va souvent le week-end.", "Il peut être un loisir."] },
          { answer: "théâtre", clue: "Lieu ou art avec des acteurs sur scène.", hints: ["Mot avec accents.", "Il peut être classique ou moderne.", "On y voit une pièce."] },
          { answer: "musique", clue: "Art des sons.", hints: ["On peut l'écouter.", "Mot féminin.", "Elle peut être francophone."] },
          { answer: "sport", clue: "Activité physique.", hints: ["Football et natation en sont des exemples.", "Mot masculin.", "Il est bon pour la santé."] },
          { answer: "danse", clue: "Activité avec mouvement et musique.", hints: ["Mot féminin.", "Elle peut être un loisir.", "Elle utilise le corps."] },
          { answer: "lecture", clue: "Activité avec des livres ou textes.", hints: ["Mot féminin.", "Elle est liée à la bibliothèque.", "Elle aide à apprendre du vocabulaire."] },
          { answer: "promenade", clue: "Sortie tranquille à pied.", hints: ["Mot féminin.", "Elle peut être dans un parc.", "Elle est liée aux loisirs."] },
          { answer: "musée", clue: "Lieu culturel avec des œuvres ou objets.", hints: ["Mot avec accent aigu.", "On y découvre l'art ou l'histoire.", "Mot masculin."] },
          { answer: "concert", clue: "Événement musical.", hints: ["On y écoute des artistes.", "Mot masculin.", "Il peut être en plein air."] },
          { answer: "jeu", clue: "Activité pour s'amuser ou apprendre.", hints: ["Mot masculin.", "Le pendu en est un.", "Il peut être interactif."] }
        ]
      },
      {
        id: "ville-directions",
        label: "Ville et directions",
        icon: "bi-signpost-2-fill",
        entries: [
          { answer: "rue", clue: "Voie dans une ville.", hints: ["Mot féminin court.", "Elle apparaît dans une adresse.", "On peut y marcher."] },
          { answer: "avenue", clue: "Grande rue.", hints: ["Mot féminin.", "Elle est souvent large.", "Elle peut avoir des commerces."] },
          { answer: "place", clue: "Espace ouvert dans une ville.", hints: ["Mot féminin.", "Elle peut être au centre-ville.", "On peut y trouver une statue."] },
          { answer: "quartier", clue: "Partie d'une ville.", hints: ["Mot masculin.", "Il peut être calme ou animé.", "On y habite parfois."] },
          { answer: "centre-ville", clue: "Partie centrale d'une ville.", hints: ["Mot composé avec un trait d'union.", "On y trouve souvent des magasins.", "Équivalent proche de centro."] },
          { answer: "carrefour", clue: "Lieu où plusieurs rues se rencontrent.", hints: ["Mot masculin.", "Il est important pour les directions.", "On peut y tourner."] },
          { answer: "feu", clue: "Signal de circulation rouge, orange ou vert.", hints: ["Mot masculin.", "Il règle la circulation.", "Il se trouve souvent au carrefour."] },
          { answer: "pont", clue: "Construction pour passer au-dessus d'un obstacle.", hints: ["Mot masculin.", "Il peut passer au-dessus d'une rivière.", "La consonne finale ne se prononce pas."] },
          { answer: "mairie", clue: "Bâtiment administratif de la ville.", hints: ["Mot féminin.", "Elle est liée à la commune.", "Lieu institutionnel."] },
          { answer: "pharmacie", clue: "Lieu où l'on achète des médicaments.", hints: ["Mot féminin.", "Elle est utile en cas de malaise.", "Elle peut avoir une croix verte."] }
        ]
      },
      {
        id: "restaurant",
        label: "Restaurant",
        icon: "bi-cup-straw",
        entries: [
          { answer: "menu", clue: "Liste des plats et boissons.", hints: ["Mot masculin.", "On le lit au restaurant.", "Il présente les prix parfois."] },
          { answer: "serveur", clue: "Personne qui travaille au restaurant.", hints: ["Mot masculin.", "Il apporte les plats.", "Le féminin est serveuse."] },
          { answer: "serveuse", clue: "Personne qui travaille au restaurant.", hints: ["Mot féminin.", "Elle apporte les boissons.", "Le masculin est serveur."] },
          { answer: "table", clue: "Meuble où les clients mangent.", hints: ["Mot féminin.", "Elle peut être réservée.", "Elle a parfois une nappe."] },
          { answer: "terrasse", clue: "Espace extérieur d'un café ou restaurant.", hints: ["Mot féminin.", "Elle est agréable quand il fait beau.", "Elle est dehors."] },
          { answer: "plat", clue: "Préparation servie au restaurant.", hints: ["Mot masculin.", "Il peut être principal.", "La consonne finale ne se prononce généralement pas."] },
          { answer: "dessert", clue: "Partie sucrée à la fin du repas.", hints: ["Mot masculin.", "Une tarte peut en être un.", "Il vient après le plat."] },
          { answer: "boisson", clue: "Liquide que l'on boit.", hints: ["Mot féminin.", "Eau, jus et thé en sont des exemples.", "Elle peut être froide ou chaude."] },
          { answer: "addition", clue: "Somme à payer au restaurant.", hints: ["Mot féminin.", "On la demande à la fin.", "Elle indique le prix total."] },
          { answer: "réservation", clue: "Place gardée à l'avance.", hints: ["Mot féminin.", "Elle peut être pour une table.", "Mot avec accent aigu."] }
        ]
      },
      {
        id: "transport-voyages",
        label: "Transport et voyages",
        icon: "bi-train-front-fill",
        entries: [
          { answer: "bus", clue: "Transport public sur la route.", hints: ["Mot court.", "Il s'arrête à un arrêt.", "Il circule en ville."] },
          { answer: "métro", clue: "Transport urbain souvent souterrain.", hints: ["Mot avec accent aigu.", "Il circule sur des lignes.", "Il est fréquent dans les grandes villes."] },
          { answer: "train", clue: "Transport sur rails entre villes ou régions.", hints: ["Mot masculin.", "On le prend à la gare.", "Il peut être rapide."] },
          { answer: "tramway", clue: "Transport urbain sur rails.", hints: ["Mot masculin.", "Il circule en ville.", "Il ressemble à un train urbain."] },
          { answer: "taxi", clue: "Transport privé avec chauffeur.", hints: ["Mot masculin.", "On le paie pour un trajet.", "Il peut être dans la rue ou via une application."] },
          { answer: "vélo", clue: "Transport à deux roues.", hints: ["Mot avec accent aigu.", "Il est écologique.", "On peut l'utiliser en ville."] },
          { answer: "gare", clue: "Lieu où l'on prend le train.", hints: ["Mot féminin.", "Elle a des quais.", "Elle est liée aux voyages."] },
          { answer: "station", clue: "Lieu où l'on attend un métro ou un bus.", hints: ["Mot féminin.", "Elle est liée au transport.", "On y monte ou descend."] },
          { answer: "billet", clue: "Document pour voyager.", hints: ["Mot masculin.", "Il peut être de train.", "Il donne accès au transport."] },
          { answer: "arrêt", clue: "Lieu où le bus s'arrête.", hints: ["Mot avec accent.", "Il est lié aux transports.", "On attend le bus ici."] }
        ]
      }
    ]
  };
})();
