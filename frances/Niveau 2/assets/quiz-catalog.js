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
        Q("À quelle heure Camille se réveille-t-elle ?", ["À sept heures trente", "À six heures trente", "À huit heures"], 1, "Le début de l’audio indique : Camille se réveille à six heures trente."),
        Q("Que fait-elle après la douche ?", ["Elle s’habille.", "Elle se couche.", "Elle sort du travail."], 0, "L’ordre entendu est : elle se douche, puis elle s’habille."),
        Q("À quelle heure commence son cours ?", ["À huit heures", "À neuf heures", "À midi"], 1, "Camille arrive avant neuf heures et commence son cours à neuf heures."),
        Q("Que fait-elle à midi ?", ["Elle se réveille.", "Elle rentre chez elle.", "Elle déjeune avec une amie."], 2, "À midi, elle déjeune avec une amie et parle de son emploi du temps."),
        Q("Quelle négation entend-on ?", ["Elle ne se couche jamais très tard.", "Elle ne mange rien.", "Elle n’a plus de cahier."], 0, "L’audio contient une négation élargie avec jamais : elle ne se couche jamais très tard."),
        Q("Quel connecteur marque la fin de la routine ?", ["Parce que", "Enfin", "Chez"], 1, "Enfin annonce la dernière étape de la journée."),
        Q("Que fait Camille après les cours ?", ["Elle va acheter des vêtements.", "Elle prend le train pour Paris.", "Elle rentre chez elle et fait ses devoirs."], 2, "Après les cours, Camille rentre chez elle et fait ses devoirs."),
        Q("Quelle expression du thème entend-on ?", ["Elle a une journée chargée.", "Elle se sent chez elle.", "Elle prend un verre."], 0, "L'audio indique qu'aujourd'hui Camille a une journée chargée.")
      ],
      { audio: `${audioBase}journee-camille.mp3?v=20260630-n2-expressions` }
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
        Q("Quelle taille fait la cliente ?", ["S", "M", "L"], 1, "Elle répond : je fais du M."),
        Q("Combien coûte la veste ?", ["Quinze euros", "Soixante euros", "Quarante-cinq euros"], 2, "Le vendeur indique que la veste coûte quarante-cinq euros."),
        Q("Que veut aussi regarder la cliente ?", ["Un manteau gris", "Une chemise blanche", "Une jupe verte"], 1, "Elle demande ensuite s’il y a une chemise blanche."),
        Q("Quelle expression explique que la robe rouge est très chère ?", ["Elle coûte les yeux de la tête.", "Elle va comme un gant.", "Elle fait du lèche-vitrines."], 0, "La cliente dit que la robe rouge coûte les yeux de la tête, c’est-à-dire qu’elle est très chère."),
        Q("Comment paie la cliente ?", ["En espèces", "Elle ne paie pas", "Par carte"], 2, "À la fin, elle paie par carte."),
        Q("Quelle formule le vendeur utilise-t-il pour proposer son aide ?", ["Je peux vous aider ?", "Vous êtes en retard ?", "Vous avez une réservation ?"], 0, "Le dialogue commence par : Bonjour, je peux vous aider ?"),
        Q("Quelle phrase montre que la veste convient parfaitement à la cliente ?", ["Elle me va comme un gant.", "Je paie par carte.", "Vous avez une chemise blanche ?"], 0, "La cliente dit : elle me va comme un gant. Cette expression signifie que le vêtement convient très bien.")
      ],
      { audio: `${audioBaseTheme2}magasin-vetements.mp3?v=20260630-n2-t2-expressions` }
    ),

    "vocabulaire-logement": A(
      "Vocabulaire : pièces et meubles",
      "Thème 3 · Logement détaillé",
      "Vocabulaire",
      "Identifiez les pièces du logement et les meubles essentiels avec leur article.",
      [
        Q("Dans quelle pièce trouve-t-on normalement un canapé ?", ["Dans le salon", "Dans la salle de bains", "Dans le couloir"], 0, "Le canapé est normalement dans le salon."),
        Q("Quel mot désigne une pièce pour dormir ?", ["la chambre", "la cuisine", "l'entrée"], 0, "La chambre est la pièce où l'on dort."),
        Q("Quel meuble va naturellement avec le travail ou les devoirs ?", ["un bureau", "un frigo", "une douche"], 0, "On travaille souvent sur un bureau."),
        Q("Quel objet appartient plutôt à la cuisine ?", ["un frigo", "un lit", "une armoire"], 0, "Le frigo est un élément de la cuisine."),
        Q("Quelle phrase est correcte ?", ["Il y a une table dans la cuisine.", "Il y a un table dans la cuisine.", "Il y a des table dans la cuisine."], 0, "Table est féminin singulier : une table."),
        Q("Quel groupe est cohérent pour une chambre ?", ["un lit, un bureau, une armoire", "un four, un évier, un frigo", "un canapé, une table basse, une télévision"], 0, "Le lit, le bureau et l'armoire sont fréquents dans une chambre.")
      ]
    ),

    "il-y-a-logement": A(
      "Il y a / il n'y a pas de",
      "Thème 3 · Logement détaillé",
      "Grammaire",
      "Dites ce qui existe ou n'existe pas dans un logement avec la forme affirmative et la forme négative.",
      [
        Q("Choisissez la phrase correcte.", ["Il y a un balcon.", "Il est un balcon.", "Il a balcon."], 0, "Pour dire qu'une chose existe dans un lieu, on utilise il y a."),
        Q("Forme négative correcte :", ["Il n'y a pas de garage.", "Il n'y a pas un garage.", "Il ne y a pas garage."], 0, "Avec la négation, on utilise souvent pas de avant le nom."),
        Q("Complétez : Dans mon appartement, ___ deux chambres.", ["il y a", "il est", "il fait"], 0, "Il y a introduit la présence de deux chambres."),
        Q("Complétez : Il n'y a pas ___ ascenseur.", ["d'", "de la", "un"], 0, "Devant une voyelle, de devient d' : pas d'ascenseur."),
        Q("Quelle phrase parle d'une absence ?", ["Il n'y a pas de terrasse.", "Il y a une terrasse.", "La terrasse est grande."], 0, "Il n'y a pas de indique une absence."),
        Q("Quelle phrase est naturelle ?", ["Dans le salon, il y a un canapé et une table basse.", "Dans le salon, il est un canapé.", "Dans salon a un canapé."], 0, "La structure naturelle est : dans + lieu, il y a + nom.")
      ]
    ),

    "prepositions-logement": A(
      "Prépositions de lieu",
      "Thème 3 · Logement détaillé",
      "Localisation",
      "Choisissez la préposition correcte pour situer les meubles et les objets dans une pièce.",
      [
        Q("Le livre est ___ la table.", ["sur", "sous", "entre"], 0, "Sur signifie que l'objet est au-dessus et en contact avec la table."),
        Q("Le sac est ___ le bureau.", ["sous", "dans", "devant"], 0, "Sous indique une position en bas du bureau."),
        Q("La plante est ___ du canapé.", ["à côté", "sur", "entre"], 0, "À côté de indique une position proche, sur le côté."),
        Q("La table basse est ___ le canapé.", ["devant", "derrière", "sous"], 0, "Dans un salon, la table basse est souvent devant le canapé."),
        Q("La lampe est ___ le fauteuil.", ["derrière", "sous", "dans"], 0, "Derrière indique une position à l'arrière."),
        Q("La cuisine est ___ le salon et le couloir.", ["entre", "sur", "sous"], 0, "Entre indique une position au milieu de deux éléments.")
      ]
    ),

    "ecoute-appartement-malik": A(
      "Écoute : l'appartement de Malik",
      "Thème 3 · Logement détaillé",
      "Compréhension orale",
      "Écoutez la description de l'appartement de Malik, puis répondez aux questions.",
      [
        Q("Où habite Malik ?", ["Dans un petit appartement près de l'université", "Dans une grande maison à la campagne", "Dans un hôtel au centre-ville"], 0, "Malik dit qu'il habite dans un petit appartement près de l'université."),
        Q("Quelles pièces y a-t-il ?", ["Deux salons et trois chambres", "Un salon, une cuisine, une chambre et une salle de bains", "Une cuisine seulement"], 1, "La description mentionne un salon, une cuisine, une chambre et une salle de bains."),
        Q("Où est le canapé bleu ?", ["Dans la cuisine", "Dans la salle de bains", "Dans le salon"], 2, "Le canapé bleu est dans le salon."),
        Q("Où est la table basse ?", ["Sous le lit", "Devant le canapé", "Derrière la porte"], 1, "La table basse est devant le canapé."),
        Q("Qu'est-ce qu'il n'y a pas ?", ["Il n'y a pas de balcon", "Il n'y a pas de lit", "Il n'y a pas de cuisine"], 0, "Malik dit qu'il n'y a pas de balcon."),
        Q("Pourquoi Malik aime-t-il son appartement ?", ["Parce qu'il est très grand", "Parce qu'il a un garage", "Parce qu'il est simple et confortable"], 2, "Malik dit qu'il aime son appartement parce qu'il est simple et confortable."),
        Q("Où est la plante ?", ["À côté de la fenêtre", "Sous le bureau", "Devant la porte"], 0, "La plante est à côté de la fenêtre."),
        Q("Quelle expression du thème Malik utilise-t-il à la fin ?", ["J'ai les yeux plus gros que le ventre.", "Je me sens chez moi.", "Il fait un temps de chien."], 1, "La dernière phrase dit : ici, je me sens chez moi.")
      ],
      { audio: "../audio/theme-3/appartement-malik.mp3?v=20260630-n2-expressions" }
    ),

    "vocabulaire-aliments-boissons": A(
      "Vocabulaire : aliments et boissons",
      "Thème 4 · Alimentation et restaurant",
      "Vocabulaire",
      "Identifiez les aliments, les boissons et les mots utiles pour commander. L'expression du thème à reconnaître est « avoir faim ».",
      [
        Q("Quel mot désigne une boisson ?", ["de l'eau", "du riz", "du fromage"], 0, "L'eau est une boisson. Devant une voyelle, on utilise de l'."),
        Q("Quel aliment est souvent dans une salade ?", ["de la tomate", "du café", "de l'eau"], 0, "La tomate peut être dans une salade; on dit de la tomate."),
        Q("Quel mot correspond à un plat principal ?", ["le plat du jour", "l'addition", "le serveur"], 0, "Le plat du jour est un plat proposé par le restaurant."),
        Q("Quelle phrase est naturelle avant de commander ?", ["J'ai faim.", "Je suis faim.", "Je fais faim."], 0, "En français, on utilise avoir : j'ai faim."),
        Q("Quel mot demande le total à payer ?", ["l'addition", "la carte", "la soupe"], 0, "L'addition indique ce qu'il faut payer à la fin du repas."),
        Q("Quel groupe contient seulement des aliments ?", ["du pain, du riz, des légumes", "une table, la carte, le serveur", "l'addition, la réservation, la serveuse"], 0, "Pain, riz et légumes sont des aliments.")
      ]
    ),

    "articles-partitifs-restaurant": A(
      "Articles partitifs : du, de la, de l', des",
      "Thème 4 · Alimentation et restaurant",
      "Grammaire",
      "Choisissez l'article partitif correct. Pensez au genre du nom et au premier son du mot.",
      [
        Q("Je mange ___ pain.", ["du", "de la", "des"], 0, "Pain est masculin singulier et commence par une consonne : du pain."),
        Q("Elle prend ___ soupe.", ["de la", "du", "de l'"], 0, "Soupe est féminin singulier : de la soupe."),
        Q("Nous buvons ___ eau.", ["de l'", "du", "de la"], 0, "Eau commence par une voyelle : de l'eau."),
        Q("Ils commandent ___ légumes.", ["des", "du", "de l'"], 0, "Légumes est pluriel : des légumes."),
        Q("Je voudrais ___ café.", ["du", "de la", "des"], 0, "Quand on parle d'une quantité non précise de café, on dit du café."),
        Q("Quelle phrase est correcte ?", ["Le menu est copieux : il y a du riz et des légumes.", "Le menu est copieux : il y a de la riz et du légumes.", "Le menu est copieux : il y a des riz et de l'légumes."], 0, "Riz est masculin singulier : du riz. Légumes est pluriel : des légumes.")
      ]
    ),

    "negation-alimentation": A(
      "Négation : pas de, jamais, rien",
      "Thème 4 · Alimentation et restaurant",
      "Grammaire",
      "Transformez les articles partitifs à la négation et utilisez la négation élargie pour parler de restrictions.",
      [
        Q("Forme négative correcte :", ["Je ne mange pas de fromage.", "Je ne mange pas du fromage.", "Je ne mange pas le fromage."], 0, "Avec une absence générale, du devient de après pas."),
        Q("Je bois de l'eau. À la négation :", ["Je ne bois pas d'eau.", "Je ne bois pas de l'eau.", "Je ne bois pas du eau."], 0, "Devant une voyelle, de devient d' : pas d'eau."),
        Q("Elle prend des légumes. À la négation :", ["Elle ne prend pas de légumes.", "Elle ne prend pas des légumes.", "Elle ne prend pas les légumes."], 0, "Des devient de après la négation : pas de légumes."),
        Q("Quelle phrase utilise ne... jamais ?", ["Je ne mange jamais de viande.", "Je ne jamais mange de viande.", "Je mange ne jamais de viande."], 0, "La négation entoure le verbe conjugué : ne mange jamais."),
        Q("Quelle phrase signifie que la personne ne veut aucun dessert ?", ["Je ne veux rien pour le dessert.", "Je ne veux pas du dessert.", "Je ne veux jamais rien dessert."], 0, "Ne... rien signifie aucune chose."),
        Q("Quelle phrase est naturelle pour expliquer une restriction ?", ["Je suis au régime, je ne prends pas de dessert.", "Je suis au régime, je ne prends pas du dessert.", "Je suis régime, je ne prends rien de dessert."], 0, "Être au régime est une expression utile; à la négation, on dit pas de dessert.")
      ]
    ),

    "ecoute-restaurant": A(
      "Écoute : au restaurant",
      "Thème 4 · Alimentation et restaurant",
      "Compréhension orale",
      "Écoutez la scène au restaurant. Repérez la commande, les restrictions, les articles partitifs et les expressions du thème.",
      [
        Q("Combien de personnes veulent une table ?", ["Deux personnes", "Trois personnes", "Une personne"], 0, "Au début, la cliente demande une table pour deux personnes."),
        Q("Quelle expression entend-on avant de commander ?", ["Je suis en retard", "J'ai faim", "Je fais la grasse matinée"], 1, "La cliente dit : j'ai faim."),
        Q("Que contient le plat du jour ?", ["De la soupe, du pain et du fromage", "Du poisson, des frites et de l'eau", "Du poulet, du riz et des légumes"], 2, "Le serveur présente le plat du jour avec du poulet, du riz et des légumes."),
        Q("Pourquoi le deuxième client ne prend-il pas le plat du jour ?", ["Il n'a pas soif", "Il ne mange pas de viande", "Il ne veut rien boire"], 1, "Le client dit qu'il ne mange pas de viande."),
        Q("Quelle boisson commande le deuxième client ?", ["Du jus d'orange", "Du café", "Du lait"], 0, "Il commande du jus d'orange."),
        Q("Quelle expression décrit le plat du jour ?", ["Ça coûte les yeux de la tête", "Il est à l'heure", "C'est copieux"], 2, "Le serveur dit que le plat du jour est copieux."),
        Q("Que retire le deuxième client de sa salade ?", ["Le fromage", "La tomate", "L'avocat"], 0, "Il prend la salade, mais sans fromage."),
        Q("Que commande la cliente à la fin ?", ["Une salade et du jus", "Le plat du jour et de l'eau", "Un dessert et un café"], 1, "La cliente dit : pour moi, le plat du jour et de l'eau.")
      ],
      { audio: "../audio/theme-4/restaurant.mp3?v=20260630-n2-audio-audit" }
    ),

    "vocabulaire-corps-symptomes": A(
      "Vocabulaire : corps et symptômes",
      "Thème 5 · Santé de base",
      "Vocabulaire",
      "Identifiez les parties du corps et les symptômes utiles pour expliquer un malaise simple.",
      [
        Q("Quelle phrase correspond à un problème dans la gorge ?", ["J'ai mal au dos.", "J'ai mal à la gorge.", "J'ai mal aux yeux."], 1, "Gorge est féminin singulier : on dit à la gorge."),
        Q("Quel mot désigne une partie du corps au pluriel ?", ["les yeux", "le ventre", "la tête"], 0, "Les yeux est un nom pluriel; on dira aux yeux avec avoir mal à."),
        Q("Quelle phrase exprime un état général, pas une partie du corps ?", ["J'ai mal à l'estomac.", "J'ai mal au pied.", "Je me sens mal."], 2, "Je me sens mal décrit l'état général de la personne."),
        Q("Quel symptôme peut accompagner un rhume simple ?", ["Je réserve une table.", "Je tousse.", "Je porte une chemise."], 1, "Tousser est un symptôme simple; les autres phrases appartiennent à d'autres thèmes."),
        Q("Quelle phrase utilise correctement l'expression du thème ?", ["Je ne suis pas dans ma chaise.", "Je ne suis pas dans mon menu.", "Je ne suis pas dans mon assiette."], 2, "Ne pas être dans son assiette signifie ne pas se sentir bien."),
        Q("Quelle action est cohérente quand une personne se sent mal ?", ["Essayer une veste", "Aller à la pharmacie", "Commander un dessert copieux"], 1, "Aller à la pharmacie est cohérent avec un malaise simple.")
      ]
    ),

    "avoir-mal-a-sante": A(
      "Avoir mal à : contractions",
      "Thème 5 · Santé de base",
      "Grammaire",
      "Choisissez entre à la, au, aux et à l' selon la partie du corps.",
      [
        Q("J'ai mal ___ tête.", ["au", "à la", "aux"], 1, "Tête est féminin singulier : à la tête."),
        Q("Il a mal ___ dos.", ["au", "aux", "à la"], 0, "Dos est masculin singulier : à + le devient au."),
        Q("Nous avons mal ___ yeux.", ["à l'", "à la", "aux"], 2, "Yeux est pluriel : à + les devient aux."),
        Q("Elle a mal ___ estomac.", ["à l'", "au", "à la"], 0, "Estomac commence par une voyelle : à l'estomac."),
        Q("Quelle phrase est correcte ?", ["J'ai mal au gorge.", "J'ai mal à la gorge.", "J'ai mal aux gorge."], 1, "Gorge est féminin singulier : à la gorge."),
        Q("Quelle transformation est correcte ?", ["à + les oreilles = aux oreilles", "à + les oreilles = au oreilles", "à + les oreilles = à la oreilles"], 0, "À + les devient aux : aux oreilles.")
      ]
    ),

    "il-faut-sante": A(
      "Il faut + infinitif",
      "Thème 5 · Santé de base",
      "Grammaire",
      "Comprenez comment formuler une recommandation simple avec il faut + infinitif.",
      [
        Q("Après « il faut », le verbe doit être :", ["au pluriel", "à l'infinitif", "au féminin"], 1, "Il faut est suivi d'un verbe à l'infinitif : boire, prendre, se reposer."),
        Q("Quelle phrase est correcte ?", ["Il faut boit de l'eau.", "Il faut buvez de l'eau.", "Il faut boire de l'eau."], 2, "Boire reste à l'infinitif après il faut."),
        Q("Quelle recommandation est cohérente pour une personne fatiguée ?", ["Il faut essayer une chemise.", "Il faut se reposer.", "Il faut réserver une table."], 1, "Se reposer est une recommandation cohérente pour la fatigue."),
        Q("Complétez : Il faut ___ ce médicament après le repas.", ["prend", "prenez", "prendre"], 2, "Après il faut, on utilise l'infinitif prendre."),
        Q("Quelle phrase combine symptôme et recommandation ?", ["Je porte une veste; il faut de la soupe.", "J'ai mal à la gorge; il faut boire de l'eau.", "Je prends le bus; il faut la table."], 1, "La deuxième phrase relie un symptôme et une recommandation simple."),
        Q("Quelle expression signifie que la personne va mieux ?", ["Ça coûte cher.", "C'est copieux.", "Ça va mieux."], 2, "Ça va mieux signifie que l'état de la personne s'améliore.")
      ]
    ),

    "ecoute-pharmacie": A(
      "Écoute : à la pharmacie",
      "Thème 5 · Santé de base",
      "Compréhension orale",
      "Écoutez la scène à la pharmacie. Repérez le symptôme principal, les questions et la recommandation.",
      [
        Q("Pourquoi Camila va-t-elle à la pharmacie ?", ["Elle cherche une veste bleue.", "Elle ne se sent pas bien depuis ce matin.", "Elle veut réserver une table."], 1, "Camila dit qu'elle ne se sent pas bien depuis ce matin."),
        Q("Quelle expression idiomatique Camila utilise-t-elle ?", ["Je ne suis pas dans mon assiette.", "J'ai les yeux plus gros que le ventre.", "Je fais la grasse matinée."], 0, "Camila dit : je ne suis pas dans mon assiette."),
        Q("Où Camila a-t-elle mal ?", ["Au dos et aux yeux", "À la gorge et à la tête", "À l'estomac et au pied"], 1, "Elle dit qu'elle a mal à la gorge et un peu à la tête."),
        Q("Depuis quand a-t-elle ces symptômes ?", ["Depuis ce matin", "Depuis samedi soir", "Depuis deux semaines"], 0, "Elle répond : depuis ce matin."),
        Q("Que recommande le pharmacien ?", ["Manger un dessert et prendre un café", "Acheter des chaussures et marcher vite", "Boire de l'eau et se reposer"], 2, "Le pharmacien recommande de boire de l'eau et de se reposer."),
        Q("Quand Camila doit-elle prendre le médicament ?", ["Avant le cours", "Après le repas", "Pendant la nuit seulement"], 1, "Le pharmacien précise : après le repas."),
        Q("Que doit faire Camila si ça ne va pas mieux demain ?", ["Acheter une veste", "Appeler le médecin", "Réserver une table"], 1, "Le pharmacien dit qu'il faut appeler le médecin si ça ne va pas mieux demain."),
        Q("Quelle formule le pharmacien utilise-t-il à la fin ?", ["Ça coûte les yeux de la tête.", "On fait quoi ce week-end ?", "Prenez soin de vous."], 2, "Le dialogue se termine par : prenez soin de vous.")
      ],
      { audio: "../audio/theme-5/pharmacie.mp3?v=20260630-n2-audio-audit" }
    ),

    "futur-proche-plans": A(
      "Le futur proche : plans de week-end",
      "Thème 6 · Climat, saisons et loisirs",
      "Grammaire",
      "Construisez des projets proches avec aller au présent + infinitif, en lien avec la météo.",
      [
        Q("Quelle phrase annonce correctement un projet proche ?", ["Nous allons marcher au parc.", "Nous marchons aller au parc.", "Nous allons marchons au parc."], 0, "Après allons, le deuxième verbe reste à l'infinitif : marcher."),
        Q("Dans « Dimanche, je ne vais pas sortir », la négation entoure :", ["le verbe aller conjugué", "le verbe sortir", "le mot dimanche"], 0, "Au futur proche, ne... pas entoure le verbe aller : je ne vais pas."),
        Q("Complétez : S'il fait beau, tu ___ profiter du beau temps.", ["vas", "va", "allez"], 0, "Avec tu, on utilise vas."),
        Q("Quelle phrase combine météo et projet de façon naturelle ?", ["Il pleut, donc nous allons rester au chaud.", "Il pleut, donc nous sommes rester au chaud.", "Il pleut, donc rester au chaud allons."], 0, "La première phrase relie une météo et un projet cohérent."),
        Q("Quelle forme correspond à « elles » ?", ["elles vont regarder un film", "elles va regarder un film", "elles allons regarder un film"], 0, "Avec elles, on utilise vont."),
        Q("Quelle phrase est incorrecte et doit être corrigée ?", ["Je vais marcher samedi.", "Nous allons prendre un café.", "Ils vont regardent un film."], 2, "Après vont, le verbe doit rester à l'infinitif : regarder.")
      ]
    ),

    "comparatifs-saisons": A(
      "Comparatifs : saisons et météo",
      "Thème 6 · Climat, saisons et loisirs",
      "Grammaire",
      "Comparez deux jours, deux saisons ou deux activités avec plus, moins et aussi.",
      [
        Q("Quelle phrase exprime une supériorité ?", ["Samedi est plus chaud que vendredi.", "Samedi est aussi chaud que vendredi.", "Samedi est moins chaud que vendredi."], 0, "Plus... que indique une supériorité."),
        Q("Quelle phrase exprime une égalité ?", ["Le printemps est aussi agréable que l'automne.", "Le printemps est plus agréable que l'automne.", "Le printemps est moins agréable que l'automne."], 0, "Aussi... que indique une égalité."),
        Q("Complétez : Dimanche est ___ agréable que samedi parce qu'il pleut.", ["moins", "aussi", "très"], 0, "Moins agréable que samedi est cohérent avec la pluie."),
        Q("Quelle comparaison aide à choisir une activité ?", ["Le cinéma est moins cher que le restaurant.", "Le cinéma est dimanche.", "Le cinéma va nuage."], 0, "La première phrase compare deux options réelles."),
        Q("Quelle phrase est grammaticalement complète ?", ["L'hiver est plus froid que l'été.", "L'hiver plus froid l'été.", "L'hiver est froid que été."], 0, "La structure complète est plus + adjectif + que."),
        Q("Quelle phrase combine comparaison et futur proche ?", ["Samedi va être plus chaud que dimanche, donc nous allons sortir.", "Samedi plus chaud, donc sortir.", "Samedi est que dimanche nous allons."], 0, "La phrase relie une comparaison et une décision.")
      ]
    ),

    "ecoute-weekend-meteo": A(
      "Écoute : on sort ce week-end ?",
      "Thème 6 · Climat, saisons et loisirs",
      "Compréhension orale",
      "Écoutez le message de Camille. Repérez la météo, les projets, les comparaisons et les expressions idiomatiques.",
      [
        Q("Pourquoi Camille regarde-t-elle la météo ?", ["Pour choisir le programme du week-end", "Pour acheter des vêtements", "Pour expliquer un symptôme"], 0, "Camille dit qu'ils regardent la météo avant de choisir le programme."),
        Q("Quel temps est prévu samedi matin ?", ["Il va neiger toute la journée.", "Il va faire beau et il y aura du soleil.", "Il va faire mauvais avec du vent."], 1, "Samedi matin, il va faire beau et il y aura du soleil."),
        Q("Que vont-ils faire samedi matin ?", ["Rester chez Lina", "Regarder un film", "Marcher au parc"], 2, "Camille dit qu'ils vont marcher au parc."),
        Q("Quelle comparaison entend-on pour samedi après-midi ?", ["Il va faire moins chaud que dimanche.", "Il va faire plus chaud que vendredi.", "Il va être aussi froid que l'hiver."], 1, "Le message compare samedi après-midi avec vendredi."),
        Q("Pourquoi ne vont-ils pas pique-niquer dimanche ?", ["Il y aura des nuages, du vent et de la pluie.", "Ils n'aiment pas le parc.", "Camille doit aller à la pharmacie."], 0, "Dimanche, il va faire mauvais; le pique-nique n'est donc pas cohérent."),
        Q("Quelle expression idiomatique propose une invitation naturelle ?", ["J'ai mal à la gorge", "C'est copieux", "Si ça te dit"], 2, "Si ça te dit sert à inviter ou proposer."),
        Q("Où vont-ils rester dimanche ?", ["Chez Lina", "À la gare", "Au restaurant"], 0, "Dimanche, ils vont rester au chaud chez Lina."),
        Q("Pourquoi vont-ils prendre de l'eau et des casquettes samedi après-midi ?", ["Parce qu'il va neiger", "Parce qu'il va faire plus chaud que vendredi", "Parce qu'ils vont à la pharmacie"], 1, "Camille explique que samedi après-midi il va faire plus chaud que vendredi.")
      ],
      { audio: "../audio/theme-6/weekend-meteo.mp3?v=20260630-n2-theme6" }
    ),

    "vocabulaire-ville-lieux": A(
      "Vocabulaire : ville et lieux",
      "Thème 7 · Ville, personnes et technologies",
      "Vocabulaire",
      "Identifiez les lieux utiles de la ville et choisissez le mot qui convient dans une situation réelle.",
      [
        Q("Lina doit prendre un train pour Paris. Quel lieu cherche-t-elle ?", ["la pharmacie", "la gare", "la boulangerie"], 1, "Pour prendre un train, on va à la gare."),
        Q("Tu veux acheter du pain avant le cours. Où vas-tu ?", ["à la boulangerie", "au parc", "à l'arrêt de bus"], 0, "La boulangerie est le lieu où l'on achète du pain."),
        Q("Une personne dit : « La poste est en face de la banque ». Où est la poste ?", ["derrière la banque", "loin de la banque", "devant la banque, de l'autre côté"], 2, "En face de indique que les deux lieux se regardent, de l'autre côté de la rue ou de l'espace."),
        Q("Quel mot désigne un lieu où l'on attend le bus ?", ["un arrêt de bus", "un musée", "une place"], 0, "On attend le bus à un arrêt de bus."),
        Q("Dans « Le café est à deux pas », l'expression signifie que le café est :", ["très cher", "très proche", "fermé aujourd'hui"], 1, "Être à deux pas signifie être très proche."),
        Q("Quelle phrase utilise correctement un lieu de la ville ?", ["Je prends un médicament à la bibliothèque.", "Je réserve un train à la piscine.", "Je demande mon chemin près de la station de métro."], 2, "La station de métro est un repère naturel pour demander son chemin.")
      ]
    ),

    "directions-ville": A(
      "Directions en ville",
      "Thème 7 · Ville, personnes et technologies",
      "Communication",
      "Comprenez et donnez un itinéraire simple avec des repères précis.",
      [
        Q("Quelle instruction signifie continuer sans tourner ?", ["Allez tout droit.", "Tournez à gauche.", "Traversez la place."], 0, "Allez tout droit signifie continuer dans la même direction."),
        Q("Complétez : La pharmacie est ___ la banque.", ["jusqu'à", "en face de", "tout droit"], 1, "En face de sert à localiser un lieu devant un autre."),
        Q("Quel ordre est le plus clair pour guider une personne ?", ["Le cinéma est intéressant, puis merci.", "Allez tout droit jusqu'au feu, puis tournez à droite.", "Pourquoi la gare est cinq minutes ?"], 1, "Cette phrase donne deux étapes concrètes : continuer, puis tourner."),
        Q("Une personne se perd. Quelle phrase est naturelle ?", ["Je me perds, pouvez-vous me donner un coup de main ?", "Je suis au régime, où est la gare ?", "Il fait beau, je ne comprends pas."], 0, "Se perdre et donner un coup de main sont cohérents dans une demande d'aide."),
        Q("Que signifie « jusqu'au feu » dans un itinéraire ?", ["continuer jusqu'au feu de circulation", "entrer dans une pharmacie", "prendre un taxi immédiatement"], 0, "Jusqu'au feu indique le point où l'on doit arriver avant l'étape suivante."),
        Q("Quelle phrase contient une erreur à corriger ?", ["La gare est à côté de l'arrêt de bus.", "Tournez à gauche après la banque.", "Allez à droite tout droit jusqu'au."], 2, "La troisième phrase mélange les instructions et reste incomplète.")
      ]
    ),

    "questions-ville-technologies": A(
      "Questions utiles en ville",
      "Thème 7 · Ville, personnes et technologies",
      "Grammaire",
      "Choisissez la bonne question avec où, pourquoi, combien et qu'est-ce que dans des échanges urbains.",
      [
        Q("Vous cherchez la gare. Quelle question est correcte ?", ["Où est la gare, s'il vous plaît ?", "Pourquoi est la gare, s'il vous plaît ?", "Combien est la gare, s'il vous plaît ?"], 0, "Où sert à demander un lieu."),
        Q("Vous voulez connaître la durée à pied. Quelle question utilisez-vous ?", ["Qu'est-ce que la gare ?", "Combien de minutes à pied ?", "Pourquoi à gauche ?"], 1, "Combien de minutes sert à demander une durée."),
        Q("La batterie du téléphone est vide. Quelle question demande la raison ?", ["Où est vide ?", "Combien de batterie ?", "Pourquoi ton téléphone ne fonctionne pas ?"], 2, "Pourquoi demande la cause ou la raison."),
        Q("Un passant demande votre destination. Quelle question est naturelle ?", ["Qu'est-ce que vous cherchez ?", "Combien vous cherchez ?", "Où vous cherchez pourquoi ?"], 0, "Qu'est-ce que vous cherchez ? demande l'objet ou le lieu recherché."),
        Q("Quelle question est bien formée pour demander un prix ?", ["Pourquoi coûte le ticket ?", "Combien coûte le ticket de métro ?", "Où coûte le ticket ?"], 1, "Combien coûte... sert à demander le prix."),
        Q("Quelle réponse correspond à « Où est la station de métro ? »", ["Parce que mon téléphone est déchargé.", "Cinq minutes environ.", "Elle est à droite, près de la banque."], 2, "Une question avec où attend une localisation.")
      ]
    ),

    "pronoms-toniques-ville": A(
      "Pronoms toniques : moi, toi, lui, elle...",
      "Thème 7 · Ville, personnes et technologies",
      "Grammaire",
      "Utilisez les pronoms toniques pour insister, comparer des rôles et organiser une interaction.",
      [
        Q("Complétez : ___, je vais à la gare; eux, ils arrivent en train.", ["Moi", "Lui", "Elle"], 0, "Moi sert à insister sur je."),
        Q("Quelle phrase utilise correctement un pronom tonique après avec ?", ["Je vais avec elle.", "Je vais avec il.", "Je vais avec nous allons."], 0, "Après avec, on utilise un pronom tonique : elle, lui, toi, nous, vous, eux, elles."),
        Q("Complétez : Tu as le GPS, mais ___, je n'ai plus de batterie.", ["toi", "moi", "eux"], 1, "Moi correspond à je et marque le contraste avec toi."),
        Q("Quelle phrase oppose deux personnes correctement ?", ["Lui, il connaît le quartier; moi, je cherche la station.", "Il, lui connaît le quartier; je, moi cherche.", "Lui connaît il; moi cherche je."], 0, "La structure correcte est pronom tonique + pronom sujet + verbe."),
        Q("Complétez : Nous demandons à Sarah. ___, elle travaille à la gare.", ["Eux", "Elle", "Toi"], 1, "Elle reprend Sarah et insiste sur cette personne."),
        Q("Quelle phrase est utile dans une conversation de groupe ?", ["Nous, on prend le bus; vous, vous prenez le métro.", "On nous prend le bus; vous métro.", "Je, tu, il, gare."], 0, "Nous et vous comme pronoms toniques permettent d'opposer deux groupes.")
      ]
    ),

    "ecoute-cherche-la-gare": A(
      "Écoute : je cherche la gare",
      "Thème 7 · Ville, personnes et technologies",
      "Compréhension orale",
      "Écoutez une personne qui demande son chemin. Repérez les lieux, les directions, les pronoms toniques et les expressions idiomatiques.",
      [
        Q("Quel lieu la personne cherche-t-elle ?", ["la pharmacie", "la gare", "le cinéma"], 1, "La personne dit : je cherche la gare."),
        Q("Quelle expression indique que le lieu est proche ?", ["à deux pas", "loin de tout", "un temps de chien"], 0, "Le passant dit que la gare est à deux pas."),
        Q("Quel itinéraire le passant donne-t-il ?", ["Tournez à droite, puis traversez le parc.", "Prenez le bus jusqu'au musée.", "Allez tout droit jusqu'au feu, puis tournez à gauche."], 2, "L'itinéraire exact est : allez tout droit jusqu'au feu, puis tournez à gauche."),
        Q("Pourquoi la personne ne peut-elle pas utiliser son GPS ?", ["Elle n'a plus de batterie.", "Elle ne connaît pas ses amis.", "Elle est à la pharmacie."], 0, "Elle dit : moi, je n'ai plus de batterie et mon GPS ne fonctionne pas."),
        Q("Quelle personne travaille à la gare selon le passant ?", ["l'homme avec un sac noir", "la femme avec le manteau rouge", "le professeur de français"], 1, "Le passant recommande de demander à la femme avec le manteau rouge."),
        Q("Qui arrive en train ?", ["Ses amis", "Le passant", "La pharmacienne"], 0, "La personne dit : eux, ils arrivent en train."),
        Q("Combien de temps faut-il marcher environ ?", ["Quinze minutes", "Cinq minutes", "Trente minutes"], 1, "Le passant répond : cinq minutes environ."),
        Q("D'où vient la personne qui cherche la gare ?", ["De la pharmacie", "De la boulangerie", "Du centre-ville"], 2, "La personne dit : moi, je viens du centre-ville.")
      ],
      { audio: "../audio/theme-7/cherche-la-gare.mp3?v=20260630-n2-theme7" }
    )
  };
})();
