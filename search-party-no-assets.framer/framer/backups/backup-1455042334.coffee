#Import dependencies
{VRComponent, VRLayer} = require "VRComponent"
{AudioPlayer} = require "audio"

#Import audio files
audioA = new AudioPlayer audio: "https://dl.dropboxusercontent.com/u/20558868/songs/dng_onstreet1.mp3"
# 
audioB = new AudioPlayer audio: "https://dl.dropboxusercontent.com/u/20558868/songs/dng_onstreet2.mp3"
# 
audioC = new AudioPlayer audio: "https://dl.dropboxusercontent.com/u/20558868/songs/dng_inclub1.mp3"
# 
audioD = new AudioPlayer audio: "https://dl.dropboxusercontent.com/u/20558868/songs/dng_orig.mp3"

#Setup audio files
startTime = 52
audioA.player.currentTime = startTime
audioB.player.currentTime = startTime
audioC.player.currentTime = startTime
audioD.player.currentTime = startTime

audioA.player.volume = 0
audioB.player.volume = 1
audioC.player.volume = 0
audioD.player.volume = 0

# Draw layer for fade to black btw scenes
fadeLayer = new Layer
	width: screen.width
	height: screen.height
	backgroundColor: "black"

# Make sure fade to black not visible on start	
fadeLayer.visible = false
fadeLayer.opacity = 0

##Setup scenes

#  /// Scene 1 (Hallway)
front1 = "images/mainscene/front.jpg"
right1 = "images/mainscene/right.jpg"
left1 = "images/mainscene/left.jpg"
back1 = "images/mainscene/back.jpg"
bottom1 = "images/mainscene/bottom.jpg"
top1 = "images/mainscene/top.jpg"

#  /// Scene 2 (Bathroom)
front2 = "images/bathroom/front2.jpg"
right2 = "images/bathroom/right2.jpg"
left2 = "images/bathroom/left2.jpg"
back2 = "images/bathroom/back2.jpg"
bottom2 = "images/bathroom/bottom2.jpg"
top2 = "images/bathroom/top2.jpg"

# /// Scene 3 (Bedroom)
front3 = "images/bedroom/front3.jpg"
right3 = "images/bedroom/right3.jpg"
left3 = "images/bedroom/left3.jpg"
back3 = "images/bedroom/back3.jpg"
bottom3 = "images/bedroom/bottom3.jpg"
top3 = "images/bedroom/top3.jpg"

# /// Scene 4 (Bedroom2)
front4 = "images/bedroom2/front4.jpg"
right4 = "images/bedroom2/right4.jpg"
left4 = "images/bedroom2/left4.jpg"
back4 = "images/bedroom2/back4.jpg"
bottom4 = "images/bedroom2/bottom4.jpg"
top4 = "images/bedroom2/top4.jpg"

# /// Scene 5 (Dancefloor)
front5 = "images/dancefloor/front5.png"
right5 = "images/dancefloor/right5.png"
left5 = "images/dancefloor/left5.png"
back5 = "images/dancefloor/back5.png"
bottom5 = "images/dancefloor/bottom5.png"
top5 = "images/dancefloor/top5.png"

# /// Create VR view
vr = new VRComponent
	front: front1
	right: right1
	left: left1
	back: back1
	bottom: bottom1
	top: top1

#Starting heading faces mirror
vr.heading = -90

# On window resize we make sure the vr component fills the entire screen
window.onresize = ->
	vr.size = Screen.size

#Import heading marker image
focalPoint = new Layer
	image: "images/focalPoint.png"
	scale: 0.25

#Starting value for layers projected into scene (knob zones specifically)
distVal = 1565

#Scene 1 knob zones /// viewers lock heading on these to open doors
layer = new VRLayer
	superLayer: vr.left
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	borderColor: "blue"
	opacity: 0.25
	backgroundColor: "transparent"
	distance: distVal
	heading: 340
	elevation: -24
vr.projectLayer(layer)

layer2 = new VRLayer
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	distance: distVal
	heading: 340
	elevation: -24
vr.projectLayer(layer2)

roomKnob1 = new VRLayer
	superLayer: vr.front
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	borderColor: "blue"
	opacity: 0.25
	backgroundColor: "transparent"
	distance: distVal
	heading: 348
	elevation: -20
vr.projectLayer(roomKnob1)

roomKnob2 = new VRLayer
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	distance: distVal
	heading: 348
	elevation: -20
vr.projectLayer(roomKnob2)

room2KnobA = new VRLayer
	superLayer: vr.right
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	borderColor: "blue"
	opacity: 0.25
	backgroundColor: "transparent"
	distance: distVal
	heading: 90
	elevation: -28
vr.projectLayer(room2KnobA)

room2KnobB = new VRLayer
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	distance: distVal
	heading: 90
	elevation: -28
vr.projectLayer(room2KnobB)

