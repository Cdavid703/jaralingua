# Politique audio Québec - Français Niveau 8

Cette règle s'applique aux compréhensions orales avec bouton `Français québécois`.

## Règle pédagogique

- La version France est la source canonique du contenu.
- La version Québec utilise le même texte, les mêmes informations, les mêmes questions et les mêmes réponses.
- La seule différence autorisée est la voix/l'accent.
- La page doit charger `Français de France` par défaut.

## Voix validées

Ces voix ont été retenues après écoute humaine comme suffisamment québécoises pour le cours :

- Voix 1 : `JaraLingua QC Amelie` - `UJCi4DDncuo0VJDSIegj`
- Voix 2 : `JaraLingua QC Louis` - `j9RedbMRSNQ74PyikQwD`

Si une activité a plus de deux voix, réutiliser ces deux voix en alternance par personnage, sauf décision pédagogique contraire.

## Route technique

Utiliser uniquement :

```powershell
python tools\regenerate_french8_quebec_audio_from_france.py
```

Pour une seule activité :

```powershell
python tools\regenerate_french8_quebec_audio_from_france.py --only 01a
```

Le script :

- reconstruit `french8-listenings-b2-quebec-scripts.md` depuis le script France ;
- reconstruit `french8-theme09-synthese-b2-quebec-script.md` depuis le script France ;
- supprime les questions/transcriptions Québec séparées dans `french8-listening-activity-data.js` ;
- force les pages de compréhension orale à ouvrir France par défaut ;
- génère les MP3 Québec avec les deux voix validées.

## Lot complete 2026-07-08

Activites regenerees avec les voix validees et cache tag `20260708-qc-voices` :

- `07a` Egalite des chances
- `07b` Engagement citoyen
- `07c` Discrimination a l'embauche
- `08a` Parler parisien
- `08b` Francophonie en mouvement
- `08c` Rappeur et langue
- `09a` Precision syntaxique

## Interdiction

Ne pas écrire un script Québec différent pour une compréhension orale standard. Si le contenu doit changer pour des raisons culturelles, il faut créer une autre activité, pas une variante d'accent.
