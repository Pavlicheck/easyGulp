function wheelSwipe(selector = 'body', propagation = false, delta = 125) {

	let touchstartX = null,
	 	touchstartY = null,
	 	touchendX  	= null,
	 	touchendY  	= null,
	 	xDiff 		= null,
	 	yDiff 		= null,
		swipeDown 	= new WheelEvent('wheel', {deltaY: -delta}),
		swipeUp 	= new WheelEvent('wheel', {deltaY: delta}),
		swipeLeft 	= new WheelEvent('wheel', {deltaX: delta}),
		swipeRight  = new WheelEvent('wheel', {deltaX: -delta}),
		elem 		= document.querySelector(selector);

	elem.addEventListener('touchstart', handleTouchStart, false);        
	elem.addEventListener('touchmove', handleTouchMove, false);

//  Set start coordinates
	function handleTouchStart(e) {           
		touchstartX = e.touches[0].clientX;                                      
		touchstartY = e.touches[0].clientY;                                      
	}; 

// Check direction and dispatch event
	function handleTouchMove(e) {
		if (!propagation) {
			e.stopPropagation()
		}
		
		if ( ! touchstartX || ! touchstartY ) {
			return;
		}

		touchendX = e.touches[0].clientX;                                 
		touchendY = e.touches[0].clientY;
		xDiff = touchstartX - touchendX;
		yDiff = touchstartY - touchendY;

		if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
			if ( xDiff > 0 ) { 					//swipe left
				elem.dispatchEvent(swipeLeft)
			} else {  							//swipe right
				elem.dispatchEvent(swipeRight)
			}                       
		} else {
			if ( yDiff > 0 ) {					//swipe up
				elem.dispatchEvent(swipeUp)
			} else { 							//swipe down
				elem.dispatchEvent(swipeDown)
			}                                                                 
		}

// reset values
		touchstartX = null;
	 	touchstartY = null;
	 	touchendX  	= null;
	 	touchendY  	= null;
	 	xDiff 		= null;
	 	yDiff 		= null;                                          
	};
}