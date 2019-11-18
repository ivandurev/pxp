# PxP

## Instructions to play
In the game you can create your profile to participate in the leaderboard. You click on play and the game itself is revealed. You get one huge "pixel", your points and a next image button. If you click on the huge colour it gets separated into four smaller ones. If you click on any of them they also get separated into four new. You can hold the mouse and see how you get different parts of the image revealed. When you see an object, easily recognisable (as the sky), you can type the word in the textbox and hit enter. It will give you points if correct. You lose points when you reveal more parts of the picture or try an incorrect word. So, don't bother clicking on the blue pixels on the top of a landscape... If you think you're done with the picture go on to the next one.

## Instructions to run the game

Firstly you will need the correct databased structure. There is the dump of the current database in the files.
There are two `node.js` server files. If you want to just start the game type in:
```
node server.js
```
If you want to add new pictures run:
```
node convserv.js
```
and open `converter.html`. Use the function `convert(imageURL)` to get the tree to be imported in the database.

## Information

The game runs an HTTPS server so a certificate must be provided.
