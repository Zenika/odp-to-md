# odp-to-md

## Description

Conversion de fichiers ODP et ODT en Markdown.


## Installation

Il est possible d'installer en global avec la commande :

```shell
npm install -g
```

L'exécutable `mdconvert` est alors disponible partout.


## Lancement du script

```shell
node mdconvert.js
# OU si installé en global
mdconvert
```

Options :

```
OPTIONS :
    -f FICHIER.odp ou odt
    -d répertoire avec odp (par défaut répertoire courant)
    -o répertoire de sortie (par défaut target)
    -h, --help : aide/usage
    -s, split: 1 fichier par chapitre niveau 1
```


## Détection des images inutilisées

Le script `listUnusedImages.sh` est fournit pour trouver les images inutilisées après la conversion.

Il fonctionne sous Linux, Mac OS ou Windows (via Git Bash, Cygwin, MSys, ...)

- Placer le fichier dans le dossier `ressources` des slides ou/et du cahier de TP.
- Lancer le script, ce qui produira un script `isolateUnusedImages.sh`
- Le script `isolateUnusedImages.sh` déplace les images inutilisés dans un dossier `backup`
- Supprimer le dossier `backup` après avoir vérifié le bon fonctionnement des slides


## Image de type SVM

Pour les ODP ou les ODT, les schémas seront exportés dans leur format d'origine SVM (Star View Model).

Il est possible de les convertir en SVG via des sites comme :
- http://freeconverter.info/online/svm-to-svg
- ...


## Attention

1. La conversion ne gère pas plusieurs niveaux de liste à puces
2. Il faut renuméroter le slide de TP
3. Les blocs de code converti sont générique,il faut leur ajouter un langage si nécessaire
4. Les slides de titre intermédiaire
5. Il y a beaucoup d'images inutiles générées, il faut faire le tri
6. Les noms des images ne sont pas explicites
7. si vous êtes sous Windows il est possible que les slides soient séparées par 4 sauts de ligne au lieu de 3 (correction manuelle obligatoire)
