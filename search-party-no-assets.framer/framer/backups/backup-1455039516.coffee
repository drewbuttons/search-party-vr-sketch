{VRComponent, VRLayer} = require "VRComponent"

# using six images we create the environment
# images from Humus: http://www.humus.name/index.php?page=Textures
vr = new VRComponent
	front: "./images/front.jpg"
	right: "./images/right.jpg"
	left: "./images/left.jpg"
	back: "images/back.jpg"
	bottom: "images/bottom.jpg"
	top: "images/top.jpg"

vr.heading = 90

# on window resize we make sure the vr component fills the entire screen
window.onresize = ->
	vr.size = Screen.size
	

vr.on Events.OrientationDidChange, (data) ->
    heading =   data.heading
    elevation = data.elevation
    tilt =      data.tilt
    print vr.heading