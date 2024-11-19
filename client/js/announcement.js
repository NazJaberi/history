class Announcement {
  constructor(message, duration = 3000) {
    this.message = message;
    this.duration = duration;
    this.startTime = performance.now();

    // Create DOM element
    this.element = document.createElement("div");
    this.element.className = "announcement";
    this.element.textContent = this.message;
    this.element.style.position = "absolute";
    this.element.style.top = "25%";
    this.element.style.left = "50%";
    this.element.style.transform = "translate(-50%, -50%)";
    this.element.style.color = "white";
    this.element.style.fontFamily = "Arial, sans-serif";
    this.element.style.fontSize = "24px";
    this.element.style.fontWeight = "bold";
    this.element.style.textAlign = "center";
    this.element.style.opacity = "1";
    this.element.style.transition = "opacity 1s";
  }

  update(currentTime) {
    const elapsedTime = currentTime - this.startTime;
    if (elapsedTime > this.duration) {
      this.element.remove();
      return false; // Announcement has expired
    }
    if (elapsedTime > this.duration - 1000) {
      this.element.style.opacity = "0";
    }
    return true;
  }
}
