// TODO!!!
// make explody graphics
// game over graphic?
// add form for name before game starts
// track & show score & health
// add cute noises, or something for more HTML5 fun!!!

/*
 * Tactical Panda Missle
 *
 * License: Follow the flowchart @ http://cl.ly/5nAo and choose the one you like
 *
 * Image attribution:
 *  Panda Missle:
 *   Photo by Michael Musson, mogrified by Caz
 *   Source: http://www.flickr.com/photos/mmusson/300982458/sizes/l/in/photostream/
 *  Spoon:
 *   Photo from totallyfreecrap.com, not sure on the attribution or license.
 *   They wanted me to fill out a survey, in exchange for a free phyical spoon.
 *   I didn't, but assumed I could have a free digital spoon.
 *   Source: http://www.totallyfreecrap.com/2009/10/05/free-spoon/
 *     
 */

// {"player":{"created_at":,"id":,"name":,"score":,"time":,"updated_at":}}
(function() {
    // Structure
    var path = 'sprites/',
        //postUrl = 'http://localhost:3000/',
        postUrl = 'http://tacpan.heroku.com/',
        playerId = false,
        score = 0,
        health = 5,
        spoonCount = lasCount = totLasers = 0,
        leaders = ['','','']

    function pollServer() {
        rw.post(
            postUrl+'player/update/',
            '{"id":'+playerId+',"score":'+score+'}',
            function(resp) {
                resp = JSON.parse(resp)
                for (var x=0; x<3; x++) {
                    leaders[x] = resp[x].player ? 
                        resp[x].player.name+' : '+resp[x].player.score : ''
                }
            }
        )
    }

    function LeaderLine(num) {
        this.base = new rw.Ent('leader_'+num, 'text', 500, 16)
        this.text = {
            text: '',
            form: 'fill',
            style: {
                font:'12pt sans',
                fill: '#000'
            }
        }
        this.update = function() {
            this.text.text = leaders[num]
        }
        this.init = function() {
            this.base.display(0,16+num*16)
        }
    }

    function StatLine() {
        this.base = new rw.Ent('stats', 'text', 500, 16)
        this.text = {
            text: '',
            form: 'fill',
            style: {
                font:'12pt sans',
                fill: '#000'
            }
        }
        this.update = function() {
            this.text.text = 'Score: '+score+' Health: '+health
        }
        this.init = function() {
            this.base.display(0,320)
        }
    }

    function Backdrop(name) {
        this.base = new rw.Ent('backdrop_'+name, 'bg', 480, 320)
        this.update = function(pX) {
            if (pX>-480) this.base.move(-2,0)
            else this.base.move(958,0)
        }
    }

    function Panda() {
        this.base = new rw.Ent('panda', 'panda1', 150, 40)
        var counter = 20,
            lasCooldown = 0,
            ani = 1

        this.update = function(pX,pY) {
            var mY = rw.mouse.y(),
                move = 0
            counter ? counter-- : (
                counter = 20,
                ((ani==1) ? ani=2 : ani=1),
                this.base.changeSprite('panda'+ani)
            )
            if (mY<pY) move = -2
            else if ((mY>pY+40)&&(pY+40<300)) move = 2
            this.base.move(0, move, 0)
            if (!lasCooldown) {
                if ((lasCount<6)&&(rw.mouse.down())) {
                    lasCooldown = 20
                    rw.newEnt(new Laser(pY+move))
                }
            } else lasCooldown--
                    
        }
        this.hitMap=[['panda',['spoon'],0,0,150,40]]
        this.gotHit = function(by) {
            if (by=='spoon') {
                health--
            }
            if (!health) return this.base.hide(), false//rw.rules['score'].gameOver=true
        }
    }

    function Laser(yPos) {
        this.base = new rw.Ent('laser_'+lasCount++, 'laser', 20, 10)
        this.update = function() {
            if (this.base.posX1()>480) return totLasers--, this.base.hide(), false
            this.base.move(2,0)
        }
        this.hitMap = [['laser',['spoon'], 2, 0, 8, 20]]
        this.gotHit = function() { return totLasers--, this.base.hide(), false }
        this.init = function() {
            totLasers++
            this.base.display(160, yPos)
        }
    }

    function Spoon(yPos) {
        this.base = new rw.Ent('spoon_'+spoonCount++, 'spoon', 22, 100)
        var dying = false,
            countdown = 30,
            speed = 2+Math.random()
        this.update = function(pX,pY) {
            this.base.move(-speed, 0)
            if (dying) {
                if (countdown) countdown--
                else return this.base.hide(), score++, false
            } 
            if (this.base.posX1()<-40) return this.base.hide(), false
                
            
        }
        this.hitMap = [
            ['spoon',['panda','laser'],0,0,22,36],
            ['spoon',['panda','laser'],10,37,13,100]
        ]
        this.gotHit = function() { 
            dying=true 
            this.hitMap = []
        }
        this.init = function() { this.base.display(480,yPos) }
    }

    function Spawner() {
        this.base = new rw.Rule(1)
        this.rule = function() {
            if (Math.random()<0.01) rw.newEnt(
                new Spoon(Math.floor(220*Math.random()))
            )
        }
    }

    function Score() {
        this.base = new rw.Rule(0)
        var gameOver = false,
            score = 0,
            poll = 10*60
        this.rule = function() {
            // Poll server
            poll ? poll-- : (
                poll = 10*60,
                pollServer()
            )
            //end game
            if (this.gameOver) {}
        }
    }

    // Implementation
    function makeGame() {
        rw.stop(function() {
            rw.wipeAll()
            .newRule('score', new Score())
            .newRule('spawner', new Spawner())
            .newEnt(new StatLine()).base.end()
            .newEnt(new LeaderLine(0)).base.end()
            .newEnt(new LeaderLine(1)).base.end()
            .newEnt(new LeaderLine(2)).base.end()
            .newEnt(new Panda())
                .base.display(10,140,320).end()
            .newEnt(new Backdrop(1))
                .base.display(0,0).end()
            .newEnt(new Backdrop(2))
                .base.display(480,0).end()
            .start()
        })
    }
    rw.loadSprites({
        splash: [path+'splashpanda.png', 480, 320, 0, 0]
    }, function() {
        rw.init('playarea', {
            x:480,
            y:320,
            FPS:60,
            sequence:['ajax','ents','cols','rule','kill','blit','rule']
        })
        .newEnt({
            base:new rw.Ent('splash','splash',480,320),
            update:function() {}
        }).base.display(0,0).end()
        .start()
        .loadSprites({
            panda1: [path+'rpm1.png', 150, 40, 0, 0],
            panda2: [path+'rpm2.png', 150, 40, 0, 0],
            laser: [path+'laser.png', 20, 10, 0, 0],
            spoon: [path+'spoon.png', 22, 100, 0, 0],
            bg: [path+'bg.png',480,320,0,0]
        }, function() {
            rw.post(postUrl+'player/play/',"{'name':'caz'}", function(resp) {
                resp = JSON.parse(resp),
                playerId = resp.player.id,
                makeGame()
            })
        })
    })
})()
