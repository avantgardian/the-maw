import Phaser from 'phaser'
import { CRTManager } from '../systems/CRTManager'

const fragShader = `
precision mediump float;

uniform sampler2D uMainSampler;
uniform float uTime;
uniform vec3 uColorTint;

varying vec2 outTexCoord;

void main() {
  vec2 uv = outTexCoord;
  vec2 center = uv - 0.5;
  float dist = dot(center, center);

  // Barrel distortion (subtle)
  uv = uv + center * dist * 0.06;

  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }

  vec4 color = texture2D(uMainSampler, uv);

  // Scanlines
  float scanline = sin(uv.y * 480.0 * 3.14159) * 0.04 + 0.96;
  color.rgb *= scanline;

  // Phosphor glow
  color.rgb = pow(color.rgb, vec3(1.0 / 1.8));
  color.rgb *= 0.92;
  color.rgb *= uColorTint;

  // Chromatic aberration
  float aberration = 0.002;
  float r = texture2D(uMainSampler, uv + vec2(aberration, 0.0)).r;
  float b = texture2D(uMainSampler, uv - vec2(aberration, 0.0)).b;
  color.r = mix(color.r, r, 0.3);
  color.b = mix(color.b, b, 0.3);

  gl_FragColor = color;
}
`

export class CRTPipeline extends Phaser.Renderer.WebGL.Pipelines.PostFXPipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      name: 'CRTPipeline',
      fragShader,
    })
  }

  onPreRender() {
    const tint = CRTManager.getTint()
    this.set1f('uTime', this.game.loop.time / 1000)
    this.set3f('uColorTint', tint[0], tint[1], tint[2])
  }
}
