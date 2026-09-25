export class visionPartialModel extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    const fields = foundry.data.fields

    const vision = () => {
      return new fields.SchemaField({
        hasVision: new fields.BooleanField({
          initial: false
        }),
        isActive: new fields.BooleanField({
          initial: false
        }),
        natural: new fields.BooleanField({
          initial: false
        }),
        augmented: new fields.BooleanField({
          initial: false
        }),
      })
    }

    return {
      visions: new fields.SchemaField({
        astral: vision(),
        lowLight: vision(),
        thermographic: vision(),
        ultrasound: vision(),
        //True as soon as one of the special visions above is switched on
        hasActiveVision: new fields.BooleanField({
          initial: false
        }),
        //Cybereyes replace the eyes the character was born with (SR5 p. 456)
        cyberEyes: new fields.SchemaField({
          hasCyberEyes: new fields.BooleanField({
            initial: false
          }),
          replacedNaturalVision: new fields.ArrayField(new fields.StringField()),
        }),
      }),
    }
  }
}
