// TODO!!!
// make explody graphics
// make background graphics
// make splashscreen & gameover
// add form for name before game starts
// track & show score & health
// fix up hit maps: only front of panda can kill spoons via the head
// add grapes or something
// ajax calls to server
// make game increase in difficulty over time
// add cute noises, or something for more HTML5 fun!!!

/*
 * Tactical Panda Missle
 *
 * Image attribution:
 *  Panda Missle:
 *   Photo by Michael Musson. 
 *   Source: http://www.flickr.com/photos/mmusson/300982458/sizes/l/in/photostream/
 *  Spoon:
 *   Photo from totallyfreecrap.com, not sure on the attribution or license.
 *   They wanted me to fill out a survey, in exchange for a free phyical spoon,
 *   I didn't, but assumed I could have a free digital spoon.
 *   Source: http://www.totallyfreecrap.com/2009/10/05/free-spoon/
 * 	
 */

// Lovely bit of code that makes touch pretend it's a mouse
// Source: http://ross.posterous.com/2008/08/19/iphone-touch-events-in-javascript/ 
(function() {
	function touchHandler(event) {
		var touches = event.changedTouches,
			first = touches[0],
			type = ""
		switch(event.type) {
			case "touchstart": type = "mousedown"; break
			case "touchmove":  type="mousemove"; break
			case "touchend":   type="mouseup"; break
			default: return
		}
		
		var simulatedEvent = document.createEvent("MouseEvent")
		simulatedEvent.initMouseEvent(type, true, true, window, 1, 
								  first.screenX, first.screenY, 
								  first.clientX, first.clientY, false, 
								  false, false, false, 0/*left*/, null)

		first.target.dispatchEvent(simulatedEvent)
		event.preventDefault()
	}

	function init() {
		document.addEventListener("touchstart", touchHandler, true)
		document.addEventListener("touchmove", touchHandler, true)
		document.addEventListener("touchend", touchHandler, true)
		document.addEventListener("touchcancel", touchHandler, true)
	}
})();

(function() {
    // Structure
    var canHit = ['spoonhead','spoonbody'],
        path = 'sprites/',
        score = 0,
        leaders = [
            {name:'bob', score:800},
            {name:'bib', score:80},
            {name:'bab', score:8}
        ]

    function pollServer() {
		//leaders[0].score++
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
			ani = 1,
        	health = 2

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
				
			//this.base.move(0, rw.key('ua') ? -2 : rw.key('da') ? 2 : 0)
        }
        this.hitMap=[['panda',canHit,0,0,150,40]]
        this.gotHit = function(by) {
            if (by=='spoonbody') {
                health--
            }
            if (!health) return this.base.hide(), false//rw.rules['score'].gameOver=true
        }
    }

    var spoonCount = cloudCount = 0
    function Spoon(yPos) {
        this.base = new rw.Ent('spoon_'+spoonCount++, 'spoon', 22, 100)
        var dying = false,
            countdown = 30,
			speed = 2+Math.random()
        this.update = function(pX,pY) {
            this.base.move(-speed, 0)
            if (dying) {
                if (countdown) countdown--
                else return this.base.hide(), false
            } 
            if (this.base.posX1()<-40) return this.base.hide(), false
				
			
        }
        this.hitMap = [
			['spoonhead',['panda'],0,0,22,36],
			['spoonbody',['panda'],10,37,13,100]
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
        	poll = 30*60
        this.rule = function() {
			// Poll server
            poll ? poll-- : (
                poll = 30*60,
                pollServer()
            )
			//end game
            if (this.gameOver) {}
        }
    }

    // Implementation
    rw.loadSprites({
        panda1: [path+'rpm1.png', 150, 40, 0, 0],
        panda2: [path+'rpm2.png', 150, 40, 0, 0],
        spoon: [path+'spoon.png', 22, 100, 0, 0],
		bg: [path+'bg.png',480,320,0,0]
    }, function() {
        rw.init('playarea', {
            x:480,
            y:320,
            FPS:60,
            sequence:['ajax','ents','cols','rule','kill','blit','rule']
        })
        .newRule('score', new Score())
        .newRule('spawner', new Spawner())
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
})()