partyLyrA = new VRLayer
	superLayer: vr.left
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	borderColor: "blue"
	opacity: 0.25
	backgroundColor: "transparent"
	distance: 1200
	heading: 265
	elevation: -24
	scale: 0.3
vr.projectLayer(partyLyrA)

partyLyrB = new VRLayer
	width: 200
	height: 200
	borderRadius: 100
	borderWidth: 3
	distance: 1200
	heading: 265
	elevation: -24
	scale: 0.3
vr.projectLayer(partyLyrB)

partyLyrA.visible = false
partyLyrB.visible = false

leaveLayer2 = new VRLayer
	superLayer: vr.back
	width: 150
	height: 75
	borderRadius: 10
	borderWidth: 3
	distance: 1400
	heading: 180
	elevation: -4
vr.projectLayer(leaveLayer2)

leaveLayer = new VRLayer
	superLayer: vr.back
	width: 150
	height: 75
	borderRadius: 10
	borderColor: "blue"
	borderWidth: 3
	opacity: 0.4
	backgroundColor: "rgba(255,255,255, 0.5)"
	distance: 1400
	heading: 180
	elevation: -4
	html: "Leave"
	style: 
		"text-align" : "center"
		"line-height" : "2.5"
		"color" : "blue"
vr.projectLayer(leaveLayer)


#Arrays of objects w/in scenes to turn on/off
rmOneobjs = [layer,layer2,roomKnob1,roomKnob2,room2KnobA, room2KnobB]
leaveyrs = [leaveLayer, leaveLayer2]

#Setup starting states for knob zones and leave layers
layer2.opacity = 1
layer2.scale = 0

roomKnob2.opacity = 1
roomKnob2.scale = 0

room2KnobB.opacity = 1
room2KnobB.scale = 0

leaveLayer2.opacity = 1
leaveLayer2.scale = 0

leaveLayer.visible = false
leaveLayer2.visible = false

#Make sure the heading marker is centered and visible
focalPoint.bringToFront()
focalPoint.center()


#Set boolean to monitor whether heading is inside or outside knob zones
inRangeleft = false
inRangemid = false
inRangeright = false
inRangeleave = false
inRangeparty = false

#Opening sequence function
startUp = ()->
	fadeLayer.bringToFront()
	fadeLayer.visible = true
	fadeLayer.opacity = 1
	Utils.delay 4, ->
		audioA.player.play()
		audioB.player.play()
		audioC.player.play()
		audioD.player.play()
	Utils.delay 5.5, ->
		fadeLayer.animate
			properties: 
				opacity: 0
			time: 0.6
		fadeLayer.on Events.AnimationEnd, ->
			fadeLayer.visible = false

#Functions for hiding and showing knob check layers in a given scene
hideKnob = (nobby) ->
	nobby.visible = false

showKnob = (noblet) ->
	noblet.visible = true
	
#Function for switching scenes when go through a door
switchVR = (fr,ba,le,ri,bott,to) ->
	vr.front = fr
	vr.back = ba
	vr.left = le
	vr.right = ri
	vr.bottom = bott
	vr.top = to
	
#Function to add dancers to scene
addDancers = ()->
	images = []
	for i in [0...49]
		images[i] = "images/dancers/dance" + i + ".gif"
		
		
	makeDance = (img)->
		imgInst = new Image
		imgInst.src = img
		danceLayer = new VRLayer
			image: img
			height: imgInst.naturalHeight
			width: imgInst.naturalWidth
			scale: 1
			distance: 1100
			heading: Utils.randomNumber(0, 1080)
			elevation: -12
			clip: false
		vr.projectLayer(danceLayer)
		shadowLayer = new VRLayer
			image: "images/dropShadow.png"
			width: 300
			height: 140
			scale: 0.35
			scaleX: 1
			superLayer: danceLayer
			y: imgInst.naturalHeight - 80
			x: -80
		if vr.front.image == front1
			danceLayer.destroy()
	for image1, i in images
		Utils.loadImage(image1,makeDance(image1))
# 		print image1
	
		
	
#Function for knob checking	
knobCheck = (range, knobLayer, knobLayer2, lessH, moreH, lessE, moreE) ->
	
	if vr.heading >= lessH && vr.heading <= moreH
		if vr.elevation <= lessE && vr.elevation >= moreE
			range = true
		else 
			range = false
	else 
			range = false
	
	#Knob hover in and out animations
	if range == true
		knobLayer.animate
			properties:
				scale: 1.5
			time: 0.1
		knobLayer2.animate
			properties:
				scale: 1.5
			time: 0.75
			curve: "ease-out"
		knobLayer2.on Events.AnimationEnd, ->
			fadeLayer.visible = true
			fadeLayer.bringToFront()
			fadeLayer.animate
				properties:
					opacity: 1
				time: 1.5
			
			
			
			# Depending on which knob, transition to corresponding scene
			Utils.delay 1.5, ->
				audioA.player.volume = 1
				audioB.player.volume = 0
				if layer2.scale == 1.5
					switchVR(front2,back2,left2,right2,bottom2,top2)
