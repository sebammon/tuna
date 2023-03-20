// Phaser variables
const width = 800;
const height = 600;

let game = new Phaser.Game(width, height, Phaser.CANVAS, 'game',
    {preload: preload, create: create, update: update, render: render});

// Game variables
let player;
let facing = 'right';
let jumpTimer = 0;
let touch1;
let touch2;
let cursors;
let jumpButton;
let background;
let platforms;
let stars;
let starCount = 0;
let starCountText;
let winningText;

// TuningGame variables
let parameterX1Text;
let parameterX1Value;
let parameterX2Text;
let parameterX2Value;
let jumpPowerValue = 0;
let jumpPowerText;
let jumpPowerUpdateText;
let jumpPowerUpdateImage;

function preload() {
    // Load images
    game.load.spritesheet('player', 'assets/player.png', 32, 48);
    game.load.image('background', 'assets/background.png');
    game.load.image('star', 'assets/star.png');
    game.load.image('platform', 'assets/platform.png');
    game.load.image('rocket', 'assets/rocket.png');
}

function create() {
    // Game settings
    if (!Phaser.Device.desktop) {
        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    }
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.time.desiredFps = 30;

    // Background and Control
    background = game.add.tileSprite(0, 0, 800, 600, 'background');
    cursors = game.input.keyboard.createCursorKeys();
    jumpButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    touch1 = game.input.pointer1;
    touch2 = game.input.pointer2;

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

    starCountText = game.add.text(game.world.right - 170, 16, 'Star: 0/3',
        {font: '24px Arial', fill: '#fff'});

    jumpPowerText = game.add.text(16, 16, "Jump power: 0",
        {font: "24px Arial", fill: "#fff"});
    jumpPowerUpdateText = game.add.text(game.world.centerX - 130, height, "none",
        {font: "24px Arial", fill: "#fff"});
    jumpPowerUpdateImage = game.add.button(game.world.centerX - 45, height,
        "rocket", null, this, 2, 1, 0);

    // Update with default parameters
    parameterX1Value = $("input#x1").text();
    parameterX2Value = $("input#x2").text();
    parameterX1Text = game.add.text(16, 52, "Param 1: " + parameterX1Value,
        {font: "24px Arial", fill: "#fff"});
    parameterX2Text = game.add.text(16, 88, "Param 2: " + parameterX2Text,
        {font: "24px Arial", fill: "#fff"});

    // Win text
    winningText = game.add.text(game.world.centerX - 50, game.world.centerY,
        "You win!", {font: "24px Arial", fill: "#fff"});
    winningText.visible = false;

}

function update() {
    // Check collision
    game.physics.arcade.collide(player, platforms);
    game.physics.arcade.collide(stars, platforms);
    game.physics.arcade.overlap(player, stars, collectStar, null, this);

    // Update parameter values
    parameterX1Value = $("input#x1").get(0).value;
    parameterX1Text.text = "Param 1: " + parameterX1Value;

    parameterX2Value = $("input#x2").get(0).value;
    parameterX2Text.text = "Param 2: " + parameterX2Value;

    // Move the player
    player.body.velocity.x = 0;

    const touch1Down = touch1.isDown;
    const touch1X = touch1.worldX;
    const touch1Y = touch1.worldY;

    if (cursors.left.isDown || touch1Down && touch1X < 400 && touch1Y > 250) {
        player.body.velocity.x = -150;

        if (facing != 'left') {
            player.animations.play('left');
            facing = 'left';
        }
    } else if (cursors.right.isDown || touch1Down && touch1X > 400 && touch1Y > 250) {
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

    const touch2Down = touch2.isDown;
    const touch2Y = touch2.worldY;

    const isPointerJumping = touch1Down && touch1Y < 350 || touch2Down && touch2Y < 350

    if ((jumpButton.isDown || isPointerJumping) && player.body.onFloor() && game.time.now > jumpTimer
        || (jumpButton.isDown || isPointerJumping) && player.body.touching.down && game.time.now
        > jumpTimer) {

        if (jumpPowerValue === "none" || jumpPowerValue <= 0) {
            player.body.velocity.y = -150;
        } else if (jumpPowerValue < 70) {
            player.body.velocity.y = -1 * jumpPowerValue - 200;
        } else if (jumpPowerValue < 90) {
            player.body.velocity.y = -2 * jumpPowerValue - 200;
        } else {
            player.body.velocity.y = -3 * jumpPowerValue - 200;
        }

        jumpTimer = game.time.now + 300;
    }
}

// When player touches the start
function collectStar(player, star) {
    star.kill();

    starCount += 1;
    starCountText.text = "Star: " + starCount + "/3";

    // Display win text
    if (starCount == 3) {
        winningText.visible = true;
    }
}

// When user clicks the submit button
function submitButtonOnClick() {
    parameterX1 = parseFloat(parameterX1Value);
    parameterX2 = parseFloat(parameterX2Value);

    jumpPowerText.text = "Jump power: " + "loading...";

    return submitMetric(parameterX1, parameterX2);
}

function submitMetric(parameterX1, parameterX2) {
    return setTimeout(function () {
        jumpPowerValue = getMetric(parameterX1, parameterX2)
        jumpPowerText.text = "Jump power: " + jumpPowerValue;

        jumpPowerUpdateText.x = game.world.centerX - 120;
        jumpPowerUpdateText.y = height;
        jumpPowerUpdateText.text = "New jump power: " + jumpPowerValue + "!";
        jumpPowerUpdateText.alpha = 0;

        jumpPowerUpdateImage.x = game.world.centerX - 45
        jumpPowerUpdateImage.y = height
        jumpPowerUpdateImage.alpha = 0;

        // Display
        const durationTime = 1500;

        game.add.tween(jumpPowerUpdateText).to({y: -32}, durationTime,
            Phaser.Easing.Linear.None, true);
        game.add.tween(jumpPowerUpdateText).to({alpha: 1}, durationTime,
            Phaser.Easing.Linear.None, true);
        game.add.tween(jumpPowerUpdateImage).to({y: -180}, durationTime,
            Phaser.Easing.Linear.None, true);
        game.add.tween(jumpPowerUpdateImage).to({alpha: 1}, durationTime,
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