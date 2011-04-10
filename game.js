(function() {
    // Structure
    var canHit = ['spoon'],
        path = '',
        score = 0,
        leaders = [
            {name:'bob', score:800},
            {name:'bib', score:80},
            {name:'bab', score:8}
        ]

    function pollServer() {
    }

    function LeaderLine(num) {
        this.base = new rw.Ent('leader_'+num, 'text', 500, 16)
        this.text = {
            text: leaders[num].name+' : '+leaders[num].score,
            form: 'fill',
            style: {
                font:'12pt sans',
                fill: '#000'
            }
        }
        this.update = function() {
            this.text.text = leaders[num].name+' : '+leaders[num].score
        }
        this.init = function() {
            this.base.display(0,16+num*16)
        }
    }

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
            if (by=='cloud') {
                this.health--
            }
            if (!this.health) rw.rules['score'].gameOver=true
        }
    }

    var spoonCount = cloudCount = 0
    function Spoon(yPos) {
        this.base = new rw.Ent('spoon_'+spoonCount++, 'spoon', 40, 40)
        this.dying = false
        this.countdown = 30
        this.update = function(pX,pY) {
            if (this.dying) {
                if (this.countdown) this.countdown--
                else return this.base.hide(), false
            } 
            this.base.move(-1, 0)
            if (pX<-40) return this.base.hide(), false
        }
        this.hitMap = [['spoon',['panda'],0,0,40,40]]
        this.gotHit = function() { this.dying=true }
        this.init = function() { this.base.display(500,yPos) }
    }

    function Cloud(yPos) {
        this.base = new rw.Ent('cloud_'+cloudCount++, 'cloud', 40, 40)
        this.update = function(pX,pY) {
            this.base.move(-1, 0)
            if (pX<-40) return false
        }
        this.hitMap = [['cloud',['panda'],0,0,40,40]]
        this.gotHit = function() {
        }
        this.init = function() { this.base.display(500,yPos) }
    }

    function Score() {
        this.base = new rw.Rule(0)
        this.gameOver = false
        this.score = 0
        this.poll = 30*60
        this.rule = function() {
            this.poll ? this.poll-- : (
                this.poll = 30*60,
                pollServer()
                // poll server and send current score
            )
            if (this.gameOver) {}//end game
        }
    }



    // Implementation
    rw.loadSprites({
        panda: [path+'panda.png', 40, 40, 0, 0],
        spoon: [path+'panda.png', 40, 40, 0, 0],
        cloud: [path+'panda.png', 40, 40, 0, 0]
    }, function() {
        rw.init('playarea', {
            x:500,
            y:500,
            FPS:60,
            sequence:['ents','cols','rule','blit']
        })
        .newRule('score', new Score())
        .newEnt(new LeaderLine(0)).base.end()
        .newEnt(new LeaderLine(1)).base.end()
        .newEnt(new LeaderLine(2)).base.end()
        .newEnt(new Panda())
            .base.display(0,0).end()
        .newEnt(new Spoon(0)).base.end()
        .newEnt(new Spoon(250)).base.end()
        .start()
    })
})()
