(function(){
const Q=(q,o,a,e)=>({question:q,options:o,answer:a,explanation:e||"La réponse se trouve dans le document."});
const A=(title,theme,skill,description,questions,extra)=>Object.assign({title,theme,skill,description,questions},extra||{});
const from=(rows)=>rows.map(r=>Q(r[0],r[1],r[2]));
const C={
"premiere-rencontre":A("Première rencontre","Thème 1 · Premiers contacts","Compréhension orale","Écoutez le dialogue complet avec les commandes de vitesse, puis répondez.",from([
["Pourquoi Lina parle-t-elle à Thomas ?",["Ils se rencontrent pour la première fois","Ils commandent un repas","Ils cherchent une adresse"],0],["D’où vient Lina ?",["De Colombie","De Belgique","Du Canada"],0],["Quelle est la nationalité de Thomas ?",["Suisse","Française","Belge"],1],["Quel âge a Lina ?",["Dix-neuf ans","Vingt et un ans","Vingt-quatre ans"],1],["Où Thomas habite-t-il maintenant ?",["À Bogotá","À Paris","À Lyon"],0],["Pourquoi Lina apprend-elle le français ?",["Pour voyager et étudier","Pour devenir médecin","Pour vendre sa voiture"],0],["Que propose Thomas ?",["Prendre un café","Visiter un musée","Téléphoner au professeur"],0],["Quel registre utilisent-ils ?",["Une présentation polie et simple","Une dispute familière","Une annonce officielle"],0]]),{audio:"../audio/theme-1/dialogue-premiere-rencontre.mp3?v=20260626-audio"}),
"ecoute-verbes-er":A("Une journée bien organisée","Thème 3 · Verbes du premier groupe","Compréhension orale","Repérez les actions quotidiennes au présent.",from([
["À quelle heure Camille commence-t-elle ?",["À sept heures","À neuf heures","À midi"],0],["Où travaille-t-elle ?",["Dans une école","Dans un café","Dans un hôpital"],1],["Comment va-t-elle au travail ?",["Elle marche","Elle nage","Elle voyage en train"],0],["Que prépare-t-elle ?",["Des boissons","Des livres","Des vêtements"],0],["Avec qui déjeune-t-elle ?",["Avec Nora","Avec son frère","Seule"],0],["Que fait-elle après le travail ?",["Elle étudie le français","Elle ferme l’école","Elle joue au tennis"],0],["Quel est son loisir du soir ?",["Dessiner","Réparer une voiture","Chanter au théâtre"],0],["Que présente l’audio ?",["Une routine quotidienne","Un voyage exceptionnel","Une cérémonie"],0]]),{audio:"../audio/theme-2/routine-camille.mp3?v=20260626-audio"}),
"ecoute-verbes-essentiels":A("Notre samedi à Lyon","Thème 4 · Être, avoir, aller et faire","Compréhension orale","Distinguez les quatre verbes essentiels dans une sortie.",from([
["Où sont les amis ?",["À Lyon","À Marseille","À Bogotá"],0],["Quel temps fait-il ?",["Il fait beau","Il neige","Il fait très froid"],0],["Où vont-ils d’abord ?",["Au marché","À l’aéroport","À l’université"],0],["Qu’a Nora dans son sac ?",["De l’eau et un appareil photo","Un ordinateur","Des chaussures"],0],["Que font-ils après le déjeuner ?",["Une promenade","Un examen","La cuisine"],0],["Pourquoi Hugo est-il content ?",["Il aime découvrir la ville","Il gagne un concours","Il rentre chez lui"],0],["Quel verbe exprime la possession ?",["avoir","aller","faire"],0],["Quel est le sujet principal ?",["Une journée de loisirs","Une journée de travail","Une maladie"],0]]),{audio:"../audio/theme-3/samedi-lyon.mp3?v=20260626-audio"}),
"ecoute-ma-famille":A("Le déjeuner chez Mamie","Thème 5 · Famille et relations","Compréhension orale","Identifiez les personnes et leurs relations.",from([
["Chez qui la famille déjeune-t-elle ?",["Chez la grand-mère","Chez une collègue","Chez le professeur"],0],["Comment s’appelle la mère ?",["Sophie","Émilie","Nora"],0],["Quel est le métier du père ?",["Infirmier","Professeur","Cuisinier"],1],["Combien de frères Chloé a-t-elle ?",["Un","Deux","Aucun"],0],["Qui apporte le dessert ?",["La tante Émilie","Le cousin Paul","Le grand-père"],0],["Quel âge a Paul ?",["Huit ans","Douze ans","Dix-sept ans"],1],["Pourquoi ce repas est-il important ?",["La famille partage ses nouvelles","Ils vendent la maison","Ils préparent un examen"],0],["Quel possessif convient ?",["ses parents","son parents","leur parent"],0]]),{audio:"../audio/theme-4/ma-famille.mp3?v=20260626-audio"}),
"ecoute-portrait":A("Qui est Sofia ?","Thème 6 · Description et personnalité","Compréhension orale","Écoutez un portrait physique et moral complet.",from([
["Quel âge a Sofia ?",["Vingt-trois ans","Seize ans","Trente ans"],0],["Comment sont ses cheveux ?",["Longs, noirs et bouclés","Courts et blonds","Roux et raides"],0],["De quelle couleur sont ses yeux ?",["Verts","Bleus","Marron"],2],["Que porte-t-elle ?",["Des lunettes rondes","Un uniforme","Un chapeau rouge"],0],["Quel adjectif décrit son caractère ?",["Généreuse","Paresseuse","Impatiente"],0],["Pourquoi ses amis l’apprécient-ils ?",["Elle écoute et aide","Elle parle fort","Elle achète des cadeaux"],0],["Quel est son loisir ?",["La photographie","Le football","La cuisine"],0],["Quelle phrase la résume ?",["Elle est créative et souriante","Elle est froide et solitaire","Elle est sportive professionnelle"],0]]),{audio:"../audio/theme-5/portrait-sofia.mp3?v=20260626-audio"})
};
const readings=[
["lecture-premiers-contacts","Une nouvelle étudiante","Thème 1 · Premiers contacts","Je m’appelle Ana Torres. J’ai vingt ans et je suis colombienne. Aujourd’hui, c’est mon premier jour dans une école de langues à Lyon. Dans la classe, je rencontre Paul, un étudiant français. Nous échangeons nos prénoms, nos nationalités et nos numéros de téléphone. Paul habite près de l’école et connaît bien la ville. Après le cours, il me montre la bibliothèque et la cafétéria. Je suis un peu timide, mais très contente de commencer cette nouvelle expérience.",[["Où Ana étudie-t-elle ?",["À Lyon","À Paris","À Bogotá"],0],["Quelle est sa nationalité ?",["Colombienne","Française","Belge"],0],["Qui rencontre-t-elle ?",["Paul","Thomas","Marc"],0],["Qu’échangent-ils ?",["Leurs informations personnelles","Leurs notes","Des recettes"],0],["Que montre Paul ?",["La bibliothèque et la cafétéria","Une gare","Un appartement"],0],["Comment Ana se sent-elle ?",["Timide mais contente","En colère","Malade"],0]]],
["lecture-present-classe","Dans la classe de français","Thème 2 · Le présent de l’indicatif","Dans la classe, le professeur parle lentement et les étudiants écoutent. Lina pose une question, puis Thomas répond avec une phrase complète. Le groupe répète les verbes au présent : je parle, tu écoutes, nous travaillons. À la fin du cours, chaque étudiant écrit une phrase affirmative, une phrase négative et une question simple. Le professeur corrige les exemples au tableau.",[["Où se passe le texte ?",["Dans une classe de français","Dans une gare","Dans un restaurant"],0],["Que fait le professeur ?",["Il parle lentement","Il chante très vite","Il ferme l’école"],0],["Que fait Lina ?",["Elle pose une question","Elle vend un livre","Elle voyage"],0],["Quelle forme les étudiants répètent-ils ?",["Le présent","Le futur","Le passé composé"],0],["Combien de types de phrases écrivent-ils ?",["Trois","Un","Cinq"],0],["Qui corrige les exemples ?",["Le professeur","Thomas","Lina"],0]]],
["lecture-verbes-er","La routine de Malik","Thème 3 · Verbes du premier groupe","Malik habite à Grenoble avec un ami. Chaque matin, il prépare un café, écoute les informations et marche jusqu’à l’université. Il étudie l’informatique et travaille deux soirs par semaine dans une librairie. À midi, il mange avec ses camarades et ils parlent de leurs projets. Le vendredi, Malik termine tôt. Il rentre chez lui, range sa chambre et cuisine des pâtes. Le week-end, il visite souvent ses parents ou joue au football dans le parc.",[["Où habite Malik ?",["À Grenoble","À Nice","À Lille"],0],["Qu’étudie-t-il ?",["L’informatique","La médecine","La musique"],0],["Où travaille-t-il ?",["Dans une librairie","Dans une banque","Dans un hôtel"],0],["Avec qui mange-t-il ?",["Ses camarades","Ses parents","Son professeur"],0],["Que cuisine-t-il ?",["Des pâtes","Une soupe","Un gâteau"],0],["Que fait-il au parc ?",["Il joue au football","Il lit","Il travaille"],0]]],
["lecture-verbes-essentiels","Une sortie au musée","Thème 4 · Verbes essentiels","Aujourd’hui, Clara et Youssef sont libres. Ils ont deux billets pour le musée des sciences. Le musée est au centre-ville, alors ils vont en métro. Clara a un petit sac et Youssef a son appareil photo. Dans la première salle, ils font une activité sur les planètes. Ensuite, ils vont voir une exposition sur les océans. À midi, ils ont faim et font une pause au café. Ils sont très contents de leur visite et vont revenir avec leurs amis.",[["Combien de billets ont-ils ?",["Deux","Trois","Un"],0],["Comment vont-ils au musée ?",["En métro","À vélo","En taxi"],0],["Qu’a Youssef ?",["Un appareil photo","Un livre","Un ballon"],0],["Sur quoi porte l’activité ?",["Les planètes","La cuisine","Les langues"],0],["Pourquoi font-ils une pause ?",["Ils ont faim","Ils sont perdus","Le musée ferme"],0],["Quel est leur avis ?",["Ils sont contents","Ils sont déçus","Ils sont indifférents"],0]]],
["lecture-famille","La famille de Léa","Thème 5 · Famille","Léa vit avec ses parents et son petit frère Tom. Sa mère, Isabelle, est infirmière et son père, Julien, travaille dans une boulangerie. Tom a neuf ans et adore les animaux. Le dimanche, leurs grands-parents viennent déjeuner. Leur grand-mère raconte des histoires et leur grand-père joue aux cartes avec Tom. Léa téléphone souvent à sa tante Marion, qui habite à Bruxelles. La famille n’est pas toujours réunie, mais chacun partage ses nouvelles dans un groupe de messages.",[["Comment s’appelle le frère ?",["Tom","Julien","Paul"],0],["Quel est le métier de la mère ?",["Infirmière","Boulangère","Professeure"],0],["Quand viennent les grands-parents ?",["Le dimanche","Le lundi","Le vendredi"],0],["Avec qui joue le grand-père ?",["Tom","Léa","Marion"],0],["Où habite Marion ?",["À Bruxelles","À Lyon","À Nantes"],0],["Comment partagent-ils leurs nouvelles ?",["Dans un groupe de messages","À la radio","Dans un journal"],0]]],
["lecture-description","Mon amie Inès","Thème 6 · Description","Inès est mon amie de classe. Elle est de taille moyenne et a les cheveux courts et châtains. Ses yeux sont verts et elle porte parfois des lunettes. Inès est calme, organisée et très curieuse. Elle aime poser des questions et comprendre les choses en détail. Elle dessine très bien et garde toujours un petit carnet dans son sac. Au début, elle semble réservée, mais avec ses amis elle est drôle et généreuse. Nous préparons souvent nos projets ensemble.",[["Comment sont ses cheveux ?",["Courts et châtains","Longs et noirs","Blonds"],0],["De quelle couleur sont ses yeux ?",["Verts","Marron","Bleus"],0],["Que porte-t-elle parfois ?",["Des lunettes","Un chapeau","Un uniforme"],0],["Quel objet garde-t-elle ?",["Un carnet","Un ballon","Une caméra"],0],["Comment est-elle avec ses amis ?",["Drôle et généreuse","Froide","Impatiente"],0],["Que font-elles ensemble ?",["Des projets","La cuisine","Du sport"],0]]]
];
readings.forEach(([k,t,th,text,rows])=>C[k]=A(t,th,"Compréhension écrite","Lisez le texte de moins de 100 mots, puis répondez.",from(rows),{reading:text}));
C["conjugaison-er"]=A("Les verbes du premier groupe en contexte","Thème 3 · Verbes du premier groupe","Grammaire en contexte","Complétez vingt phrases A1 avec la forme correcte du présent.",from([
["Je ___ français tous les soirs.",["étudie","étudies","étudient"],0],["Tu ___ près de l’université.",["habite","habites","habitons"],1],["Lina ___ un café sans sucre.",["commande","commandes","commandez"],0],["Nous ___ au professeur.",["parlons","parlez","parlent"],0],["Vous ___ la radio le matin.",["écoutez","écoutons","écoutent"],0],["Mes amis ___ au football.",["joue","jouez","jouent"],2],["Paul et moi ___ à Lyon.",["habitons","habitez","habitent"],0],["Je ___ le dîner à dix-neuf heures.",["prépare","prépares","préparons"],0],["Tu ___ la bibliothèque à dix-huit heures.",["fermes","ferme","fermez"],0],["Le cours ___ à huit heures.",["commence","commences","commencent"],0],["Nous ___ notre projet vendredi.",["terminons","terminez","terminent"],0],["Vous ___ souvent en France.",["voyagez","voyageons","voyagent"],0],["Elles ___ dans un petit café.",["travaille","travaillez","travaillent"],2],["J’___ la musique française.",["aime","aimes","aimons"],0],["Tu ___ une question utile.",["poses","pose","posent"],0],["Ma sœur ___ avec ses amis.",["danse","danses","dansons"],0],["Nous ___ le vocabulaire ensemble.",["révisons","révisez","révisent"],0],["Vous ___ votre nom sur la fiche.",["notez","notons","notent"],0],["Les étudiants ___ les phrases.",["répète","répétez","répètent"],2],["Je ___ mes parents le dimanche.",["téléphone à","téléphones à","téléphonons à"],0]]));
C["present-indicatif"]=A("Le présent : emplois, négation et questions","Thème 2 · Le présent de l’indicatif","Grammaire fondamentale","Répondez à vingt questions A1 sur les emplois du présent, la négation et l’interrogation.",from([
["Quelle phrase exprime une habitude ?",["Je travaille chaque lundi.","Je vais travailler demain.","J’ai travaillé hier."],0],
["Quelle phrase décrit une action actuelle ?",["Elle parle avec le professeur.","Elle parlera plus tard.","Elle a parlé hier."],0],
["Quelle phrase exprime une vérité générale ?",["Paris est en France.","Paris va en France.","Paris a été demain."],0],
["Choisissez la négation correcte : Je parle espagnol.",["Je ne parle pas espagnol.","Je pas parle espagnol.","Je ne pas parle espagnol."],0],
["Complétez : Il ___ habite pas à Lyon.",["ne","n’","pas"],1],
["Complétez : Nous ne ___ pas le dimanche.",["travaillons","travailler","travaillez"],0],
["Quelle question utilise l’intonation ?",["Tu étudies le français ?","Est-ce que tu étudies le français ?","Étudies-tu le français ?"],0],
["Complétez : ___ tu habites à Bogotá ?",["Est-ce que","Est que","Qu’est-ce"],0],
["Quel mot demande un lieu ?",["Où","Quand","Pourquoi"],0],
["Quel mot demande une raison ?",["Comment","Pourquoi","Combien"],1],
["Choisissez la question correcte.",["Où est-ce que vous habitez ?","Où vous est-ce que habitez ?","Est-ce où vous habitez ?"],0],
["Transformez : Elle aime le café.",["Elle n’aime pas le café.","Elle ne pas aime le café.","Elle n’pas aime le café."],0],
["Quelle forme est la plus simple à l’oral A1 ?",["Vous habitez ici ?","Habitez-vous ici ?","Ici habitez-vous donc ?"],0],
["Complétez : ___ est ta nationalité ?",["Quel","Quelle","Quels"],1],
["Quelle phrase est affirmative ?",["Je ne suis pas étudiant.","Je suis étudiant.","Est-ce que je suis étudiant ?"],1],
["Quelle phrase est négative ?",["Nous avons un cours.","Avons-nous un cours ?","Nous n’avons pas de cours."],2],
["Choisissez l’ordre correct d’une négation.",["sujet + ne + verbe + pas","sujet + pas + ne + verbe","ne + pas + sujet + verbe"],0],
["Complétez : Quand ___ le cours ?",["commence","commencent","commencer"],0],
["Quelle question demande l’identité ?",["Comment tu t’appelles ?","Où tu habites ?","Quand tu travailles ?"],0],
["Quelle phrase convient à une routine ?",["Le matin, je prépare un café.","Demain, je vais préparer un café.","Hier, j’ai préparé un café."],0]
]));
C["negation-present"]=A("La négation au présent","Thème 2 · Le présent de l’indicatif","Grammaire","Transformez des phrases simples avec ne/n’ + verbe + pas.",from([
["Transformez : Je parle français.",["Je ne parle pas français.","Je parle ne pas français.","Je pas parle français."],0],
["Transformez : Tu écoutes la radio.",["Tu n’écoutes pas la radio.","Tu ne pas écoutes la radio.","Tu écoutes pas ne la radio."],0],
["Transformez : Il habite à Lyon.",["Il n’habite pas à Lyon.","Il ne habite pas à Lyon.","Il habite ne pas à Lyon."],0],
["Transformez : Nous travaillons aujourd’hui.",["Nous ne travaillons pas aujourd’hui.","Nous pas travaillons aujourd’hui.","Nous ne travailler pas aujourd’hui."],0],
["Transformez : Vous avez un stylo.",["Vous n’avez pas de stylo.","Vous ne avez pas un stylo.","Vous pas avez de stylo."],0],
["Transformez : Elles sont étudiantes.",["Elles ne sont pas étudiantes.","Elles ne pas sont étudiantes.","Elles sont ne pas étudiantes."],0],
["Complétez : Je ___ comprends pas.",["ne","n’","pas"],0],
["Complétez : Elle ___ aime pas le café.",["n’","ne","pas"],0],
["Quelle phrase est correcte ?",["Je n’ai pas de livre.","Je ne ai pas un livre.","Je pas ai de livre."],0],
["Quelle phrase garde le verbe conjugué ?",["Nous ne parlons pas.","Nous ne parler pas.","Nous pas parlons ne."],0],
["Choisissez la négation de : C’est facile.",["Ce n’est pas facile.","Ce ne est pas facile.","C’est ne pas facile."],0],
["Quelle phrase est négative ?",["Tu ne regardes pas la vidéo.","Tu regardes la vidéo.","Regardes-tu la vidéo ?"],0]
]));
C["questions-present"]=A("Questions simples au présent","Thème 2 · Le présent de l’indicatif","Interaction","Reconnaissez les questions par intonation, est-ce que et mots interrogatifs.",from([
["Quelle question utilise l’intonation ?",["Tu habites ici ?","Est-ce que tu habites ici ?","Habites-tu ici ?"],0],
["Complétez : ___ tu travailles aujourd’hui ?",["Est-ce que","Est que","Qu’est-ce"],0],
["Quel mot demande un lieu ?",["Où","Quand","Qui"],0],
["Quel mot demande une personne ?",["Qui","Pourquoi","Combien"],0],
["Quel mot demande une manière ?",["Comment","Où","Quand"],0],
["Choisissez la question correcte.",["Où est-ce que vous habitez ?","Où vous est-ce que habitez ?","Est-ce où vous habitez ?"],0],
["Quelle question demande l’âge ?",["Quel âge as-tu ?","Quelle ville habites-tu ?","Comment tu t’appelles ?"],0],
["Quelle question demande la nationalité ?",["Quelle est ta nationalité ?","Quel est ton numéro ?","Quand est le cours ?"],0],
["Transformez : Tu parles français.",["Tu parles français ?","Tu français parles ?","Parles français tu ?"],0],
["Complétez : ___ commence le cours ?",["Quand","Qui","Combien"],0],
["Quelle question est polie et simple ?",["Est-ce que vous comprenez ?","Comprenez-vous donc parfaitement ceci ?","Vous comprendre ?"],0],
["Quelle question demande une raison ?",["Pourquoi tu étudies le français ?","Où tu étudies le français ?","Qui étudie le français ?"],0]
]));
C["production-routine-present"]=A("Ma routine au présent","Thème 2 · Le présent de l’indicatif","Production guidée","Choisissez les blocs qui construisent une mini-présentation au présent.",from([
["Pour commencer une routine, choisissez :",["Le matin, je prépare un café.","Hier, je prépare un café.","Demain, j’ai préparé un café."],0],
["Pour parler d’une habitude, choisissez :",["Je travaille chaque lundi.","Je vais travailler hier.","Je travaille demain passé."],0],
["Pour ajouter une phrase négative, choisissez :",["Je ne regarde pas la télévision.","Je regarde ne pas la télévision.","Je pas regarde la télévision."],0],
["Pour poser une question à un camarade, choisissez :",["Tu étudies le soir ?","Tu étudié le soir ?","Étudier tu le soir ?"],0],
["Pour donner une information actuelle, choisissez :",["Aujourd’hui, je suis en classe.","Hier, je suis demain.","Demain, j’étais maintenant."],0],
["Pour parler d’un lieu, choisissez :",["J’habite à Bogotá.","Je suis Bogotá ans.","J’ai à Bogotá."],0],
["Pour dire ce que vous ne faites pas, choisissez :",["Je ne travaille pas le dimanche.","Je travaille pas ne le dimanche.","Je ne travailler pas dimanche."],0],
["Pour demander un lieu, choisissez :",["Où est-ce que tu habites ?","Quand est-ce que tu habites ?","Pourquoi est-ce que tu t’appelles ?"],0],
["Pour fermer une présentation, choisissez :",["Et vous, quelle est votre routine ?","Hier routine fini passé.","Je suis routine."],0],
["Quelle mini-présentation est cohérente ?",["Je m’appelle Lina. J’étudie le français. Je n’habite pas à Paris.","Je m’appelle Lina. J’ai français demain. Je ne Paris.","Je suis Lina ans. Je pas étudie. Paris."],0]
]));

// Répartit les bonnes réponses entre A, B et C selon une séquence propre à
// chaque activité, sans modifier la réponse linguistique correcte.
Object.assign(C["premiere-rencontre"], {
  transcript: "Thomas : Bonjour, je m’appelle Thomas. Et vous ?\n\nLina : Bonjour, je m’appelle Lina. Enchantée.\n\nThomas : Enchanté, Lina. Vous venez d’où ?\n\nLina : Je viens de Colombie. Et vous, vous êtes français ?\n\nThomas : Oui, je suis français, mais j’habite maintenant à Bogotá.\n\nLina : Très bien ! Moi, j’ai vingt et un ans et j’apprends le français pour voyager et étudier.\n\nThomas : C’est un beau projet. Après le cours, vous voulez prendre un café ?\n\nLina : Oui, avec plaisir. Merci, Thomas."
});
Object.assign(C["ecoute-verbes-er"], {
  transcript: "Camille commence sa journée à sept heures. Elle prépare un café, écoute les informations et marche jusqu’au petit café où elle travaille. Le matin, elle prépare des boissons et parle avec les clients. À midi, elle déjeune avec Nora. Après le travail, Camille étudie le français pendant une heure. Le soir, elle dessine dans son carnet et prépare son sac pour le lendemain. Sa routine est simple, mais très organisée."
});
Object.assign(C["ecoute-verbes-essentiels"], {
  transcript: "Aujourd’hui, Nora et Hugo sont à Lyon. Il fait beau et ils vont d’abord au marché. Nora a de l’eau et un appareil photo dans son sac. Hugo est content parce qu’il aime découvrir la ville. Après le déjeuner, ils font une promenade près de la rivière. Ils sont un peu fatigués, mais ils ont encore envie de visiter un quartier ancien. Cette journée leur permet de pratiquer être, avoir, aller et faire en contexte."
});
Object.assign(C["ecoute-ma-famille"], {
  transcript: "Le dimanche, Chloé déjeune chez sa grand-mère. Sa mère s’appelle Sophie et son père est professeur. Chloé a un frère et beaucoup de cousins. Aujourd’hui, la tante Émilie apporte le dessert. Le cousin Paul a douze ans et raconte ses nouvelles à toute la famille. Ce repas est important parce que chacun parle de sa semaine, de ses projets et de ses activités. Chloé aime ces moments simples avec ses proches."
});
Object.assign(C["ecoute-portrait"], {
  transcript: "Sofia a vingt-trois ans. Elle a les cheveux longs, noirs et bouclés. Ses yeux sont marron et elle porte souvent des lunettes rondes. Sofia est généreuse, créative et souriante. Ses amis l’apprécient parce qu’elle écoute les autres et aide quand quelqu’un a un problème. Elle aime la photographie et prend souvent des photos dans la rue. Pour ses camarades, Sofia est une personne calme, attentive et très agréable."
});

const answerLayouts={
  "premiere-rencontre":[1,2,0,1,2,0,2,1],
  "ecoute-verbes-er":[2,0,1,2,1,0,2,1],
  "ecoute-verbes-essentiels":[1,0,2,1,0,2,1,2],
  "ecoute-ma-famille":[2,1,0,2,1,0,2,1],
  "ecoute-portrait":[0,2,1,0,2,1,2,0],
  "lecture-premiers-contacts":[1,2,0,2,1,0],
  "lecture-present-classe":[2,1,0,2,1,0],
  "lecture-verbes-er":[2,0,1,0,2,1],
  "lecture-verbes-essentiels":[0,2,1,2,0,1],
  "lecture-famille":[2,1,0,1,2,0],
  "lecture-description":[1,0,2,1,0,2],
  "conjugaison-er":[1,2,0,2,1,0,1,2,0,1,2,0,2,1,0,2,0,1,2,1],
  "present-indicatif":[1,2,0,2,1,0,1,2,0,1,2,0,2,1,0,2,0,1,2,1],
  "negation-present":[2,0,1,2,1,0,2,1,0,2,1,0],
  "questions-present":[1,0,2,1,2,0,1,0,2,1,2,0],
  "production-routine-present":[0,2,1,0,2,1,0,2,1,0]
};
Object.entries(answerLayouts).forEach(([activityId,layout])=>{
  C[activityId].questions.forEach((question,index)=>{
    const correct=question.options[question.answer];
    const distractors=question.options.filter((_,optionIndex)=>optionIndex!==question.answer);
    const target=layout[index%layout.length];
    const ordered=[];
    let distractorIndex=0;
    for(let position=0;position<question.options.length;position+=1){
      ordered.push(position===target?correct:distractors[distractorIndex++]);
    }
    question.options=ordered;
    question.answer=target;
  });
});
window.french1ExpandedActivities=C; if(window.quizCatalog)Object.assign(window.quizCatalog,C);
})();