# 					audioA.player.volume = 0.75
# 					audioB.player.volume = 0
					vr.heading = 0
					vr.elevation = -4
				if roomKnob2.scale == 1.5
					switchVR(front3,back3,left3,right3,bottom3,top3)
# 					audioA.player.volume = 0.75
# 					audioB.player.volume = 0
					vr.heading = 0
					vr.elevation = -4
				if room2KnobB.scale == 1.5
					partyLyrA.visible = true
					partyLyrB.visible = true
					switchVR(front4,back4,left4,right4,bottom4,top4)
					vr.heading = 0
					vr.elevation = -4
					audioA.player.volume = 0
					audioB.player.volume = 0
					audioC.player.volume = 0.45
					audioD.player.volume = 0
				if partyLyrB.scale == 1.5
					partyLyrA.visible = false
					partyLyrB.visible = false
					switchVR(front5,back5,left5,right5,bottom5,top5)
					addDancers()
					vr.heading = 0
					vr.elevation = -4
					audioA.player.volume = 0
					audioB.player.volume = 0
					audioC.player.volume = 0
					audioD.player.volume = 0.4
# 				if inRangemid == true
# 					switchVR(front,back,left2,right2,bottom2,top2)
				for nobRings, i in rmOneobjs
					hideKnob(nobRings)
				leaveLayer.visible = true
				leaveLayer2.visible = true
				
			Utils.delay 1.5, ->
				fadeLayer.animate
					properties:
						opacity: 0
					time: 0.6
				fadeLayer.on Events.AnimationEnd, ->
					fadeLayer.visible = false
					
	if knobLayer.scale != 1
		if range == false
			knobLayer.animateStop()
			knobLayer.animate
				properties:
					scale: 1
				time: 0.1
	if range == false
		knobLayer2.animateStop()
		knobLayer2.scale = 0
# 		layer2.opacity = 0
	


#Function for leaving room
leaveRm = (range, knobLayer, knobLayer2, lessH, moreH, lessE, moreE)->
	if vr.heading >= lessH && vr.heading <= moreH
		if vr.elevation <= lessE && vr.elevation >= moreE
			range = true
		else 
			range = false
	else 
			range = false
	
	if range == true
		knobLayer.animate
			properties:
				scale: 1.5
			time: 0.1
		knobLayer2.animate
			properties:
				scale: 1.5
			time: 0.75
			curve: "ease-out"
		knobLayer2.on Events.AnimationEnd, ->
			fadeLayer.visible = true
			fadeLayer.bringToFront()
			fadeLayer.animate
				properties:
					opacity: 1
				time: 1.5
			
			
			# Depending on which knob, transition to corresponding scene
			Utils.delay 1.5, ->
				partyLyrA.visible = false
				partyLyrB.visible = false

				if vr.front.image == front2
					vr.heading = 23
					vr.elevation = 0
				if vr.front.image == front3
					vr.heading = 180
					vr.elevation = 0
				if vr.front.image == front4
					vr.heading = -90
					vr.elevation = 0
					
				audioA.player.volume = 0
				audioB.player.volume = 1
				audioC.player.volume = 0
				audioD.player.volume = 0
				

				switchVR(front1,back1,left1,right1,bottom1,top1)
				for nobRings, i in rmOneobjs
					showKnob(nobRings)
				leaveLayer.visible = false
				leaveLayer2.visible = false
					
			Utils.delay 1.5, ->
				fadeLayer.animate
					properties:
						opacity: 0
					time: 0.6
				fadeLayer.on Events.AnimationEnd, ->
					fadeLayer.visible = false
					
	if knobLayer.scale != 1
		if range == false
			knobLayer.animateStop()
			knobLayer.animate
				properties:
					scale: 1
				time: 0.1
	if range == false
		knobLayer2.animateStop()
		knobLayer2.scale = 0



# Listen for changes to heading /// If our heading locks on knob zone, go thru door
vr.on Events.OrientationDidChange, (data) ->
	heading =   data.heading
	elevation = data.elevation
	tilt =      data.tilt
# 	print vr.heading
# 	print vr.elevation
	# Hover knob for left door
	knobCheck(inRangeleft, layer, layer2, 336, 342, -18, -30)
	
	# Hover knob for front door
	knobCheck(inRangemid, roomKnob1, roomKnob2, 343, 353, -15, -24)
	
	# Hover knob for right door
	knobCheck(inRangeright, room2KnobA, room2KnobB, 84, 96, -23, -32)
	
	leaveRm(inRangeleave, leaveLayer, leaveLayer2, 176, 183, -3.5, -6)
	
	knobCheck(inRangeparty, partyLyrA, partyLyrB, 263, 267, -22, -25)




#Do stuff on load
startUp()
addDancers()
