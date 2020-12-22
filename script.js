window.onload = function() //evenement Declaration d'une fonction -> lorsque la fenetre se charge elle execute la fonction (getsionnaire d'event)
{
  var canvasWidth = 900;
  var canvasHeight = 600;
  var blockSize = 30; //nombre de pixels
  var ctx;
  var delay = 100;
  var snaky;
  var apply;
  var widthInBlocks = canvasWidth / blockSize;
  var heightInBlock = canvasHeight / blockSize;
  var timeOut;

  init();

  function init() {
    var canvas = document.createElement("canvas"); //creation d'un canvas
    canvas.width = canvasWidth; //taille ou largeur
    canvas.height = canvasHeight; // la hauteur
    canvas.style.border = "30px solid gray"; //le style de la bordure
    canvas.style.margin = "50 px auto";
    canvas.style.display = "block";
    canvas.style.backgroundColor = "#ddd"; //l'arriere plan du canvas
    document.body.appendChild(canvas); //envoyer les informations au body du html
    ctx = canvas.getContext("2d"); //declaration d'un contexte dans le canvas
    snaky = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
    apply = new Apple([10, 10]);
    score = 0;
    refreshCanvas();
  }

  function refreshCanvas() {
    snaky.advance();
    if (snaky.checkCollision()) {
      gameOver();
    } else {
      if (snaky.isEatingApple(apply)) {
        score++;
        snaky.ateApple = true;
        do {
          apply.setNewPosition();
        } while (apply.OnSnake(snaky)); //tant que la pomme se trouvera sur le snaky il va sans cesse donner une nouvelle position
      }
      ctx.clearRect(0, 0, canvasWidth, canvasHeight); //cela permet de clear tout le canvas à letat initial
      drawScore();
      snaky.draw();
      apply.draw();
      timeOut = setTimeout(refreshCanvas, delay); // permet d'executer la fonction tous les x secondes
    }
  }

  function gameOver() {
    ctx.save();
    ctx.font = "bold 70px sans-serif"; //taille de la police
    ctx.fillStyle = "#000"; //couleur du text
    ctx.textAlign = "center"; //le point du bas du 0
    ctx.textBaseLine = "middle"; // le millieu du ZERO
    ctx.strokeStyle = "white";
    ctx.lineWidth = 5;
    var centreX = canvasWidth / 2;
    var centreY = canvasHeight / 2;
    ctx.strokeText("Game Over Gros Nul", centreX, centreY - 180); //le contour
    ctx.fillText("Game Over Gros Nul", centreX, centreY - 180);
    ctx.font = "bold 30px sans-serif";
    ctx.strokeText("Replay on Space", centreX, centreY - 120);
    ctx.fillText("Replay on Space", centreX, centreY - 120);
    ctx.restore();
  }

  function restart() {
    snaky = new Snake([[6, 4], [5, 4], [4, 4], [3, 4], [2, 4]], "right");
    apply = new Apple([10, 10]);
    score = 0;
    clearTimeout(timeOut); // permet d'eviter le bug de croisance de vitesse
    refreshCanvas();
  }

  function drawScore() {
    ctx.save();
    ctx.font = "bold 200px sans-serif"; //taille de la police
    ctx.fillStyle = "gray"; //couleur de la police
    ctx.textAlign = "center"; //le point du bas du 0
    ctx.textBaseLine = "middle"; // le millieu du ZERO
    var centreX = canvasWidth / 2;
    var centreY = canvasHeight / 2;
    ctx.fillText(score.toString(), centreX, centreY);
    ctx.restore();
  }

  // recupere les coordonées d'un block
  function drawBlock(ctx, position) {
    var x = position[0] * blockSize;
    var y = position[1] * blockSize;
    ctx.fillRect(x, y, blockSize, blockSize);
  }

  function Snake(body, direction) {
    this.body = body;
    this.ateApple = false;
    this.direction = direction;
    this.draw = function() {
      ctx.save(); // sauvegarde du contenu
      ctx.fillStyle = "#ff0000";
      for (var i = 0; i < this.body.length; i++) {
        drawBlock(ctx, this.body[i]);
      }
      ctx.restore();
    };
    this.advance = function() // faire avancer
    {
      var nextPosition = this.body[0].slice(); // creer un nouvel elemnt en format copié
      switch (this.direction) {
        case "left":
          nextPosition[0] -= 1;
          break;
        case "right":
          nextPosition[0] += 1;
          break;
        case "down":
          nextPosition[1] += 1;
          break;
        case "up":
          nextPosition[1] -= 1;
          break;
        default:
          throw "Invalid Direction";
      }
      this.body.unshift(nextPosition); //rajoute un element au Array
      if (!this.ateApple) this.body.pop();
      // supprime un element d'un Array
      else this.ateApple = false;
    };

    this.setDirection = function(
      newDirection //controller la direction
    ) {
      var allowedDirection;
      switch (this.direction) {
        case "left":
        case "right":
          allowedDirection = ["up", "down"];
          break;
        case "down":
        case "up":
          allowedDirection = ["left", "right"];
          break;
        default:
          throw "Invalid Direction";
      }
      if (allowedDirection.indexOf(newDirection) > -1) {
        //tableau allowedDirection [0,1]
        this.direction = newDirection; //definit une nouvelle direction
      }
    };

    this.checkCollision = function() {
      var wallCollision = false;
      var snakeCollision = false;
      var head = this.body[0];
      var rest = this.body.slice(1); //entre parentheses cest lindex du debut
      var snakeX = head[0];
      var snakeY = head[1];
      var minX = 0;
      var minY = 0;
      var maxX = widthInBlocks - 1;
      var maxY = heightInBlock - 1;
      var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
      var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;

      if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
        wallCollision = true;
      }

      for (var i = 0; i < rest.length; i++) {
        if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
          snakeCollision = true;
        }
      }

      return wallCollision || snakeCollision;
    };

    this.isEatingApple = function(appleToEat) {
      var head = this.body[0]; //declaration de la tete
      if (
        head[0] === appleToEat.position[0] &&
        head[1] === appleToEat.position[1]
      )
        //verification si x de la tete au x de la pomme
        return true;
      else return false;
    };
  }

  function Apple(position) {
    this.position = position;
    this.draw = function() {
      ctx.save();
      ctx.fillStyle = "#33CC33";
      ctx.beginPath();
      var radius = blockSize / 2;
      var x = this.position[0] * blockSize + radius;
      var y = this.position[1] * blockSize + radius;
      ctx.arc(x, y, radius, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.restore();
    };

    this.setNewPosition = function() {
      var newX = Math.round(Math.random() * (widthInBlocks - 1)); //donne un nombre aleatoire entre 0-29 et arrondi
      var newY = Math.round(Math.random() * (heightInBlock - 1));
      this.position = [newX, newY];
    };

    this.OnSnake = function(snake) {
      var OnSnake = false;

      for (var i = 0; i < snake.body.length; i++) {
        if (
          this.position[0] === snake.body[i][0] ||
          this.position[1] === snake.body[i][1]
        ) {
          OnSnake = true;
        }
      }
      return OnSnake;
    };
  }

  //chaque touche appuyer cree un evenement
  document.onkeydown = function handleKeyDown(
    e //evenement qui est attaché aux evenement
  ) {
    var key = e.keyCode;
    var newDirection;
    switch (key) {
      case 37:
        newDirection = "left";
        break;
      case 38:
        newDirection = "up";
        break;
      case 39:
        newDirection = "right";
        break;
      case 40:
        newDirection = "down";
        break;
      case 32:
        restart();
        return;
      default:
        return;
    }
    snaky.setDirection(newDirection);
  };
};
