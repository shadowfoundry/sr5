export class visionPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const vision = () => {
      return new fields.SchemaField({
        hasVision: new fields.BooleanField({initial: false}),
        isActive: new fields.BooleanField({initial: false}),
        natural: new fields.BooleanField({initial: false}),
        augmented: new fields.BooleanField({initial: false}),
      })
    }

    return {
      visions: new fields.SchemaField({
        astral: vision(),
        lowLight: vision(),
        thermographic: vision(),
        ultrasound: vision(),
      }),
    }
  }
}
