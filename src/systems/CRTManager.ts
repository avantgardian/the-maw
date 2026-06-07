let tint: [number, number, number] = [1.0, 0.67, 0.0]

export const CRTManager = {
  setTint(r: number, g: number, b: number) {
    tint = [r, g, b]
  },
  getTint: () => tint,
}
