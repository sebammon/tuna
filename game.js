// Phaser variables
let width = 800;
let height = 600;

let game = new Phaser.Game(width, height, Phaser.CANVAS, 'game',
    {preload: preload, create: create, update: update, render: render});

// Game variables
let player;
let facing = 'right';
let jumpTimer = 0;
let touch;
let cursors;
let jumpButton;
let background;
let platforms;
let stars;
let starNumber = 0;
let starNumberText;
let winText;

// TuningGame variables
let parameterX1Text;
let parameterX1Value;
let parameterX2Text;
let parameterX2Value;
let metricsValue = "none";
let metricsText;
let metricsUpdateText;
let metricsUpdateImage;
let submitButton;

function preload() {
    // Load images
    game.load.spritesheet('player', 'assets/player.png', 32, 48);
    game.load.image('background', 'assets/background.png');
    game.load.image("submitButton", "assets/submit_button.png");
    game.load.image('star', 'assets/star.png');
    game.load.image('platform', 'assets/platform.png');
    game.load.image('rocket', 'assets/rocket.png');
}

function create() {
    // Game settings
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.time.desiredFps = 30;

    // Background and Control
    background = game.add.tileSprite(0, 0, 800, 600, 'background');
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    touch = game.input.pointer1;

    // Create player
    player = game.add.sprite(32, 32, 'player');
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.bounce.y = 0.2;
    player.body.collideWorldBounds = true;
    player.body.setSize(20, 32, 5, 16);
    player.body.gravity.y = 350;
    player.animations.add('left', [0, 1, 2, 3], 10, true);
    player.animations.add('turn', [4], 20, true);
    player.animations.add('right', [5, 6, 7, 8], 10, true);

    // Create platforms
    platforms = game.add.group();
    platforms.enableBody = true;

    // Platform image is 400 * 32
    let platform1 = platforms.create(400, 500, 'platform');
    platform1.body.immovable = true;

    let platform2 = platforms.create(-150, 450, 'platform');
    platform2.body.immovable = true;

    let platform3 = platforms.create(450, 300, 'platform');
    platform3.body.immovable = true;

    // Create stars
    stars = game.add.group();
    stars.enableBody = true;
    for (let i = 0; i < 3; i++) {
        let x = (3 - i) * 100 + Math.random() * 150;
        let y = i * 100 + Math.random() * 150;
        let star = stars.create(x, y, 'star');
        star.body.bounce.y = 0.7 + Math.random() * 10.2;
        star.body.bounce.x = 0.7 + Math.random() * 10.2;
    }

    starNumberText = game.add.text(game.world.right - 170, 16, 'Star: 0/3',
        {font: '24px Arial', fill: '#fff'});

    // TuningGame texts
    submitButton = game.add.button(game.world.right - 170, 550,
        "submitButton", submitButtonOnClick, this, 2, 1, 0);
    metricsText = game.add.text(16, 16, "Metrics: none",
        {font: "24px Arial", fill: "#fff"});
    metricsUpdateText = game.add.text(game.world.centerX - 130, height, "none",
        {font: "24px Arial", fill: "#fff"});
    metricsUpdateImage = game.add.button(game.world.centerX - 45, height,
        "rocket", null, this, 2, 1, 0);

    // Update with default parameters
    parameterX1Value = $("input#x1").text();
    parameterX2Value = $("input#x2").text();
    parameterX1Text = game.add.text(16, 64, "x1: " + parameterX1Value,
        {font: "24px Arial", fill: "#fff"});
    parameterX2Text = game.add.text(16, 112, "x2: " + parameterX2Text,
        {font: "24px Arial", fill: "#fff"});

    // Win text
    winText = game.add.text(game.world.centerX - 50, game.world.centerY,
        "You win!", {font: "24px Arial", fill: "#fff"});
    winText.visible = false;

}

function update() {
    // Check collision
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    // Update parameter values
    parameterX1Value = $("input#x1").get(0).value;
    parameterX1Text.text = "x1: " + parameterX1Value;

    parameterX2Value = $("input#x2").get(0).value;
    parameterX2Text.text = "x2: " + parameterX2Value;

    // Move the player
    player.body.velocity.x = 0;

    const pointerIsDown = touch.isDown;

    if (cursors.left.isDown || pointerIsDown && touch.screenX < 400 && touch.screenY > 250) {
        player.body.velocity.x = -150;

        if (facing != 'left') {
            player.animations.play('left');
            facing = 'left';
        }
    } else if (cursors.right.isDown || pointerIsDown && touch.screenX > 400 && touch.screenY > 250) {
        player.body.velocity.x = 150;

        if (facing != 'right') {
            player.animations.play('right');
            facing = 'right';
        }
    } else {
        if (facing != 'idle') {
            player.animations.stop();

            if (facing == 'left') {
                player.frame = 0;
            } else {
                player.frame = 5;
            }

            facing = 'idle';
        }
    }

    const isPointerJumping = pointerIsDown && touch.screenY < 350;

    if ((jumpButton.isDown || isPointerJumping) && player.body.onFloor() && game.time.now > jumpTimer
        || (jumpButton.isDown || isPointerJumping) && player.body.touching.down && game.time.now
        > jumpTimer) {

        if (metricsValue == "none" || metricsValue < 0) {
            player.body.velocity.y = -200;
        } else if (metricsValue < 80) {
            player.body.velocity.y = -1 * metricsValue - 200;
        } else if (metricsValue < 90) {
            player.body.velocity.y = -2 * metricsValue - 200;
        } else {
            player.body.velocity.y = -3 * metricsValue - 200;
        }

        jumpTimer = game.time.now + 300;
    }
}

// When player touches the start
function collectStar(player, star) {
    star.kill();

    starNumber += 1;
    starNumberText.text = "Star: " + starNumber + "/3";

    // Display win text
    if (starNumber == 3) {
        winText.visible = true;
    }
}

// When user clicks the submit button
function submitButtonOnClick() {
    parameterX1 = parseFloat(parameterX1Value);
    parameterX2 = parseFloat(parameterX2Value);

    metricsText.text = "Metrics: " + "loading...";

    return submitMetric(parameterX1, parameterX2);
}

function submitMetric(parameterX1, parameterX2) {
    return setTimeout(function () {
        metricsValue = getMetric(parameterX1, parameterX2)
        metricsText.text = "Metrics: " + metricsValue;

        metricsUpdateText.x = game.world.centerX - 75;
        metricsUpdateText.y = height;
        metricsUpdateText.text = "New metrics: " + metricsValue + "!";
        metricsUpdateText.alpha = 0;

        metricsUpdateImage.x = game.world.centerX - 45
        metricsUpdateImage.y = height
        metricsUpdateImage.alpha = 0;

        // Display
        game.add.tween(metricsUpdateText).to({y: -32}, 2000,
            Phaser.Easing.Linear.None, true);
        game.add.tween(metricsUpdateText).to({alpha: 1}, 2000,
            Phaser.Easing.Linear.None, true);
        game.add.tween(metricsUpdateImage).to({y: -180}, 2000,
            Phaser.Easing.Linear.None, true);
        game.add.tween(metricsUpdateImage).to({alpha: 1}, 2000,
            Phaser.Easing.Linear.None, true);
    }, 500)
}

function getMetric(x1, x2) {
    // Max is 100 @ x1 = -4, x2 = 6
    return -2 * (x1 + 4) ** 2 - (x2 - 6) ** 2 + 100
}

function render() {
    // game.debug.pointer(game.input.pointer1);
}