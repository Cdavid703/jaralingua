(function () {
  const Q = (question, options, answer, explanation, audio) => ({ question, options, answer, explanation, audio });
  const A = (title, theme, skill, description, questions) => ({ title, theme, skill, description, questions });
  window.quizCatalog = {
    "alphabet-sons": A("Alphabet et premiers sons", "Thème 1 · Premiers contacts", "Phonétique", "Écoutez, observez et reconnaissez les lettres et les sons de base.", [
      Q("Quelle lettre entendez-vous ?", ["A", "E", "I"], 0, "La lettre A se prononce a, ouverte et brève.", "../audio/theme-1/alphabet/lettre-a.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["C", "G", "J"], 0, "La lettre C se prononce cé.", "../audio/theme-1/alphabet/lettre-c.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["D", "T", "P"], 0, "La lettre D se prononce dé.", "../audio/theme-1/alphabet/lettre-d.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["E", "U", "I"], 0, "La lettre E se prononce eu, sans ajouter de consonne finale.", "../audio/theme-1/alphabet/lettre-e.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["H", "R", "K"], 0, "La lettre H se prononce ache.", "../audio/theme-1/alphabet/lettre-h.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["Q", "K", "U"], 0, "La lettre Q se prononce ku, avec la voyelle française u.", "../audio/theme-1/alphabet/lettre-q.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["R", "L", "N"], 0, "La lettre R se prononce erre, avec le r français.", "../audio/theme-1/alphabet/lettre-r.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["U", "O", "I"], 0, "La lettre U se prononce u, lèvres arrondies.", "../audio/theme-1/alphabet/lettre-u.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["W", "V", "Y"], 0, "La lettre W se prononce double vé.", "../audio/theme-1/alphabet/lettre-w.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quelle lettre entendez-vous ?", ["Y", "I", "X"], 0, "La lettre Y se prononce i grec.", "../audio/theme-1/alphabet/lettre-y.mp3?v=20260624-alphabet-nz-fix"),
      Q("Quel contraste entendez-vous ?", ["tu / tout", "bon / banc", "mais / mes"], 0, "L’exercice oppose [y] dans tu et [u] dans tout.", "../audio/theme-1/son-u-ou.mp3?v=20260626-audio"),
      Q("Quelle épellation correspond à LINA ?", ["L-I-N-A", "R-I-M-A", "L-E-N-E"], 0, "Lina s’épelle L-I-N-A.", "../audio/theme-1/epellation-lina.mp3?v=20260624-alphabet-nz-fix")
    ]),
    "ecoute-nombres-1-20": A("Écoute : nombres de 1 à 20", "Thème 1 · Premiers contacts", "Compréhension orale", "Écoutez chaque nombre, puis choisissez sa forme écrite.", [
      Q("Quel nombre entendez-vous ?", ["sept", "seize", "dix-sept"], 0, "Vous avez entendu sept.", "../audio/theme-1/nombres-shtooka/sept.mp3?v=20260624-shtooka-nombres"),
      Q("Quel nombre entendez-vous ?", ["cinq", "quinze", "seize"], 1, "Vous avez entendu quinze.", "../audio/theme-1/nombres-shtooka/quinze.mp3?v=20260624-shtooka-nombres"),
      Q("Quel nombre entendez-vous ?", ["neuf", "dix-neuf", "onze"], 2, "Vous avez entendu onze.", "../audio/theme-1/nombres-shtooka/onze.mp3?v=20260624-shtooka-nombres"),
      Q("Quel nombre entendez-vous ?", ["deux", "douze", "vingt"], 1, "Vous avez entendu douze.", "../audio/theme-1/nombres-shtooka/douze.mp3?v=20260624-shtooka-nombres"),
      Q("Quel nombre entendez-vous ?", ["deux", "douze", "vingt"], 2, "Vous avez entendu vingt.", "../audio/theme-1/nombres/vingt.mp3?v=20260626-audio")
    ]),
    "nombres-dates": A("Nombres et dates", "Thème 1 · Premiers contacts", "Vocabulaire", "Reliez chiffres, formes écrites et dates simples.", [
      Q("Comment écrit-on 18 ?", ["dix-huit", "dix-sept", "quatre-vingts"], 0, "18 s’écrit dix-huit."),
      Q("Quel nombre correspond à quatre-vingts ?", ["40", "60", "80"], 2, "Quatre fois vingt donne quatre-vingts."),
      Q("Comment dit-on 1er janvier ?", ["un janvier", "premier janvier", "une janvier"], 1, "Pour le premier jour du mois, on emploie premier."),
      Q("Quelle date est correcte ?", ["le vingt-trois juin", "la vingt-trois juin", "au vingt-trois de juin"], 0, "Une date simple se construit avec le + nombre + mois.")
    ]),
    "premiere-rencontre": A("Première rencontre", "Thème 1 · Premiers contacts", "Compréhension orale", "Écoutez le dialogue entre Lina et Thomas et repérez les informations importantes.", [
      Q("Comment s’appelle la première personne ?", ["Lina", "Sofia", "Laura"], 0, "Elle dit : Je m’appelle Lina.", "../audio/theme-1/dialogue-premiere-rencontre.mp3?v=20260626-audio"),
      Q("Comment s’appelle l’homme ?", ["Lucas", "Thomas", "Nicolas"], 1, "Il dit : Moi, c’est Thomas."),
      Q("Quelle est la nationalité de Thomas ?", ["belge", "française", "français"], 2, "Thomas dit : Je suis français."),
      Q("Quelle est la nationalité de Lina ?", ["colombienne", "française", "canadienne"], 0, "Lina dit : Je suis colombienne.")
    ]),
    "articles-definis": A("Les articles définis", "Thème 1 · Premiers contacts", "Grammaire", "Choisissez entre le, la, l’ et les selon le genre, le nombre et le premier son.", [
      Q("___ alphabet français", ["Le", "La", "L’", "Les"], 2, "Alphabet commence par une voyelle : l’alphabet."),
      Q("___ professeur explique.", ["Le", "La", "L’", "Les"], 0, "Professeur est masculin singulier ici."),
      Q("___ nationalité de Lina", ["Le", "La", "L’", "Les"], 1, "Nationalité est féminin singulier."),
      Q("___ étudiants écoutent.", ["Le", "La", "L’", "Les"], 3, "Étudiants est pluriel : les étudiants."),
      Q("J’aime ___ chocolat.", ["le", "la", "l’", "les"], 0, "On emploie le pour une préférence générale avec un nom masculin.")
    ]),
    "conjugaison-er": A("Défi conjugaison -ER", "Thème 3 · Premier groupe", "Grammaire", "Choisissez la bonne terminaison au présent.", [
      Q("Je parl___ français.", ["e", "es", "ons"], 0, "Avec je : radical + e."), Q("Tu regard___ un film.", ["e", "es", "ez"], 1, "Avec tu : radical + es."), Q("Nous habit___ à Bogotá.", ["ent", "ons", "ez"], 1, "Avec nous : radical + ons."), Q("Ils chant___ bien.", ["ent", "es", "ons"], 0, "Avec ils : radical + ent.")
    ]),
    "radical-terminaison": A("Radical + terminaison", "Thème 3 · Premier groupe", "Construction", "Identifiez le radical et construisez la forme correcte.", [
      Q("Quel est le radical de regarder ?", ["regard-", "regarde-", "regarder-"], 0, "On retire -er."), Q("manger avec nous :", ["nous mangons", "nous mangeons", "nous mangent"], 1, "On conserve le son doux avec mangeons."), Q("commencer avec nous :", ["commencons", "commençons", "commenceons"], 1, "La cédille conserve le son /s/."), Q("Quelle formule est correcte ?", ["infinitif + sujet", "radical + terminaison", "nom + adjectif"], 1, "C’est la règle d’or du premier groupe.")
    ]),
    "verbes-er-contexte": A("Verbes -ER en contexte", "Thème 3 · Premier groupe", "Lecture", "Complétez de petites routines au présent.", [
      Q("Le matin, je ___ à sept heures.", ["travaille", "travailles", "travaillons"], 0, "Avec je : travaille."), Q("Nous ___ la musique.", ["aime", "aimez", "aimons"], 2, "Avec nous : aimons."), Q("Vous ___ à Medellín.", ["habitez", "habitons", "habitent"], 0, "Avec vous : habitez."), Q("Elle ___ avec sa sœur.", ["danses", "danse", "dansent"], 1, "Avec elle : danse.")
    ]),
    "verbe-etre": A("Le verbe ÊTRE", "Thème 4 · Verbes essentiels", "Grammaire", "Complétez les phrases avec être au présent.", [Q("Je ___ étudiant.", ["suis", "es", "sommes"], 0, "Je suis."),Q("Vous ___ français ?", ["êtes", "sommes", "sont"], 0, "Vous êtes."),Q("Elles ___ colombiennes.", ["est", "sont", "êtes"], 1, "Elles sont."),Q("Nous ___ en classe.", ["êtes", "sommes", "suis"], 1, "Nous sommes.")]),
    "verbe-avoir": A("Le verbe AVOIR", "Thème 4 · Verbes essentiels", "Grammaire", "Exprimez l’âge et la possession avec avoir.", [Q("J’___ vingt ans.", ["ai", "as", "a"], 0, "J’ai vingt ans."),Q("Tu ___ un frère.", ["a", "as", "avons"], 1, "Tu as."),Q("Nous ___ un cours.", ["avez", "avons", "ont"], 1, "Nous avons."),Q("Ils ___ faim.", ["ont", "avez", "a"], 0, "Ils ont faim.")]),
    "verbe-aller": A("Le verbe ALLER", "Thème 4 · Verbes essentiels", "Grammaire", "Parlez des déplacements et des projets proches.", [Q("Je ___ à l’université.", ["vais", "vas", "va"], 0, "Je vais."),Q("Nous ___ étudier.", ["allez", "allons", "vont"], 1, "Nous allons."),Q("Elle ___ au travail.", ["vais", "va", "vas"], 1, "Elle va."),Q("Vous ___ bien ?", ["allez", "allons", "vont"], 0, "Vous allez bien ?")]),
    "verbe-faire": A("Le verbe FAIRE", "Thème 4 · Verbes essentiels", "Grammaire", "Parlez des actions, des activités et du sport.", [Q("Je ___ du sport.", ["fais", "fait", "font"], 0, "Je fais."),Q("Nous ___ un exercice.", ["faites", "font", "faisons"], 2, "Nous faisons."),Q("Vous ___ quoi ?", ["faites", "faisons", "font"], 0, "Vous faites."),Q("Elle ___ la cuisine.", ["fais", "fait", "faites"], 1, "Elle fait.")]),
    "informations-personnelles": A("Carte d’identité", "Thème 4 · Verbes essentiels", "Communication", "Choisissez la phrase adaptée à chaque information personnelle.", [Q("Pour donner son âge :", ["Je suis vingt ans.", "J’ai vingt ans.", "Je fais vingt ans."], 1, "En français, l’âge se construit avec avoir."),Q("Pour donner sa ville :", ["J’habite à Cali.", "Je suis à Cali ans.", "J’ai Cali."], 0, "J’habite à + ville."),Q("Pour donner sa profession :", ["Je suis ingénieure.", "J’ai ingénieure.", "Je vais ingénieure."], 0, "On emploie être avec une profession."),Q("Pour parler d’une activité :", ["Je fais du yoga.", "Je suis du yoga.", "J’ai du yoga."], 0, "Faire + activité.")]),
    "famille-relations": A("Qui est dans la famille ?", "Thème 5 · Famille", "Vocabulaire", "Lisez la définition et trouvez le membre de la famille.", [Q("Le frère de ma mère est…", ["mon oncle", "mon neveu", "mon cousin"], 0, "C’est votre oncle."),Q("La fille de mon frère est…", ["ma tante", "ma nièce", "ma cousine"], 1, "C’est votre nièce."),Q("Le père de mon père est…", ["mon grand-père", "mon beau-père", "mon oncle"], 0, "C’est votre grand-père."),Q("Les enfants de mes parents sont…", ["mes cousins", "mes frères et sœurs", "mes grands-parents"], 1, "Ce sont vos frères et sœurs.")]),
    "adjectifs-possessifs": A("Adjectifs possessifs", "Thème 5 · Famille", "Grammaire", "Choisissez le possessif qui s’accorde avec le nom.", [Q("C’est ___ sœur. (je)", ["mon", "ma", "mes"], 1, "Sœur est féminin singulier : ma sœur."),Q("Voici ___ amis. (tu)", ["ton", "ta", "tes"], 2, "Amis est pluriel : tes amis."),Q("Elle présente ___ père.", ["son", "sa", "ses"], 0, "Père est masculin singulier : son père."),Q("Nous aimons ___ famille.", ["notre", "nos", "leurs"], 0, "Famille est singulier : notre famille.")]),
    "arbre-familial": A("Arbre familial", "Thème 5 · Famille", "Logique", "Déduisez les relations à partir de phrases simples.", [Q("Marc est le père de Léa. Léa est…", ["sa mère", "sa fille", "sa sœur"], 1, "Léa est la fille de Marc."),Q("Nina est la sœur de Paul. Paul est…", ["son frère", "son père", "son fils"], 0, "Paul est le frère de Nina."),Q("Eva est la mère de la mère de Tom. Eva est…", ["sa tante", "sa grand-mère", "sa cousine"], 1, "Eva est la grand-mère de Tom."),Q("Lina et Marc ont le même oncle. Ils sont probablement…", ["cousins", "parents", "grands-parents"], 0, "Ils peuvent être cousins.")]),
    "ecoute-ma-famille": A("Écoute : ma famille", "Thème 5 · Famille", "Compréhension orale", "Écoutez une courte présentation familiale.", [Q("Combien de frères la personne a-t-elle ?", ["aucun", "un", "deux"], 1, "Elle présente un frère.", "../audio/theme-4/ma-famille.mp3?v=20260626-audio"),Q("Comment s’appelle sa sœur ?", ["Émilie", "Emma", "Ana"], 0, "Sa sœur s’appelle Émilie."),Q("Où habitent ses parents ?", ["à Paris", "à Bogotá", "à Lyon"], 2, "Ils habitent à Lyon."),Q("Quel possessif entendez-vous ?", ["ma", "mes", "leur"], 1, "Elle dit mes parents.")]),
    "accord-adjectifs": A("Accord des adjectifs", "Thème 6 · Description", "Grammaire", "Accordez les adjectifs avec la personne décrite.", [Q("Sofia est petit___.", ["petit", "petite", "petits"], 1, "Sofia est féminin singulier : petite."),Q("Ils sont sportif___.", ["sportive", "sportifs", "sportives"], 1, "Masculin pluriel : sportifs."),Q("Lina et Ana sont créatif___.", ["créatives", "créatifs", "créative"], 0, "Féminin pluriel : créatives."),Q("Paul est heureu___.", ["heureux", "heureuse", "heureuses"], 0, "Masculin singulier : heureux.")]),
    "portrait-guide": A("Constructeur de portrait", "Thème 6 · Description", "Production guidée", "Choisissez les éléments qui forment un portrait naturel.", [Q("Pour parler des cheveux :", ["Elle est les cheveux noirs.", "Elle a les cheveux noirs.", "Elle fait les cheveux noirs."], 1, "On emploie avoir pour les cheveux."),Q("Pour parler de la taille :", ["Il est grand.", "Il a grand.", "Il fait grand."], 0, "On emploie être + adjectif."),Q("Quelle phrase décrit le caractère ?", ["Elle a les yeux verts.", "Elle est généreuse.", "Elle porte des lunettes."], 1, "Généreuse décrit la personnalité."),Q("Quel ordre est naturel ?", ["nom + apparence + caractère", "caractère + date + téléphone", "âge + article + alphabet"], 0, "Un portrait simple progresse de l’identité vers l’apparence et le caractère.")]),
    "qui-est-ce-description": A("Qui est-ce ?", "Thème 6 · Description", "Lecture", "Identifiez une personne grâce à une courte description.", [Q("Je suis grand, j’ai les cheveux courts et je porte des lunettes. Quel détail est un accessoire ?", ["grand", "cheveux courts", "lunettes"], 2, "Les lunettes sont un accessoire."),Q("Elle est petite, sportive et très drôle. Quel adjectif décrit le caractère ?", ["petite", "drôle", "sportive"], 1, "Drôle décrit ici le caractère."),Q("Il a les yeux marron. Que décrit-on ?", ["la taille", "les yeux", "les cheveux"], 1, "La phrase décrit les yeux."),Q("Elle est sérieuse mais sympathique. Combien d’adjectifs ?", ["un", "deux", "trois"], 1, "Sérieuse et sympathique : deux adjectifs.")]),
    "ecoute-portrait": A("Écoute : un portrait", "Thème 6 · Description", "Compréhension orale", "Écoutez un portrait et repérez l’apparence et le caractère.", [Q("Comment s’appelle la personne décrite ?", ["Sofia", "Lina", "Emma"], 0, "Le portrait présente Sofia.", "../audio/theme-5/portrait-sofia.mp3?v=20260626-audio"),Q("Comment sont ses cheveux ?", ["longs et noirs", "courts et blonds", "roux et bouclés"], 0, "Elle a les cheveux longs et noirs."),Q("Quel adjectif décrit son caractère ?", ["grande", "généreuse", "brune"], 1, "Généreuse décrit le caractère."),Q("Que porte-t-elle ?", ["un chapeau", "des lunettes", "une montre"], 1, "Elle porte des lunettes.")])
  };

  function numberToFrench(number) {
    const units = ["zéro","un","deux","trois","quatre","cinq","six","sept","huit","neuf","dix","onze","douze","treize","quatorze","quinze","seize","dix-sept","dix-huit","dix-neuf"];
    if (number < 20) return units[number];
    if (number === 100) return "cent";
    if (number < 70) {
      const tens = {2:"vingt",3:"trente",4:"quarante",5:"cinquante",6:"soixante"};
      const ten = Math.floor(number/10), rest = number%10;
      return tens[ten] + (rest === 0 ? "" : rest === 1 ? " et un" : `-${units[rest]}`);
    }
    if (number < 80) return number === 71 ? "soixante et onze" : `soixante-${units[number - 60]}`;
    if (number === 80) return "quatre-vingts";
    return `quatre-vingt-${units[number-80]}`;
  }

  function randomNumberQuestions() {
    const selected = new Set();
    while (selected.size < 10) selected.add(Math.floor(Math.random()*100)+1);
    return [...selected].map((number) => {
      const candidates = new Set([number]);
      for (const offset of [1,-1,10,-10,2,-2]) {
        const candidate = number + offset;
        if (candidate >= 1 && candidate <= 100) candidates.add(candidate);
        if (candidates.size >= 4) break;
      }
      while (candidates.size < 4) candidates.add(Math.floor(Math.random()*100)+1);
      const values = [...candidates].slice(0,4).sort(() => Math.random()-.5);
      return Q(
        "Quel nombre entendez-vous ?",
        values.map(numberToFrench),
        values.indexOf(number),
        `Vous avez entendu ${numberToFrench(number)} (${number}).`,
        `../audio/theme-1/nombres-1-100/nombre-${String(number).padStart(3,"0")}.mp3?v=20260626-audio`
      );
    });
  }

  window.quizCatalog["ecoute-nombres-1-100"] = A(
    "Écoute aléatoire : nombres de 1 à 100",
    "Thème 1 · Premiers contacts",
    "Compréhension orale",
    "Dix nombres sont tirés au hasard à chaque tentative. Écoutez puis choisissez leur écriture.",
    randomNumberQuestions()
  );
})();
