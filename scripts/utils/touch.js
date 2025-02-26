class Touch {
	static simulateTouchEvent = (type, touches, touchArea) => {
		const touchEvent = new TouchEvent(type, {
			touches: touches,
			targetTouches: touches,
			changedTouches: touches,
			bubbles: true,
			cancelable: true,
		});
		touchArea.dispatchEvent(touchEvent);
	}
}