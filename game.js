(function() {
    // Structure
    var canHit = []
    function Panda() {
        this.base = new rw.Ent('panda', 'panda', 40, 40)
        this.health = 100
        this.speed = 0
        this.update = function(pX,pY) {
            if (rw.key('ua')) this.base.move(0,-1)
            else if (rw.key('da')) this.base.move(0,1)
        }
        this.hitMap=[['panda',canHit,0,0,40,40]]
        this.gotHit = function(by) {
        }
    }

    function Spoon(yPos) {
        this.base = new rw.Ent('spoon_'+spoonCount++, 'spoon', 40, 40)
        this.update = function(pX,pY) {
        }
        this.hitMap = ['spoon',['panda'],0,0,40,40]
        this.gotHit = function() {
        }
    }

    function Cloud(yPos) {
        this.base = new rw.Ent('spoon_'+spoonCount++, 'spoon', 40, 40)
        this.update = function(pX,pY) {
        }
        this.hitMap = ['spoon',['panda'],0,0,40,40]
        this.gotHit = function() {
        }
    }


    // Implementation
    rw.loadSprites({
        panda: ['panda.png', 40, 40, 0, 0]
    }, function() {
        rw.init('playarea', {
            x:500,
            y:500,
            FPS:60,
            sequence:['ents','cols','rule','blit']
        })
        .newEnt(new Panda())
            .base.display(0,0).end()
        .start()
    })
})()
