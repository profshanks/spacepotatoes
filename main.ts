enum SpriteKindLegacy {
    Player,
    Projectile,
    Food,
    Enemy,
    MedAsteroid,
    SmallAsteroid,
    BigAsteroid,
    BigSpaceship,
    SmallSpaceship,
    SpaceshipShot
}
function ChangeScores() {
    if (attractMode == 0) {
        info.changeScoreBy(scoreDelta)
        if (info.score() >= nextLife) {
            music.powerUp.play()
            info.changeLifeBy(1)
            nextLife += newLifeScore
        }
    }
}
controller.A.onEvent(ControllerButtonEvent.Pressed, function () {
    if (attractMode == 0) {
        if (sprites.allOfKind(SpriteKindLegacy.Projectile).length < simultaneousShots) {
            Shoot()
        }
    } else {
        StartGame()
    }
})
function RelocateSprite() {
    relocateThreshold = testSprite.width / 2
    if (testSprite.x > scene.screenWidth() + relocateThreshold) {
        testSprite.x = 0 - relocateThreshold
    }
    if (testSprite.x < 0 - relocateThreshold) {
        testSprite.x = scene.screenWidth() + relocateThreshold
    }
    if (testSprite.y > scene.screenHeight() + relocateThreshold) {
        testSprite.y = 0 - relocateThreshold
    }
    if (testSprite.y < 0 - relocateThreshold) {
        testSprite.y = scene.screenHeight() + relocateThreshold
    }
}
function InitPlayer() {
    // Decrease in velocity of player during each game
    // update.
    velocityChange = 1
    info.setScore(0)
    info.setLife(3)
    // Score interval when players earn additional lives.
    newLifeScore = 10000
    nextLife = newLifeScore
    // Lifetime of shots in milliseconds
    shotLifetime = 3000
    shotVelocity = 100
    rotateAmount = 10
    // Safe distance between player's center and enemy's
    // edge when generating asteroids and when restoring
    // player.
    safeRadius = 12
    // 1 = Player is destroyed and needs to be restored
    playerDestroyed = 1
    // Delay in milliseconds between time player destroyed
    // and time player restored.
    playerRestoreDelay = 2500
    inHyperspace = 0
    // Time in seconds that user is in hyperspace.
    hyperspaceTime = 3
    simultaneousShots = 4
    // Acceleration when thrusters activated
    thrust = 100
    ResetPlayer()
}
function InitSpaceships() {
    // Interval of time in seconds between spaceship
    // spawns.
    initSpaceshipDelay = 120
    // Minimum interval in seconds between spaceship
    // spawns.
    minSpaceshipDelay = 10
    // After specified delay, chance that spaceship will
    // spawn.
    initSpaceshipChance = 2
    maxSpaceshipChance = 50
    smallSpaceshipSpeed = 25
    smallSpaceshipSpeed = 50
    spaceshipExists = 0
    bigSpaceshipValue = 50
    smallSpaceshipValue = 100
    bigSpaceshipSpeed = 25
    smallSpaceshipSpeed = 50
    shipShotVelocity = 100
    // Maximum number of spaceship shots on the screen at
    // one time.
    maxSpaceshipShots = 1
    // Degrees +/- within which small ships will fire at
    // player.
    smallShipInitAccuracy = 90
    // Accuracy spread is cut in half in ResetLevel.
    smallShipAccuracy = smallShipInitAccuracy * 2
    // Don't let the small spaceship be perfect. :-)
    smallShipMinAccuracy = 10
    // % chance that spaceship will shot when on screen.
    spaceshipShootChance = 10
    spaceshipIndicator = sprites.create(img`
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
    `, SpriteKindLegacy.Food)
    spaceshipIndicator.setPosition(4, scene.screenHeight() - 4)
    spaceshipIndicator.setFlag(SpriteFlag.Ghost, true)
}
function InitLevel() {
    startAsteroids = 3
    bigAsteroidValue = 20
    medAsteroidValue = 50
    smallAsteroidValue = 100
    asteroidSpeed = 10
    asteroidMinSpeed = 3
    // Spaceship delay is cut in half in resetLevel. Also
    // convert to milliseconds.
    spaceshipDelay = initSpaceshipDelay * 2000
    // Spaceship chance is doubled in resetLevel.
    spaceshipChance = initSpaceshipChance / 2
    numStars = 40
    ResetLevel()
}
function ResetLevel() {
    CreateStarfield()
    for (let index = 0; index <= startAsteroids - 1; index++) {
        asteroid = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
        `, SpriteKindLegacy.BigAsteroid)
        asteroidStyle = Math.randomRange(1, 3)
        if (asteroidStyle == 1) {
            asteroid.setImage(img`
                . . . 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 . . . . . . .
                . . . . 1 f f f f f f f f f f f f f f f f f f f f 1 . . . . . .
                . . . . . 1 f f f f f f f f f f f f f f f f f f f f 1 . . . . .
                . . . . . . 1 f f f f f f f f f f f f f f f f f f f f 1 . . . .
                . . . . . . . 1 f f f f f f f f f f f f f f f f f f f f 1 . . .
                . . . 1 . . . . 1 f f f f f f f f f f f f f f f f f f f f 1 . .
                . . . 1 1 1 . . . 1 f f f f f f f f f f f f f f f f f f f f 1 .
                . . . 1 f f 1 1 . . 1 f f f f f f f f f f f f f f f f f f f f 1
                . . 1 f f f f f 1 1 f f f f f f f f f f f f f f f f f f f f f 1
                . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . 1 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . . . 1 1 f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . . . . . 1 1 f f f f f f f f f f f f f f f f f f f f f f f f 1
                . . . . . . . 1 1 f f f f f f f f f f f f f f f f f f f f f f 1
                . . . . . . . . . 1 1 f f f f f f f f f f f f f f f f f f f f 1
                . . . . . . . . . . . 1 1 f f f f f f f f f f f f f f f f f f 1
                . . . . . . . . . . . . . 1 f f f f f f f f f f f f f f f f f 1
                . . . . . . . . . . 1 1 1 f f f f f f f f f f f f f f f f f f 1
                . . . . . . . 1 1 1 f f f f f f f f f f f f f f f f f f f f f 1
                . . . . 1 1 1 f f f f f f f f f f f f f f f f f f f f f f f f 1
                . 1 1 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                . . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f 1 .
                . . . . 1 f f f f f f f f f f f f f f f f f f f f f f f f 1 . .
                . . . . . 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 . . .
            `)
        } else if (asteroidStyle == 2) {
            asteroid.setImage(img`
                . . . . . . . . . . 1 1 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . .
                . . . . . . . 1 1 1 f f f f f f f f f f f f 1 1 1 . . . . . . .
                . . . . . 1 1 f f f f f f f f f f f f f f f f f f 1 1 . . . . .
                . . . . 1 f f f f f f f f f f f f f f f f f f f f f f 1 . . . .
                . . . 1 f f f f f f f f f f f f f f f f f f f f f f f f 1 . . .
                . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f 1 . .
                . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f 1 . .
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1 .
                . 1 1 1 1 1 1 1 1 f f f f f f f f f f f f f f f f f f f f f 1 .
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1 .
                1 f f f f f f f f f 1 1 f f f f f f f f 1 1 f f f f f f f f f 1
                1 f f f f f f f f 1 . . 1 f f f f f f 1 . . 1 f f f f f f f f 1
                1 f f f f f f f f 1 . . 1 f f f f f f 1 . . 1 f f f f f f f f 1
                1 f f f f f f f f f 1 1 f f f f f f f f 1 1 f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f 1 f f f f f f f f f f f f f f f f 1 f f f f f f 1
                1 f f f f f f f 1 f f f f f f f f f f f f f f 1 f f f f f f f 1
                1 f f f f f f f f 1 1 1 1 f f f f f f 1 1 1 1 f f f f f f f f 1
                . 1 f f f f f f f f f f f 1 1 1 1 1 1 f f f f f f f f f f f 1 .
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1 .
                . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1 .
                . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f 1 . .
                . . 1 f f f f f f f f f f f f f f f f f f f f f f f f f f 1 . .
                . . . 1 f f f f f f f f f f f f f f f f f f f f f f f f 1 . . .
                . . . . 1 f f f f f f f f f f f f f f f f f f f f f f 1 . . . .
                . . . . . 1 1 f f f f f f f f f f f f f f f f f f 1 1 . . . . .
                . . . . . . . 1 1 1 f f f f f f f f f f f f 1 1 1 . . . . . . .
                . . . . . . . . . . 1 1 1 1 1 1 1 1 1 1 1 1 . . . . . . . . . .
            `)
        } else {
            asteroid.setImage(img`
                . . . . . . . . . . . . 1 1 1 1 1 1 1 1 . . . . . . . . . . . .
                . . . . . . . . . . . 1 f f f f f f f 1 . . . . . . . . . . . .
                . . . . . . . . . . 1 f f f f f f f 1 . . . . . . . . . . . . .
                . . . . . . . . . 1 f f f f f f f f 1 . . . . . . . . . . . . .
                . . . . . . . . 1 f f f f f f f f f 1 . . . . . . . . . . . . .
                . . . . . . . 1 f f f f f f f f f 1 . . . . . . . . . . . . . .
                . . . . . . 1 f f f f f f f f f f 1 . . . . . . . . . . . . . .
                . . . . . 1 f f f f f f f f f f f 1 . . . . . . . . . . . . . .
                . . . . 1 f f f f f f f f f f f 1 . . . . . . . . . . . . . . .
                . . . 1 f f f f f f f f f f f f 1 . . . . . . . . . . . . . . .
                . . 1 f f f f f f f f f f f f f 1 . . . . . . . . . . . . . . .
                . 1 f f f f f f f f f f f f f f 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f f f f 1 1 1
                1 f f f f f f f f f f f f f f f f f f f f f f f f f 1 1 1 . . .
                1 f f f f f f f f f f f f f f f f f f f f f f 1 1 1 . . . . . .
                1 f f f f f f f f f f f f f f f f f f f f 1 1 . . . . . . . . .
                . 1 f f f f f f f f f f f f f f f f f f f 1 . . . . . . . . . .
                . . 1 f f f f f f f f f f f f f f f f f f 1 . . . . . . . . . .
                . . . 1 f f f f f f f f f f f f f f f f f 1 . . . . . . . . . .
                . . . . 1 f f f f f f f f f f f f f f f f f 1 . . . . . . . . .
                . . . . . 1 f f f f f f f f f f f f f f f f 1 . . . . . . . . .
                . . . . . . 1 f f f f f f f f f f f f f f f 1 . . . . . . . . .
                . . . . . . . 1 f f f f f f f f f f f f f f f 1 . . . . . . . .
                . . . . . . . . 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 . . . . . . . .
            `)
        }
        // Don't try too hard. :-)
        tries = 0
        asteroidX = player2.x
        asteroidY = player2.y
        while (tries < 5 && (Math.abs(player2.x - asteroidX) < asteroid.width / 2 + safeRadius || Math.abs(player2.y - asteroidY) < asteroid.width / 2 + safeRadius)) {
            asteroidX = Math.randomRange(0, scene.screenWidth())
            asteroidY = Math.randomRange(0, scene.screenHeight())
            tries += 1
        }
        asteroidVx = Math.randomRange(asteroidMinSpeed - asteroidSpeed, asteroidSpeed - asteroidMinSpeed)
        if (asteroidVx == 0) {
            asteroidVx = asteroidMinSpeed
        }
        asteroidVy = asteroidSpeed - Math.abs(asteroidVx)
        if (Math.percentChance(50)) {
            asteroidVy = 0 - asteroidVy
        }
        asteroid.setPosition(asteroidX, asteroidY)
        asteroid.setVelocity(asteroidVx, asteroidVy)
    }
    // Halve spaceship delay each level.
    if (spaceshipDelay > minSpaceshipDelay) {
        spaceshipDelay = spaceshipDelay / 2
        if (spaceshipDelay < minSpaceshipDelay) {
            spaceshipDelay = minSpaceshipDelay
        }
    }
    // Double spaceship probability each level.
    if (spaceshipChance < maxSpaceshipChance) {
        spaceshipChance = spaceshipChance * 2
        if (spaceshipChance > maxSpaceshipChance) {
            spaceshipChance = maxSpaceshipChance
        }
    }
    // Halve accuracy window for small spaceship each
    // level.
    if (smallShipAccuracy > smallShipMinAccuracy) {
        smallShipAccuracy = smallShipAccuracy / 2
        if (smallShipAccuracy < smallShipMinAccuracy) {
            smallShipAccuracy = smallShipMinAccuracy
        }
    }
    CalcNextSpaceshipTime()
}
sprites.onOverlap(SpriteKindLegacy.Projectile, SpriteKindLegacy.BigAsteroid, function (sprite, otherSprite) {
    struckAsteroid = otherSprite
    sprite.destroy()
    DestroyBigAsteroid()
})
sprites.onOverlap(SpriteKindLegacy.Projectile, SpriteKindLegacy.SmallAsteroid, function (sprite, otherSprite) {
    struckAsteroid = otherSprite
    sprite.destroy()
    DestroySmallAsteroid()
})
controller.left.onEvent(ControllerButtonEvent.Pressed, function () {
    if (attractMode == 0) {
        if (playerDestroyed == 0) {
            transformSprites.changeRotation(player2, 0 - rotateAmount)
        }
    } else {
        StartGame()
    }
})
sprites.onOverlap(SpriteKindLegacy.Projectile, SpriteKindLegacy.MedAsteroid, function (sprite, otherSprite) {
    struckAsteroid = otherSprite
    sprite.destroy()
    DestroyMediumAsteroid()
})
sprites.onOverlap(SpriteKindLegacy.Projectile, SpriteKindLegacy.BigSpaceship, function (sprite, otherSprite) {
    sprite.destroy()
    DestroySpaceships()
})
sprites.onOverlap(SpriteKindLegacy.Projectile, SpriteKindLegacy.SmallSpaceship, function (sprite, otherSprite) {
    sprite.destroy()
    DestroySpaceships()
})
sprites.onOverlap(SpriteKindLegacy.Player, SpriteKindLegacy.BigAsteroid, function (sprite, otherSprite) {
    if (playerDestroyed == 0) {
        struckAsteroid = otherSprite
        DestroyBigAsteroid()
        DestroyPlayer()
    }
})
function CreateStarfield() {
    background = image.create(scene.screenWidth(), scene.screenHeight())
    background.fill(15)
    for (let index = 0; index <= numStars; index++) {
        pixelX = Math.randomRange(0, scene.screenWidth())
        pixelY = Math.randomRange(0, scene.screenHeight())
        background.setPixel(pixelX, pixelY, Math.randomRange(2, 14))
    }
    scene.setBackgroundImage(background)
}
sprites.onOverlap(SpriteKindLegacy.Player, SpriteKindLegacy.SmallAsteroid, function (sprite, otherSprite) {
    if (playerDestroyed == 0) {
        struckAsteroid = otherSprite
        DestroySmallAsteroid()
        DestroyPlayer()
    }
})
function CreateSplashScreenBase() {
    background = image.create(scene.screenWidth(), scene.screenHeight())
    background.fill(15)
    currFont = drawStrings.createFontInfo(FontName.Font8, 2)
    drawStrings.writeCenter(
        "Asteroids",
        background,
        2,
        1,
        currFont
    )
    currFont = drawStrings.createFontInfo(FontName.Font8)
    drawStrings.writeCenter(
        "Press any button to start",
        background,
        scene.screenHeight() - (drawStrings.height(currFont) + 2),
        1,
        currFont
    )
    controlsDesc = ["Left/Right = Rotate", "Up = Thrusters", "A = Shoot", "B = Hyperspace"]
    textY = 80
    currFont = drawStrings.createFontInfo(FontName.Font5)
    for (let index = 0; index <= controlsDesc.length - 1; index++) {
        drawStrings.writeCenter(
            controlsDesc[index],
            background,
            textY,
            1,
            currFont
        )
        textY += drawStrings.height(currFont) + 1
    }
}
sprites.onOverlap(SpriteKindLegacy.Player, SpriteKindLegacy.MedAsteroid, function (sprite, otherSprite) {
    if (playerDestroyed == 0) {
        struckAsteroid = otherSprite
        DestroyMediumAsteroid()
        DestroyPlayer()
    }
})
sprites.onOverlap(SpriteKindLegacy.BigAsteroid, SpriteKindLegacy.BigSpaceship, function (sprite, otherSprite) {
    DestroySpaceships()
    struckAsteroid = sprite
    DestroyBigAsteroid()
})
sprites.onOverlap(SpriteKindLegacy.BigAsteroid, SpriteKindLegacy.SmallSpaceship, function (sprite, otherSprite) {
    DestroySpaceships()
    struckAsteroid = sprite
    DestroyBigAsteroid()
})
function StartGame() {
    ClearSprites()
    attractMode = 0
    InitPlayer()
    InitSpaceships()
    InitLevel()
}
function ClearSprites() {
    for (let value of sprites.allOfKind(SpriteKindLegacy.Player)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.Projectile)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.Food)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.Enemy)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.MedAsteroid)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.SmallAsteroid)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.BigAsteroid)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.BigSpaceship)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.SmallSpaceship)) {
        value.destroy()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.SpaceshipShot)) {
        value.destroy()
    }
}
controller.left.onEvent(ControllerButtonEvent.Repeated, function () {
    if (attractMode == 0) {
        if (playerDestroyed == 0) {
            transformSprites.changeRotation(player2, 0 - rotateAmount)
        }
    } else {
        StartGame()
    }
})
sprites.onOverlap(SpriteKindLegacy.MedAsteroid, SpriteKindLegacy.BigSpaceship, function (sprite, otherSprite) {
    DestroySpaceships()
    struckAsteroid = sprite
    DestroyMediumAsteroid()
})
sprites.onOverlap(SpriteKindLegacy.MedAsteroid, SpriteKindLegacy.SmallSpaceship, function (sprite, otherSprite) {
    DestroySpaceships()
    struckAsteroid = sprite
    DestroyMediumAsteroid()
})
function Shoot() {
    // Player rotation of zero is pointing up; adjust
    // player angle by -90 degrees for correct shot angle.
    shotAngle = (transformSprites.getRotation(player2) - 90) * 3.1416 / 180
    shotVx = shotVelocity * Math.cos(shotAngle)
    shotVy = shotVelocity * Math.sin(shotAngle)
    projectile = sprites.createProjectileFromSprite(img`
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . 1 1 . . . . . . .
        . . . . . . . 1 1 . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
        . . . . . . . . . . . . . . . .
    `, player2, shotVx, shotVy)
    projectile.lifespan = shotLifetime
}
sprites.onOverlap(SpriteKindLegacy.SpaceshipShot, SpriteKindLegacy.MedAsteroid, function (sprite, otherSprite) {
    struckAsteroid = otherSprite
    sprite.destroy()
    DestroyMediumAsteroid()
})
function StartAttractMode() {
    attractMode = 1
    ShowSplashScreen()
}
function ShowSplashScreen() {
    CreateSplashScreenBase()
    BuildSplashScreens()
    scene.setBackgroundImage(splashScreens[0])
    currSplashScreen = 0
    splashScreenInterval = 5000
    nextSplashScreen = game.runtime() + splashScreenInterval
    CreateGhostAsteroids()
}
sprites.onOverlap(SpriteKindLegacy.SmallAsteroid, SpriteKindLegacy.BigSpaceship, function (sprite, otherSprite) {
    DestroySpaceships()
    struckAsteroid = sprite
    DestroySmallAsteroid()
})
function DestroyPlayer() {
    info.changeLifeBy(-1)
    player2.destroy(effects.spray, 500)
    playerDestroyed = 1
    playerTimeToReturn = game.runtime() + playerRestoreDelay
}
sprites.onOverlap(SpriteKindLegacy.SmallAsteroid, SpriteKindLegacy.SmallSpaceship, function (sprite, otherSprite) {
    DestroySpaceships()
    struckAsteroid = sprite
    DestroySmallAsteroid()
})
controller.right.onEvent(ControllerButtonEvent.Pressed, function () {
    if (attractMode == 0) {
        if (playerDestroyed == 0) {
            transformSprites.changeRotation(player2, rotateAmount)
        }
    } else {
        StartGame()
    }
})
function DestroyMediumAsteroid() {
    scoreDelta = medAsteroidValue
    ChangeScores()
    for (let index3 = 0; index3 <= 1; index3++) {
        newAsteroid = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
        `, SpriteKindLegacy.SmallAsteroid)
        asteroidStyle = Math.randomRange(1, 2)
        if (asteroidStyle == 1) {
            newAsteroid.setImage(img`
                . . 1 1 1 1 1 1
                . 1 f f f f f 1
                1 f f f f f f 1
                1 f f f f f f 1
                1 f f f f 1 1 1
                1 f f f f 1 . .
                1 f f f f 1 . .
                1 1 1 1 1 1 . .
            `)
        } else {
            newAsteroid.setImage(img`
                . . 1 1 1 1 . .
                . 1 f f f f 1 .
                1 f 1 f f 1 f 1
                1 f f f f f f 1
                1 f 1 f f 1 f 1
                1 f f 1 1 f f 1
                . 1 f f f f 1 .
                . . 1 1 1 1 . .
            `)
        }
        newAsteroid.setPosition(struckAsteroid.x + Math.randomRange(-5, 5), struckAsteroid.y + Math.randomRange(-5, 5))
        newAsteroid.setVelocity(struckAsteroid.vx + Math.randomRange(0, 10), struckAsteroid.vy + Math.randomRange(0, 10))
    }
    struckAsteroid.destroy()
    CheckForNewLevel()
}
function UpdateEnemies() {
    for (let value of sprites.allOfKind(SpriteKindLegacy.BigAsteroid)) {
        testSprite = value
        RelocateSprite()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.MedAsteroid)) {
        testSprite = value
        RelocateSprite()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.SmallAsteroid)) {
        testSprite = value
        RelocateSprite()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.BigSpaceship)) {
        if (value.x < 0 || value.x > scene.screenWidth()) {
            value.destroy()
            spaceshipExists = 0
            CalcNextSpaceshipTime()
        }
        if (sprites.allOfKind(SpriteKindLegacy.SpaceshipShot).length < maxSpaceshipShots && Math.percentChance(spaceshipShootChance)) {
            // Big spaceships shoot randomly.
            shotAccuracy = 360
            spaceship = value
            SpaceshipShoot()
        }
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.SmallSpaceship)) {
        if (value.x < 0 || value.x > scene.screenWidth()) {
            value.destroy()
            spaceshipExists = 0
            CalcNextSpaceshipTime()
        }
        if (sprites.allOfKind(SpriteKindLegacy.SpaceshipShot).length < maxSpaceshipShots && Math.percentChance(spaceshipShootChance)) {
            // Big spaceships shoot randomly.
            shotAccuracy = smallShipAccuracy
            spaceship = value
            SpaceshipShoot()
        }
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.SpaceshipShot)) {
        if (value.x < 0 || value.x > scene.screenWidth()) {
            value.destroy()
        }
    }
    if (spaceshipExists == 0 && game.runtime() >= nextSpaceshipTime) {
        if (attractMode == 0) {
            spaceshipIndicator.setImage(img`
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
                5 5 5 5 5 5 5 5
            `)
        }
        if (Math.percentChance(spaceshipChance)) {
            spaceshipExists = 1
            if (attractMode == 0) {
                spaceshipIndicator.setImage(img`
                    2 2 2 2 2 2 2 2
                    2 2 2 2 2 2 2 2
                    2 2 2 2 2 2 2 2
                    2 2 2 2 2 2 2 2
                    2 2 2 2 2 2 2 2
                    2 2 2 2 2 2 2 2
                    2 2 2 2 2 2 2 2
                    2 2 2 2 2 2 2 2
                `)
            }
            if (Math.percentChance(50)) {
                ShowBigSpaceship()
            } else {
                ShowSmallSpaceship()
            }
        }
    }
}
sprites.onOverlap(SpriteKindLegacy.Player, SpriteKindLegacy.BigSpaceship, function (sprite, otherSprite) {
    if (playerDestroyed == 0) {
        DestroySpaceships()
        DestroyPlayer()
    }
})
sprites.onOverlap(SpriteKindLegacy.Player, SpriteKindLegacy.SmallSpaceship, function (sprite, otherSprite) {
    if (playerDestroyed == 0) {
        DestroySpaceships()
        DestroyPlayer()
    }
})
function CalcNextSpaceshipTime() {
    if (attractMode == 0) {
        nextSpaceshipTime = game.runtime() + (spaceshipDelay + Math.randomRange(0, spaceshipDelay * 0.1))
        spaceshipIndicator.setImage(img`
            7 7 7 7 7 7 7 7
            7 7 7 7 7 7 7 7
            7 7 7 7 7 7 7 7
            7 7 7 7 7 7 7 7
            7 7 7 7 7 7 7 7
            7 7 7 7 7 7 7 7
            7 7 7 7 7 7 7 7
            7 7 7 7 7 7 7 7
        `)
    } else {
        nextSpaceshipTime = 0
    }
}
sprites.onOverlap(SpriteKindLegacy.SpaceshipShot, SpriteKindLegacy.BigAsteroid, function (sprite, otherSprite) {
    struckAsteroid = otherSprite
    sprite.destroy()
    DestroyBigAsteroid()
})
function UpdatePlayer() {
    if (playerDestroyed == 1 && game.runtime() >= playerTimeToReturn) {
        ResetPlayer()
    }
    testSprite = player2
    RelocateSprite()
    if (player2.vx != 0 || player2.vy != 0) {
        playerVmag = Math.sqrt(player2.vx ** 2 + player2.vy ** 2)
        if (playerVmag < velocityChange) {
            player2.setVelocity(0, 0)
        } else {
            playerVmag += 0 - velocityChange
            playerVdir = Math.atan2(player2.vy, player2.vx)
            player2.vx = playerVmag * Math.cos(playerVdir)
            player2.vy = playerVmag * Math.sin(playerVdir)
        }
    }
    if (playerDestroyed == 0 && controller.up.isPressed()) {
        // Player rotation of zero is pointing up; adjust
        // player angle by -90 degrees for correct angle.
        accelAngle = (transformSprites.getRotation(player2) - 90) * 3.1416 / 180
        playerAx = thrust * Math.cos(accelAngle)
        playerAy = thrust * Math.sin(accelAngle)
        player2.ax = playerAx
        player2.ay = playerAy
    } else {
        player2.ax = 0
        player2.ay = 0
    }
}
sprites.onOverlap(SpriteKindLegacy.SpaceshipShot, SpriteKindLegacy.SmallAsteroid, function (sprite, otherSprite) {
    struckAsteroid = otherSprite
    sprite.destroy()
    DestroySmallAsteroid()
})
function RotateSplashScreen() {
    currSplashScreen += 1
    if (currSplashScreen >= splashScreens.length) {
        currSplashScreen = 0
    }
    scene.setBackgroundImage(splashScreens[currSplashScreen])
    nextSplashScreen = game.runtime() + splashScreenInterval
}
controller.right.onEvent(ControllerButtonEvent.Repeated, function () {
    if (attractMode == 0) {
        if (playerDestroyed == 0) {
            transformSprites.changeRotation(player2, rotateAmount)
        }
    } else {
        StartGame()
    }
})
sprites.onOverlap(SpriteKindLegacy.Player, SpriteKindLegacy.SpaceshipShot, function (sprite, otherSprite) {
    if (playerDestroyed == 0) {
        otherSprite.destroy()
        DestroyPlayer()
    }
})
function DestroyBigAsteroid() {
    scoreDelta = bigAsteroidValue
    ChangeScores()
    for (let index2 = 0; index2 <= 1; index2++) {
        let asteroidSpeedup = 0
        newAsteroid = sprites.create(img`
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
            . . . . . . . . . . . . . . . .
        `, SpriteKindLegacy.MedAsteroid)
        asteroidStyle = Math.randomRange(1, 2)
        if (asteroidStyle == 1) {
            newAsteroid.setImage(img`
                . . . . . 1 1 1 1 1 1 . . . . .
                . . . . 1 f f f f f 1 . . . . .
                . . . 1 f f f f f f 1 . . . . .
                . . 1 f f f f f f f 1 . . . . .
                . 1 f f f f f f f f 1 1 1 1 1 1
                1 f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f 1
                1 f f f f f f f f f f 1 1 1 1 1
                1 f f f f f f f f f f 1 . . . .
                . 1 f f f f f f f f 1 . . . . .
                . . 1 f f f f f f f 1 . . . . .
                . . . 1 1 1 1 1 1 1 1 . . . . .
            `)
        } else {
            newAsteroid.setImage(img`
                . . . . . 1 1 1 1 1 1 . . . . .
                . . . . 1 f f f f f f 1 . . . .
                . . . 1 f f f f f f f f 1 1 . .
                . . 1 f f f f f f f f f f f 1 .
                . 1 f f f f f f f f f f f f f 1
                1 f f f f f f f f f f f f f f 1
                . 1 1 f f f f f f f f f f f f 1
                . . . 1 1 1 1 f f f f f f f f 1
                . . . . . . . 1 f f f f f f f 1
                . . . . . . . . 1 f f f f f f 1
                . . . . . 1 1 1 f f f f f f f 1
                . 1 1 1 1 f f f f f f f f f f 1
                1 f f f f f f f f f f f f f 1 .
                . 1 f f f f f f f f f f f f 1 .
                . . 1 f f f f f f f f f f 1 . .
                . . . 1 1 1 1 1 1 1 1 1 1 . . .
            `)
        }
        newAsteroid.setPosition(struckAsteroid.x + Math.randomRange(-5, 5), struckAsteroid.y + Math.randomRange(-5, 5))
        asteroidVx = struckAsteroid.vx
        if (asteroidVx >= 0) {
            asteroidVx += Math.randomRange(1, asteroidSpeedup)
        } else {
            asteroidVx += 0 - Math.randomRange(1, asteroidSpeedup)
        }
        asteroidVy = struckAsteroid.vy
        if (asteroidVy >= 0) {
            asteroidVy += Math.randomRange(1, asteroidSpeedup)
        } else {
            asteroidVy += 0 - Math.randomRange(1, asteroidSpeedup)
        }
        // Asteroid always should have some sort of velocity.
        if (asteroidVx == 0 && asteroidVy == 0) {
            if (Math.percentChance(50)) {
                asteroidVx = asteroidMinSpeed
            } else {
                asteroidVy = asteroidMinSpeed
            }
        }
        newAsteroid.setVelocity(asteroidVx, asteroidVy)
    }
    struckAsteroid.destroy()
    CheckForNewLevel()
}
function DestroySmallAsteroid() {
    scoreDelta = smallAsteroidValue
    ChangeScores()
    struckAsteroid.destroy()
    CheckForNewLevel()
}
function BuildSplashScreens() {
    headlines = [["Asteroids is", "(c) 1979 Atari Inc."], ["Programmed in", "MakeCode Arcade"], ["by", "Alex K."]]
    currFont = drawStrings.createFontInfo(FontName.Font5)
    splashScreens = []
    for (let value of headlines) {
        splashScreen = background.clone()
        drawStrings.writeMultipleCenter(
            value,
            splashScreen,
            20,
            14,
            currFont
        )
        splashScreens.push(splashScreen)
    }
}
function CreateGhostAsteroids() {
    startAsteroids = 3
    asteroidSpeed = 15
    asteroidMinSpeed = 5
    spaceshipChance = 1
    bigSpaceshipSpeed = 25
    smallSpaceshipSpeed = 50
    spaceshipShootChance = 100
    shipShotVelocity = 100
    shotLifetime = 1000
    maxSpaceshipShots = 3
    smallShipAccuracy = 10
    for (let index = 0; index <= startAsteroids - 1; index++) {
        asteroid = sprites.create(img`
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
        `, SpriteKindLegacy.BigAsteroid)
        if (index == 1) {
            asteroid.setImage(img`
                . . . b b b b b b b b b b b b b b b b b b b b b b . . . . . . .
                . . . . b . . . . . . . . . . . . . . . . . . . . b . . . . . .
                . . . . . b . . . . . . . . . . . . . . . . . . . . b . . . . .
                . . . . . . b . . . . . . . . . . . . . . . . . . . . b . . . .
                . . . . . . . b . . . . . . . . . . . . . . . . . . . . b . . .
                . . . b . . . . b . . . . . . . . . . . . . . . . . . . . b . .
                . . . b b b . . . b . . . . . . . . . . . . . . . . . . . . b .
                . . . b . . b b . . b . . . . . . . . . . . . . . . . . . . . b
                . . b . . . . . b b . . . . . . . . . . . . . . . . . . . . . b
                . . b . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . . b . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . b b . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . . . b b . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . . . . . b b . . . . . . . . . . . . . . . . . . . . . . . . b
                . . . . . . . b b . . . . . . . . . . . . . . . . . . . . . . b
                . . . . . . . . . b b . . . . . . . . . . . . . . . . . . . . b
                . . . . . . . . . . . b b . . . . . . . . . . . . . . . . . . b
                . . . . . . . . . . . . . b . . . . . . . . . . . . . . . . . b
                . . . . . . . . . . b b b . . . . . . . . . . . . . . . . . . b
                . . . . . . . b b b . . . . . . . . . . . . . . . . . . . . . b
                . . . . b b b . . . . . . . . . . . . . . . . . . . . . . . . b
                . b b b . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . . b . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                . . . b . . . . . . . . . . . . . . . . . . . . . . . . . . b .
                . . . . b . . . . . . . . . . . . . . . . . . . . . . . . b . .
                . . . . . b b b b b b b b b b b b b b b b b b b b b b b b . . .
            `)
        } else if (index == 2) {
            asteroid.setImage(img`
                . . . . . . . . b b b b b b b b b b b b b b b b b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                b b b b b b b b b . . . . . . . . . . . . . . . b b b b b b b b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b b b b b b b b b . . . . . . . . . . . . . . . b b b b b b b b
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . .
                . . . . . . . . b b b b b b b b b b b b b b b b b . . . . . . .
            `)
        } else {
            asteroid.setImage(img`
                . . . . . . . . . . . . b b b b b b b b . . . . . . . . . . . .
                . . . . . . . . . . . b . . . . . . . b . . . . . . . . . . . .
                . . . . . . . . . . b . . . . . . . b . . . . . . . . . . . . .
                . . . . . . . . . b . . . . . . . . b . . . . . . . . . . . . .
                . . . . . . . . b . . . . . . . . . b . . . . . . . . . . . . .
                . . . . . . . b . . . . . . . . . b . . . . . . . . . . . . . .
                . . . . . . b . . . . . . . . . . b . . . . . . . . . . . . . .
                . . . . . b . . . . . . . . . . . b . . . . . . . . . . . . . .
                . . . . b . . . . . . . . . . . b . . . . . . . . . . . . . . .
                . . . b . . . . . . . . . . . . b . . . . . . . . . . . . . . .
                . . b . . . . . . . . . . . . . b . . . . . . . . . . . . . . .
                . b . . . . . . . . . . . . . . b b b b b b b b b b b b b b b b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . b
                b . . . . . . . . . . . . . . . . . . . . . . . . . . . . b b b
                b . . . . . . . . . . . . . . . . . . . . . . . . . b b b . . .
                b . . . . . . . . . . . . . . . . . . . . . . b b b . . . . . .
                b . . . . . . . . . . . . . . . . . . . . b b . . . . . . . . .
                . b . . . . . . . . . . . . . . . . . . . b . . . . . . . . . .
                . . b . . . . . . . . . . . . . . . . . . b . . . . . . . . . .
                . . . b . . . . . . . . . . . . . . . . . b . . . . . . . . . .
                . . . . b . . . . . . . . . . . . . . . . . b . . . . . . . . .
                . . . . . b . . . . . . . . . . . . . . . . b . . . . . . . . .
                . . . . . . b . . . . . . . . . . . . . . . b . . . . . . . . .
                . . . . . . . b . . . . . . . . . . . . . . . b . . . . . . . .
                . . . . . . . . b b b b b b b b b b b b b b b b . . . . . . . .
            `)
        }
        asteroidX = Math.randomRange(0, scene.screenWidth())
        asteroidY = Math.randomRange(0, scene.screenHeight())
        asteroidVx = Math.randomRange(asteroidMinSpeed - asteroidSpeed, asteroidSpeed - asteroidMinSpeed)
        if (asteroidVx == 0) {
            asteroidVx = asteroidMinSpeed
        }
        asteroidVy = asteroidSpeed - Math.abs(asteroidVx)
        if (Math.percentChance(50)) {
            asteroidVy = 0 - asteroidVy
        }
        asteroid.setPosition(asteroidX, asteroidY)
        asteroid.setVelocity(asteroidVx, asteroidVy)
    }
}
controller.B.onEvent(ControllerButtonEvent.Pressed, function () {
    if (attractMode == 0) {
        if (inHyperspace == 0) {
            hyperspaceDirection = transformSprites.getRotation(player2)
            player2.destroy()
            info.startCountdown(hyperspaceTime)
        }
    } else {
        StartGame()
    }
})
function ResetPlayer() {
    if (inHyperspace == 1) {
        playerX = Math.randomRange(player2.width, scene.screenWidth() - player2.width)
        playerY = Math.randomRange(player2.height, scene.screenHeight() - player2.height)
    } else {
        playerX = scene.screenWidth() / 2
        playerY = scene.screenHeight() / 2
    }
    unsafeEnemies = 0
    // Do not count unsafe enemies when restoring from
    // hyperspace. Good luck! :-)
    if (inHyperspace == 0) {
        for (let value of sprites.allOfKind(SpriteKindLegacy.BigAsteroid)) {
            if (Math.abs(value.y - playerY) <= value.width + 2 + safeRadius && Math.abs(value.x - playerX) <= value.width + 2 + safeRadius) {
                unsafeEnemies += 1
            }
        }
        for (let value of sprites.allOfKind(SpriteKindLegacy.MedAsteroid)) {
            if (Math.abs(value.y - playerY) <= value.width + 2 + safeRadius && Math.abs(value.x - playerX) <= value.width + 2 + safeRadius) {
                unsafeEnemies += 1
            }
        }
        for (let value of sprites.allOfKind(SpriteKindLegacy.SmallAsteroid)) {
            if (Math.abs(value.y - playerY) <= value.width + 2 + safeRadius && Math.abs(value.x - playerX) <= value.width + 2 + safeRadius) {
                unsafeEnemies += 1
            }
        }
        for (let value of sprites.allOfKind(SpriteKindLegacy.BigSpaceship)) {
            if (Math.abs(value.y - playerY) <= value.width + 2 + safeRadius && Math.abs(value.x - playerX) <= value.width + 2 + safeRadius) {
                unsafeEnemies += 1
            }
        }
        for (let value of sprites.allOfKind(SpriteKindLegacy.SmallSpaceship)) {
            if (Math.abs(value.y - playerY) <= value.width + 2 + safeRadius && Math.abs(value.x - playerX) <= value.width + 2 + safeRadius) {
                unsafeEnemies += 1
            }
        }
    }
    if (unsafeEnemies == 0) {
        player2 = sprites.create(img`
            . . . . . . . 1 . . . . . . . .
            . . . . . . . 1 . . . . . . . .
            . . . . . . 1 . 1 . . . . . . .
            . . . . . . 1 . 1 . . . . . . .
            . . . . . . 1 . 1 . . . . . . .
            . . . . . 1 . . . 1 . . . . . .
            . . . . . 1 . . . 1 . . . . . .
            . . . . . 1 . . . 1 . . . . . .
            . . . . 1 . . . . . 1 . . . . .
            . . . . 1 . . 1 . . 1 . . . . .
            . . . . 1 1 1 . 1 1 1 . . . . .
            . . . 1 1 1 . . . 1 1 1 . . . .
            . . 1 1 . 1 1 . 1 1 . 1 1 . . .
            . 1 1 1 . . 1 1 1 . . 1 1 1 . .
            . . 1 1 1 . . 1 . . 1 1 1 . . .
            . . . 1 . . . . . . . 1 . . . .
        `, SpriteKindLegacy.Player)
        player2.setPosition(playerX, playerY)
        player2.setVelocity(0, 0)
        transformSprites.rotateSprite(player2, hyperspaceDirection)
        playerDestroyed = 0
        inHyperspace = 0
    }
}
function ShowBigSpaceship() {
    spaceship = sprites.create(img`
        . . . . . . 1 1 1 1 . . . . . .
        . . . . . . 1 f f 1 . . . . . .
        . . . . . . 1 f f 1 . . . . . .
        . . . . . . 1 f f 1 . . . . . .
        . . . . . . 1 f f 1 . . . . . .
        . . . . 1 1 1 1 1 1 1 1 . . . .
        . . . 1 f f f f f f f f 1 . . .
        . . 1 f f f f f f f f f f 1 . .
        . 1 f f f f f f f f f f f f 1 .
        1 f f f f f f f f f f f f f f 1
        1 1 1 1 1 1 1 1 1 1 1 1 1 1 1 1
        1 f f f f f f f f f f f f f f 1
        . 1 f f f f f f f f f f f f 1 .
        . . 1 f f f f f f f f f f 1 . .
        . . . 1 f f f f f f f f 1 . . .
        . . . . 1 1 1 1 1 1 1 1 . . . .
    `, SpriteKindLegacy.BigSpaceship)
    if (attractMode == 1) {
        spaceship.setImage(img`
            . . . . . . e e e e . . . . . .
            . . . . . . e . . e . . . . . .
            . . . . . . e . . e . . . . . .
            . . . . . . e . . e . . . . . .
            . . . . . . e . . e . . . . . .
            . . . . . . e . . e . . . . . .
            . . . . . . e . . e . . . . . .
            . . . . e e e e e e e e . . . .
            . . . e . . . . . . . . e . . .
            . . e . . . . . . . . . . e . .
            . e . . . . . . . . . . . . e .
            e e e e e e e e e e e e e e e e
            . e . . . . . . . . . . . . e .
            . . e . . . . . . . . . . e . .
            . . . e . . . . . . . . e . . .
            . . . . e e e e e e e e . . . .
        `)
        spaceship.setFlag(SpriteFlag.Ghost, true)
    }
    spaceship.y = Math.randomRange(spaceship.height, scene.screenHeight() - spaceship.height)
    if (Math.percentChance(50)) {
        spaceship.x = 0
        spaceship.vx = bigSpaceshipSpeed
    } else {
        spaceship.x = scene.screenWidth()
        spaceship.vx = 0 - bigSpaceshipSpeed
    }
}
function ShowSmallSpaceship() {
    spaceship = sprites.create(img`
        . . . 1 1 . . .
        . . . 1 1 . . .
        . . 1 1 1 1 . .
        . 1 f f f f 1 .
        1 f f f f f f 1
        1 1 1 1 1 1 1 1
        1 f f f f f f 1
        . 1 1 1 1 1 1 .
    `, SpriteKindLegacy.SmallSpaceship)
    if (attractMode == 1) {
        spaceship.setImage(img`
            . . . e e . . .
            . . . e e . . .
            . . e e e e . .
            . e . . . . e .
            e . . . . . . e
            e e e e e e e e
            e . . . . . . e
            . e e e e e e .
        `)
        spaceship.setFlag(SpriteFlag.Ghost, true)
    }
    spaceship.y = Math.randomRange(spaceship.height, scene.screenHeight() - spaceship.height)
    if (Math.percentChance(50)) {
        spaceship.x = 0
        spaceship.vx = smallSpaceshipSpeed
    } else {
        spaceship.x = scene.screenWidth()
        spaceship.vx = 0 - smallSpaceshipSpeed
    }
}
function CheckForNewLevel() {
    numAsteroids = 0
    numAsteroids += sprites.allOfKind(SpriteKindLegacy.BigAsteroid).length
    numAsteroids += sprites.allOfKind(SpriteKindLegacy.MedAsteroid).length
    numAsteroids += sprites.allOfKind(SpriteKindLegacy.SmallAsteroid).length
    if (numAsteroids == 0) {
        startAsteroids += 1
        ResetLevel()
    }
}
info.onCountdownEnd(function () {
    info.stopCountdown()
    playerDestroyed = 1
    inHyperspace = 1
})
function DestroySpaceships() {
    for (let value of sprites.allOfKind(SpriteKindLegacy.BigSpaceship)) {
        value.destroy(effects.spray, 500)
        scoreDelta = bigSpaceshipValue
        ChangeScores()
    }
    for (let value of sprites.allOfKind(SpriteKindLegacy.SmallSpaceship)) {
        value.destroy(effects.spray, 500)
        scoreDelta = smallSpaceshipValue
        ChangeScores()
    }
    spaceshipExists = 0
    CalcNextSpaceshipTime()
    CheckForNewLevel()
}
function SpaceshipShoot() {
    if (attractMode == 0) {
        shipShotX = player2.x - spaceship.x
        shipShotY = player2.y - spaceship.y
    } else {
        shipShotX = scene.screenWidth() / 2 - spaceship.x
        shipShotY = scene.screenHeight() / 2 - spaceship.y
    }
    shipShotDir = Math.atan2(shipShotY, shipShotX)
    shipShotDir += Math.randomRange(0 - shotAccuracy, shotAccuracy) * 3.1416 / 180
    shipShotVx = shipShotVelocity * Math.cos(shipShotDir)
    shipShotVy = shipShotVelocity * Math.sin(shipShotDir)
    shipshot = sprites.create(img`
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
        . . . . 1 . . .
        . . . . . . . .
        . . . . . . . .
        . . . . . . . .
    `, SpriteKindLegacy.SpaceshipShot)
    if (attractMode == 1) {
        shipshot.setImage(img`
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
            . . . . e . . .
            . . . . . . . .
            . . . . . . . .
            . . . . . . . .
        `)
        shipshot.setFlag(SpriteFlag.Ghost, true)
    }
    shipshot.setPosition(spaceship.x, spaceship.y)
    shipshot.setVelocity(shipShotVx, shipShotVy)
    shipshot.lifespan = shotLifetime
}
let shipshot: Sprite = null
let shipShotVy = 0
let shipShotVx = 0
let shipShotDir = 0
let shipShotY = 0
let shipShotX = 0
let numAsteroids = 0
let unsafeEnemies = 0
let playerY = 0
let playerX = 0
let hyperspaceDirection = 0
let splashScreen: Image = null
let headlines: string[][] = []
let playerAy = 0
let playerAx = 0
let accelAngle = 0
let playerVdir = 0
let playerVmag = 0
let nextSpaceshipTime = 0
let spaceship: Sprite = null
let shotAccuracy = 0
let newAsteroid: Sprite = null
let playerTimeToReturn = 0
let nextSplashScreen = 0
let splashScreenInterval = 0
let currSplashScreen = 0
let splashScreens: Image[] = []
let projectile: Sprite = null
let shotVy = 0
let shotVx = 0
let shotAngle = 0
let textY = 0
let controlsDesc: string[] = []
let currFont: FontInfo = null
let pixelY = 0
let pixelX = 0
let background: Image = null
let struckAsteroid: Sprite = null
let asteroidVy = 0
let asteroidVx = 0
let asteroidY = 0
let player2: Sprite = null
let asteroidX = 0
let tries = 0
let asteroidStyle = 0
let asteroid: Sprite = null
let numStars = 0
let spaceshipChance = 0
let spaceshipDelay = 0
let asteroidMinSpeed = 0
let asteroidSpeed = 0
let smallAsteroidValue = 0
let medAsteroidValue = 0
let bigAsteroidValue = 0
let startAsteroids = 0
let spaceshipIndicator: Sprite = null
let spaceshipShootChance = 0
let smallShipMinAccuracy = 0
let smallShipAccuracy = 0
let smallShipInitAccuracy = 0
let maxSpaceshipShots = 0
let shipShotVelocity = 0
let bigSpaceshipSpeed = 0
let smallSpaceshipValue = 0
let bigSpaceshipValue = 0
let spaceshipExists = 0
let smallSpaceshipSpeed = 0
let maxSpaceshipChance = 0
let initSpaceshipChance = 0
let minSpaceshipDelay = 0
let initSpaceshipDelay = 0
let thrust = 0
let hyperspaceTime = 0
let inHyperspace = 0
let playerRestoreDelay = 0
let playerDestroyed = 0
let safeRadius = 0
let rotateAmount = 0
let shotVelocity = 0
let shotLifetime = 0
let velocityChange = 0
let relocateThreshold = 0
let simultaneousShots = 0
let newLifeScore = 0
let nextLife = 0
let scoreDelta = 0
let attractMode = 0
let testSprite: Sprite = null
testSprite = sprites.create(img`
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
    . . . . . . . . . . . . . . . .
`, SpriteKindLegacy.Enemy)
StartAttractMode()
game.onUpdate(function () {
    if (attractMode == 0) {
        UpdateEnemies()
        UpdatePlayer()
    } else {
        UpdateEnemies()
        if (game.runtime() >= nextSplashScreen) {
            RotateSplashScreen()
        }
    }
})

