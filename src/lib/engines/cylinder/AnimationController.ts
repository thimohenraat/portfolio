export class AnimationController {
  public progress = 0;
  public flickerTimer = 0;
  public animationFinished = false;
  public isFullyActive = false;

  update(dt: number, speed: number) {
    if (!this.animationFinished) {
      this.progress = Math.min(1, this.progress + dt * speed);
      if (this.progress >= 1) this.animationFinished = true;
      return { phase: 'BUILD', progress: this.progress };
    }

    if (!this.isFullyActive) {
      this.flickerTimer += dt;
      if (this.flickerTimer > 1.2) this.isFullyActive = true;
      return { phase: 'FLICKER', timer: this.flickerTimer };
    }

    return { phase: 'ACTIVE' };
  }
}
