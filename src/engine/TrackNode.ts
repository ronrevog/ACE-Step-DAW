/**
 * Per-track audio routing: GainNode for volume control + mute/solo.
 */
export class TrackNode {
  readonly inputGain: GainNode;
  readonly volumeGain: GainNode;

  private _volume = 0.8;
  private _muted = false;
  private _soloed = false;
  private _soloActive = false; // true if any track in the session is soloed

  constructor(private ctx: AudioContext, destination: AudioNode) {
    this.inputGain = ctx.createGain();
    this.volumeGain = ctx.createGain();
    this.inputGain.connect(this.volumeGain);
    this.volumeGain.connect(destination);
    this.volumeGain.gain.value = this._volume;
  }

  get volume() { return this._volume; }
  set volume(v: number) {
    this._volume = v;
    this._applyGain();
  }

  get muted() { return this._muted; }
  set muted(v: boolean) {
    this._muted = v;
    this._applyGain();
  }

  get soloed() { return this._soloed; }
  set soloed(v: boolean) {
    this._soloed = v;
    this._applyGain();
  }

  /** Called externally when any track's solo state changes */
  set soloActive(v: boolean) {
    this._soloActive = v;
    this._applyGain();
  }

  private _applyGain() {
    if (this._muted) {
      this.volumeGain.gain.value = 0;
    } else if (this._soloActive && !this._soloed) {
      this.volumeGain.gain.value = 0;
    } else {
      this.volumeGain.gain.value = this._volume;
    }
  }

  disconnect() {
    this.inputGain.disconnect();
    this.volumeGain.disconnect();
  }
}
