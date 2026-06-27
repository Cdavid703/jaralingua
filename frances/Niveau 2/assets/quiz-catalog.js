(function () {
  "use strict";

  const A = (title, theme, type, lead, questions, extra = {}) => ({ title, theme, type, lead, questions, ...extra });
  const Q = (question, options, answer, explanation, audio = "") => ({ question, options, answer, explanation, audio });

  const audioBase = "../audio/theme-1/";
  const audioBaseTheme2 = "../audio/theme-2/";

  window.NIVEAU2_ACTIVITIES = {
    "diagnostic-routine-a12": A(
      "Diagnostic A1.2 : ma routine",
      "Thème 1 · Routines et horaires élargis",
      "Diagnostic",
      "Réactivez le présent, les heures et les habitudes avant d’entrer dans les verbes pronominaux.",
      [
        Q("Quelle phrase est correcte pour parler d’une habitude ?", ["Je me lève à sept heures.", "Je me lever à sept heures.", "Je lève moi à sept heures."], 0, "Avec un verbe pronominal, on place le pronom réfléchi avant le verbe conjugué : je me lève."),
        Q("Quelle question demande l’heure d’une routine ?", ["À quelle heure tu te couches ?", "Quelle heure est ta couche ?", "Combien tu dors heure ?"], 0, "À quelle heure + sujet + verbe permet de demander le moment précis d’une action."),
        Q("Choisissez la phrase négative correcte.", ["Je ne me réveille pas tard.", "Je ne réveille me pas tard.", "Je me ne réveille pas tard."], 0, "La négation encadre le bloc pronom + verbe : ne + me réveille + pas."),
        Q("Quel connecteur vient naturellement après d’abord ?", ["ensuite", "jamais", "chez"], 0, "Pour organiser une routine, on peut dire : d’abord, ensuite, puis, après, enfin."),
        Q("Quelle phrase exprime une fréquence ?", ["Je me douche toujours le matin.", "Je me douche à sept heures.", "Je me douche dans la salle de bain."], 0, "Toujours, souvent, parfois, rarement et jamais expriment la fréquence."),
        Q("Quelle phrase respecte l’ordre français ?", ["Je prends le petit-déjeuner après la douche.", "Je prends après le petit-déjeuner la douche.", "Après prends je la douche."], 0, "Après peut introduire un nom ou un groupe nominal : après la douche, après le petit-déjeuner.")
      ]
    ),

    "verbes-pronominaux-present": A(
      "Les verbes pronominaux au présent",
      "Thème 1 · Routines et horaires élargis",
      "Grammaire",
      "Choisissez le bon pronom réfléchi et la bonne conjugaison. L’objectif est de comprendre la logique, pas de mémoriser mécaniquement.",
      [
        Q("Je ___ réveille à six heures.", ["me", "te", "se"], 0, "Avec je, le pronom réfléchi est me : je me réveille."),
        Q("Tu ___ couches tard le samedi.", ["te", "me", "nous"], 0, "Avec tu, on emploie te : tu te couches."),
        Q("Elle ___ habille vite.", ["se", "te", "vous"], 0, "Avec il/elle/on, on emploie se : elle s’habille. Devant voyelle, se devient s’."),
        Q("Nous ___ préparons avant le cours.", ["nous", "vous", "se"], 0, "Avec nous, le pronom est aussi nous : nous nous préparons."),
        Q("Vous ___ levez tôt ?", ["vous", "nous", "se"], 0, "Avec vous, on dit vous vous levez. Le premier vous est sujet, le deuxième est pronom réfléchi."),
        Q("Ils ___ couchent à vingt-trois heures.", ["se", "te", "me"], 0, "Avec ils/elles, on emploie se : ils se couchent."),
        Q("Forme négative correcte :", ["Je ne me douche pas.", "Je me ne douche pas.", "Je ne douche me pas."], 0, "Ne se place avant le pronom réfléchi, pas après le verbe conjugué."),
        Q("Forme interrogative naturelle A1.2 :", ["Est-ce que tu te lèves tôt ?", "Est-ce que te tu lèves tôt ?", "Te lèves est-ce que tu tôt ?"], 0, "Avec est-ce que, l’ordre reste simple : est-ce que + sujet + pronom + verbe.")
      ]
    ),

    "ecoute-journee-camille": A(
      "Écoute : la journée de Camille",
      "Thème 1 · Routines et horaires élargis",
      "Compréhension orale",
      "Écoutez l’audio complet une ou deux fois. Ensuite, répondez aux questions sans relancer l’audio à chaque question.",
      [
        Q("À quelle heure Camille se réveille-t-elle ?", ["À six heures trente", "À sept heures trente", "À huit heures"], 0, "Le début de l’audio indique : Camille se réveille à six heures trente."),
        Q("Que fait-elle après la douche ?", ["Elle s’habille.", "Elle se couche.", "Elle sort du travail."], 0, "L’ordre entendu est : elle se douche, puis elle s’habille."),
        Q("À quelle heure commence son cours ?", ["À huit heures", "À neuf heures", "À midi"], 1, "Camille arrive avant neuf heures et commence son cours à neuf heures."),
        Q("Que fait-elle à midi ?", ["Elle déjeune avec une amie.", "Elle se réveille.", "Elle rentre chez elle."], 0, "À midi, elle déjeune avec une amie et parle de son emploi du temps."),
        Q("Quelle négation entend-on ?", ["Elle ne se couche jamais très tard.", "Elle ne mange rien.", "Elle n’a plus de cahier."], 0, "L’audio contient une négation élargie avec jamais : elle ne se couche jamais très tard."),
        Q("Quel connecteur marque la fin de la routine ?", ["Enfin", "Parce que", "Chez"], 0, "Enfin annonce la dernière étape de la journée.")
      ],
      { audio: `${audioBase}journee-camille.mp3?v=20260624-n2-t1` }
    ),

    "a-quelle-heure-routine": A(
      "À quelle heure ?",
      "Thème 1 · Routines et horaires élargis",
      "Horaires",
      "Associez une action de routine à une heure. Travaillez la question « À quelle heure… ? » et les réponses simples.",
      [
        Q("À quelle heure est 07:15 en français courant ?", ["sept heures et quart", "sept heures moins le quart", "six heures et quart"], 0, "Et quart signifie +15 minutes : 7 h 15 = sept heures et quart."),
        Q("À quelle heure est 06:30 ?", ["six heures et demie", "six heures moins le quart", "sept heures moins vingt"], 0, "Et demie signifie +30 minutes : 6 h 30."),
        Q("Quelle réponse est naturelle ?", ["Je me lève à six heures.", "Je me lève dans six heures.", "Je me lève pour six heures."], 0, "Pour une heure précise, on utilise à : à six heures."),
        Q("Quelle question est correcte ?", ["À quelle heure tu te réveilles ?", "Quelle heure tu réveilles ?", "Tu réveilles à quelle ?"], 0, "À quelle heure + sujet + verbe est la forme simple attendue en A1.2."),
        Q("08:45 peut se dire :", ["neuf heures moins le quart", "huit heures moins le quart", "neuf heures et quart"], 0, "08:45 = quinze minutes avant neuf heures : neuf heures moins le quart."),
        Q("Quelle phrase utilise avant correctement ?", ["Je me douche avant le petit-déjeuner.", "Je me douche avant je petit-déjeune.", "Je me douche avant à sept heures."], 0, "Avant + nom est simple et naturel : avant le petit-déjeuner.")
      ]
    ),

    "routine-en-ordre": A(
      "Ma routine en ordre",
      "Thème 1 · Routines et horaires élargis",
      "Organisation du discours",
      "Remettez une journée dans l’ordre logique et choisissez les bons connecteurs temporels.",
      [
        Q("Quel connecteur ouvre naturellement une routine ?", ["D’abord", "Enfin", "Parce que"], 0, "D’abord annonce la première étape."),
        Q("Après « D’abord, je me réveille », quelle suite est logique ?", ["Ensuite, je me lève.", "Enfin, je me réveille.", "Parce que je me couche."], 0, "Ensuite introduit l’action suivante."),
        Q("Quel connecteur peut introduire une action au milieu de la routine ?", ["Puis", "Jamais", "Chez"], 0, "Puis signifie ensuite/après cela."),
        Q("Quelle phrase est cohérente ?", ["Après le cours, je rentre chez moi.", "Après le cours, je me réveille.", "Après le cours, je prends le petit-déjeuner du matin."], 0, "Rentrer chez soi après le cours est cohérent dans une journée typique."),
        Q("Quel connecteur annonce la dernière action ?", ["Enfin", "D’abord", "Pendant"], 0, "Enfin signale souvent la fin d’une séquence."),
        Q("Quelle mini-routine est la plus naturelle ?", ["D’abord je me réveille, ensuite je me lève, puis je me douche.", "Enfin je me réveille, puis je dors, d’abord je sors.", "Parce que je me lève, chez je me douche."], 0, "La première phrase suit une progression logique et emploie bien les connecteurs.")
      ]
    ),

    "vocabulaire-vetements": A(
      "Vocabulaire : les vêtements",
      "Thème 2 · Mode, vêtements et achats",
      "Vocabulaire",
      "Identifiez les vêtements avec leur article. L’objectif est de mémoriser le genre du nom en même temps que le mot.",
      [
        Q("Quel mot correspond à « shirt » dans une tenue plutôt formelle ?", ["une chemise", "un pantalon", "des chaussures"], 0, "Une chemise est une pièce plus formelle qu’un t-shirt."),
        Q("Quel vêtement est généralement au pluriel dans cette liste ?", ["des chaussures", "une robe", "un sac"], 0, "On porte deux chaussures; on utilise donc très souvent le pluriel."),
        Q("Quel article va avec « robe » ?", ["une", "un", "des"], 0, "Robe est féminin singulier : une robe."),
        Q("Quel article va avec « manteau » ?", ["un", "une", "des"], 0, "Manteau est masculin singulier : un manteau."),
        Q("Quelle phrase est correcte ?", ["Je porte un jean bleu.", "Je porte une jean bleue.", "Je porte des jean bleu."], 0, "Jean est masculin singulier : un jean bleu."),
        Q("Quel mot est un accessoire ?", ["un sac", "un pantalon", "une chemise"], 0, "Un sac complète la tenue; ce n’est pas un vêtement principal.")
      ]
    ),

    "couleurs-accords-vetements": A(
      "Les couleurs et les accords",
      "Thème 2 · Mode, vêtements et achats",
      "Grammaire",
      "Choisissez la bonne forme de la couleur selon le genre et le nombre du vêtement.",
      [
        Q("Une chemise ___", ["blanche", "blanc", "blanches"], 0, "Chemise est féminin singulier : blanche."),
        Q("Un pantalon ___", ["noir", "noire", "noirs"], 0, "Pantalon est masculin singulier : noir."),
        Q("Des chaussures ___", ["noires", "noir", "noire"], 0, "Chaussures est féminin pluriel : noires."),
        Q("Une veste ___", ["bleue", "bleu", "bleus"], 0, "Veste est féminin singulier : bleue."),
        Q("Un manteau ___", ["gris", "grise", "grises"], 0, "Manteau est masculin singulier : gris."),
        Q("Quelle phrase est correcte ?", ["Je porte une robe rouge.", "Je porte un robe rouge.", "Je porte une robe rouges."], 0, "Robe est féminin singulier; rouge a la même forme au masculin et au féminin singulier.")
      ]
    ),

    "quelle-taille-couleur": A(
      "Quelle taille ? Quelle couleur ?",
      "Thème 2 · Mode, vêtements et achats",
      "Questions",
      "Pratiquez quel, quelle, quels, quelles et les questions utiles dans un magasin.",
      [
        Q("___ taille faites-vous ?", ["Quelle", "Quel", "Quels"], 0, "Taille est féminin singulier : quelle taille."),
        Q("___ prix ?", ["Quel", "Quelle", "Quelles"], 0, "Prix est masculin singulier : quel prix."),
        Q("___ chaussures voulez-vous essayer ?", ["Quelles", "Quel", "Quelle"], 0, "Chaussures est féminin pluriel : quelles chaussures."),
        Q("___ vêtements préférez-vous ?", ["Quels", "Quelle", "Quel"], 0, "Vêtements est masculin pluriel : quels vêtements."),
        Q("Quelle question demande le prix ?", ["Combien ça coûte ?", "Quelle taille faites-vous ?", "Vous avez du M ?"], 0, "Combien ça coûte ? sert à demander le prix."),
        Q("Quelle phrase est polie en magasin ?", ["Je voudrais essayer cette veste, s’il vous plaît.", "Donne veste maintenant.", "Moi veste bleue."], 0, "Je voudrais + infinitif + s’il vous plaît est une formule polie et naturelle.")
      ]
    ),

    "ecoute-magasin-vetements": A(
      "Écoute : au magasin de vêtements",
      "Thème 2 · Mode, vêtements et achats",
      "Compréhension orale",
      "Écoutez le dialogue complet une ou deux fois. Ensuite, répondez aux questions sans relancer l’audio à chaque question.",
      [
        Q("Que cherche la cliente ?", ["Une veste bleue", "Une robe rouge", "Des chaussures noires"], 0, "La cliente dit qu’elle cherche une veste bleue."),
        Q("Quelle taille fait la cliente ?", ["M", "S", "L"], 0, "Elle répond : je fais du M."),
        Q("Combien coûte la veste ?", ["Quarante-cinq euros", "Quinze euros", "Soixante euros"], 0, "Le vendeur indique que la veste coûte quarante-cinq euros."),
        Q("Que veut aussi regarder la cliente ?", ["Une chemise blanche", "Un manteau gris", "Une jupe verte"], 0, "Elle demande ensuite s’il y a une chemise blanche."),
        Q("Pourquoi ne prend-elle pas la robe rouge ?", ["Elle est trop chère.", "Elle est trop petite.", "Elle n’aime pas le rouge."], 0, "La cliente dit que la robe rouge est trop chère."),
        Q("Comment paie la cliente ?", ["Par carte", "En espèces", "Elle ne paie pas"], 0, "À la fin, elle paie par carte.")
      ],
      { audio: `${audioBaseTheme2}magasin-vetements.mp3?v=20260626-n2-t2` }
    )
  };
})();
